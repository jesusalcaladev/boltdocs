import { cn } from '@client/utils/cn'

export interface FieldProps {
  name: string
  type?: string
  defaultValue?: string
  required?: boolean
  children: React.ReactNode
  id?: string
  className?: string
}

export function Field({
  name,
  type,
  defaultValue,
  required = false,
  children,
  id,
  className = '',
}: FieldProps) {
  return (
    <article
      className={cn(
        'group relative my-6 rounded-xl border border-border-subtle bg-bg-surface p-5 transition-all duration-300',
        'hover:border-primary-500/30 hover:shadow-lg hover:shadow-primary-500/5',
        className,
      )}
      id={id}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <code className="inline-flex items-center rounded-md bg-primary-500/10 px-2.5 py-1 font-mono text-sm font-bold text-primary-400 border border-primary-500/20 shadow-sm transition-colors group-hover:bg-primary-500/15">
            {name}
          </code>
          {type && (
            <span className="rounded-md bg-bg-muted/80 border border-border-subtle px-2 py-0.5 text-[11px] font-semibold text-text-muted uppercase tracking-wider shadow-sm">
              {type}
            </span>
          )}
          {required && (
            <div className="flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-400 border border-red-500/20 shadow-sm">
              <span className="h-1 w-1 rounded-full bg-red-400 animate-pulse" />
              Required
            </div>
          )}
        </div>

        {defaultValue && (
          <div className="flex items-center gap-2 text-[11px] text-text-muted bg-bg-muted/30 px-2.5 py-1 rounded-md border border-border-subtle/50">
            <span className="font-semibold opacity-60 uppercase tracking-tighter">
              Default
            </span>
            <code className="font-mono text-text-main font-medium">
              {defaultValue}
            </code>
          </div>
        )}
      </div>

      <div className="text-sm text-text-muted leading-relaxed [&>p]:m-0 selection:bg-primary-500/30">
        {children}
      </div>
    </article>
  )
}
