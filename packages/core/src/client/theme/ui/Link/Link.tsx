import React from "react";
import {
  Link as RouterLink,
  NavLink as RouterNavLink,
  LinkProps as RouterLinkProps,
  NavLinkProps as RouterNavLinkProps,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { usePreload } from "../../../app/preload";
import { useConfig } from "../../../app";

function useLocalizedTo(to: RouterLinkProps["to"]) {
  const location = useLocation();
  const config = useConfig();
  if (!config || typeof to !== "string") return to;
  if (!config.i18n && !config.versions) return to;

  const basePath = "/docs";
  if (!to.startsWith(basePath)) return to;

  // 1. Detect current context from location
  const curSub = location.pathname.substring(basePath.length);
  const curParts = curSub.split("/").filter(Boolean);

  let currentVersion = config.versions?.defaultVersion;
  let currentLocale = config.i18n?.defaultLocale;

  let cIdx = 0;
  if (
    config.versions &&
    curParts.length > cIdx &&
    config.versions.versions[curParts[cIdx]]
  ) {
    currentVersion = curParts[cIdx];
    cIdx++;
  }
  if (
    config.i18n &&
    curParts.length > cIdx &&
    config.i18n.locales[curParts[cIdx]]
  ) {
    currentLocale = curParts[cIdx];
  }

  // 2. Parse the target `to` path
  const toSub = to.substring(basePath.length);
  const toParts = toSub.split("/").filter(Boolean);

  let tIdx = 0;
  let hasVersion = false;
  let hasLocale = false;

  if (
    config.versions &&
    toParts.length > tIdx &&
    config.versions.versions[toParts[tIdx]]
  ) {
    hasVersion = true;
    tIdx++;
  }
  if (
    config.i18n &&
    toParts.length > tIdx &&
    config.i18n.locales[toParts[tIdx]]
  ) {
    hasLocale = true;
    tIdx++;
  }

  // Extract just the actual route parts
  const routeParts = toParts.slice(tIdx);

  // Reconstruct path
  const finalParts = [];
  if (config.versions) {
    if (hasVersion) {
      finalParts.push(toParts[0]);
    } else if (currentVersion) {
      finalParts.push(currentVersion);
    }
  }
  if (config.i18n) {
    if (hasLocale) {
      finalParts.push(toParts[hasVersion ? 1 : 0]);
    } else if (currentLocale) {
      finalParts.push(currentLocale);
    }
  }

  finalParts.push(...routeParts);

  let finalPath = `${basePath}/${finalParts.join("/")}`;
  if (finalPath.endsWith("/")) {
    finalPath = finalPath.slice(0, -1);
  }
  return finalPath === basePath ? basePath : finalPath;
}

export interface LinkProps extends Omit<RouterLinkProps, "prefetch"> {
  /** Should prefetch the page on hover? Options: 'hover' | 'none'. Default 'hover' */
  boltdocsPrefetch?: "hover" | "none";
}

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  (props, ref) => {
    const {
      boltdocsPrefetch = "hover",
      onMouseEnter,
      onFocus,
      onClick,
      to,
      ...rest
    } = props;
    const localizedTo = useLocalizedTo(to);
    const { preload } = usePreload();
    const navigate = useNavigate();

    const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
      onMouseEnter?.(e);
      if (
        boltdocsPrefetch === "hover" &&
        typeof localizedTo === "string" &&
        localizedTo.startsWith("/")
      ) {
        preload(localizedTo);
      }
    };

    const handleFocus = (e: React.FocusEvent<HTMLAnchorElement>) => {
      onFocus?.(e);
      if (
        boltdocsPrefetch === "hover" &&
        typeof localizedTo === "string" &&
        localizedTo.startsWith("/")
      ) {
        preload(localizedTo);
      }
    };

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      // Allow user onClick to handle defaults or custom logic
      onClick?.(e);

      // If default prevented or not a simple left click, don't handle
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      // Intercept navigation to wrap in startTransition
      if (typeof localizedTo === "string" && !localizedTo.startsWith("http")) {
        e.preventDefault();
        React.startTransition(() => {
          navigate(localizedTo);
        });
      }
    };

    return (
      <RouterLink
        ref={ref}
        to={localizedTo}
        onMouseEnter={handleMouseEnter}
        onFocus={handleFocus}
        onClick={handleClick}
        {...rest}
      />
    );
  },
);
Link.displayName = "Link";

export interface NavLinkProps extends Omit<RouterNavLinkProps, "prefetch"> {
  /** Should prefetch the page on hover? Options: 'hover' | 'none'. Default 'hover' */
  boltdocsPrefetch?: "hover" | "none";
}

export const NavLink = React.forwardRef<HTMLAnchorElement, NavLinkProps>(
  (props, ref) => {
    const {
      boltdocsPrefetch = "hover",
      onMouseEnter,
      onFocus,
      onClick,
      to,
      ...rest
    } = props;

    const localizedTo = useLocalizedTo(to);
    const { preload } = usePreload();
    const navigate = useNavigate();

    const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
      onMouseEnter?.(e);
      if (
        boltdocsPrefetch === "hover" &&
        typeof localizedTo === "string" &&
        localizedTo.startsWith("/")
      ) {
        preload(localizedTo);
      }
    };

    const handleFocus = (e: React.FocusEvent<HTMLAnchorElement>) => {
      onFocus?.(e);
      if (
        boltdocsPrefetch === "hover" &&
        typeof localizedTo === "string" &&
        localizedTo.startsWith("/")
      ) {
        preload(localizedTo);
      }
    };

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      onClick?.(e);
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }
      if (typeof localizedTo === "string" && !localizedTo.startsWith("http")) {
        e.preventDefault();
        React.startTransition(() => {
          navigate(localizedTo);
        });
      }
    };

    return (
      <RouterNavLink
        ref={ref}
        to={localizedTo}
        onMouseEnter={handleMouseEnter}
        onFocus={handleFocus}
        onClick={handleClick}
        {...rest}
      />
    );
  },
);
NavLink.displayName = "NavLink";
