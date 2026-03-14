import React, { useEffect, useState, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { Pencil, CircleHelp, TextAlignStart } from "lucide-react";

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
  const [activeId, setActiveId] = useState<string | null>(null);
  const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>({});
  const observerRef = useRef<IntersectionObserver | null>(null);
  const location = useLocation();
  const listRef = useRef<HTMLUListElement>(null);
  const visibleIdsRef = useRef<Set<string>>(new Set());

  // Reset active ID when path changes
  useEffect(() => {
    if (headings.length > 0) {
      const hash = window.location.hash.substring(1);
      if (hash && headings.some((h) => h.id === hash)) {
        setActiveId(hash);
      } else {
        setActiveId(headings[0].id);
      }
    }
  }, [location.pathname, headings]);

  // Update indicator position for the single active ID
  useEffect(() => {
    if (!activeId || !listRef.current) return;

    const activeLink = listRef.current.querySelector(
      `a[href="#${activeId}"]`,
    ) as HTMLElement;

    if (activeLink) {
      const top = activeLink.offsetTop;
      const height = activeLink.offsetHeight;

      setIndicatorStyle({
        transform: `translateY(${top}px)`,
        height: `${height}px`,
        opacity: 1,
      });
    }
  }, [activeId, headings]);

  // IntersectionObserver for active heading tracking
  useEffect(() => {
    if (headings.length === 0) return;

    // Reset visible tracking on re-run
    visibleIdsRef.current.clear();

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const callback: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          visibleIdsRef.current.add(entry.target.id);
        } else {
          visibleIdsRef.current.delete(entry.target.id);
        }
      });

      // Selection logic: first visible heading in document order
      const firstVisible = headings.find((h) => visibleIdsRef.current.has(h.id));

      if (firstVisible) {
        setActiveId(firstVisible.id);
      } else {
        // Fallback: If nothing is visible, determine if we are at the top or bottom
        const firstEl = document.getElementById(headings[0].id);
        if (firstEl) {
          const rect = firstEl.getBoundingClientRect();
          if (rect.top > 200) {
            setActiveId(headings[0].id);
            return;
          }
        }
        
        // If we are deep in the doc, don't change it (keep previous)
      }
    };

    const observerOptions: IntersectionObserverInit = {
      root: document.querySelector(".boltdocs-content"),
      rootMargin: "-20% 0px -70% 0px",
      threshold: [0, 1],
    };

    observerRef.current = new IntersectionObserver(callback, observerOptions);

    const observeHeadings = () => {
      headings.forEach(({ id }) => {
        const el = document.getElementById(id);
        if (el) {
          observerRef.current!.observe(el);
        }
      });
    };

    observeHeadings();
    const timeoutId = setTimeout(observeHeadings, 1000);

    const handleScroll = () => {
      const scrollPosition = window.innerHeight + window.pageYOffset;
      const bodyHeight = document.documentElement.scrollHeight;

      if (scrollPosition >= bodyHeight - 50) {
        setActiveId(headings[headings.length - 1].id);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      observerRef.current?.disconnect();
      clearTimeout(timeoutId);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [headings, location.pathname]);

  // Autoscroll TOC list when the activeId changes
  useEffect(() => {
    if (!activeId || !listRef.current) return;

    const activeLink = listRef.current.querySelector(
      `a[href="#${activeId}"]`,
    ) as HTMLElement;

    if (activeLink) {
      const container = listRef.current.parentElement as HTMLElement;
      if (!container) return;

      const linkRect = activeLink.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      const isVisible =
        linkRect.top >= containerRect.top &&
        linkRect.bottom <= containerRect.bottom;

      if (!isVisible) {
        activeLink.scrollIntoView({
          behavior: "auto",
          block: "nearest",
        });
      }
    }
  }, [activeId]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
      e.preventDefault();
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({
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
        <div className="on-this-page-list-container">
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
