import React from "react";
import { useLocation } from "react-router-dom";
import { Link } from "../Link";
import { Home, ChevronRight } from "lucide-react";
import { ComponentRoute } from "../../../app";
import { BoltdocsConfig } from "../../../../node/config";

export interface BreadcrumbsProps {
  routes: ComponentRoute[];
  config: BoltdocsConfig;
}

export function Breadcrumbs({ routes, config }: BreadcrumbsProps) {
  const location = useLocation();

  if (config.themeConfig?.breadcrumbs === false) return null;
  if (location.pathname === "/") return null;

  const currentRoute = routes.find((r) => r.path === location.pathname);

  const groupRoute = currentRoute?.group
    ? routes.find((r) => r.group === currentRoute.group)
    : null;

  return (
    <nav className="boltdocs-breadcrumbs" aria-label="Breadcrumb">
      <ol className="boltdocs-breadcrumbs-list">
        <li className="boltdocs-breadcrumbs-item">
          <Link to="/" className="boltdocs-breadcrumbs-link">
            {/* Home Icon */}
            <Home size={14} />
          </Link>
          <span className="boltdocs-breadcrumbs-separator">
            <ChevronRight size={14} />
          </span>
        </li>

        {currentRoute?.groupTitle && (
          <li className="boltdocs-breadcrumbs-item">
            {groupRoute ? (
              <Link to={groupRoute.path} className="boltdocs-breadcrumbs-link">
                {currentRoute.groupTitle}
              </Link>
            ) : (
              <span className="boltdocs-breadcrumbs-text">
                {currentRoute.groupTitle}
              </span>
            )}
            <span className="boltdocs-breadcrumbs-separator">
              <ChevronRight size={14} />
            </span>
          </li>
        )}

        {currentRoute?.title && (
          <li className="boltdocs-breadcrumbs-item">
            <span
              className="boltdocs-breadcrumbs-text boltdocs-breadcrumbs-active"
              aria-current="page"
            >
              {currentRoute.title}
            </span>
          </li>
        )}
      </ol>
    </nav>
  );
}
