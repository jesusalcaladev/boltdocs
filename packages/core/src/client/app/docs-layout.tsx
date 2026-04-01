import { Outlet } from 'react-router-dom'
import UserLayout from 'virtual:boltdocs-layout'

/**
 * Wraps the docs Outlet with the user's (or default) layout component.
 * The Layout receives the routed page as `children`.
 */
export function DocsLayout() {
  return (
    <UserLayout>
      <Outlet />
    </UserLayout>
  )
}
