import React, { useEffect, useState, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { Pencil, CircleHelp } from "lucide-react";

interface TocHeading {
  id: string;
  text: string;
  level: number;
}

export function OnThisPage({
  headings = [],
  editLink,
  communityHelp,
  filePath,
}: {
  headings?: TocHeading[];
  editLink?: string;
  communityHelp?: string;
  filePath?: string;
}) {
  const [activeId, setActiveId] = useState<string>("");
  const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>({});
  const observerRef = useRef<IntersectionObserver | null>(null);
  const location = useLocation();
  const listRef = useRef<HTMLUListElement>(null);

  // Reset active ID when path changes
  useEffect(() => {
    if (headings.length > 0) {
      // Check if there's a hash in the URL
      const hash = window.location.hash.substring(1);
      if (hash && headings.some((h) => h.id === hash)) {
        setActiveId(hash);
      } else {
        setActiveId(headings[0].id);
      }
    }
  }, [location.pathname, headings]);

  // Update indicator position
  useEffect(() => {
    if (!activeId || !listRef.current) return;

    const activeElement = listRef.current.querySelector(
      `a[href="#${activeId}"]`,
    ) as HTMLElement;

    if (activeElement) {
      const { offsetTop, offsetHeight } = activeElement;
      setIndicatorStyle({
        transform: `translateY(${offsetTop}px)`,
        height: `${offsetHeight}px`,
        opacity: 1,
      });
    }
  }, [activeId, headings]);

  // IntersectionObserver for active heading tracking
  useEffect(() => {
    if (headings.length === 0) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const callback: IntersectionObserverCallback = (entries) => {
      // Find all entries that are intersecting
      const visibleEntries = entries.filter((entry) => entry.isIntersecting);

      if (visibleEntries.length > 0) {
        // If we have visible entries, find the one closest to the top of the viewport
        // But with a priority for ones that just entered from the top
        const closest = visibleEntries.reduce((prev, curr) => {
          return Math.abs(curr.boundingClientRect.top - 100) <
            Math.abs(prev.boundingClientRect.top - 100)
            ? curr
            : prev;
        });
        setActiveId(closest.target.id);
      }
    };

    observerRef.current = new IntersectionObserver(callback, {
      rootMargin: "-100px 0px -70% 0px",
      threshold: [0, 1],
    });

    const observeHeadings = () => {
      headings.forEach(({ id }) => {
        const el = document.getElementById(id);
        if (el) {
          observerRef.current!.observe(el);
        }
      });
    };

    // Initial observation
    observeHeadings();

    // Re-observe if content changes (e.g. after some delay to ensure rendering)
    const timeoutId = setTimeout(observeHeadings, 1000);

    return () => {
      observerRef.current?.disconnect();
      clearTimeout(timeoutId);
    };
  }, [headings, location.pathname]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
      e.preventDefault();
      const el = document.getElementById(id);
      if (el) {
        const offset = 80;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = el.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });

        setActiveId(id);
        window.history.pushState(null, "", `#${id}`);
      }
    },
    [],
  );

  if (headings.length === 0) return null;

  return (
    <nav className="boltdocs-on-this-page" aria-label="Table of contents">
      <p className="on-this-page-title">On this page</p>
      <div className="on-this-page-container">
        <div className="toc-indicator" style={indicatorStyle} />
        <ul className="on-this-page-list" ref={listRef}>
          {headings.map((h) => (
            <li key={h.id} className={h.level === 3 ? "toc-indent" : ""}>
              <a
                href={`#${h.id}`}
                className={`toc-link ${activeId === h.id ? "active" : ""}`}
                aria-current={activeId === h.id ? "true" : undefined}
                onClick={(e) => handleClick(e, h.id)}
              >
                {h.text}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Need help? section */}
      {(editLink || communityHelp) && (
        <div className="toc-help">
          <p className="toc-help-title">Need help?</p>
          <ul className="toc-help-links">
            {editLink && filePath && (
              <li>
                <a
                  href={editLink.replace(":path", filePath)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="toc-help-link"
                >
                  <Pencil size={16} />
                  Edit this page
                </a>
              </li>
            )}
            {communityHelp && (
              <li>
                <a
                  href={communityHelp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="toc-help-link"
                >
                  <CircleHelp size={16} />
                  Community help
                </a>
              </li>
            )}
          </ul>
        </div>
      )}
    </nav>
  );
}
