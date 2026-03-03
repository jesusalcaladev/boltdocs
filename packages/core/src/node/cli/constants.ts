export const DEFAULT_CSS_VARIABLES = `:root {
  /* ─ Base palette ─ */
  --ld-bg-main: #0a0a0f;
  --ld-bg-soft: #0f0f18;
  --ld-bg-mute: #141420;
  --ld-surface: #1a1a2e;
  --ld-border-subtle: rgba(255, 255, 255, 0.06);
  --ld-border-strong: rgba(255, 255, 255, 0.12);

  /* ─ Text ─ */
  --ld-text-main: #e4e4ed;
  --ld-text-muted: #9d9db5;
  --ld-text-dim: #6b6b85;

  /* ─ Accent ─ */
  --ld-color-primary: #ffff;
  --ld-color-primary-hover: #f8f8f8;
  --ld-color-primary-muted: rgba(255, 255, 255, 0.05);
  --ld-color-primary-glow: rgba(255, 255, 255, 0.15);
  --ld-color-primary-text: #010101;
  --ld-color-accent: #ffff; /* Yellow accent for TOC */

  /* ─ Code ─ */
  --ld-code-bg: #0d0d14;
  --ld-code-header: #111119;
  --ld-code-text: #d4d4d4;

  /* ─ Typography ─ */
  --ld-font-sans: "Inter", system-ui, -apple-system, sans-serif;
  --ld-font-mono:
    "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    monospace;

  /* ─ Dimensions ─ */
  --ld-navbar-height: 3.5rem;
  --ld-sidebar-width: 14.5rem;
  --ld-toc-width: 13rem;
  --ld-content-max-width: 820px;
  --ld-radius-sm: 4px;
  --ld-radius-md: 8px;
  --ld-radius-lg: 12px;
  --ld-radius-full: 9999px;
}

[data-theme="light"],
.theme-light {
  --ld-bg-main: #ffffff;
  --ld-bg-soft: #f9fafb;
  --ld-bg-mute: #f3f4f6;

  --ld-surface: #ffffff;

  --ld-border-subtle: #e5e7eb;
  --ld-border-strong: #d1d5db;

  --ld-text-main: #111827;
  --ld-text-muted: #4b5563;
  --ld-text-dim: #6b7280;

  --ld-color-primary: #010101;
  --ld-color-primary-hover: #010101;
  --ld-color-primary-muted: rgba(127, 19, 236, 0.1);
  --ld-color-primary-glow: rgba(127, 19, 236, 0.25);
  --ld-color-primary-text: #010101;

  --ld-code-bg: #f3f4f6;
  --ld-code-header: #e5e7eb;
  --ld-code-text: #1f2937;
}
`;
