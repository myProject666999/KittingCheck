import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { api } from '@/api'
import { useAppStore } from '@/store'
import type { InboundRecord } from '@/types'

export default function InboundRecords() {
  const { inboundRecords, inboundTotal, setInboundRecords, setLoading } = useAppStore()
  const [page, setPage] = useState(1)
  const [orderId, setOrderId] = useState('')
  const [partNo, setPartNo] = useState('')
  const pageSize = 10

  useEffect(() => {
    setLoading(true)
    api.getInboundRecords({ page, page_size: pageSize, order_id: orderId ? Number(orderId) : undefined, part_no: partNo || undefined })
      .then((res) => setInboundRecords(res.list, res.total))
      .catch(() => setInboundRecords([], 0))
      .finally(() => setLoading(false))
  }, [page, orderId, partNo, setInboundRecords, setLoading])

  const totalPages = Math.ceil(inboundTotal / pageSize)

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-gray-800">入库记录</h2>
        <Link
          to="/inbound"
          className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
        >
          返回入库登记
        </Link>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索料号..."
            value={partNo}
            onChange={(e) => { setPartNo(e.target.value); setPage(1) }}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
          />
        </div>
        <input
          type="text"
          placeholder="订单ID筛选"
          value={orderId}
          onChange={(e) => { setOrderId(e.target.value); setPage(1) }}
          className="w-40 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-3 px-4 font-medium text-gray-500">时间</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">订单号</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">料号</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">名称</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">批次号</th>
              <th className="text-right py-3 px-4 font-medium text-gray-500">数量</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">操作人</th>
            </tr>
          </thead>
          <tbody>
            {inboundRecords.map((record: InboundRecord) => (
              <tr key={record.id} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors">
                <td className="py-3 px-4 text-gray-500">{new Date(record.created_at).toLocaleString('zh-CN')}</td>
                <td className="py-3 px-4 font-medium text-gray-800">{record.order_no}</td>
                <td className="py-3 px-4 text-gray-600">{record.part_no}</td>
                <td className="py-3 px-4 text-gray-600">{record.part_name}</td>
                <td className="py-3 px-4 text-gray-600">{record.batch_no}</td>
                <td className="py-3 px-4 text-right font-medium text-emerald-600">{record.quantity}</td>
                <td className="py-3 px-4 text-gray-600">{record.operator}</td>
              </tr>
            ))}
            {inboundRecords.length === 0 && (
              <tr>
                <td colSpan={7} className="py-12 text-center text-gray-400">暂无入库记录</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <span className="text-sm text-gray-500">共 {inboundTotal} 条记录</span>
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
