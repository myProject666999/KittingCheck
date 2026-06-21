package model

import (
	"time"

	"gorm.io/gorm"
)

type SalesOrder struct {
	ID           uint           `gorm:"primaryKey" json:"id"`
	OrderNo      string         `gorm:"uniqueIndex;size:64;not null" json:"order_no"`
	Customer     string         `gorm:"size:128" json:"customer"`
	Status       string         `gorm:"size:32;default:pending" json:"status"`
	KittingRate  float64        `gorm:"default:0" json:"kitting_rate"`
	DeliveryDate string         `gorm:"type:date;not null" json:"delivery_date"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
	Items        []OrderItem    `gorm:"foreignKey:OrderID" json:"items,omitempty"`
}

type OrderItem struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	OrderID     uint           `gorm:"index;not null" json:"order_id"`
	PartNo      string         `gorm:"size:64;not null" json:"part_no"`
	PartName    string         `gorm:"size:256;not null" json:"part_name"`
	RequiredQty float64        `gorm:"not null" json:"required_qty"`
	ReceivedQty float64        `gorm:"default:0" json:"received_qty"`
	ShortageQty float64        `gorm:"default:0" json:"shortage_qty"`
	KittingRate float64        `gorm:"default:0" json:"kitting_rate"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

type InboundRecord struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	OrderID   uint      `gorm:"index;not null" json:"order_id"`
	ItemID    uint      `gorm:"index;not null" json:"item_id"`
	PartNo    string    `gorm:"size:64;not null" json:"part_no"`
	Quantity  float64   `gorm:"not null" json:"quantity"`
	BatchNo   string    `gorm:"size:64;not null" json:"batch_no"`
	Operator  string    `gorm:"size:64" json:"operator"`
	CreatedAt time.Time `json:"created_at"`
}

type CreateOrderRequest struct {
	OrderNo      string           `json:"order_no"`
	Customer     string           `json:"customer"`
	DeliveryDate string           `json:"delivery_date"`
	Items        []OrderItemInput `json:"items"`
}

type OrderItemInput struct {
	PartNo      string  `json:"part_no"`
	PartName    string  `json:"part_name"`
	RequiredQty float64 `json:"required_qty"`
}

type UpdateOrderStatusRequest struct {
	Status string `json:"status"`
}

type CreateInboundRequest struct {
	OrderID   uint    `json:"order_id"`
	ItemID    uint    `json:"item_id"`
	PartNo    string  `json:"part_no"`
	Quantity  float64 `json:"quantity"`
	BatchNo   string  `json:"batch_no"`
	Operator  string  `json:"operator"`
}

type BatchReleaseRequest struct {
	OrderIDs []uint `json:"order_ids"`
	Action   string `json:"action"`
}

type KittingCacheData struct {
	KittingRate     float64 `json:"kitting_rate"`
	TotalItems      int     `json:"total_items"`
	CompletedItems  int     `json:"completed_items"`
}
