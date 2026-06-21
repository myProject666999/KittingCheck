package repository

import (
	"kitting-check/model"

	"gorm.io/gorm"
)

type OrderRepo struct {
	db *gorm.DB
}

func NewOrderRepo(db *gorm.DB) *OrderRepo {
	return &OrderRepo{db: db}
}

func (r *OrderRepo) Create(order *model.SalesOrder) error {
	return r.db.Create(order).Error
}

func (r *OrderRepo) List() ([]model.SalesOrder, error) {
	var orders []model.SalesOrder
	err := r.db.Preload("Items").Find(&orders).Error
	return orders, err
}

func (r *OrderRepo) ListPaginated(page, pageSize int, status, keyword string) ([]model.SalesOrder, int64, error) {
	var orders []model.SalesOrder
	var total int64

	query := r.db.Model(&model.SalesOrder{})

	if status != "" {
		query = query.Where("status = ?", status)
	}
	if keyword != "" {
		query = query.Where("order_no LIKE ? OR customer LIKE ?", "%"+keyword+"%", "%"+keyword+"%")
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * pageSize
	err := query.Preload("Items").Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&orders).Error
	return orders, total, err
}

func (r *OrderRepo) GetByID(id uint) (*model.SalesOrder, error) {
	var order model.SalesOrder
	err := r.db.Preload("Items").First(&order, id).Error
	if err != nil {
		return nil, err
	}
	return &order, nil
}

func (r *OrderRepo) UpdateStatus(id uint, status string) error {
	return r.db.Model(&model.SalesOrder{}).Where("id = ?", id).Update("status", status).Error
}

func (r *OrderRepo) UpdateKittingRate(id uint, rate float64) error {
	return r.db.Model(&model.SalesOrder{}).Where("id = ?", id).Update("kitting_rate", rate).Error
}

func (r *OrderRepo) UpdateItemQty(itemID uint, receivedQty, shortageQty, kittingRate float64) error {
	return r.db.Model(&model.OrderItem{}).Where("id = ?", itemID).
		Updates(map[string]interface{}{
			"received_qty": receivedQty,
			"shortage_qty": shortageQty,
			"kitting_rate": kittingRate,
		}).Error
}

func (r *OrderRepo) GetItemsByOrderID(orderID uint) ([]model.OrderItem, error) {
	var items []model.OrderItem
	err := r.db.Where("order_id = ?", orderID).Find(&items).Error
	return items, err
}

func (r *OrderRepo) GetItemsByOrderIDs(orderIDs []uint) ([]model.OrderItem, error) {
	var items []model.OrderItem
	err := r.db.Where("order_id IN ?", orderIDs).Find(&items).Error
	return items, err
}

func (r *OrderRepo) GetItemByID(id uint) (*model.OrderItem, error) {
	var item model.OrderItem
	err := r.db.First(&item, id).Error
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *OrderRepo) GetByStatuses(statuses []string) ([]model.SalesOrder, error) {
	var orders []model.SalesOrder
	err := r.db.Preload("Items").Where("status IN ?", statuses).Find(&orders).Error
	return orders, err
}

func (r *OrderRepo) GetByStatusesPaginated(statuses []string, page, pageSize int, sort string) ([]model.SalesOrder, int64, error) {
	var orders []model.SalesOrder
	var total int64

	query := r.db.Model(&model.SalesOrder{})
	if len(statuses) > 0 {
		query = query.Where("status IN ?", statuses)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	orderClause := "created_at DESC"
	switch sort {
	case "kitting_rate_asc":
		orderClause = "kitting_rate ASC"
	case "kitting_rate_desc":
		orderClause = "kitting_rate DESC"
	case "delivery_date_asc":
		orderClause = "delivery_date ASC"
	case "delivery_date_desc":
		orderClause = "delivery_date DESC"
	}

	offset := (page - 1) * pageSize
	err := query.Preload("Items").Offset(offset).Limit(pageSize).Order(orderClause).Find(&orders).Error
	return orders, total, err
}
