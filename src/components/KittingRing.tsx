import { cn } from '@/lib/utils'

interface KittingRingProps {
  rate: number
  size?: number
  strokeWidth?: number
}

function getRingColor(rate: number) {
  if (rate >= 100) return { stroke: '#10B981', text: 'text-emerald-600' }
  if (rate >= 60) return { stroke: '#F59E0B', text: 'text-amber-600' }
  return { stroke: '#EF4444', text: 'text-red-600' }
}

export default function KittingRing({ rate, size = 80, strokeWidth = 6 }: KittingRingProps) {
  const clampedRate = Math.min(100, Math.max(0, rate))
  const colors = getRingColor(rate)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (clampedRate / 100) * circumference
  const center = size / 2

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={colors.stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>
      <span className={cn('absolute font-bold tabular-nums', size >= 80 ? 'text-lg' : 'text-sm', colors.text)}>
        {clampedRate}%
      </span>
    </div>
  )
}
