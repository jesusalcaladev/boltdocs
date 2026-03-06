import React, { useEffect, useState } from "react";
import { Link } from "../Link";
import { Book, ChevronDown } from "lucide-react";
import { BoltdocsConfig } from "../../../../node/config";
import { ComponentRoute } from "../../../app";
import { LanguageSwitcher } from "../LanguageSwitcher";
import { VersionSwitcher } from "../VersionSwitcher";
import { ThemeToggle } from "../ThemeToggle";
import { getStarsRepo } from "../../../utils";
import { Discord } from "../../icons/discord";
import { XformerlyTwitter } from "../../icons/twitter";
import { GithubStars } from "./GithubStars";

const SearchDialog = React.lazy(() =>
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
  const title = config.themeConfig?.title || "Boltdocs";
  const navItems = config.themeConfig?.navbar || [];
  const socialLinks = config.themeConfig?.socialLinks || [];

  return (
    <header className="boltdocs-navbar">
      <div className="navbar-container">
        {/* LEFT SECTION */}
        <div className="navbar-left">
          <div className="navbar-logo">
            <Link to="/">
              {config.themeConfig?.logo ? (
                config.themeConfig.logo.trim().startsWith("<svg") ? (
                  <span
                    className="navbar-logo-svg"
                    dangerouslySetInnerHTML={{
                      __html: config.themeConfig.logo,
                    }}
                  />
                ) : (
                  <img
                    src={config.themeConfig.logo}
                    alt={title}
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

          <nav className="navbar-links" aria-label="Top Navigation">
            {navItems.map((item, i) => (
              <Link key={i} to={item.link}>
                {item.text}
              </Link>
            ))}
          </nav>
        </div>

        {/* RIGHT SECTION */}
        <div className="navbar-right">
          <React.Suspense
            fallback={<div className="navbar-search-placeholder" />}
          >
            <SearchDialog routes={routes || []} />
          </React.Suspense>

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
    </header>
  );
}
