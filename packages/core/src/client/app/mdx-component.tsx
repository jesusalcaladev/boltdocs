import { Link as LucideLink } from "lucide-react";
import { CodeBlock } from "../theme/components/CodeBlock";
import { Suspense } from "react";
import { Video } from "../theme/components/Video";
import * as MdxComponents from "../theme/components/mdx";

const Heading = ({
  level,
  id,
  children,
}: {
  level: number;
  id?: string;
  children: React.ReactNode;
}) => {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  return (
    <Tag id={id} className="boltdocs-heading">
      {children}
      {id && (
        <a href={`#${id}`} className="header-anchor" aria-label="Anchor">
          <LucideLink size={16} />
        </a>
      )}
    </Tag>
  );
};

export const mdxComponentsDefault = {
  ...MdxComponents,
  h1: (props: any) => <Heading level={1} {...props} />,
  h2: (props: any) => <Heading level={2} {...props} />,
  h3: (props: any) => <Heading level={3} {...props} />,
  h4: (props: any) => <Heading level={4} {...props} />,
  h5: (props: any) => <Heading level={5} {...props} />,
  h6: (props: any) => <Heading level={6} {...props} />,
  pre: (props: any) => <CodeBlock {...props}>{props.children}</CodeBlock>,
  Video: (props: any) => (
    <Suspense fallback={<div className="video-skeleton" />}>
      <Video {...props} />
    </Suspense>
  ),
};
