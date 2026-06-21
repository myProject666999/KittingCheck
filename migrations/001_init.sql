CREATE DATABASE IF NOT EXISTS kitting_check DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE kitting_check;

CREATE TABLE IF NOT EXISTS sales_orders (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    order_no VARCHAR(64) NOT NULL COMMENT '订单编号',
    customer VARCHAR(128) NOT NULL COMMENT '客户名称',
    delivery_date DATE NOT NULL COMMENT '交付日期',
    status VARCHAR(32) NOT NULL DEFAULT 'pending' COMMENT '状态: pending-待齐套, held-挂起, released-已放行',
    kitting_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00 COMMENT '齐套率(%)',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_order_no (order_no),
    KEY idx_status (status),
    KEY idx_delivery_date (delivery_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='销售订单表';

CREATE TABLE IF NOT EXISTS order_items (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    order_id BIGINT UNSIGNED NOT NULL COMMENT '订单ID',
    part_no VARCHAR(64) NOT NULL COMMENT '料号',
    part_name VARCHAR(256) NOT NULL COMMENT '料号名称',
    required_qty DECIMAL(12,2) NOT NULL COMMENT '应入库数量',
    received_qty DECIMAL(12,2) NOT NULL DEFAULT 0.00 COMMENT '已入库数量',
    shortage_qty DECIMAL(12,2) NOT NULL DEFAULT 0.00 COMMENT '缺件数量',
    kitting_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00 COMMENT '单项齐套率(%)',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_order_id (order_id),
    KEY idx_part_no (part_no),
    CONSTRAINT fk_item_order FOREIGN KEY (order_id) REFERENCES sales_orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单料号明细表';

CREATE TABLE IF NOT EXISTS inbound_records (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    order_id BIGINT UNSIGNED NOT NULL COMMENT '订单ID',
    item_id BIGINT UNSIGNED NOT NULL COMMENT '订单明细ID',
    batch_no VARCHAR(64) NOT NULL COMMENT '批次号',
    quantity DECIMAL(12,2) NOT NULL COMMENT '入库数量',
    operator VARCHAR(64) NOT NULL COMMENT '操作人',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_order_id (order_id),
    KEY idx_item_id (item_id),
    KEY idx_batch_no (batch_no),
    KEY idx_created_at (created_at),
    CONSTRAINT fk_record_order FOREIGN KEY (order_id) REFERENCES sales_orders(id),
    CONSTRAINT fk_record_item FOREIGN KEY (item_id) REFERENCES order_items(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='入库记录表';

INSERT INTO sales_orders (order_no, customer, delivery_date, status, kitting_rate) VALUES
('SO-2026-001', '华为技术有限公司', '2026-07-15', 'pending', 0.00),
('SO-2026-002', '中兴通讯股份公司', '2026-07-20', 'pending', 0.00),
('SO-2026-003', '大疆创新科技公司', '2026-07-10', 'pending', 0.00);

INSERT INTO order_items (order_id, part_no, part_name, required_qty) VALUES
(1, 'FG-A1001', '主控板组件', 100.00),
(1, 'FG-A1002', '电源模块', 100.00),
(1, 'FG-A1003', '外壳组件', 200.00),
(1, 'FG-A1004', '连接线缆', 300.00),
(2, 'FG-B2001', '传感器模组', 50.00),
(2, 'FG-B2002', '信号处理器', 50.00),
(2, 'FG-B2003', '天线组件', 100.00),
(3, 'FG-C3001', '飞控主板', 30.00),
(3, 'FG-C3002', '云台组件', 30.00),
(3, 'FG-C3003', '电池包', 60.00),
(3, 'FG-C3004', '遥控器', 30.00),
(3, 'FG-C3005', '螺旋桨套装', 120.00);

INSERT INTO inbound_records (order_id, item_id, batch_no, quantity, operator) VALUES
(1, 1, 'B20260615-001', 60.00, '张三'),
(1, 2, 'B20260615-002', 100.00, '张三'),
(1, 3, 'B20260616-001', 150.00, '李四'),
(2, 5, 'B20260617-001', 50.00, '张三'),
(2, 6, 'B20260617-002', 30.00, '王五'),
(3, 9, 'B20260618-001', 60.00, '李四'),
(3, 10, 'B20260618-002', 30.00, '张三');

UPDATE order_items SET received_qty = 60.00, shortage_qty = 40.00, kitting_rate = 60.00 WHERE id = 1;
UPDATE order_items SET received_qty = 100.00, shortage_qty = 0.00, kitting_rate = 100.00 WHERE id = 2;
UPDATE order_items SET received_qty = 150.00, shortage_qty = 50.00, kitting_rate = 75.00 WHERE id = 3;
UPDATE order_items SET received_qty = 0.00, shortage_qty = 300.00, kitting_rate = 0.00 WHERE id = 4;
UPDATE order_items SET received_qty = 50.00, shortage_qty = 0.00, kitting_rate = 100.00 WHERE id = 5;
UPDATE order_items SET received_qty = 30.00, shortage_qty = 20.00, kitting_rate = 60.00 WHERE id = 6;
UPDATE order_items SET received_qty = 0.00, shortage_qty = 100.00, kitting_rate = 0.00 WHERE id = 7;
UPDATE order_items SET received_qty = 0.00, shortage_qty = 30.00, kitting_rate = 0.00 WHERE id = 8;
UPDATE order_items SET received_qty = 60.00, shortage_qty = 0.00, kitting_rate = 100.00 WHERE id = 9;
UPDATE order_items SET received_qty = 30.00, shortage_qty = 0.00, kitting_rate = 100.00 WHERE id = 10;
UPDATE order_items SET received_qty = 0.00, shortage_qty = 30.00, kitting_rate = 0.00 WHERE id = 11;
UPDATE order_items SET received_qty = 0.00, shortage_qty = 120.00, kitting_rate = 0.00 WHERE id = 12;

UPDATE sales_orders SET kitting_rate = 58.75 WHERE id = 1;
UPDATE sales_orders SET kitting_rate = 53.33 WHERE id = 2;
UPDATE sales_orders SET kitting_rate = 40.00 WHERE id = 3;
