package service

import (
	"errors"
	"kitting-check/model"
	"kitting-check/repository"
)

type OrderService struct {
	repo *repository.OrderRepo
}

func NewOrderService(repo *repository.OrderRepo) *OrderService {
	return &OrderService{repo: repo}
}

func (s *OrderService) Create(req *model.CreateOrderRequest) (*model.SalesOrder, error) {
	if req.OrderNo == "" {
		return nil, errors.New("order_no is required")
	}
	if len(req.Items) == 0 {
		return nil, errors.New("items is required")
	}
	if req.DeliveryDate == "" {
		return nil, errors.New("delivery_date is required")
	}

	order := &model.SalesOrder{
		OrderNo:      req.OrderNo,
		Customer:     req.Customer,
		Status:       "pending",
		DeliveryDate: req.DeliveryDate,
	}

	for _, item := range req.Items {
		order.Items = append(order.Items, model.OrderItem{
			PartNo:      item.PartNo,
			PartName:    item.PartName,
			RequiredQty: item.RequiredQty,
			ReceivedQty: 0,
			ShortageQty: item.RequiredQty,
			KittingRate: 0,
		})
	}

	if err := s.repo.Create(order); err != nil {
		return nil, err
	}
	return order, nil
}

func (s *OrderService) List() ([]model.SalesOrder, error) {
	return s.repo.List()
}

type PaginatedResult struct {
	Total int64       `json:"total"`
	List  interface{} `json:"list"`
}

func (s *OrderService) ListPaginated(page, pageSize int, status, keyword string) (*PaginatedResult, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 10
	}
	orders, total, err := s.repo.ListPaginated(page, pageSize, status, keyword)
	if err != nil {
		return nil, err
	}
	return &PaginatedResult{
		Total: total,
		List:  orders,
	}, nil
}

func (s *OrderService) GetByID(id uint) (*model.SalesOrder, error) {
	return s.repo.GetByID(id)
}

func (s *OrderService) UpdateStatus(id uint, req *model.UpdateOrderStatusRequest) (*model.SalesOrder, error) {
	validStatuses := map[string]bool{
		"pending":  true,
		"kitting":  true,
		"released": true,
		"held":     true,
		"shipped":  true,
	}
	if !validStatuses[req.Status] {
		return nil, errors.New("invalid status")
	}
	if err := s.repo.UpdateStatus(id, req.Status); err != nil {
		return nil, err
	}
	return s.repo.GetByID(id)
}

func (s *OrderService) ListByStatusesPaginated(statuses []string, page, pageSize int, sort string) ([]model.SalesOrder, int64, error) {
	return s.repo.GetByStatusesPaginated(statuses, page, pageSize, sort)
}

func (s *OrderService) GetRepo() *repository.OrderRepo {
	return s.repo
}
