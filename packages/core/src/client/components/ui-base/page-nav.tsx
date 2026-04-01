import { usePageNav } from '@hooks/use-page-nav'
import PageNavPrimitive from '@components/primitives/page-nav'

/**
 * Component to display the previous and next page navigation buttons.
 */
export function PageNav() {
  const { prevPage, nextPage } = usePageNav()

  if (!prevPage && !nextPage) return null

  return (
    <PageNavPrimitive.PageNavRoot>
      {prevPage ? (
        <PageNavPrimitive.PageNavLink to={prevPage.path} direction="prev">
          <PageNavPrimitive.PageNavLink.Title>
            Previous
          </PageNavPrimitive.PageNavLink.Title>
          <PageNavPrimitive.PageNavLink.Description>
            {prevPage.title}
          </PageNavPrimitive.PageNavLink.Description>
        </PageNavPrimitive.PageNavLink>
      ) : (
        <div />
      )}

      {nextPage && (
        <PageNavPrimitive.PageNavLink to={nextPage.path} direction="next">
          <PageNavPrimitive.PageNavLink.Title>
            Next
          </PageNavPrimitive.PageNavLink.Title>
          <PageNavPrimitive.PageNavLink.Description>
            {nextPage.title}
          </PageNavPrimitive.PageNavLink.Description>
        </PageNavPrimitive.PageNavLink>
      )}
    </PageNavPrimitive.PageNavRoot>
  )
}
