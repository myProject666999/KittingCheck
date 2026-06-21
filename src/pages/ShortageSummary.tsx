import { useState, useEffect } from 'react'
import { api } from '@/api'
import { useAppStore } from '@/store'
import type { ShortageItem } from '@/types'

export default function ShortageSummary() {
  const { shortages, setShortages, setLoading } = useAppStore()
  const [sortedData, setSortedData] = useState<ShortageItem[]>([])

  useEffect(() => {
    setLoading(true)
    api.getShortages()
      .then((data) => {
        setShortages(data)
        setSortedData([...data].sort((a, b) => b.shortage_qty - a.shortage_qty))
      })
      .catch(() => { setShortages([]); setSortedData([]) })
      .finally(() => setLoading(false))
  }, [setShortages, setLoading])

  return (
    <div className="p-5">
      <h2 className="text-lg font-bold text-gray-800 mb-5">缺件汇总</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-3 px-4 font-medium text-gray-500">订单号</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">料号</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">名称</th>
              <th className="text-right py-3 px-4 font-medium text-gray-500">应入数量</th>
              <th className="text-right py-3 px-4 font-medium text-gray-500">已入数量</th>
              <th className="text-right py-3 px-4 font-medium text-gray-500">缺件数量</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((item, index) => (
              <tr key={`${item.order_no}-${item.part_no}-${index}`} className="border-b border-gray-50 hover:bg-red-50/50 transition-colors">
                <td className="py-3 px-4 font-medium text-gray-800">{item.order_no}</td>
                <td className="py-3 px-4 text-gray-600">{item.part_no}</td>
                <td className="py-3 px-4 text-gray-600">{item.part_name}</td>
                <td className="py-3 px-4 text-right text-gray-600">{item.required_qty}</td>
                <td className="py-3 px-4 text-right text-gray-600">{item.received_qty}</td>
                <td className="py-3 px-4 text-right font-bold text-red-600">{item.shortage_qty}</td>
              </tr>
            ))}
            {sortedData.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-gray-400">暂无缺件数据</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
