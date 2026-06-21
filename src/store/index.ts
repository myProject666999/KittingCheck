import { create } from 'zustand'
import type { SalesOrder, InboundRecord, KanbanItem, ShortageItem } from '@/types'

interface AppState {
  orders: SalesOrder[]
  ordersTotal: number
  currentOrder: SalesOrder | null
  inboundRecords: InboundRecord[]
  inboundTotal: number
  kanbanData: KanbanItem[]
  shortages: ShortageItem[]
  releaseOrders: SalesOrder[]
  loading: boolean

  setOrders: (orders: SalesOrder[], total: number) => void
  setCurrentOrder: (order: SalesOrder | null) => void
  setInboundRecords: (records: InboundRecord[], total: number) => void
  setKanbanData: (data: KanbanItem[]) => void
  setShortages: (data: ShortageItem[]) => void
  setReleaseOrders: (orders: SalesOrder[]) => void
  setLoading: (loading: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  orders: [],
  ordersTotal: 0,
  currentOrder: null,
  inboundRecords: [],
  inboundTotal: 0,
  kanbanData: [],
  shortages: [],
  releaseOrders: [],
  loading: false,

  setOrders: (orders, total) => set({ orders, ordersTotal: total }),
  setCurrentOrder: (order) => set({ currentOrder: order }),
  setInboundRecords: (records, total) => set({ inboundRecords: records, inboundTotal: total }),
  setKanbanData: (data) => set({ kanbanData: data }),
  setShortages: (data) => set({ shortages: data }),
  setReleaseOrders: (orders) => set({ releaseOrders: orders }),
  setLoading: (loading) => set({ loading }),
}))
