import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { Link } from "../Link";
import { BoltdocsConfig } from "../../../../node/config";
import { PoweredBy } from "../PoweredBy";
import { ChevronRight, ChevronLeft, PanelLeft } from "lucide-react";

interface RouteItem {
  path: string;
  title: string;
  group?: string;
  groupTitle?: string;
  sidebarPosition?: number;
  badge?: string | { text: string; expires?: string };
}

interface SidebarGroup {
  slug: string;
  title: string;
  routes: RouteItem[];
}

/**
 * Renders a small badge next to sidebar items if one exists and hasn't expired.
 */
function renderBadge(badgeRaw: RouteItem["badge"]) {
  if (!badgeRaw) return null;

  let text = "";
  let expires = "";

  if (typeof badgeRaw === "string") {
    text = badgeRaw;
  } else {
    text = badgeRaw.text;
    expires = badgeRaw.expires || "";
  }

  // Check expiration
  if (expires) {
    const expireDate = new Date(expires);
    const now = new Date();
    // Reset time components for accurate day comparison
    expireDate.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    if (now > expireDate) {
      return null;
    }
  }

  if (!text) return null;

  if (!text) return null;

  let typeClass = "badge-default";
  const lowerText = text.toLowerCase();
  if (lowerText === "new") {
    typeClass = "badge-new";
  } else if (lowerText === "experimental") {
    typeClass = "badge-experimental";
  } else if (lowerText === "updated") {
    typeClass = "badge-updated";
  }

  return <span className={`sidebar-badge ${typeClass}`}>{text}</span>;
}

/**
 * The sidebar navigation component.
 * Groups documentation routes logically based on the `group` property.
 * Highlights the active link based on the current URL path.
 *
 * @param routes - Array of all generated routes to be displayed
 * @param config - Global configuration (which can contain sidebar overrides)
 */
export function Sidebar({
  routes,
  config,
  isCollapsed,
  onToggle,
}: {
  routes: RouteItem[];
  config: BoltdocsConfig;
  isCollapsed?: boolean;
  onToggle?: () => void;
}) {
  const location = useLocation();

  const ungrouped: RouteItem[] = [];
  const groupMap = new Map<string, SidebarGroup>();

  for (const route of routes) {
    if (!route.group) {
      ungrouped.push(route);
    } else {
      if (!groupMap.has(route.group)) {
        groupMap.set(route.group, {
          slug: route.group,
          title: route.groupTitle || route.group,
          routes: [],
        });
      }
      groupMap.get(route.group)!.routes.push(route);
    }
  }

  const groups = Array.from(groupMap.values());

  return (
    <aside className="boltdocs-sidebar">
      {onToggle && (
        <div className="sidebar-collapse">
          <button
            className="sidebar-collapse-btn"
            onClick={onToggle}
            aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <PanelLeft size={18} />
          </button>
        </div>
      )}

      {!isCollapsed && (
        <>
          <nav aria-label="Main Navigation">
            <ul className="sidebar-list">
              {ungrouped.map((route) => (
                <li key={route.path}>
                  <Link
                    to={route.path === "" ? "/" : route.path}
                    className={`sidebar-link ${location.pathname === route.path ? "active" : ""}`}
                    aria-current={
                      location.pathname === route.path ? "page" : undefined
                    }
                  >
                    <div className="sidebar-link-content">
                      <span>{route.title}</span>
                      {renderBadge(route.badge)}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>

            {groups.map((group) => (
              <SidebarGroupSection
                key={group.slug}
                group={group}
                currentPath={location.pathname}
              />
            ))}
          </nav>
          {config.themeConfig?.poweredBy !== false && <PoweredBy />}
        </>
      )}
    </aside>
  );
}

function SidebarGroupSection({
  group,
  currentPath,
}: {
  group: SidebarGroup;
  currentPath: string;
}) {
  const isActive = group.routes.some((r) => currentPath === r.path);
  const [open, setOpen] = useState(true);

  return (
    <div className="sidebar-group">
      <button
        className={`sidebar-group-header ${isActive ? "active" : ""}`}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls={`sidebar-group-${group.slug}`}
      >
        <span className="sidebar-group-title">{group.title}</span>
        <span className={`sidebar-group-chevron ${open ? "open" : ""}`}>
          <ChevronRight size={16} />
        </span>
      </button>
      {open && (
        <ul className="sidebar-group-list" id={`sidebar-group-${group.slug}`}>
          {group.routes.map((route) => (
            <li key={route.path}>
              <Link
                to={route.path === "" ? "/" : route.path}
                className={`sidebar-link sidebar-link-nested ${currentPath === route.path ? "active" : ""}`}
                aria-current={currentPath === route.path ? "page" : undefined}
              >
                <div className="sidebar-link-content">
                  <span>{route.title}</span>
                  {renderBadge(route.badge)}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
