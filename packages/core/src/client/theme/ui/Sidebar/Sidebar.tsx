import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Link } from "../Link";
import { BoltdocsConfig } from "../../../../node/config";
import { PoweredBy } from "../PoweredBy";
import { ChevronRight } from "lucide-react";
import * as LucideIcons from "lucide-react";

interface RouteItem {
  path: string;
  title: string;
  group?: string;
  groupTitle?: string;
  sidebarPosition?: number;
  badge?: string | { text: string; expires?: string };
  icon?: string;
  tab?: string;
  groupIcon?: string;
}

interface SidebarGroup {
  slug: string;
  title: string;
  routes: RouteItem[];
  icon?: string;
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
 * Renders an icon from a string (Lucide name or SVG).
 */
function renderIcon(iconName?: string, size = 16) {
  if (!iconName) return null;

  const trimmed = iconName.trim();

  // Check if it's a raw SVG
  if (trimmed.startsWith("<svg") || trimmed.includes("http")) {
    if (trimmed.startsWith("<svg")) {
      return (
        <span
          className="sidebar-icon svg-icon"
          dangerouslySetInnerHTML={{ __html: trimmed }}
        />
      );
    }
    return (
      <img
        src={trimmed}
        className="sidebar-icon"
        style={{ width: size, height: size }}
        alt=""
      />
    );
  }

  // Check if it's a Lucide icon
  const IconComponent = (LucideIcons as any)[iconName];
  if (IconComponent) {
    return <IconComponent size={size} className="sidebar-icon lucide-icon" />;
  }

  return null;
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
}: {
  routes: RouteItem[];
  config: BoltdocsConfig;
}) {
  const location = useLocation();

  // Find active tab based on the current route's metadata
  const currentRoute = routes.find((r) => r.path === location.pathname);
  const activeTabId = currentRoute?.tab?.toLowerCase();

  // Filter routes by active tab if any tab is active
  const filteredRoutes = activeTabId
    ? routes.filter((r) => {
        if (!r.tab) return true; // Fallback for untabbed routes
        return r.tab.toLowerCase() === activeTabId;
      })
    : routes;

  const ungrouped: RouteItem[] = [];
  const groupMap = new Map<string, SidebarGroup & { icon?: string }>();

  for (const route of filteredRoutes) {
    if (!route.group) {
      ungrouped.push(route);
    } else {
      if (!groupMap.has(route.group)) {
        groupMap.set(route.group, {
          slug: route.group,
          title: route.groupTitle || route.group,
          routes: [],
          icon: (route as any).groupIcon,
        });
      }
      groupMap.get(route.group)!.routes.push(route);
    }
  }

  const groups = Array.from(groupMap.values());

  return (
    <aside className="boltdocs-sidebar">
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
                  <div className="sidebar-link-title-container">
                    {renderIcon((route as any).icon)}
                    <span>{route.title}</span>
                  </div>
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
        <div className="sidebar-group-header-content">
          <span className="sidebar-group-title">{group.title}</span>
        </div>
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
                  <div className="sidebar-link-title-container">
                    {renderIcon((route as any).icon)}
                    <span>{route.title}</span>
                  </div>
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
