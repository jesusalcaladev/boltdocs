import { CheckCircle2, Copy } from 'lucide-react'
import { useState, useEffect } from 'react'

export const Terminal = () => {
  const [copied, setCopied] = useState(false)
  const [text2, setText2] = useState('')
  const [text3, setText3] = useState('')
  const [show3, setShow3] = useState(false)

  const line2Full = '⠿ Initializing Boltdocs template...'
  const line3Full = '✔ Project created successfully'
  const command = 'pnpx create-boltdocs@latest'

  useEffect(() => {
    // Start typing line 2 after 500ms
    const startTimeout = setTimeout(() => {
      let i = 0
      const interval = setInterval(() => {
        setText2(line2Full.slice(0, i + 1))
        i++
        if (i >= line2Full.length) {
          clearInterval(interval)
          // Line 2 complete, show line 3 after a small delay
          setTimeout(() => setShow3(true), 300)
        }
      }, 25)
    }, 500)

    return () => clearTimeout(startTimeout)
  }, [])

  useEffect(() => {
    if (!show3) return

    let i = 0
    const interval = setInterval(() => {
      setText3(line3Full.slice(0, i + 1))
      i++
      if (i >= line3Full.length) {
        clearInterval(interval)
      }
    }, 25)

    return () => clearInterval(interval)
  }, [show3])

  const copyToClipboard = () => {
    navigator.clipboard.writeText(command)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-2xl mx-auto mt-12 relative group">
      <div className="relative bg-surface border border-text-main/10 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-text-main/10">
          <span className="text-[10px] font-mono text-on-surface-variant tracking-widest uppercase">
            create-boltdocs
          </span>
          <div className="w-12" />
        </div>
        <div className="p-6 font-mono text-sm sm:text-base text-left min-h-[140px]">
          {/* Line 1: Static */}
          <div className="flex gap-4">
            <span className="text-on-surface-variant/30 select-none">1</span>
            <div className="flex-1 flex gap-2">
              <span className="text-primary-300 font-bold">$</span>
              <span className="text-primary-300">{command}</span>
            </div>
            <button
              type="button"
              onClick={copyToClipboard}
              className="hover:scale-105 hover:cursor-pointer hover:text-primary-300 transition-all focus:outline-none"
            >
              {copied ? (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Line 2: Animated */}
          <div className="flex gap-4 mt-2 h-6">
            <span className="text-purple-400 select-none">2</span>
            <div className="flex-1 text-purple-400">
              {text2}
              {text2 !== line2Full && text2 !== '' && (
                <span className="animate-pulse border-r-2 border-primary-400 ml-1 h-4" />
              )}
            </div>
          </div>

          {/* Line 3: Animated */}
          {show3 && (
            <div className="flex gap-4 mt-1 h-6">
              <span className="text-green-300 select-none">3</span>
              <div className="flex-1 text-green-300 flex items-center">
                {text3}
                {text3 !== line3Full ? (
                  <span className="animate-pulse border-r-2 border-primary-400 ml-1 h-4" />
                ) : (
                  <span className="animate-pulse border-r-2 border-primary-400 ml-1 h-4" />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
