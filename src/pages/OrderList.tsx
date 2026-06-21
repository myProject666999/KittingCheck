import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, Eye } from 'lucide-react'
import { api } from '@/api'
import { useAppStore } from '@/store'
import { formatDate } from '@/lib/utils'
import StatusBadge from '@/components/StatusBadge'
import KittingRateBar from '@/components/KittingRateBar'
import type { SalesOrder } from '@/types'

export default function OrderList() {
  const navigate = useNavigate()
  const { orders, ordersTotal, setOrders, setLoading } = useAppStore()
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const [keyword, setKeyword] = useState('')
  const pageSize = 10

  useEffect(() => {
    setLoading(true)
    api.getOrders({ page, page_size: pageSize, status: status || undefined, keyword: keyword || undefined })
      .then((res) => setOrders(res.list, res.total))
      .catch(() => setOrders([], 0))
      .finally(() => setLoading(false))
  }, [page, status, keyword, setOrders, setLoading])

  const totalPages = Math.ceil(ordersTotal / pageSize)

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-gray-800">订单列表</h2>
        <button
          onClick={() => navigate('/orders/create')}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 active:bg-emerald-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          新建订单
        </button>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索订单号或客户..."
            value={keyword}
            onChange={(e) => { setKeyword(e.target.value); setPage(1) }}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
          />
        </div>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1) }}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 bg-white"
        >
          <option value="">全部状态</option>
          <option value="pending">待齐套</option>
          <option value="held">已挂起</option>
          <option value="released">已放行</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-3 px-4 font-medium text-gray-500">订单号</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">客户</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">交付日期</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">状态</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500 min-w-[180px]">齐套率</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">操作</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order: SalesOrder) => (
              <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors">
                <td className="py-3 px-4 font-medium text-gray-800">{order.order_no}</td>
                <td className="py-3 px-4 text-gray-600">{order.customer}</td>
                <td className="py-3 px-4 text-gray-600">{formatDate(order.delivery_date)}</td>
                <td className="py-3 px-4"><StatusBadge status={order.status} /></td>
                <td className="py-3 px-4"><KittingRateBar rate={order.kitting_rate} /></td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => navigate(`/orders/${order.id}`)}
                    className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    详情
                  </button>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-gray-400">暂无订单数据</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <span className="text-sm text-gray-500">共 {ordersTotal} 条记录</span>
          <div className="flex items-center gap-1">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1.5 text-sm rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              上一页
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-3 py-1.5 text-sm rounded border ${p === page ? 'bg-emerald-500 text-white border-emerald-500' : 'border-gray-200 hover:bg-gray-50'}`}
              >
                {p}
              </button>
            ))}
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1.5 text-sm rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              下一页
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
