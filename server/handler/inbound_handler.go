package handler

import (
	"kitting-check/model"
	"kitting-check/service"
	"net/http"
	"strconv"

	"github.com/labstack/echo/v4"
)

type InboundHandler struct {
	svc *service.InboundService
}

func NewInboundHandler(svc *service.InboundService) *InboundHandler {
	return &InboundHandler{svc: svc}
}

func (h *InboundHandler) Create(c echo.Context) error {
	var req model.CreateInboundRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "invalid request body"})
	}

	record, err := h.svc.Create(c.Request().Context(), &req)
	if err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": err.Error()})
	}

	return c.JSON(http.StatusCreated, record)
}

func (h *InboundHandler) List(c echo.Context) error {
	page, _ := strconv.Atoi(c.QueryParam("page"))
	pageSize, _ := strconv.Atoi(c.QueryParam("page_size"))
	orderID, _ := strconv.ParseUint(c.QueryParam("order_id"), 10, 64)
	partNo := c.QueryParam("part_no")

	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 10
	}

	result, err := h.svc.ListPaginated(page, pageSize, uint(orderID), partNo)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, result)
}
