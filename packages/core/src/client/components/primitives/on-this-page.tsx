import React, {
  createContext,
  use,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react'
import scrollIntoView from 'scroll-into-view-if-needed'
import { cn } from '../../utils/cn'
import { useOnChange } from '../../utils/use-on-change'
import type { ComponentBase } from './types'
import { getItemId } from './helpers/observer'

export interface TOCItemType {
  title: ReactNode
  url: string
  depth: number
  _step?: number
}

export type TableOfContents = TOCItemType[]

export interface TOCItemInfo {
  id: string
  active: boolean
  /** last time the item is updated */
  t: number
  /** currently active but not intersecting in viewport */
  fallback: boolean
  original?: TOCItemType
}

export interface AnchorProviderProps {
  toc: TOCItemType[]
  /**
   * Only accept one active item at most
   * @defaultValue false
   */
  single?: boolean
  children?: ReactNode
}

export interface ScrollProviderProps {
  /**
   * Scroll into the view of container when active
   */
  containerRef: RefObject<HTMLElement | null>
  children?: ReactNode
}

export interface OnThisPageContentProps extends ComponentBase {
  ref?: React.Ref<HTMLDivElement>
  scrollRef?: RefObject<HTMLElement | null>
}

export interface OnThisPageItemProps extends ComponentBase {
  level?: number
}

export interface OnThisPageLinkProps extends ComponentBase {
  href?: string
  active?: boolean
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void
}

export interface OnThisPageIndicatorProps extends ComponentBase {
  style?: React.CSSProperties
}

const ItemsContext = createContext<TOCItemInfo[] | null>(null)
const ScrollContext = createContext<RefObject<HTMLElement | null> | null>(null)

class Observer {
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

    // If no headings are intersecting, the active one is typically the one 
    // above the viewport. We can determine this by checking if the first 
    // intersecting element's bounding box is below the root.
    if (!hasActive && entries.length > 0) {
      const firstEntry = entries[0]
      // If the top-most visible entry is below the top of the viewport,
      // then the active anchor should be the one immediately preceding it.
      if (firstEntry.boundingClientRect.top > 0) {
        const firstIdx = this.items.findIndex(i => i.id === firstEntry.target.id)
        if (firstIdx > 0) {
          this.items = this.items.map((item, idx) => ({
            ...item,
            active: idx === firstIdx - 1,
            fallback: idx === firstIdx - 1,
            t: idx === firstIdx - 1 ? Date.now() : item.t
          }))
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

export function useItems() {
  const ctx = use(ItemsContext)
  if (!ctx)
    throw new Error(
      `Component must be used under the <AnchorProvider /> component.`,
    )
  return ctx
}


export function useActiveAnchor(): string | undefined {
  const items = useItems()
  return useMemo(() => {
    let out: TOCItemInfo | undefined
    for (const item of items) {
      if (!item.active) continue
      if (!out || item.t > out.t) {
        out = item
      }
    }
    return out?.id
  }, [items])
}

export function useActiveAnchors(): string[] {
  const items = useItems()
  return useMemo(() => {
    const out: string[] = []
    for (const item of items) {
      if (item.active) out.push(item.id)
    }
    return out
  }, [items])
}

/** Optional: add auto-scroll to TOC items. */
export function ScrollProvider({
  containerRef,
  children,
}: ScrollProviderProps) {
  return (
    <ScrollContext.Provider value={containerRef}>
      {children}
    </ScrollContext.Provider>
  )
}

export function AnchorProvider({
  toc,
  single = false,
  children,
}: AnchorProviderProps) {
  const observer = useMemo(() => new Observer(), [])
  const [items, setItems] = useState<TOCItemInfo[]>(observer.items)

  observer.single = single
  useEffect(() => {
    observer.setItems(toc)
  }, [observer, toc])

  useEffect(() => {
    // We use a rootMargin that covers the top part of the screen
    // and a smaller threshold to make it more responsive.
    observer.watch({
      rootMargin: '-20px 0% -80% 0%',
      threshold: [0, 1],
    })
    observer.onChange = () => setItems([...observer.items])

    return () => {
      observer.unwatch()
    }
  }, [observer])

  return <ItemsContext.Provider value={items}>{children}</ItemsContext.Provider>
}

export const OnThisPageRoot = ({ children, className }: ComponentBase) => {
  return (
    <nav
      className={cn(
        'sticky top-navbar hidden xl:flex flex-col shrink-0',
        'w-toc',
        'py-8 pl-6 pr-4',
        className,
      )}
    >
      {children}
    </nav>
  )
}

export const OnThisPageHeader = ({
  children,
  className,
  ...props
}: ComponentBase) => {
  return (
    <div
      className={cn(
        'mb-4 text-xs font-bold uppercase tracking-wider text-text-main',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export const OnThisPageContent = ({
  children,
  className,
  ref,
  ...props
}: OnThisPageContentProps) => {
  const internalRef = useRef<HTMLDivElement>(null)

  useImperativeHandle(ref, () => internalRef.current!)

  return (
    <div
      ref={internalRef}
      className={cn(
        'relative overflow-y-auto boltdocs-otp-content',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

OnThisPageContent.displayName = 'OnThisPageContent'

export const OnThisPageList = ({ children, className }: ComponentBase) => {
  return (
    <ul
      className={cn(
        'relative space-y-1 text-sm border-l border-border-subtle',
        className,
      )}
    >
      {children}
    </ul>
  )
}

export const OnThisPageItem = ({
  level,
  children,
  className,
}: OnThisPageItemProps) => {
  return <li className={cn(level === 3 && 'pl-3', className)}>{children}</li>
}

export const OnThisPageLink = ({
  children,
  href,
  active,
  onClick,
  className,
}: OnThisPageLinkProps) => {
  const items = use(ItemsContext)
  const containerRef = use(ScrollContext)
  const id = href ? getItemId(href) : null
  const anchorRef = useRef<HTMLAnchorElement>(null)
  const [internalActive, setInternalActive] = useState(active)

  useOnChange(
    id && items ? items.find((i) => i.id === id)?.active : null,
    (newActive) => {
      if (newActive !== null && newActive !== internalActive) {
        setInternalActive(!!newActive)

        if (newActive && anchorRef.current && containerRef?.current) {
          scrollIntoView(anchorRef.current, {
            behavior: 'smooth',
            block: 'center',
            inline: 'center',
            scrollMode: 'if-needed',
            boundary: containerRef.current,
          })
        }
      }
    },
  )

  // Also sync with external active prop if provided
  useEffect(() => {
    if (active !== undefined) setInternalActive(active)
  }, [active])

  return (
    <a
      ref={anchorRef}
      href={href}
      onClick={onClick}
      data-active={internalActive}
      className={cn(
        'block py-1 pl-4 text-[13px] outline-none transition-colors hover:text-text-main',
        internalActive ? 'text-primary-500 font-medium' : 'text-text-muted',
        className,
      )}
    >
      {children}
    </a>
  )
}

export const OnThisPageIndicator = ({
  style,
  className,
}: OnThisPageIndicatorProps) => {
  return (
    <div
      className={cn(
        'absolute -left-px w-0.5 rounded-full bg-primary-500 transition-all duration-300',
        className,
      )}
      style={style}
    />
  )
}

export default {
  OnThisPageRoot,
  OnThisPageHeader,
  OnThisPageContent,
  OnThisPageList,
  OnThisPageItem,
  OnThisPageLink,
  OnThisPageIndicator,
}
