import OTP, {
  AnchorProvider,
  ScrollProvider,
  useActiveAnchor,
} from '@components/primitives/on-this-page'
import React, { useRef, useEffect, useState, useCallback } from 'react'
import { useOnThisPage } from '@hooks/use-onthispage'
import type { OnThisPageProps } from '@client/types'
import { Pencil, CircleHelp, TextAlignStart } from 'lucide-react'

export function OnThisPage({
  headings: rawHeadings = [],
  editLink,
  communityHelp,
  filePath,
}: OnThisPageProps) {
  const { headings } = useOnThisPage(rawHeadings)

  const toc = React.useMemo(
    () =>
      headings.map((h) => ({ title: h.text, url: `#${h.id}`, depth: h.level })),
    [headings],
  )

  if (headings.length === 0) return null

  return (
    <AnchorProvider toc={toc}>
      <OnThisPageInner
        headings={headings}
        editLink={editLink}
        communityHelp={communityHelp}
        filePath={filePath}
      />
    </AnchorProvider>
  )
}

function OnThisPageInner({
  headings,
  editLink,
  communityHelp,
  filePath,
}: OnThisPageProps & {
  headings: { level: number; text: string; id: string }[]
}) {
  const activeId = useActiveAnchor()
  const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>({
    opacity: 0,
  })
  const listRef = useRef<HTMLUListElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!activeId || !listRef.current) return

    const activeLink = listRef.current.querySelector(
      `a[href="#${activeId}"]`,
    ) as HTMLElement

    if (activeLink) {
      setIndicatorStyle({
        transform: `translateY(${activeLink.offsetTop}px)`,
        height: `${activeLink.offsetHeight}px`,
        opacity: 1,
      })
    }
  }, [activeId])

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
      e.preventDefault()
      const el = document.getElementById(id)

      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
        window.history.pushState(null, '', `#${id}`)
      }
    },
    [],
  )

  return (
    <OTP.OnThisPageRoot>
      <OTP.OnThisPageHeader className="flex flex-row gap-x-2">
        <TextAlignStart size={16} />
        On this page
      </OTP.OnThisPageHeader>
      <ScrollProvider containerRef={scrollContainerRef}>
        <OTP.OnThisPageContent
          className="max-h-[450px] boltdocs-otp-scroll-area"
          ref={scrollContainerRef}
        >
          <OTP.OnThisPageIndicator style={indicatorStyle} />
          <ul
            className="relative space-y-2 border-l border-border-subtle"
            ref={listRef}
          >
            {headings.map((h) => (
              <OTP.OnThisPageItem key={h.id} level={h.level}>
                <OTP.OnThisPageLink
                  href={`#${h.id}`}
                  active={activeId === h.id}
                  onClick={(e) => handleClick(e, h.id)}
                  className="pl-4"
                >
                  {h.text}
                </OTP.OnThisPageLink>
              </OTP.OnThisPageItem>
            ))}
          </ul>
        </OTP.OnThisPageContent>
      </ScrollProvider>

      {(editLink || communityHelp) && (
        <div className="mt-8 pt-8 border-t border-border-subtle space-y-4">
          <p className="text-xs font-bold uppercase tracking-wider text-text-main">
            Need help?
          </p>
          <ul className="space-y-3">
            {editLink && filePath && (
              <li>
                <a
                  href={editLink.replace(':path', filePath)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-text-muted hover:text-text-main transition-colors"
                >
                  <Pencil size={16} />
                  Edit this page
                </a>
              </li>
            )}
            {communityHelp && (
              <li>
                <a
                  href={communityHelp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-text-muted hover:text-text-main transition-colors"
                >
                  <CircleHelp size={16} />
                  Community help
                </a>
              </li>
            )}
          </ul>
        </div>
      )}
    </OTP.OnThisPageRoot>
  )
}
