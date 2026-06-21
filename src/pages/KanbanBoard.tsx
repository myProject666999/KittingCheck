import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/api'
import { useAppStore } from '@/store'
import { formatDate } from '@/lib/utils'
import StatusBadge from '@/components/StatusBadge'
import KittingRing from '@/components/KittingRing'
import type { KanbanItem } from '@/types'

export default function KanbanBoard() {
  const navigate = useNavigate()
  const { kanbanData, setKanbanData, setLoading } = useAppStore()
  const [status, setStatus] = useState('')
  const [sort, setSort] = useState('')

  useEffect(() => {
    setLoading(true)
    api.getKanban({ status: status || undefined, sort: sort || undefined })
      .then((data) => setKanbanData(data))
      .catch(() => setKanbanData([]))
      .finally(() => setLoading(false))
  }, [status, sort, setKanbanData, setLoading])

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-gray-800">齐套看板</h2>
        <div className="flex items-center gap-3">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 bg-white"
          >
            <option value="">全部状态</option>
            <option value="pending">待齐套</option>
            <option value="held">已挂起</option>
            <option value="released">已放行</option>
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 bg-white"
          >
            <option value="">默认排序</option>
            <option value="kitting_rate_asc">齐套率升序</option>
            <option value="kitting_rate_desc">齐套率降序</option>
            <option value="delivery_date_asc">交付日期升序</option>
            <option value="delivery_date_desc">交付日期降序</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {kanbanData.map((item: KanbanItem) => (
          <div
            key={item.id}
            onClick={() => navigate(`/orders/${item.id}`)}
            className="bg-white border border-gray-100 rounded-lg p-4 hover:shadow-md hover:border-emerald-200 cursor-pointer transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm font-bold text-gray-800">{item.order_no}</p>
                <p className="text-xs text-gray-500 mt-0.5">{item.customer}</p>
              </div>
              <StatusBadge status={item.status as 'pending' | 'held' | 'released'} />
            </div>

            <div className="flex items-center justify-center my-3">
              <KittingRing rate={item.kitting_rate} size={80} strokeWidth={6} />
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
              <span>已完成 <span className="font-semibold text-gray-700">{item.completed_items}</span> / {item.total_items} 料号</span>
              <span>交付 {formatDate(item.delivery_date)}</span>
            </div>
          </div>
        ))}
      </div>

      {kanbanData.length === 0 && (
        <div className="py-20 text-center text-gray-400">暂无看板数据</div>
      )}
    </div>
  )
}
