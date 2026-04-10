import { useMdxComponents } from './mdx-components-context'

/**
 * Renders an MDX page securely, injecting required custom components.
 * This overrides the default HTML tags emitted by MDX with stylized components.
 */
export function MdxPage({
  Component,
}: {
  Component: React.ComponentType<any>
}) {
  const allComponents = useMdxComponents()

  return <Component components={allComponents as any} />
}
