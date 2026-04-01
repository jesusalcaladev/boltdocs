import type { TOCItemInfo, TOCItemType } from '../on-this-page'

export function getItemId(url: string) {
  if (url.startsWith('#')) return url.slice(1)
  return null
}

export class Observer {
  items: TOCItemInfo[] = []
  single = false
  private observer: IntersectionObserver | null = null
  onChange?: () => void

  private callback(entries: IntersectionObserverEntry[]) {
    if (entries.length === 0) return

    let hasActive = false
    this.items = this.items.map((item) => {
      const entry = entries.find((entry) => entry.target.id === item.id)
      let active = entry ? entry.isIntersecting : item.active && !item.fallback
      if (this.single && hasActive) active = false

      if (item.active !== active) {
        item = {
          ...item,
          t: Date.now(),
          active,
          fallback: false,
        }
      }

      if (active) hasActive = true
      return item
    })

    if (!hasActive && entries[0].rootBounds) {
      const viewTop = entries[0].rootBounds.top
      let min = Number.MAX_VALUE
      let fallbackIdx = -1

      for (let i = 0; i < this.items.length; i++) {
        const element = document.getElementById(this.items[i].id)
        if (!element) continue

        const d = Math.abs(viewTop - element.getBoundingClientRect().top)
        if (d < min) {
          fallbackIdx = i
          min = d
        }
      }

      if (fallbackIdx !== -1) {
        this.items[fallbackIdx] = {
          ...this.items[fallbackIdx],
          active: true,
          fallback: true,
          t: Date.now(),
        }
      }
    }

    this.onChange?.()
  }

  setItems(newItems: TOCItemType[]) {
    const observer = this.observer
    if (observer) {
      for (const item of this.items) {
        const element = document.getElementById(item.id)
        if (!element) continue
        observer.unobserve(element)
      }
    }

    this.items = []
    for (const item of newItems) {
      const id = getItemId(item.url)
      if (!id) continue

      this.items.push({
        id,
        active: false,
        fallback: false,
        t: 0,
        original: item,
      })
    }
    this.watchItems()

    // In an SPA, the TOC might update before the MDX content is in the DOM.
    // We perform a few delayed scans to ensure we catch those elements.
    if (typeof window !== 'undefined') {
      setTimeout(() => this.watchItems(), 100)
      setTimeout(() => this.watchItems(), 500)
      setTimeout(() => this.watchItems(), 1000)
    }

    this.onChange?.()
  }

  watch(options?: IntersectionObserverInit) {
    if (this.observer) return
    this.observer = new IntersectionObserver(this.callback.bind(this), options)
    this.watchItems()
  }

  private watchItems() {
    if (!this.observer) return
    for (const item of this.items) {
      const element = document.getElementById(item.id)
      if (!element) continue
      this.observer.observe(element)
    }
  }

  unwatch() {
    this.observer?.disconnect()
    this.observer = null
  }
}
