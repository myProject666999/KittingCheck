package service

import (
	"context"
	"encoding/json"
	"fmt"
	"kitting-check/model"
	"kitting-check/repository"
	"time"

	"github.com/redis/go-redis/v9"
)

type KittingCacheVO struct {
	KittingRate    float64 `json:"kitting_rate"`
	TotalItems     int     `json:"total_items"`
	CompletedItems int     `json:"completed_items"`
}

type KittingService struct {
	orderRepo *repository.OrderRepo
	rdb       *redis.Client
}

func NewKittingService(orderRepo *repository.OrderRepo, rdb *redis.Client) *KittingService {
	return &KittingService{
		orderRepo: orderRepo,
		rdb:       rdb,
	}
}

func (s *KittingService) CalculateOrderRate(items []model.OrderItem) float64 {
	var totalRequired, totalReceived float64
	for _, item := range items {
		totalRequired += item.RequiredQty
		totalReceived += item.ReceivedQty
	}
	if totalRequired == 0 {
		return 0
	}
	rate := totalReceived / totalRequired * 100
	if rate > 100 {
		rate = 100
	}
	return rate
}

func (s *KittingService) cacheKey(orderID uint) string {
	return fmt.Sprintf("kitting:order:%d", orderID)
}

func (s *KittingService) GetCache(ctx context.Context, orderID uint) (*model.KittingCacheData, error) {
	val, err := s.rdb.Get(ctx, s.cacheKey(orderID)).Result()
	if err == redis.Nil {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	var data model.KittingCacheData
	if err := json.Unmarshal([]byte(val), &data); err != nil {
		return nil, err
	}
	return &data, nil
}

func (s *KittingService) SetCache(ctx context.Context, orderID uint, data *model.KittingCacheData) error {
	val, err := json.Marshal(data)
	if err != nil {
		return err
	}
	return s.rdb.Set(ctx, s.cacheKey(orderID), val, 30*time.Minute).Err()
}

func (s *KittingService) GetOrderKittingData(ctx context.Context, orderID uint) (*KittingCacheVO, error) {
	cached, err := s.GetCache(ctx, orderID)
	if err != nil {
		return nil, err
	}
	if cached != nil {
		return &KittingCacheVO{
			KittingRate:    cached.KittingRate,
			TotalItems:     cached.TotalItems,
			CompletedItems: cached.CompletedItems,
		}, nil
	}

	order, err := s.orderRepo.GetByID(orderID)
	if err != nil {
		return nil, err
	}

	rate := s.CalculateOrderRate(order.Items)
	completed := 0
	for _, item := range order.Items {
		if item.KittingRate >= 100 {
			completed++
		}
	}

	data := &model.KittingCacheData{
		KittingRate:    rate,
		TotalItems:     len(order.Items),
		CompletedItems: completed,
	}

	_ = s.SetCache(ctx, orderID, data)

	return &KittingCacheVO{
		KittingRate:    rate,
		TotalItems:     len(order.Items),
		CompletedItems: completed,
	}, nil
}
