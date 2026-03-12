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
  const preRef = useRef<HTMLPreElement>(null);

  const handleCopy = useCallback(async () => {
    const code = preRef.current?.textContent || "";
    copyToClipboard(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  return (
    <div className="code-block-wrapper">
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
    </div>
  );
}
