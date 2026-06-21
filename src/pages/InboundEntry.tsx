import { useState, useEffect } from 'react'
import { PackagePlus, CheckCircle } from 'lucide-react'
import { api } from '@/api'
import { useAppStore } from '@/store'
import type { SalesOrder, OrderItem } from '@/types'

interface InboundResult {
  part_name: string
  kitting_rate: number
}

export default function InboundEntry() {
  const { orders, setOrders, setLoading } = useAppStore()
  const [selectedOrderId, setSelectedOrderId] = useState<number | ''>('')
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [selectedItemId, setSelectedItemId] = useState<number | ''>('')
  const [batchNo, setBatchNo] = useState('')
  const [quantity, setQuantity] = useState('')
  const [operator, setOperator] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<InboundResult | null>(null)

  useEffect(() => {
    setLoading(true)
    api.getOrders({ page: 1, page_size: 200 })
      .then((res) => setOrders(res.list, res.total))
      .catch(() => setOrders([], 0))
      .finally(() => setLoading(false))
  }, [setOrders, setLoading])

  useEffect(() => {
    if (!selectedOrderId) {
      setOrderItems([])
      setSelectedItemId('')
      return
    }
    const order = orders.find((o) => o.id === Number(selectedOrderId))
    if (order?.items) {
      setOrderItems(order.items)
    } else {
      api.getOrder(Number(selectedOrderId)).then((o) => {
        setOrderItems(o.items || [])
      })
    }
    setSelectedItemId('')
  }, [selectedOrderId, orders])

  const handleSubmit = async () => {
    if (!selectedOrderId || !selectedItemId || !batchNo || !quantity || !operator) return
    setSubmitting(true)
    setResult(null)
    try {
      await api.createInbound({
        order_id: Number(selectedOrderId),
        item_id: Number(selectedItemId),
        batch_no: batchNo,
        quantity: Number(quantity),
        operator,
      })
      const updated = await api.getOrder(Number(selectedOrderId))
      const item = updated.items?.find((i) => i.id === Number(selectedItemId))
      setResult({
        part_name: item?.part_name || '',
        kitting_rate: item?.kitting_rate || 0,
      })
      setBatchNo('')
      setQuantity('')
      if (updated.items) setOrderItems(updated.items)
    } catch {
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-5">
      <h2 className="text-lg font-bold text-gray-800 mb-5">入库核对</h2>

      <div className="bg-gray-50 rounded-lg p-5 mb-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">入库登记</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">选择订单</label>
            <select
              value={selectedOrderId}
              onChange={(e) => setSelectedOrderId(Number(e.target.value) || '')}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 bg-white"
            >
              <option value="">请选择订单</option>
              {orders.map((o: SalesOrder) => (
                <option key={o.id} value={o.id}>{o.order_no} - {o.customer}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">选择料号</label>
            <select
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(Number(e.target.value) || '')}
              disabled={!selectedOrderId}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">请选择料号</option>
              {orderItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.part_no} - {item.part_name} (缺{item.shortage_qty})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">批次号</label>
            <input
              type="text"
              value={batchNo}
              onChange={(e) => setBatchNo(e.target.value)}
              placeholder="请输入批次号"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 bg-white"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">入库数量</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="请输入数量"
              min={1}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 bg-white"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">操作人</label>
            <input
              type="text"
              value={operator}
              onChange={(e) => setOperator(e.target.value)}
              placeholder="请输入操作人"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 bg-white"
            />
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={handleSubmit}
            disabled={submitting || !selectedOrderId || !selectedItemId || !batchNo || !quantity || !operator}
            className="flex items-center gap-1.5 px-5 py-2 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 active:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <PackagePlus className="w-4 h-4" />
            {submitting ? '提交中...' : '确认入库'}
          </button>
        </div>
      </div>

      {result && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-emerald-800">入库成功</p>
            <p className="text-xs text-emerald-600 mt-0.5">
              料号 <span className="font-semibold">{orderItems.find(i => i.id === Number(selectedItemId))?.part_no || ''}</span>（{result.part_name}）已入库，当前齐套率 <span className="font-bold">{result.kitting_rate}%</span>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
