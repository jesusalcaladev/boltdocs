import React, { useMemo } from "react";
import { Copy, Check, Box } from "lucide-react";
import { type SandboxOptions } from "../../../../types";
import { CodeBlock, useConfig, useTheme } from "../../../../index";
import "./ComponentPreview.css";

export interface ComponentPreviewProps {
  /**
   * The source code to display in the code block.
   */
  code?: string;
  /**
   * Pre-highlighted HTML from the server.
   */
  highlightedHtml?: string;
  /**
   * You can pass the component to preview as children, or use the `preview` prop.
   */
  children?: React.ReactNode;
  /**
   * The component instance to preview.
   */
  preview?: React.ReactNode;
  /**
   * If true, the bottom code block will be hidden.
   */
  hideCode?: boolean;
  /**
   * If true, hides the CodeSandbox integration button.
   */
  hideSandbox?: boolean;
  /**
   * If true, hides the copy to clipboard button.
   */
  hideCopy?: boolean;
  /**
   * Options to pass to the sandbox integration.
   */
  sandboxOptions?: SandboxOptions;
}

export function ComponentPreview({
  code: propsCode,
  highlightedHtml,
  children,
  preview,
  hideCode = false,
  hideSandbox = false,
  hideCopy = false,
  sandboxOptions = {},
}: ComponentPreviewProps) {
  const config = useConfig();
  const { theme: siteTheme } = useTheme();

  const initialCode = useMemo(() => {
    let base = propsCode || "";
    if (!base && typeof children === "string") {
      base = children;
    }
    return base.trim();
  }, [propsCode, children]);

  const previewElement =
    preview || (typeof children !== "string" ? children : null);

  return (
    <div
      className="boltdocs-component-preview"
      data-highlighted={!!highlightedHtml}
    >
      <div className="component-preview-showcase">{previewElement}</div>

      {!hideCode && (
        <div className="component-preview-code">
          <CodeBlock
            hideSandbox={hideSandbox}
            hideCopy={hideCopy}
            title={sandboxOptions.title}
            lang="tsx"
            highlightedHtml={highlightedHtml}
          >
            {initialCode}
          </CodeBlock>
        </div>
      )}
    </div>
  );
}
