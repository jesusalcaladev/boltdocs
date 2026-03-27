import React, { useState, useRef, useCallback, useEffect } from "react";
import { Copy, Check, Box } from "lucide-react";
import { copyToClipboard } from "../../../utils";
import { openSandbox } from "../../../integrations/codesandbox";
import { useConfig } from "../../../app";

interface CodeBlockProps {
  children?: React.ReactNode;
  className?: string;
  sandbox?: boolean | any;
  hideCopy?: boolean;
  hideSandbox?: boolean;
  title?: string;
  lang?: string;
  highlightedHtml?: string;
  [key: string]: any;
}

/**
 * Hook to handle the interactive logic for the CodeBlock component.
 * Manages copying to clipboard, sandbox integration, and expansion states.
 *
 * @param props - Component properties.
 * @returns An object containing the current states and event handlers.
 */
function useCodeBlock(props: CodeBlockProps) {
  const { title, children, highlightedHtml, sandbox: localSandbox } = props;
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isExpandable, setIsExpandable] = useState(false);
  const preRef = useRef<HTMLPreElement>(null);
  const config = useConfig();

  const handleCopy = useCallback(async () => {
    const code = preRef.current?.textContent ?? "";
    copyToClipboard(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const handleSandbox = useCallback(() => {
    const code = preRef.current?.textContent ?? "";
    const globalSandbox = config?.integrations?.sandbox;

    // Resolve base options: props > global config
    const baseOptions =
      typeof localSandbox === "object"
        ? localSandbox
        : globalSandbox?.config?.options || globalSandbox?.config || {};

    const entry = baseOptions.entry || "src/App.tsx";

    openSandbox({
      title: title ?? "Code Snippet",
      ...baseOptions,
      files: {
        ...baseOptions.files,
        [entry]: { content: code },
      },
    });
  }, [title, config, localSandbox]);

  useEffect(() => {
    const codeLength = preRef.current?.textContent?.length ?? 0;
    setIsExpandable(codeLength > 120);
  }, [children, highlightedHtml]);

  return {
    copied,
    isExpanded,
    setIsExpanded,
    isExpandable,
    preRef,
    handleCopy,
    handleSandbox,
    shouldTruncate: isExpandable && !isExpanded,
  };
}

/**
 * A specialized wrapper for code snippets.
 * Provides syntax highlighting support and interactive tools like "Copy"
 * and "Open in Sandbox".
 *
 * It prioritizes rendering pre-highlighted HTML from the server for performance.
 *
 * @param props - Component properties including the code and configuration.
 * @returns A structured code block with a toolbar and scrollable code area.
 */
export function CodeBlock(props: CodeBlockProps) {
  const {
    children,
    sandbox: localSandbox,
    hideSandbox = true,
    hideCopy = false,
    highlightedHtml,
    ...rest
  } = props;

  const config = useConfig();
  const globalSandbox = config?.integrations?.sandbox;

  // Show sandbox button only if explicitly enabled via props AND globally enabled
  // Default is false (hidden)
  const isSandboxEnabled = !!globalSandbox?.enable && !hideSandbox;

  const {
    copied,
    isExpanded,
    setIsExpanded,
    isExpandable,
    preRef,
    handleCopy,
    handleSandbox,
    shouldTruncate,
  } = useCodeBlock(props);

  return (
    <div
      className={`code-block-wrapper ${shouldTruncate ? "is-truncated" : ""}`}
    >
      <div className="code-block-toolbar">
        {isSandboxEnabled && (
          <button
            className="code-block-toolbar-btn sandbox-btn"
            onClick={handleSandbox}
            title="Open in CodeSandbox"
          >
            <Box size={16} />
          </button>
        )}

        {!hideCopy && (
          <button
            className={`code-block-toolbar-btn ${copied ? "copied" : ""}`}
            onClick={handleCopy}
            aria-label="Copy code"
            title="Copy code"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        )}
      </div>

      {highlightedHtml ? (
        <div
          ref={preRef as any}
          className="shiki-wrapper"
          dangerouslySetInnerHTML={{ __html: highlightedHtml }}
        />
      ) : (
        <pre ref={preRef} {...rest}>
          {children}
        </pre>
      )}

      {isExpandable && (
        <div className="code-block-expand-wrapper">
          <button
            className="code-block-expand-btn"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "Show less" : "Expand code"}
          </button>
        </div>
      )}
    </div>
  );
}
