import type { SalesOrder, InboundRecord, KanbanItem, ShortageItem, PaginatedResponse } from '@/types'

const BASE_URL = '/api'

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(err.message || `请求失败: ${res.status}`)
  }
  return res.json()
}

interface OrderParams {
  page?: number
  page_size?: number
  status?: string
  keyword?: string
}

interface InboundParams {
  page?: number
  page_size?: number
  order_id?: number
  part_no?: string
}

interface KanbanParams {
  status?: string
  sort?: string
}

interface ReleaseParams {
  status?: string
}

interface CreateOrderData {
  order_no: string
  customer: string
  delivery_date: string
  items: { part_no: string; part_name: string; required_qty: number }[]
}

interface CreateInboundData {
  order_id: number
  item_id: number
  batch_no: string
  quantity: number
  operator: string
}

export const api = {
  getOrders: (params: OrderParams) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== '') as [string, string][]).toString()
    return request<PaginatedResponse<SalesOrder>>(`/orders${qs ? `?${qs}` : ''}`)
  },

  getOrder: (id: number) => request<SalesOrder>(`/orders/${id}`),

  createOrder: (data: CreateOrderData) => request<SalesOrder>('/orders', { method: 'POST', body: JSON.stringify(data) }),

  updateOrderStatus: (id: number, status: string) => request<SalesOrder>(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),

  createInbound: (data: CreateInboundData) => request<InboundRecord>('/inbound', { method: 'POST', body: JSON.stringify(data) }),

  getInboundRecords: (params: InboundParams) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== '') as [string, string][]).toString()
    return request<PaginatedResponse<InboundRecord>>(`/inbound/records${qs ? `?${qs}` : ''}`)
  },

  getKanban: (params: KanbanParams) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== '') as [string, string][]).toString()
    return request<KanbanItem[]>(`/kanban${qs ? `?${qs}` : ''}`)
  },

  getShortages: () => request<ShortageItem[]>('/kanban/shortages'),

  getReleaseOrders: (params: ReleaseParams) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== '') as [string, string][]).toString()
    return request<SalesOrder[]>(`/release${qs ? `?${qs}` : ''}`)
  },

  batchRelease: (data: { order_ids: number[]; action: string }) => request<void>('/release/batch', { method: 'POST', body: JSON.stringify(data) }),
}
