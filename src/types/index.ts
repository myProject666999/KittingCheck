export interface SalesOrder {
  id: number
  order_no: string
  customer: string
  delivery_date: string
  status: 'pending' | 'held' | 'released'
  kitting_rate: number
  created_at: string
  updated_at: string
  items?: OrderItem[]
}

export interface OrderItem {
  id: number
  order_id: number
  part_no: string
  part_name: string
  required_qty: number
  received_qty: number
  shortage_qty: number
  kitting_rate: number
}

export interface InboundRecord {
  id: number
  order_no: string
  part_no: string
  part_name: string
  batch_no: string
  quantity: number
  operator: string
  created_at: string
}

export interface KanbanItem {
  id: number
  order_no: string
  customer: string
  kitting_rate: number
  total_items: number
  completed_items: number
  status: string
  delivery_date: string
}

export interface ShortageItem {
  order_no: string
  part_no: string
  part_name: string
  required_qty: number
  received_qty: number
  shortage_qty: number
}

export interface PaginatedResponse<T> {
  total: number
  list: T[]
}
