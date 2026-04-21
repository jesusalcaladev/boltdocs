import { Link as LucideLink } from 'lucide-react'
import * as MdxComponents from '../components/mdx'

const Heading = ({
  level,
  id,
  children,
  ...props
}: {
  level: number
  id?: string
  children?: React.ReactNode
} & React.HTMLAttributes<HTMLHeadingElement>) => {
  const Tag = `h${level}` as any
  return (
    <Tag id={id} {...props} className="boltdocs-heading">
      {children}
      {id && (
        <a href={`#${id}`} className="header-anchor" aria-label="Anchor">
          <LucideLink size={16} />
        </a>
      )}
    </Tag>
  )
}

import { Loading } from '../components/ui-base/loading'

export const mdxComponentsDefault = {
  ...MdxComponents,
  Loading,
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <Heading level={1} {...props} />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <Heading level={2} {...props} />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <Heading level={3} {...props} />
  ),
  h4: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <Heading level={4} {...props} />
  ),
  h5: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <Heading level={5} {...props} />
  ),
  h6: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <Heading level={6} {...props} />
  ),
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
    <MdxComponents.CodeBlock {...props}>
      {props.children}
    </MdxComponents.CodeBlock>
  ),
}
