import React, { useState, useMemo } from "react";
import { LiveProvider, LiveEditor, LiveError, LivePreview } from "react-live";
import { Copy, Check, Terminal, Play } from "lucide-react";
import { CodeBlock } from "../CodeBlock";

interface PlaygroundProps {
  code?: string;
  children?: string | React.ReactNode;
  preview?: React.ReactNode;
  scope?: Record<string, any>;
  readonly?: boolean;
  noInline?: boolean;
}

/**
 * Transforms code that uses `export default` into a format compatible
 * with react-live's `noInline` mode by stripping the export and
 * appending a `render(<ComponentName />)` call.
 */
function prepareCode(raw: string): { code: string; noInline: boolean } {
  const trimmed = (raw || "").trim();

  // Match: export default function Name(...)
  const fnMatch = trimmed.match(/export\s+default\s+function\s+(\w+)/);
  if (fnMatch) {
    const name = fnMatch[1];
    const code =
      trimmed.replace(/export\s+default\s+/, "") + `\n\nrender(<${name} />);`;
    return { code, noInline: true };
  }

  // Match: export default ComponentName  (at the end)
  const varMatch = trimmed.match(/export\s+default\s+(\w+)\s*;?\s*$/);
  if (varMatch) {
    const name = varMatch[1];
    const code =
      trimmed.replace(/export\s+default\s+\w+\s*;?\s*$/, "") +
      `\nrender(<${name} />);`;
    return { code, noInline: true };
  }

  // No export default — use inline mode (simple JSX expression)
  return { code: trimmed, noInline: false };
}

export function Playground({
  code: propsCode,
  children,
  preview,
  scope = {},
  readonly = false,
  noInline: forceNoInline,
}: PlaygroundProps) {
  // Extract code from either `code` prop or `children`
  const initialCode = useMemo(() => {
    let base = propsCode || "";
    if (!base && typeof children === "string") {
      base = children;
    }
    return base.trim();
  }, [propsCode, children]);

  const prepared = useMemo(() => prepareCode(initialCode), [initialCode]);
  const useNoInline = forceNoInline ?? prepared.noInline;

  const [copied, setCopied] = useState(false);
  const [activeCode, setActiveCode] = useState(prepared.code);
  const [isExpanded, setIsExpanded] = useState(false);

  // Sync activeCode when initialCode changes (e.g. in static mode)
  React.useEffect(() => {
    setActiveCode(prepared.code);
  }, [prepared.code]);

  const handleCopy = () => {
    const textToCopy = !!preview ? initialCode : activeCode;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Provide React generically
  const extendedScope = { React, ...scope };

  const charLimit = 800; // Adjust as needed
  const isExpandable = (propsCode || initialCode).length > charLimit;
  const shouldTruncate = isExpandable && !isExpanded;

  const isStatic = !!preview;

  // Transformer to prevent ReferenceError: require is not defined
  // only used in static mode to allow highlighting without execution
  const staticTransform = (code: string) => {
    // Return empty or a simple dummy to avoid running the code
    return "render(<div style={{display:'none'}} />)";
  };

  return (
    <div className={`boltdocs-playground ${shouldTruncate ? "is-truncated" : ""}`} data-readonly={readonly || isStatic}>
      <div className="playground-split-container">
        {/* Preview Side - Now on top */}
        <div className="playground-panel playground-preview-panel">
          <div className="playground-panel-header">
            <div className="playground-panel-title">
              <Play size={14} />
              <span>Preview</span>
            </div>
          </div>
          <div className="playground-panel-content playground-preview">
            {isStatic ? (
              preview
            ) : (
              <LiveProvider
                code={activeCode}
                scope={extendedScope}
                theme={undefined}
                noInline={useNoInline}
              >
                <LivePreview />
                <LiveError className="playground-error" />
              </LiveProvider>
            )}
          </div>
        </div>

        {/* Editor Side - Now on bottom */}
        <div className="playground-panel playground-editor-panel">
          {!isStatic && (
            <div className="playground-panel-header">
              <div className="playground-panel-title">
                <Terminal size={14} />
                <span>{readonly ? "Code Example" : "Live Editor"}</span>
              </div>
            </div>
          )}
          <div className="playground-panel-content playground-editor">
            {/* Copy button moved inside code area */}
            <button
              className="playground-copy-btn-inner"
              onClick={handleCopy}
              title="Copy code"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>

            {isStatic ? (
              <LiveProvider
                code={initialCode}
                noInline={true}
                transformCode={staticTransform}
              >
                <LiveEditor disabled />
              </LiveProvider>
            ) : (
              <LiveProvider
                code={activeCode}
                scope={extendedScope}
                theme={undefined}
                noInline={useNoInline}
              >
                <LiveEditor disabled={readonly} onChange={setActiveCode} />
              </LiveProvider>
            )}
          </div>
          
          {isExpandable && (
            <div className="playground-expand-wrapper">
              <button
                className="playground-expand-btn"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? "Show less" : "Expand code"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
