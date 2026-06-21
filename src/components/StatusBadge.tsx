import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: 'pending' | 'held' | 'released'
}

const statusConfig = {
  pending: { label: '待齐套', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  held: { label: '已挂起', className: 'bg-red-50 text-red-700 border-red-200' },
  released: { label: '已放行', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status]
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border', config.className)}>
      {config.label}
    </span>
  )
}
