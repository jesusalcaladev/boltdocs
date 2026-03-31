import { Outlet } from 'react-router-dom'
import { ThemeLayout } from '@components/ui-base/layout'
import type { ComponentRoute } from '../types'
import type { BoltdocsConfig } from '@node/config'

export function DocsLayout({
  config,
  routes,
}: {
  config: BoltdocsConfig
  routes: ComponentRoute[]
}) {
  const layoutProps = config.themeConfig?.layoutProps || {}
  return (
    <ThemeLayout config={config} routes={routes} {...layoutProps}>
      <Outlet />
    </ThemeLayout>
  )
}
