import UserLayout from 'virtual:boltdocs-layout'
import { useMdxComponents } from './mdx-components-context'
import { useMemo } from 'react'

/**
 * DocPage is a layout wrapper for documentation content during SSG.
 * It renders the user-defined layout (or default) around the MDX content.
 */
export function DocPage({
  route,
  content: Content,
  mdxComponents: propComponents,
}: any) {
  // Access global MDX components (defaults + plugins + virtuals) from context
  const contextComponents = useMdxComponents()

  // Merge components: Prop components (from loader) take priority,
  // then context components (globals).
  const allComponents = useMemo(
    () => ({
      ...contextComponents,
      ...propComponents,
    }),
    [contextComponents, propComponents],
  )

  if (!Content) return null

  return (
    <UserLayout route={route}>
      <Content components={allComponents} />
    </UserLayout>
  )
}
