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

    // 1. Update internal state based on current intersection and position
    for (const entry of entries) {
      const item = this.items.find((i) => i.id === entry.target.id)
      if (item) {
        // item.active will track if the heading is currently "on or below" the trigger line
        item.active = entry.isIntersecting

        // item.fallback will track if the heading has scrolled "above" the trigger line
        // RootMargin top is -100px, so trigger line is at 100px.
        const activationLine = 100
        item.fallback =
          !entry.isIntersecting && entry.boundingClientRect.top < activationLine
      }
    }

    // 2. The active heading is the LAST one in document order that has scrolled past the line.
    let highlightIdx = -1
    for (let i = this.items.length - 1; i >= 0; i--) {
      if (this.items[i].fallback) {
        highlightIdx = i
        break
      }
    }

    // 3. Initial state: If no headings have passed the line yet, default to the first heading.
    if (highlightIdx === -1 && this.items.length > 0) {
      highlightIdx = 0
    }

    // 4. Map back to UI state
    this.items = this.items.map((item, idx) => ({
      ...item,
      active: idx === highlightIdx,
      t: idx === highlightIdx ? Date.now() : item.t,
    }))

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
