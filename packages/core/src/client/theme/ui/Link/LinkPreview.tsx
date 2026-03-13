import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import "./link-preview.css";

interface LinkPreviewProps {
  isVisible: boolean;
  title: string;
  summary?: string;
  x: number;
  y: number;
}

export function LinkPreview({
  isVisible,
  title,
  summary,
  x,
  y,
}: LinkPreviewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const padding = 12;

      let top = y + padding;
      let left = x + padding;

      // Keep within viewport
      if (left + rect.width > window.innerWidth - 20) {
        left = x - rect.width - padding;
      }
      if (top + rect.height > window.innerHeight - 20) {
        top = y - rect.height - padding;
      }

      setPosition({ top, left });
    }
  }, [x, y, isVisible]);

  return createPortal(
    <div
      ref={ref}
      className={`boltdocs-link-preview ${isVisible ? "is-visible" : ""}`}
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      <div className="boltdocs-link-preview-content">
        <span className="boltdocs-link-preview-title">{title}</span>
        {summary && <p className="boltdocs-link-preview-summary">{summary}</p>}
      </div>
    </div>,
    document.body,
  );
}
