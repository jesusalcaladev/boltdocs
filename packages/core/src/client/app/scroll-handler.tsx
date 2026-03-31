import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Handles scroll restoration and hash scrolling on navigation.
 * It ensures the page scrolls to top on pathname changes,
 * or specifically to an anchor element if a hash is present.
 */
export function ScrollHandler() {
  const { pathname, hash } = useLocation()

  // biome-ignore lint/correctness/useExhaustiveDependencies: pathname is used as a trigger for scroll-to-top on navigation
  useLayoutEffect(() => {
    const container = document.querySelector('.boltdocs-content')
    if (!container) return

    if (hash) {
      const id = hash.replace('#', '')
      const element = document.getElementById(id)
      if (element) {
        const offset = 80
        const containerRect = container.getBoundingClientRect().top
        const elementRect = element.getBoundingClientRect().top
        const elementPosition = elementRect - containerRect
        const offsetPosition = elementPosition - offset + container.scrollTop

        container.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        })
        return
      }
    }

    // Scroll to top on navigation when no hash is specified
    container.scrollTo(0, 0)
  }, [pathname, hash])

  return null
}
