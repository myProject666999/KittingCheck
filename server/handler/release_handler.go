package handler

import (
	"kitting-check/model"
	"kitting-check/repository"
	"net/http"

	"github.com/labstack/echo/v4"
)

type ReleaseHandler struct {
	orderRepo *repository.OrderRepo
}

func NewReleaseHandler(orderRepo *repository.OrderRepo) *ReleaseHandler {
	return &ReleaseHandler{orderRepo: orderRepo}
}

func (h *ReleaseHandler) GetReleasable(c echo.Context) error {
	status := c.QueryParam("status")

	var statuses []string
	switch status {
	case "released":
		statuses = []string{"released"}
	case "held":
		statuses = []string{"held"}
	case "pending":
		statuses = []string{"pending"}
	default:
		statuses = []string{"pending"}
	}

	orders, err := h.orderRepo.GetByStatuses(statuses)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": err.Error()})
	}

	type ReleasableOrder struct {
		ID          uint    `json:"id"`
		OrderNo     string  `json:"order_no"`
		Customer    string  `json:"customer"`
		KittingRate float64 `json:"kitting_rate"`
		Status      string  `json:"status"`
		DeliveryDate string `json:"delivery_date"`
	}

	result := make([]ReleasableOrder, 0, len(orders))
	for _, order := range orders {
		if status == "pending" && order.KittingRate < 100 {
			continue
		}
		dd := ""
		if order.DeliveryDate != "" {
			dd = order.DeliveryDate
		}
		result = append(result, ReleasableOrder{
			ID:          order.ID,
			OrderNo:     order.OrderNo,
			Customer:    order.Customer,
			KittingRate: order.KittingRate,
			Status:      order.Status,
			DeliveryDate: dd,
		})
	}

	return c.JSON(http.StatusOK, result)
}

func (h *ReleaseHandler) BatchRelease(c echo.Context) error {
	var req model.BatchReleaseRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "invalid request body"})
	}

	if len(req.OrderIDs) == 0 {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "order_ids is required"})
	}

	targetStatus := "released"
	if req.Action == "hold" {
		targetStatus = "held"
	}
	if req.Action == "unhold" {
		targetStatus = "pending"
	}

	for _, id := range req.OrderIDs {
		_ = h.orderRepo.UpdateStatus(id, targetStatus)
	}

	return c.JSON(http.StatusOK, echo.Map{"message": "batch " + req.Action + " success", "count": len(req.OrderIDs)})
}
