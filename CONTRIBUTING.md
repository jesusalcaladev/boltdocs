# Contributing to LiteDocs

First off, thank you for considering contributing to LiteDocs! It's people like you that make this tool better for everyone.

## Development Setup

This project is a monorepo using [pnpm workspaces](https://pnpm.io/workspaces) and [Turborepo](https://turbo.build/repo).

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [pnpm](https://pnpm.io/installation) (v8 or higher)

### Getting Started

1. Fork the repository and clone your fork:

   ```bash
   git clone https://github.com/<your-username>/boltdocs.git
   cd boltdocs
   ```

2. Install dependencies (this will also run `preinstall` for the core package):

   ```bash
   pnpm install
   ```

3. Start the development environment for the example site:
   ```bash
   pnpm run dev
   ```

### Project Structure

- `packages/core`: The core framework logic containing the theme, plugins, and Vite integration.
- `packages/create-boltdocs`: The CLI to bootstrap new projects.
- `example/`: Example documentation site used for active development and testing.

## Making a Pull Request

1. Create a new branch for your feature or bug fix:
   ```bash
   git checkout -b feature/my-awesome-feature
   ```
2. Make your changes and verify that everything works locally.
3. Commit your changes. We recommend following [Conventional Commits](https://www.conventionalcommits.org/).
4. Push your branch to your fork.
5. Open a Pull Request!

## Code of Conduct

Please follow community standards and respect all maintainers and contributors during discussions.
