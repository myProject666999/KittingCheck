import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2 } from 'lucide-react'
import { api } from '@/api'

interface ItemRow {
  part_no: string
  part_name: string
  required_qty: number
}

export default function OrderCreate() {
  const navigate = useNavigate()
  const [orderNo, setOrderNo] = useState('')
  const [customer, setCustomer] = useState('')
  const [deliveryDate, setDeliveryDate] = useState('')
  const [items, setItems] = useState<ItemRow[]>([{ part_no: '', part_name: '', required_qty: 0 }])
  const [submitting, setSubmitting] = useState(false)

  const addItem = () => {
    setItems([...items, { part_no: '', part_name: '', required_qty: 0 }])
  }

  const removeItem = (index: number) => {
    if (items.length <= 1) return
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof ItemRow, value: string | number) => {
    const updated = [...items]
    updated[index] = { ...updated[index], [field]: value }
    setItems(updated)
  }

  const handleSubmit = async () => {
    if (!orderNo || !customer || !deliveryDate) return
    const validItems = items.filter((item) => item.part_no && item.required_qty > 0)
    if (validItems.length === 0) return

    setSubmitting(true)
    try {
      await api.createOrder({
        order_no: orderNo,
        customer,
        delivery_date: deliveryDate,
        items: validItems.map((item) => ({
          part_no: item.part_no,
          part_name: item.part_name,
          required_qty: item.required_qty,
        })),
      })
      navigate('/orders')
    } catch {
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-5">
      <h2 className="text-lg font-bold text-gray-800 mb-5">新建订单</h2>

      <div className="bg-gray-50 rounded-lg p-5 mb-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">基本信息</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">订单编号</label>
            <input
              type="text"
              value={orderNo}
              onChange={(e) => setOrderNo(e.target.value)}
              placeholder="请输入订单编号"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 bg-white"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">客户名称</label>
            <input
              type="text"
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              placeholder="请输入客户名称"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 bg-white"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">交付日期</label>
            <input
              type="date"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 bg-white"
            />
          </div>
        </div>
      </div>

      <div className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">料号明细</h3>
          <button
            onClick={addItem}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            添加料号
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 px-3 font-medium text-gray-500">料号</th>
                <th className="text-left py-2 px-3 font-medium text-gray-500">名称</th>
                <th className="text-left py-2 px-3 font-medium text-gray-500">应入数量</th>
                <th className="text-left py-2 px-3 font-medium text-gray-500 w-16">操作</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index} className="border-b border-gray-50">
                  <td className="py-2 px-3">
                    <input
                      type="text"
                      value={item.part_no}
                      onChange={(e) => updateItem(index, 'part_no', e.target.value)}
                      placeholder="料号"
                      className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 bg-white"
                    />
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="text"
                      value={item.part_name}
                      onChange={(e) => updateItem(index, 'part_name', e.target.value)}
                      placeholder="名称"
                      className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 bg-white"
                    />
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="number"
                      value={item.required_qty || ''}
                      onChange={(e) => updateItem(index, 'required_qty', Number(e.target.value))}
                      placeholder="数量"
                      min={0}
                      className="w-32 px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 bg-white"
                    />
                  </td>
                  <td className="py-2 px-3">
                    <button
                      onClick={() => removeItem(index)}
                      disabled={items.length <= 1}
                      className="p-1 text-red-400 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="px-6 py-2 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 active:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? '提交中...' : '提交订单'}
        </button>
        <button
          onClick={() => navigate('/orders')}
          className="px-6 py-2 text-gray-600 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          取消
        </button>
      </div>
    </div>
  )
}
