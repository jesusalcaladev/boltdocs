import {
  Info,
  Lightbulb,
  AlertTriangle,
  ShieldAlert,
  Bookmark,
  Zap,
  Flame,
} from 'lucide-react'
import { cn } from '../../utils/cn'
import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'

const ICON_MAP: Record<string, React.ReactNode> = {
  note: <Bookmark size={18} />,
  tip: <Lightbulb size={18} />,
  info: <Info size={18} />,
  warning: <AlertTriangle size={18} />,
  danger: <ShieldAlert size={18} />,
  important: <Flame size={18} />,
  caution: <Zap size={18} />,
}

const LABEL_MAP: Record<string, string> = {
  note: 'Note',
  tip: 'Tip',
  info: 'Info',
  warning: 'Warning',
  danger: 'Danger',
  important: 'Important',
  caution: 'Caution',
}

const admonitionVariants = cva('py-4 px-4 rounded-lg', {
  variants: {
    type: {
      note: 'border-primary-400 bg-primary-500/5 text-primary-400',
      tip: 'border-emerald-500 bg-emerald-500/5 text-emerald-500',
      info: 'border-sky-500 bg-sky-500/5 text-sky-500',
      warning: 'border-amber-500 bg-amber-500/5 text-amber-500',
      danger: 'border-red-500 bg-red-500/5 text-red-500',
      important: 'border-orange-500 bg-orange-500/5 text-orange-500',
      caution: 'border-yellow-500 bg-yellow-500/5 text-yellow-500',
    },
  },
  defaultVariants: {
    type: 'note',
  },
})
type AdmonitionVariants = VariantProps<typeof admonitionVariants>

export interface AdmonitionProps
  extends React.HTMLAttributes<HTMLDivElement>,
    AdmonitionVariants {
  title?: string
  children: React.ReactNode
}

export function Admonition({
  type = 'note',
  title,
  children,
  className = '',
  ...rest
}: AdmonitionProps) {
  return (
    <div
      className={cn(admonitionVariants({ type }), className)}
      role={type === 'warning' || type === 'danger' ? 'alert' : 'note'}
      {...rest}
    >
      <div className="flex items-center flex-row gap-2 mb-2">
        <span className={cn('shrink-0', admonitionVariants({ type }))}>
          {ICON_MAP[type as keyof typeof ICON_MAP]}
        </span>
        <span className="text-sm font-bold tracking-tight text-text-main">
          {title || LABEL_MAP[type as keyof typeof LABEL_MAP]}
        </span>
      </div>
      <div className="text-sm text-text-muted leading-relaxed [&>p]:m-0 [&>p]:mb-2 [&>p:last-child]:mb-0">
        {children}
      </div>
    </div>
  )
}

export const Note = (props: Omit<AdmonitionProps, 'type'>) => (
  <Admonition type="note" {...props} />
)
export const Tip = (props: Omit<AdmonitionProps, 'type'>) => (
  <Admonition type="tip" {...props} />
)
export const Warning = (props: Omit<AdmonitionProps, 'type'>) => (
  <Admonition type="warning" {...props} />
)
export const Danger = (props: Omit<AdmonitionProps, 'type'>) => (
  <Admonition type="danger" {...props} />
)
export const InfoBox = (props: Omit<AdmonitionProps, 'type'>) => (
  <Admonition type="info" {...props} />
)
export const Important = (props: Omit<AdmonitionProps, 'type'>) => (
  <Admonition type="important" {...props} />
)
export const Caution = (props: Omit<AdmonitionProps, 'type'>) => (
  <Admonition type="caution" {...props} />
)
