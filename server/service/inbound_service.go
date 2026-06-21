package service

import (
	"fmt"
	"kitting-check/model"
	"kitting-check/repository"

	"context"

	"github.com/redis/go-redis/v9"
)

type InboundService struct {
	inboundRepo *repository.InboundRepo
	orderRepo   *repository.OrderRepo
	kittingSvc  *KittingService
	rdb         *redis.Client
}

func NewInboundService(
	inboundRepo *repository.InboundRepo,
	orderRepo *repository.OrderRepo,
	kittingSvc *KittingService,
	rdb *redis.Client,
) *InboundService {
	return &InboundService{
		inboundRepo: inboundRepo,
		orderRepo:   orderRepo,
		kittingSvc:  kittingSvc,
		rdb:         rdb,
	}
}

func (s *InboundService) Create(ctx context.Context, req *model.CreateInboundRequest) (*model.InboundRecord, error) {
	item, err := s.orderRepo.GetItemByID(req.ItemID)
	if err != nil {
		return nil, fmt.Errorf("order item not found: %w", err)
	}

	if item.OrderID != req.OrderID {
		return nil, fmt.Errorf("item_id does not belong to order_id")
	}

	partNo := req.PartNo
	if partNo == "" {
		partNo = item.PartNo
	}

	record := &model.InboundRecord{
		OrderID:  req.OrderID,
		ItemID:   req.ItemID,
		PartNo:   partNo,
		Quantity: req.Quantity,
		BatchNo:  req.BatchNo,
		Operator: req.Operator,
	}

	if err := s.inboundRepo.Create(record); err != nil {
		return nil, err
	}

	if err := s.recalculateItemAndOrder(ctx, item); err != nil {
		return nil, err
	}

	return record, nil
}

func (s *InboundService) List() ([]model.InboundRecord, error) {
	return s.inboundRepo.List()
}

func (s *InboundService) ListPaginated(page, pageSize int, orderID uint, partNo string) (*PaginatedResult, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 10
	}
	records, total, err := s.inboundRepo.ListPaginated(page, pageSize, orderID, partNo)
	if err != nil {
		return nil, err
	}
	return &PaginatedResult{
		Total: total,
		List:  records,
	}, nil
}

func (s *InboundService) recalculateItemAndOrder(ctx context.Context, item *model.OrderItem) error {
	totalReceived, err := s.inboundRepo.SumQtyByOrderItem(item.ID)
	if err != nil {
		return err
	}

	shortageQty := item.RequiredQty - totalReceived
	if shortageQty < 0 {
		shortageQty = 0
	}

	var itemRate float64
	if item.RequiredQty > 0 {
		itemRate = totalReceived / item.RequiredQty * 100
		if itemRate > 100 {
			itemRate = 100
		}
	}

	if err := s.orderRepo.UpdateItemQty(item.ID, totalReceived, shortageQty, itemRate); err != nil {
		return err
	}

	items, err := s.orderRepo.GetItemsByOrderID(item.OrderID)
	if err != nil {
		return err
	}

	orderRate := s.kittingSvc.CalculateOrderRate(items)

	if err := s.orderRepo.UpdateKittingRate(item.OrderID, orderRate); err != nil {
		return err
	}

	cacheData := &model.KittingCacheData{
		KittingRate:    orderRate,
		TotalItems:     len(items),
		CompletedItems: countCompleted(items),
	}
	if err := s.kittingSvc.SetCache(ctx, item.OrderID, cacheData); err != nil {
		return err
	}

	if orderRate >= 100 {
		_ = s.orderRepo.UpdateStatus(item.OrderID, "released")
	}

	return nil
}

func countCompleted(items []model.OrderItem) int {
	count := 0
	for _, item := range items {
		if item.KittingRate >= 100 {
			count++
		}
	}
	return count
}
