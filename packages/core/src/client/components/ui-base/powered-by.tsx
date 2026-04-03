import { Zap } from 'lucide-react'

export function PoweredBy() {
  return (
    <div className="flex items-center justify-center mt-10 mb-4 px-4 w-full">
      <a
        href="https://github.com/jesusalcaladev/boltdocs"
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex items-center gap-2 px-4 py-2 rounded-full border border-border-subtle bg-bg-surface/50 backdrop-blur-md transition-all duration-300 hover:border-primary-500/50 hover:bg-bg-surface hover:shadow-xl hover:shadow-primary-500/5 select-none"
      >
        <Zap
          className="w-3.5 h-3.5 text-text-muted group-hover:text-primary-500 transition-colors duration-300"
          fill="currentColor"
        />
        <span className="text-[11px] font-medium text-text-muted group-hover:text-text-main transition-colors duration-300 tracking-wide">
          Powered by{' '}
          <strong className="font-bold text-text-main/80 group-hover:text-text-main">
            Boltdocs
          </strong>
        </span>
      </a>
    </div>
  )
}
