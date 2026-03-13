import React from "react";
import { useLocation } from "react-router-dom";
import { Link } from "../Link";
import * as Icons from "lucide-react";

interface TabConfig {
  id: string;
  text: string;
  icon?: string;
}

interface TabsProps {
  tabs: TabConfig[];
  routes: any[];
}

export function Tabs({ tabs, routes }: TabsProps) {
  const location = useLocation();
  const currentRoute = routes.find((r) => r.path === location.pathname);
  const currentTabId = currentRoute?.tab?.toLowerCase();

  if (!tabs || tabs.length === 0) return null;

  const renderTabIcon = (iconName?: string) => {
    if (!iconName) return null;

    // 1. Raw SVG
    if (iconName.trim().startsWith("<svg")) {
      return (
        <span
          className="tab-icon svg-icon"
          dangerouslySetInnerHTML={{ __html: iconName }}
        />
      );
    }

    // 2. Lucide Icon
    const LucideIcon = (Icons as any)[iconName];
    if (LucideIcon) {
      return <LucideIcon size={16} className="tab-icon lucide-icon" />;
    }

    // 3. Fallback to image URL
    return <img src={iconName} alt="" className="tab-icon img-icon" />;
  };

  return (
    <div className="boltdocs-tabs-container">
      <div className="boltdocs-tabs">
        {tabs.map((tab, index) => {
          // If no tab is detected (e.g. root home page), default to the first tab (usually "Guides")
          const isActive = currentTabId 
            ? currentTabId === tab.id.toLowerCase()
            : index === 0;
          
          // Find the first route for this tab to link to it
          const firstRoute = routes.find(r => r.tab && r.tab.toLowerCase() === tab.id.toLowerCase());
          const linkTo = firstRoute ? firstRoute.path : "#";

          return (
            <Link
              key={tab.id}
              to={linkTo}
              className={`boltdocs-tab-item ${isActive ? "active" : ""}`}
            >
              {renderTabIcon(tab.icon)}
              <span>{tab.text}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
