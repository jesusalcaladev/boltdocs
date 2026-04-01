import { Zap } from 'lucide-react'

export function PoweredBy() {
  return (
    <div className="rounded-full px-4 py-2 bg-gray-100 text-xs text-gray-500 flex items-center gap-1 mt-6 justify-center">
      <a
        href="https://github.com/jesusalcaladev/boltdocs"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1"
      >
        <Zap className="powered-by-icon" size={12} fill="currentColor" />
        <span>
          Powered by <strong>Boltdocs</strong>
        </span>
      </a>
    </div>
  )
}
