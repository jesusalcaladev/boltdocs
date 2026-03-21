---
name: Boltdocs Documentation Standard
description: Guidelines for creating comprehensive and structured documentation for Boltdocs components, integrations, and plugins.
---

# Boltdocs Documentation Standards

Follow these rules and structures to maintain consistency across the Boltdocs documentation site. High-quality documentation is actionable, visually clear, and technically detailed.

## 1. Core Principles

- **Comprehensive**: Never leave features or props undocumented.
- **Visual-First**: Always include a `<Playground />` with a live demonstration when possible.
- **Ordered Hierarchy**: Use numerical prefixes (e.g., `1.overview.mdx`) for logical page flow in the sidebar.
- **Action-Oriented**: Write for developers who want to _do_ something. Focus on implementation and practical usage.

## 2. Documenting Components

Every component page (e.g., `(components)/button.mdx`) must include:

### Overview

A high-level description followed by a live `<Playground />` that showcases the component in its most common use case.

### Props Table

A detailed API reference using the `<Table />` or `<Field />` components.

| Property  | Type                                  | Default     | Description                     |
| :-------- | :------------------------------------ | :---------- | :------------------------------ |
| `variant` | `'primary' \| 'secondary' \| 'ghost'` | `'primary'` | The visual style of the button. |
| `size`    | `'sm' \| 'md' \| 'lg'`                | `'md'`      | The size constraints.           |

### Variants & Examples

- **Basic Usage**: The simplest way to implement.
- **Customization**: How to use props to change appearance or behavior.
- **Personalization (CSS)**: List all CSS variables (tokens) available for this component.

```css
:root {
  --ld-button-bg: #7f13ec;
}
```

## 3. Documenting Integrations

For services like **CodeSandbox**, **StackBlitz**, or **Algolia**:

- **Analyze the API**: Summarize the core underlying API being utilized.
- **Generic Support**: Document exported functions (e.g., `openSandbox`) and their type signatures.
- **Live Implementation**: Add a playground with a "Try it in [Service]" button.
- **Options Reference**: Document all configuration objects (e.g., `SandboxOptions`).

## 4. Documentation Structure

### (Guides)

- **1. Overview**: Introduction, installation, and project goals.
- **2. Core Concepts**: Routing, file-system conventions, and i18n/versioning.
- **4. Customization**: Theming, CSS variables, and building custom themes.

### (Components)

- Individual files for every client-side UI element.
- Use `0.overview.mdx` for a component summary.

### (Integrations)

- Detailed guides for third-party service connections.

### (Plugins)

- Documentation for extending the core build system or MDX pipeline.

## 5. Writing Style

- **Voice**: Professional, helpful, and direct.
- **Labels**: Use components of "boltdocs/client" `Note`, `Tip`, `Warning`, `Danger`, `Important`, `Caution` alerts strategically.
- **Formatting**: Always provide full, copy-pasteable code examples.
