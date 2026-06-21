import { cn } from '@/lib/utils'

interface KittingRateBarProps {
  rate: number
  showLabel?: boolean
  size?: 'sm' | 'md'
}

function getBarColor(rate: number) {
  if (rate >= 100) return 'bg-emerald-500'
  if (rate >= 60) return 'bg-amber-500'
  return 'bg-red-500'
}

export default function KittingRateBar({ rate, showLabel = true, size = 'md' }: KittingRateBarProps) {
  const barColor = getBarColor(rate)
  const clampedRate = Math.min(100, Math.max(0, rate))
  const isSm = size === 'sm'

  return (
    <div className="flex items-center gap-2">
      <div className={cn('flex-1 rounded-full bg-gray-100 overflow-hidden', isSm ? 'h-1.5' : 'h-2.5')}>
        <div
          className={cn('h-full rounded-full transition-all duration-500', barColor)}
          style={{ width: `${clampedRate}%` }}
        />
      </div>
      {showLabel && (
        <span className={cn('font-medium tabular-nums', isSm ? 'text-xs min-w-[36px]' : 'text-sm min-w-[42px]', rate >= 100 ? 'text-emerald-600' : rate >= 60 ? 'text-amber-600' : 'text-red-600')}>
          {clampedRate}%
        </span>
      )}
    </div>
  )
}
