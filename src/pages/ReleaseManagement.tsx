import { useState, useEffect } from 'react'
import { Play, Square, CheckSquare } from 'lucide-react'
import { api } from '@/api'
import { useAppStore } from '@/store'
import { formatDate } from '@/lib/utils'
import KittingRateBar from '@/components/KittingRateBar'
import type { SalesOrder } from '@/types'

type TabType = 'releasable' | 'held'

export default function ReleaseManagement() {
  const { releaseOrders, setReleaseOrders, setLoading } = useAppStore()
  const [tab, setTab] = useState<TabType>('releasable')
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    const status = tab === 'releasable' ? 'pending' : 'held'
    api.getReleaseOrders({ status })
      .then((data) => { setReleaseOrders(data); setSelectedIds(new Set()) })
      .catch(() => setReleaseOrders([]))
      .finally(() => setLoading(false))
  }, [tab, setReleaseOrders, setLoading])

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (selectedIds.size === releaseOrders.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(releaseOrders.map((o) => o.id)))
    }
  }

  const handleBatchAction = async (action: string) => {
    if (selectedIds.size === 0 || actionLoading) return
    setActionLoading(true)
    try {
      await api.batchRelease({ order_ids: Array.from(selectedIds), action })
      const status = tab === 'releasable' ? 'pending' : 'held'
      const data = await api.getReleaseOrders({ status })
      setReleaseOrders(data)
      setSelectedIds(new Set())
    } catch {
    } finally {
      setActionLoading(false)
    }
  }

  const handleSingleAction = async (id: number, action: string) => {
    setActionLoading(true)
    try {
      await api.batchRelease({ order_ids: [id], action })
      const status = tab === 'releasable' ? 'pending' : 'held'
      const data = await api.getReleaseOrders({ status })
      setReleaseOrders(data)
    } catch {
    } finally {
      setActionLoading(false)
    }
  }

  const releasableOrders = tab === 'releasable' ? releaseOrders : []
  const heldOrders = tab === 'held' ? releaseOrders : []
  const currentOrders = tab === 'releasable' ? releasableOrders : heldOrders

  return (
    <div className="p-5">
      <h2 className="text-lg font-bold text-gray-800 mb-5">放行管理</h2>

      <div className="flex items-center border-b border-gray-100 mb-5">
        <button
          onClick={() => setTab('releasable')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === 'releasable' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          可放行
        </button>
        <button
          onClick={() => setTab('held')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === 'held' ? 'border-red-500 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          已挂起
        </button>
      </div>

      {currentOrders.length > 0 && (
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={toggleAll}
            className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-800"
          >
            <CheckSquare className={`w-4 h-4 ${selectedIds.size === currentOrders.length ? 'text-emerald-500' : ''}`} />
            {selectedIds.size === currentOrders.length ? '取消全选' : '全选'}
          </button>
          {selectedIds.size > 0 && (
            <button
              onClick={() => handleBatchAction(tab === 'releasable' ? 'release' : 'unhold')}
              disabled={actionLoading}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg text-white transition-colors disabled:opacity-50 ${tab === 'releasable' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-amber-500 hover:bg-amber-600'}`}
            >
              {tab === 'releasable' ? `批量放行 (${selectedIds.size})` : `批量解除挂起 (${selectedIds.size})`}
            </button>
          )}
        </div>
      )}

      <div className="space-y-3">
        {currentOrders.map((order: SalesOrder) => (
          <div
            key={order.id}
            className={`border rounded-lg p-4 flex items-center gap-4 transition-all ${selectedIds.has(order.id) ? 'border-emerald-300 bg-emerald-50/50' : 'border-gray-100 hover:border-gray-200'}`}
          >
            <button
              onClick={() => toggleSelect(order.id)}
              className="flex-shrink-0"
            >
              <CheckSquare className={`w-5 h-5 ${selectedIds.has(order.id) ? 'text-emerald-500' : 'text-gray-300'}`} />
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-bold text-gray-800">{order.order_no}</span>
                <span className="text-xs text-gray-400">|</span>
                <span className="text-sm text-gray-600">{order.customer}</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>交付日期: {formatDate(order.delivery_date)}</span>
              </div>
            </div>
            <div className="w-40 flex-shrink-0">
              <KittingRateBar rate={order.kitting_rate} size="sm" />
            </div>
            <div className="flex-shrink-0">
              {tab === 'releasable' ? (
                <button
                  onClick={() => handleSingleAction(order.id, 'release')}
                  disabled={actionLoading}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 active:bg-emerald-700 disabled:opacity-50 transition-colors"
                >
                  <Play className="w-3.5 h-3.5" />
                  放行
                </button>
              ) : (
                <button
                  onClick={() => handleSingleAction(order.id, 'unhold')}
                  disabled={actionLoading}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-amber-500 text-white rounded-lg hover:bg-amber-600 active:bg-amber-700 disabled:opacity-50 transition-colors"
                >
                  <Square className="w-3.5 h-3.5" />
                  解除挂起
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {currentOrders.length === 0 && (
        <div className="py-20 text-center text-gray-400">
          {tab === 'releasable' ? '暂无可放行订单' : '暂无已挂起订单'}
        </div>
      )}
    </div>
  )
}
