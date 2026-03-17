import React, { useState, useRef, useCallback } from "react";
import { Copy, Check } from "lucide-react";
import { copyToClipboard } from "../../../utils";

interface CodeBlockProps {
  children?: React.ReactNode;
  className?: string;
  [key: string]: any;
}

/**
 * A specialized wrapper for code snippets compiled from MDX blocks.
 * Provides syntax highlighting styling scaffolding and a "Copy to Clipboard" button.
 */
export function CodeBlock({ children, ...props }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isExpandable, setIsExpandable] = useState(false);
  const preRef = useRef<HTMLPreElement>(null);

  const handleCopy = useCallback(async () => {
    const code = preRef.current?.textContent || "";
    copyToClipboard(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  React.useEffect(() => {
    if (preRef.current) {
      const codeLength = preRef.current.textContent?.length || 0;
      setIsExpandable(codeLength > 500);
    }
  }, [children]);

  const shouldTruncate = isExpandable && !isExpanded;

  return (
    <div className={`code-block-wrapper ${shouldTruncate ? "is-truncated" : ""}`}>
      <button
        className={`code-block-copy ${copied ? "copied" : ""}`}
        onClick={handleCopy}
        aria-label="Copy code"
      >
        {copied ? <Check size={16} /> : <Copy size={16} />}
      </button>
      <pre ref={preRef} {...props}>
        {children}
      </pre>
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
