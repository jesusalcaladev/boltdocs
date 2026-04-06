export type { BoltdocsConfig, BoltdocsThemeConfig } from '../node/config'
export type {
  ComponentRoute,
  CreateBoltdocsAppOptions,
  LayoutProps,
} from './types'
export { createBoltdocsApp } from './app'
export { useConfig } from '@client/app/config-context'
export { useTheme } from '@client/app/theme-context'
export { useRoutes } from '@client/hooks/use-routes'
export { useMdxComponents } from '@client/app/mdx-components-context'

// Composable layout building blocks
export { DocsLayout } from '@components/docs-layout'
export { DefaultLayout } from '@components/default-layout'

// Default UI components (for use in custom layout.tsx)
export { Navbar } from '@components/ui-base/navbar'
export { Sidebar } from '@components/ui-base/sidebar'
export { OnThisPage } from '@components/ui-base/on-this-page'
export { Head } from '@components/ui-base/head'
export { Breadcrumbs } from '@components/ui-base/breadcrumbs'
export { PageNav } from '@components/ui-base/page-nav'
export { ErrorBoundary } from '@components/ui-base/error-boundary'
export { CopyMarkdown } from '@components/ui-base/copy-markdown'

export { NotFound } from '@components/ui-base/not-found'
export { Loading } from '@components/ui-base/loading'
export { CodeBlock } from '@components/mdx/code-block'
export { Video } from '@components/mdx/video'
export {
  defineSandbox,
  openSandbox,
  embedSandbox,
} from '@integrations/codesandbox'

export type {
  SandboxOptions,
  SandboxFile,
  SandboxFiles,
  SandboxEmbedOptions,
} from './types'
export {
  Button,
  Badge,
  Card,
  Cards,
  Tabs,
  Tab,
  Admonition,
  Note,
  Tip,
  Warning,
  Danger,
  InfoBox,
  ComponentProps,
  ComponentPreview,
  Important,
  Caution,
  List,
  FileTree,
  Table,
  Field,
  Link,
  Image,
} from './components/mdx'
export type {
  ButtonProps,
  BadgeProps,
  CardProps,
  CardsProps,
  TabsProps,
  TabProps,
  AdmonitionProps,
  ComponentPropsProps,
  ComponentPreviewProps,
  ListProps,
  FileTreeProps,
  TableProps,
  FieldProps,
  LinkProps,
  ImageProps,
} from './components/mdx'
