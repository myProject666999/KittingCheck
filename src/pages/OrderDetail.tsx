import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Play, Pause } from 'lucide-react'
import { api } from '@/api'
import { useAppStore } from '@/store'
import { formatDate } from '@/lib/utils'
import StatusBadge from '@/components/StatusBadge'
import KittingRateBar from '@/components/KittingRateBar'
import KittingRing from '@/components/KittingRing'

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { currentOrder, setCurrentOrder, setLoading } = useAppStore()
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    api.getOrder(Number(id))
      .then((order) => setCurrentOrder(order))
      .catch(() => setCurrentOrder(null))
      .finally(() => setLoading(false))
    return () => setCurrentOrder(null)
  }, [id, setCurrentOrder, setLoading])

  const handleStatusChange = async (newStatus: 'released' | 'held') => {
    if (!currentOrder || actionLoading) return
    setActionLoading(true)
    try {
      const updated = await api.updateOrderStatus(currentOrder.id, newStatus)
      setCurrentOrder(updated)
    } catch {
    } finally {
      setActionLoading(false)
    }
  }

  if (!currentOrder) {
    return (
      <div className="p-5 text-center text-gray-400 py-20">
        <p>订单不存在或加载中...</p>
        <button onClick={() => navigate('/orders')} className="mt-3 text-emerald-600 hover:underline text-sm">
          返回订单列表
        </button>
      </div>
    )
  }

  const order = currentOrder

  return (
    <div className="p-5">
      <div className="flex items-center gap-2 mb-5">
        <button
          onClick={() => navigate('/orders')}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </button>
        <h2 className="text-lg font-bold text-gray-800">订单详情</h2>
      </div>

      <div className="bg-gray-50 rounded-lg p-5 mb-5">
        <div className="flex items-start justify-between">
          <div className="grid grid-cols-2 gap-x-12 gap-y-3">
            <div>
              <span className="text-xs text-gray-400">订单号</span>
              <p className="text-sm font-semibold text-gray-800">{order.order_no}</p>
            </div>
            <div>
              <span className="text-xs text-gray-400">客户</span>
              <p className="text-sm font-semibold text-gray-800">{order.customer}</p>
            </div>
            <div>
              <span className="text-xs text-gray-400">交付日期</span>
              <p className="text-sm font-semibold text-gray-800">{formatDate(order.delivery_date)}</p>
            </div>
            <div>
              <span className="text-xs text-gray-400">状态</span>
              <div className="mt-0.5"><StatusBadge status={order.status} /></div>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <KittingRing rate={order.kitting_rate} size={90} strokeWidth={7} />
            <span className="text-xs text-gray-400 mt-1">总齐套率</span>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
          {order.status === 'pending' && (
            <button
              onClick={() => handleStatusChange('released')}
              disabled={actionLoading}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 active:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              <Play className="w-4 h-4" />
              放行
            </button>
          )}
          {order.status !== 'held' && (
            <button
              onClick={() => handleStatusChange('held')}
              disabled={actionLoading}
              className="flex items-center gap-1.5 px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 active:bg-red-700 disabled:opacity-50 transition-colors"
            >
              <Pause className="w-4 h-4" />
              挂起
            </button>
          )}
          {order.status === 'held' && (
            <button
              onClick={() => handleStatusChange('released')}
              disabled={actionLoading}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 active:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              <Play className="w-4 h-4" />
              解除挂起
            </button>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">料号明细</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2.5 px-4 font-medium text-gray-500">料号</th>
                <th className="text-left py-2.5 px-4 font-medium text-gray-500">名称</th>
                <th className="text-right py-2.5 px-4 font-medium text-gray-500">应入数量</th>
                <th className="text-right py-2.5 px-4 font-medium text-gray-500">已入数量</th>
                <th className="text-right py-2.5 px-4 font-medium text-gray-500">缺件数量</th>
                <th className="text-left py-2.5 px-4 font-medium text-gray-500 min-w-[160px]">齐套率</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item) => (
                <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors">
                  <td className="py-2.5 px-4 font-medium text-gray-800">{item.part_no}</td>
                  <td className="py-2.5 px-4 text-gray-600">{item.part_name}</td>
                  <td className="py-2.5 px-4 text-right text-gray-600">{item.required_qty}</td>
                  <td className="py-2.5 px-4 text-right text-gray-600">{item.received_qty}</td>
                  <td className="py-2.5 px-4 text-right font-medium text-red-600">{item.shortage_qty}</td>
                  <td className="py-2.5 px-4"><KittingRateBar rate={item.kitting_rate} size="sm" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
