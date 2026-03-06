import React, { useState, useRef, useEffect } from "react";
import { Globe, ChevronDown } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { BoltdocsI18nConfig } from "../../../../node/config";
import { ComponentRoute } from "../../../app";

function getBaseFilePath(
  filePath: string,
  version: string | undefined,
  locale: string | undefined,
): string {
  let path = filePath;
  if (version && (path === version || path.startsWith(version + "/"))) {
    path = path === version ? "index.md" : path.slice(version.length + 1);
  }
  if (locale && (path === locale || path.startsWith(locale + "/"))) {
    path = path === locale ? "index.md" : path.slice(locale.length + 1);
  }
  return path;
}

export function LanguageSwitcher({
  i18n,
  currentLocale,
  allRoutes,
}: {
  i18n: BoltdocsI18nConfig;
  currentLocale: string;
  allRoutes: ComponentRoute[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (locale: string) => {
    setIsOpen(false);
    if (locale === currentLocale) return;

    const currentRoute = allRoutes.find((r) => r.path === location.pathname);
    let targetPath = "/";

    if (currentRoute) {
      const baseFile = getBaseFilePath(
        currentRoute.filePath,
        currentRoute.version,
        currentRoute.locale,
      );
      const targetRoute = allRoutes.find(
        (r) =>
          getBaseFilePath(r.filePath, r.version, r.locale) === baseFile &&
          (r.locale || i18n.defaultLocale) === locale &&
          r.version === currentRoute.version,
      );
      if (targetRoute) {
        targetPath = targetRoute.path;
      } else {
        const defaultIndexRoute = allRoutes.find(
          (r) =>
            getBaseFilePath(r.filePath, r.version, r.locale) === "index.md" &&
            (r.locale || i18n.defaultLocale) === locale &&
            r.version === currentRoute.version,
        );
        targetPath = defaultIndexRoute
          ? defaultIndexRoute.path
          : locale === i18n.defaultLocale
            ? currentRoute.version
              ? `/${currentRoute.version}`
              : "/"
            : currentRoute.version
              ? `/${currentRoute.version}/${locale}`
              : `/${locale}`;
      }
    } else {
      targetPath = locale === i18n.defaultLocale ? "/" : `/${locale}`;
    }

    navigate(targetPath);
  };

  return (
    <div className="boltdocs-language-switcher" ref={dropdownRef}>
      <button
        className="language-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Switch language"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <Globe size={18} />
        <span className="language-label">
          {i18n.locales[currentLocale] || currentLocale}
        </span>
        <ChevronDown size={14} />
      </button>

      {isOpen && (
        <div className="language-dropdown">
          {Object.entries(i18n.locales).map(([key, label]) => (
            <button
              key={key}
              className={`language-option ${key === currentLocale ? "active" : ""}`}
              onClick={() => handleSelect(key)}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
