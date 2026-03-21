import React, { Suspense, lazy } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { BoltdocsConfig } from "../../../../node/config";
import { ComponentRoute } from "../../../types";
import { LanguageSwitcher } from "../LanguageSwitcher";
import { VersionSwitcher } from "../VersionSwitcher";
import { ThemeToggle } from "../ThemeToggle";
import { Discord } from "../../icons/discord";
import { XformerlyTwitter } from "../../icons/twitter";
import { GithubStars } from "./GithubStars";
import { Tabs } from "./Tabs";

const SearchDialog = lazy(() =>
  import("../SearchDialog").then((m) => ({ default: m.SearchDialog })),
);

const ICON_MAP: Record<string, React.FC> = {
  discord: Discord,
  x: XformerlyTwitter,
};

function formatStars(stars: number) {
  if (stars >= 1000) {
    return (stars / 1000).toFixed(1) + "K";
  }
  return stars.toString();
}

import { useTheme } from "../../ThemeContext";

/**
 * The top navigation bar of the documentation site.
 */
export function Navbar({
  config,
  routes,
  allRoutes,
  currentLocale,
  currentVersion,
}: {
  config: BoltdocsConfig;
  routes?: ComponentRoute[];
  allRoutes?: ComponentRoute[];
  currentLocale?: string;
  currentVersion?: string;
}) {
  const { theme } = useTheme();
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const title = config.themeConfig?.title || "Boltdocs";
  const navItems = config.themeConfig?.navbar || [];
  const socialLinks = config.themeConfig?.socialLinks || [];
  const hasTabs =
    !isHomePage &&
    config.themeConfig?.tabs &&
    config.themeConfig.tabs.length > 0;

  const leftItems = navItems.filter((item) => item.position !== "right");
  const rightItems = navItems.filter((item) => item.position === "right");

  const logo = config.themeConfig?.logo;
  const isLogoObject = typeof logo === "object" && logo !== null && !Array.isArray(logo);

  const getLogoSrc = () => {
    if (!logo) return null;
    if (typeof logo === "string") return logo;
    return theme === "dark" ? logo.dark : logo.light;
  };

  const logoSrc = getLogoSrc();
  const logoAlt = isLogoObject ? (logo as any).alt || title : title;
  const logoWidth = isLogoObject ? (logo as any).width || 24 : 24;
  const logoHeight = isLogoObject ? (logo as any).height || 24 : 24;

  const renderNavItem = (item: any, i: number) => {
    const text = item.label || item.text || "";
    const href = item.to || item.href || item.link || "";
    const isExternal =
      href.startsWith("http") || href.startsWith("//") || href.includes("://");

    return (
      <Link key={i} to={href} target={isExternal ? "_blank" : undefined}>
        {text}
        {isExternal && (
          <span className="navbar-external-icon">
            <svg
              viewBox="0 0 24 24"
              width="13"
              height="13"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </span>
        )}
      </Link>
    );
  };

  return (
    <header className={`boltdocs-navbar ${hasTabs ? "has-tabs" : ""}`}>
      <div
        className="navbar-container"
        style={{ height: "var(--ld-navbar-height)" }}
      >
        {/* LEFT SECTION */}
        <div className="navbar-left">
          <div className="navbar-logo">
            <Link to="/">
              {logoSrc ? (
                logoSrc.trim().startsWith("<svg") ? (
                  <span
                    className="navbar-logo-svg"
                    dangerouslySetInnerHTML={{
                      __html: logoSrc,
                    }}
                  />
                ) : (
                  <img
                    src={logoSrc}
                    alt={logoAlt}
                    width={logoWidth}
                    height={logoHeight}
                    className="navbar-logo-img"
                  />
                )
              ) : null}
              {title}
            </Link>
          </div>

          {config.versions && currentVersion && allRoutes ? (
            <VersionSwitcher
              versions={config.versions}
              currentVersion={currentVersion}
              currentLocale={currentLocale}
              allRoutes={allRoutes}
            />
          ) : config.themeConfig?.version ? (
            <div className="navbar-version">
              {config.themeConfig.version} <ChevronDown size={14} />
            </div>
          ) : null}

          <nav className="navbar-links" aria-label="Top Navigation Left">
            {leftItems.map(renderNavItem)}
          </nav>
        </div>

        {/* RIGHT SECTION */}
        <div className="navbar-right">
          <nav className="navbar-links" aria-label="Top Navigation Right">
            {rightItems.map(renderNavItem)}
          </nav>

          <Suspense fallback={<div className="navbar-search-placeholder" />}>
            <SearchDialog routes={routes || []} />
          </Suspense>

          {config.i18n && currentLocale && allRoutes && (
            <LanguageSwitcher
              i18n={config.i18n}
              currentLocale={currentLocale}
              allRoutes={allRoutes}
            />
          )}

          <ThemeToggle />

          {config.themeConfig?.githubRepo && (
            <GithubStars repo={config.themeConfig.githubRepo} />
          )}

          {/* Optional Divider if both groups have items */}
          {socialLinks.length > 0 && <div className="navbar-divider" />}

          <div className="navbar-icons">
            {socialLinks.map((link, i) => {
              const IconComp = ICON_MAP[link.icon.toLowerCase()];
              return (
                <a
                  key={i}
                  href={link.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="navbar-icon-btn"
                  aria-label={link.icon}
                >
                  {IconComp ? <IconComp /> : <span>{link.icon}</span>}
                </a>
              );
            })}
          </div>
        </div>
      </div>

      {hasTabs && config.themeConfig?.tabs && (
        <Tabs
          tabs={config.themeConfig.tabs}
          routes={allRoutes || routes || []}
        />
      )}
    </header>
  );
}
