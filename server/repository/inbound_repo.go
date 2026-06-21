package repository

import (
	"kitting-check/model"

	"gorm.io/gorm"
)

type InboundRepo struct {
	db *gorm.DB
}

func NewInboundRepo(db *gorm.DB) *InboundRepo {
	return &InboundRepo{db: db}
}

func (r *InboundRepo) Create(record *model.InboundRecord) error {
	return r.db.Create(record).Error
}

func (r *InboundRepo) List() ([]model.InboundRecord, error) {
	var records []model.InboundRecord
	err := r.db.Order("created_at DESC").Find(&records).Error
	return records, err
}

type EnrichedInboundRecord struct {
	model.InboundRecord
	OrderNo  string `json:"order_no"`
	PartName string `json:"part_name"`
}

func (r *InboundRepo) ListPaginated(page, pageSize int, orderID uint, partNo string) ([]EnrichedInboundRecord, int64, error) {
	var records []EnrichedInboundRecord
	var total int64

	query := r.db.Model(&model.InboundRecord{})

	if orderID > 0 {
		query = query.Where("inbound_records.order_id = ?", orderID)
	}
	if partNo != "" {
		query = query.Where("inbound_records.part_no LIKE ?", "%"+partNo+"%")
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * pageSize
	err := r.db.Table("inbound_records").
		Select("inbound_records.*, sales_orders.order_no, order_items.part_name").
		Joins("LEFT JOIN sales_orders ON inbound_records.order_id = sales_orders.id").
		Joins("LEFT JOIN order_items ON inbound_records.item_id = order_items.id").
		Scopes(func(db *gorm.DB) *gorm.DB {
			if orderID > 0 {
				return db.Where("inbound_records.order_id = ?", orderID)
			}
			return db
		}).
		Scopes(func(db *gorm.DB) *gorm.DB {
			if partNo != "" {
				return db.Where("inbound_records.part_no LIKE ?", "%"+partNo+"%")
			}
			return db
		}).
		Offset(offset).Limit(pageSize).Order("inbound_records.created_at DESC").
		Scan(&records).Error
	return records, total, err
}

func (r *InboundRepo) SumQtyByOrderItem(itemID uint) (float64, error) {
	var total float64
	err := r.db.Model(&model.InboundRecord{}).
		Where("item_id = ?", itemID).
		Select("COALESCE(SUM(quantity), 0)").
		Scan(&total).Error
	return total, err
}
