import React, { useRef, useState, useEffect } from "react";

interface VideoProps {
  /** Video source URL */
  src?: string;
  /** Poster/thumbnail image URL */
  poster?: string;
  /** Alt text for accessibility */
  alt?: string;
  /** Show native video controls (default: true) */
  controls?: boolean;
  /** Preload strategy (default: 'none') */
  preload?: string;
  /** Children (e.g. <source> elements) */
  children?: React.ReactNode;
  /** Allow any additional HTML video attributes */
  [key: string]: any;
}

/**
 * Optimized video component with lazy loading via IntersectionObserver.
 * The `<video>` element is only rendered once it enters the viewport,
 * preventing unnecessary network downloads on initial page load.
 *
 * Usage in MDX:
 * ```mdx
 * <video src="/demo.mp4" poster="/demo-thumb.jpg" />
 * ```
 */
export function Video({
  src,
  poster,
  alt,
  children,
  controls,
  preload = "metadata",
  ...rest
}: VideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="boltdocs-video-wrapper">
      {isVisible ? (
        <video
          className="boltdocs-video"
          src={src}
          poster={poster}
          controls={true}
          preload={preload}
          playsInline
          {...rest}
        >
          {children}
          Your browser does not support the video tag.
        </video>
      ) : (
        <div
          className="boltdocs-video-placeholder"
          role="img"
          aria-label={alt || "Video"}
        />
      )}
    </div>
  );
}
