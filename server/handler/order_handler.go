package handler

import (
	"kitting-check/model"
	"kitting-check/service"
	"net/http"
	"strconv"

	"github.com/labstack/echo/v4"
)

type OrderHandler struct {
	svc *service.OrderService
}

func NewOrderHandler(svc *service.OrderService) *OrderHandler {
	return &OrderHandler{svc: svc}
}

func (h *OrderHandler) Create(c echo.Context) error {
	var req model.CreateOrderRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "invalid request body"})
	}

	order, err := h.svc.Create(&req)
	if err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": err.Error()})
	}

	return c.JSON(http.StatusCreated, order)
}

func (h *OrderHandler) List(c echo.Context) error {
	page, _ := strconv.Atoi(c.QueryParam("page"))
	pageSize, _ := strconv.Atoi(c.QueryParam("page_size"))
	status := c.QueryParam("status")
	keyword := c.QueryParam("keyword")

	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 10
	}

	result, err := h.svc.ListPaginated(page, pageSize, status, keyword)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, result)
}

func (h *OrderHandler) GetByID(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "invalid id"})
	}

	order, err := h.svc.GetByID(uint(id))
	if err != nil {
		return c.JSON(http.StatusNotFound, echo.Map{"error": "order not found"})
	}
	return c.JSON(http.StatusOK, order)
}

func (h *OrderHandler) UpdateStatus(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "invalid id"})
	}

	var req model.UpdateOrderStatusRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "invalid request body"})
	}

	if err := h.svc.UpdateStatus(uint(id), &req); err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, echo.Map{"message": "status updated"})
}
