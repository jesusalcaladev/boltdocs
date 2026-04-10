import { usePageNav } from '@hooks/use-page-nav'
import { PageNav as PageNavPrimitive } from '@components/primitives/page-nav'

/**
 * Component to display the previous and next page navigation buttons.
 * Enhanced with subtle entrance animations and a modern card layout.
 */
export function PageNav() {
  const { prevPage, nextPage } = usePageNav()

  if (!prevPage && !nextPage) return null

  return (
    <PageNavPrimitive.Root className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      {prevPage ? (
        <PageNavPrimitive.Link to={prevPage.path} direction="prev">
          <PageNavPrimitive.Title>
            Previous
          </PageNavPrimitive.Title>
          <PageNavPrimitive.Description>
            {prevPage.title}
          </PageNavPrimitive.Description>
        </PageNavPrimitive.Link>
      ) : (
        <div />
      )}

      {nextPage && (
        <PageNavPrimitive.Link to={nextPage.path} direction="next">
          <PageNavPrimitive.Title>
            Next
          </PageNavPrimitive.Title>
          <PageNavPrimitive.Description>
            {nextPage.title}
          </PageNavPrimitive.Description>
        </PageNavPrimitive.Link>
      )}
    </PageNavPrimitive.Root>
  )
}
