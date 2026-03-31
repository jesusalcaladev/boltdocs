import { Link as LucideLink } from 'lucide-react'
import * as MdxComponents from '@components/mdx'

const Heading = ({
  level,
  id,
  children,
}: {
  level: number
  id?: string
  children: React.ReactNode
}) => {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements
  return (
    <Tag id={id} className="boltdocs-heading">
      {children}
      {id && (
        <a href={`#${id}`} className="header-anchor" aria-label="Anchor">
          <LucideLink size={16} />
        </a>
      )}
    </Tag>
  )
}

export const mdxComponentsDefault = {
  ...MdxComponents,
  h1: (props: any) => <Heading level={1} {...props} />,
  h2: (props: any) => <Heading level={2} {...props} />,
  h3: (props: any) => <Heading level={3} {...props} />,
  h4: (props: any) => <Heading level={4} {...props} />,
  h5: (props: any) => <Heading level={5} {...props} />,
  h6: (props: any) => <Heading level={6} {...props} />,
  pre: (props: any) => (
    <MdxComponents.CodeBlock {...props}>
      {props.children}
    </MdxComponents.CodeBlock>
  ),
}
