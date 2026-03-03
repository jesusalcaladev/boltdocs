import { useState, useRef, useEffect } from "react";
import { Layers, ChevronDown } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { LitedocsVersionsConfig } from "../../node/config";
import { ComponentRoute } from "../app";

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

export function VersionSwitcher({
  versions,
  currentVersion,
  currentLocale,
  allRoutes,
}: {
  versions: LitedocsVersionsConfig;
  currentVersion: string;
  currentLocale?: string;
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

  const handleSelect = (version: string) => {
    setIsOpen(false);
    if (version === currentVersion) return;

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
          (r.version || versions.defaultVersion) === version &&
          (currentLocale ? r.locale === currentLocale : !r.locale),
      );

      if (targetRoute) {
        targetPath = targetRoute.path;
      } else {
        // Fallback to version index
        const versionIndexRoute = allRoutes.find(
          (r) =>
            getBaseFilePath(r.filePath, r.version, r.locale) === "index.md" &&
            (r.version || versions.defaultVersion) === version &&
            (currentLocale ? r.locale === currentLocale : !r.locale),
        );
        targetPath = versionIndexRoute
          ? versionIndexRoute.path
          : version === versions.defaultVersion
            ? "/"
            : `/${version}`;
      }
    } else {
      targetPath = version === versions.defaultVersion ? "/" : `/${version}`;
    }

    navigate(targetPath);
  };

  return (
    <div className="litedocs-version-switcher" ref={dropdownRef}>
      <button
        className="version-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Switch version"
      >
        <Layers size={18} />
        <span className="version-label">
          {versions.versions[currentVersion] || currentVersion}
        </span>
        <ChevronDown size={14} />
      </button>

      {isOpen && (
        <div className="version-dropdown">
          {Object.entries(versions.versions).map(([key, label]) => (
            <button
              key={key}
              className={`version-option ${key === currentVersion ? "active" : ""}`}
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
