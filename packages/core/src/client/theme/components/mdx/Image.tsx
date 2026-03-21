import React from "react";
import { useTheme } from "../../ThemeContext";

export interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  darkSrc?: string;
  theme?: "light" | "dark";
}

/**
 * A themed Image component for Boltdocs.
 * It supports rendering based on the current active theme.
 */
export function Image({ src, alt, theme: imageTheme, ...props }: ImageProps) {
  const { theme: currentTheme } = useTheme();

  // If a specific theme is required for this image, only render if it matches
  if (imageTheme && imageTheme !== currentTheme) {
    return null;
  }

  return <img src={src} alt={alt || ""} {...props} />;
}
