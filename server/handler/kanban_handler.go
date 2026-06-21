package handler

import (
	"kitting-check/service"
	"net/http"

	"github.com/labstack/echo/v4"
)

type KanbanHandler struct {
	kittingSvc *service.KittingService
	orderSvc   *service.OrderService
}

func NewKanbanHandler(kittingSvc *service.KittingService, orderSvc *service.OrderService) *KanbanHandler {
	return &KanbanHandler{
		kittingSvc: kittingSvc,
		orderSvc:   orderSvc,
	}
}

func (h *KanbanHandler) GetKanban(c echo.Context) error {
	statusFilter := c.QueryParam("status")
	sort := c.QueryParam("sort")

	var statuses []string
	if statusFilter != "" {
		statuses = []string{statusFilter}
	}

	orders, _, err := h.orderSvc.ListByStatusesPaginated(statuses, 1, 1000, sort)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": err.Error()})
	}

	type KanbanOrder struct {
		ID              uint    `json:"id"`
		OrderNo         string  `json:"order_no"`
		Customer        string  `json:"customer"`
		KittingRate     float64 `json:"kitting_rate"`
		TotalItems      int     `json:"total_items"`
		CompletedItems  int     `json:"completed_items"`
		Status          string  `json:"status"`
		DeliveryDate    string  `json:"delivery_date"`
	}

	result := make([]KanbanOrder, 0, len(orders))
	for _, order := range orders {
		cacheData, _ := h.kittingSvc.GetOrderKittingData(c.Request().Context(), order.ID)
		totalItems := len(order.Items)
		completedItems := 0
		if cacheData != nil {
			totalItems = cacheData.TotalItems
			completedItems = cacheData.CompletedItems
		}
		result = append(result, KanbanOrder{
			ID:             order.ID,
			OrderNo:        order.OrderNo,
			Customer:       order.Customer,
			KittingRate:    order.KittingRate,
			TotalItems:     totalItems,
			CompletedItems: completedItems,
			Status:         order.Status,
			DeliveryDate:   order.DeliveryDate,
		})
	}

	return c.JSON(http.StatusOK, result)
}

func (h *KanbanHandler) GetShortages(c echo.Context) error {
	orders, err := h.orderSvc.List()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": err.Error()})
	}

	type ShortageItem struct {
		OrderNo     string  `json:"order_no"`
		PartNo      string  `json:"part_no"`
		PartName    string  `json:"part_name"`
		RequiredQty float64 `json:"required_qty"`
		ReceivedQty float64 `json:"received_qty"`
		ShortageQty float64 `json:"shortage_qty"`
	}

	var shortages []ShortageItem
	for _, order := range orders {
		for _, item := range order.Items {
			if item.ShortageQty > 0 {
				shortages = append(shortages, ShortageItem{
					OrderNo:     order.OrderNo,
					PartNo:      item.PartNo,
					PartName:    item.PartName,
					RequiredQty: item.RequiredQty,
					ReceivedQty: item.ReceivedQty,
					ShortageQty: item.ShortageQty,
				})
			}
		}
	}

	if shortages == nil {
		shortages = []ShortageItem{}
	}
	return c.JSON(http.StatusOK, shortages)
}
