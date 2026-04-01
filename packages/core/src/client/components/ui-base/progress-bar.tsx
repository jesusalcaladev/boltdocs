import { useEffect, useState } from 'react'
import { ProgressBar as AriaProgressBar } from 'react-aria-components'

/**
 * A reading progress bar component that tracks the scroll position
 * within the Boltdocs content area.
 *
 * It utilizes react-aria-components for accessibility and is fixed
 * to the top of the viewport for a premium, non-intrusive UI experience.
 */
export function ProgressBar() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let container: Element | null = null
    let timer: NodeJS.Timeout

    const handleScroll = () => {
      if (!container) return
      const { scrollTop, scrollHeight, clientHeight } = container
      if (scrollHeight <= clientHeight) {
        setProgress(0)
        return
      }
      const scrollPercent = (scrollTop / (scrollHeight - clientHeight)) * 100
      setProgress(Math.min(100, Math.max(0, scrollPercent)))
    }

    const attachListener = () => {
      // Find the main content area for Boltdocs
      container = document.querySelector('.boltdocs-content')
      if (container) {
        container.addEventListener('scroll', handleScroll)
        handleScroll()
        if (timer) clearInterval(timer)
        return true
      }
      return false
    }

    // Since the container might not be present at mount (if content is lazy loaded),
    // we poll until it's found or the component unmounts.
    if (!attachListener()) {
      timer = setInterval(attachListener, 100)
    }

    return () => {
      if (container) container.removeEventListener('scroll', handleScroll)
      if (timer) clearInterval(timer)
    }
  }, [])

  return (
    <AriaProgressBar
      value={progress}
      aria-label="Reading progress"
      className="fixed top-0 left-0 right-0 z-999 h-0.5 bg-transparent w-full pointer-events-none"
    >
      {({ percentage }) => (
        <div
          className="h-full bg-primary-500 transition-[width] duration-300 ease-out shadow-[0_0_8px_rgba(var(--primary-rgb),0.4)]"
          style={{ width: `${percentage}%` }}
        />
      )}
    </AriaProgressBar>
  )
}
