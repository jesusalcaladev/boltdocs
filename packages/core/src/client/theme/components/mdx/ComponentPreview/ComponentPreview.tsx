import React, { useMemo } from "react";
import { type SandboxOptions } from "../../../../types";
import { CodeBlock } from "../../../../index";
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
   * The code to display in the code block.
   */
  children?: string;
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

/**
 * Hook to handle the logic for ComponentPreview.
 * Separates data processing from the visual representation.
 *
 * @param props - The properties passed to the component.
 * @returns An object containing the processed state and derived values.
 */
function useComponentPreview(props: ComponentPreviewProps) {
  const { code: propsCode, children, preview } = props;

  const initialCode = useMemo(() => {
    let base = propsCode ?? (typeof children === "string" ? children : "");
    return base.trim();
  }, [propsCode, children]);

  const previewElement = useMemo(() => {
    return preview ?? (typeof children !== "string" ? children : null);
  }, [preview, children]);

  return {
    initialCode,
    previewElement,
  };
}

/**
 * ComponentPreview is a wrapper that displays a live preview of a component
 * alongside its source code.
 *
 * It automatically extracts code from children if no explicit code prop is provided,
 * and handles server-side highlighted HTML for performance.
 *
 * @param props - Component properties including the preview element and source code.
 * @returns A structured preview layout with showcase and code areas.
 */
export function ComponentPreview(props: ComponentPreviewProps) {
  const {
    highlightedHtml,
    hideCode = false,
    hideSandbox = false,
    hideCopy = false,
    sandboxOptions = {},
  } = props;

  const { initialCode, previewElement } = useComponentPreview(props);

  return (
    <div className="boltdocs-component-preview">
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
