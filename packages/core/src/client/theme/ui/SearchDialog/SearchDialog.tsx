import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Link } from "../Link";
import { Search } from "lucide-react";
import { ComponentRoute } from "../../../types";

interface SearchResult {
  title: string;
  path: string;
  groupTitle?: string;
  isHeading?: boolean;
}

export function SearchDialog({ routes }: { routes: ComponentRoute[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  const searchResults: SearchResult[] = React.useMemo(() => {
    if (!query) {
      return routes.slice(0, 10).map((r) => ({
        title: r.title,
        path: r.path,
        groupTitle: r.groupTitle,
      }));
    }

    const results: SearchResult[] = [];
    const lowerQuery = query.toLowerCase();
    
    for (const route of routes) {
      if (route.title && route.title.toLowerCase().includes(lowerQuery)) {
        results.push({
          title: route.title,
          path: route.path,
          groupTitle: route.groupTitle,
        });
      }

      if (route.headings) {
        for (const heading of route.headings) {
          if (heading.text.toLowerCase().includes(lowerQuery)) {
            results.push({
              title: heading.text,
              path: `${route.path}#${heading.id}`,
              groupTitle: route.title,
              isHeading: true,
            });
          }
        }
      }

      if (route._content && route._content.toLowerCase().includes(lowerQuery)) {
        // If it's a content match but not a title/heading match, add it
        // We only add the page itself for now
        results.push({
          title: route.title,
          path: route.path,
          groupTitle: route.groupTitle,
        });
      }
    }

    // Deduplicate results by path
    const uniqueResults = [];
    const seenPaths = new Set();
    for (const res of results) {
      if (!seenPaths.has(res.path)) {
        seenPaths.add(res.path);
        uniqueResults.push(res);
      }
    }

    return uniqueResults.slice(0, 10);
  }, [routes, query]);

  return (
    <>
      <div
        className="navbar-search"
        role="button"
        tabIndex={0}
        onClick={() => setIsOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen(true);
          }
        }}
        aria-label="Open search dialog"
      >
        <Search className="boltdocs-search-icon" size={18} />
        Search docs...
        <kbd>⌘K</kbd>
      </div>

      {isOpen &&
        createPortal(
          <div
            className="boltdocs-search-overlay"
            onPointerDown={() => setIsOpen(false)}
          >
            <div
              className="boltdocs-search-modal"
              role="dialog"
              aria-modal="true"
              aria-label="Search"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <div className="boltdocs-search-header">
                <Search size={18} />
                <input
                  ref={inputRef}
                  type="text"
                  aria-label="Search documentation input"
                  placeholder="Search documentation..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <button
                  className="boltdocs-search-close"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close search"
                >
                  ESC
                </button>
              </div>

              <div className="boltdocs-search-results">
                {searchResults.length > 0 ? (
                  searchResults.map((result) => (
                    <Link
                      key={result.path}
                      to={result.path === "" ? "/" : result.path}
                      className={`boltdocs-search-result-item ${result.isHeading ? "is-heading" : ""}`}
                      onClick={(e) => {
                        const isSamePath =
                          result.path.split("#")[0] ===
                          window.location.pathname;
                        if (isSamePath && result.isHeading) {
                          e.preventDefault();
                          const id = result.path.split("#")[1];
                          const el = document.getElementById(id);
                          if (el) {
                            const offset = 80;
                            const bodyRect =
                              document.body.getBoundingClientRect().top;
                            const elementRect = el.getBoundingClientRect().top;
                            const elementPosition = elementRect - bodyRect;
                            const offsetPosition = elementPosition - offset;

                            window.scrollTo({
                              top: offsetPosition,
                              behavior: "smooth",
                            });
                            window.history.pushState(null, "", `#${id}`);
                          }
                        }
                        setIsOpen(false);
                      }}
                    >
                      <span className="boltdocs-search-result-title">
                        {result.isHeading ? (
                          <span className="heading-indicator">#</span>
                        ) : null}
                        {result.title}
                      </span>
                      {result.groupTitle && (
                        <span className="boltdocs-search-result-group">
                          {result.groupTitle}
                        </span>
                      )}
                    </Link>
                  ))
                ) : (
                  <div className="boltdocs-search-empty">
                    No results found for "{query}"
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
