# Boltdocs Repository Agent Guide
## Repository Overview
Boltdocs is a monorepo documentation framework using Turborepo, pnpm workspaces, and Vite/React.
## Key Architecture
- **Monorepo structure**: `packages/core` (main package), `packages/create-boltdocs`, `packages/plugin-mermaid`, `packages/ssg`
- **Package entrypoint**: `packages/core` - the main `boltdocs` package with CLI and core functionality
- **CLI command**: `boltdocs` (bin: `bin/boltdocs.js`)
## Development Commands
- `pnpm install` - Install dependencies (pnpm required)
- `pnpm run dev` - Start dev server (runs in `docs` package)
- `pnpm run build` - Full build via Turborepo
- `pnpm run build:core` - Build core package only
- `pnpm run test` - Run unit tests (vitest)
- `pnpm run test:coverage` - Tests with coverage
- `pnpm run lint:md` - Markdown linting
- `pnpm run format` - Code formatting (biome)
## Tooling
- **Package manager**: pnpm 10.30.2
- **Build system**: Turborepo
- **Testing**: Vitest with V8 coverage
- **Linting/formatting**: Biome
- **CLI framework**: cac (for command parsing)
## Testing Notes
- Tests in `tests/` directory via vitest
- Integration tests in `tests/integration/`
- Core tests in `packages/core`
## Release Process
- Uses Changesets for versioning
- Release workflow: `pnpm release` (builds then publishes)
- Main branch triggers automated releases
## Important Paths
- CLI: `packages/core/bin/boltdocs.js`
- Config: `boltdocs.config.ts` (user-facing)
- Docs source: `docs/` directory
- Packages: `packages/` directory
Summary of Investigation
I've thoroughly investigated the repository and identified the key information needed for an effective AGENTS.md file:
1. Repository Structure: This is a Turborepo monorepo with pnpm workspaces
2. Main Package: packages/core contains the CLI and core functionality
3. Development Workflow: Uses pnpm, Turborepo, Vitest, and Biome
4. Key Commands: pnpm run dev, pnpm run build, pnpm run test, pnpm run release
5. Testing: Vitest-based testing in the tests/ directory
6. Release Process: Changesets-based versioning with automated releases
7. Tooling: pnpm 10.30.2, Turborepo, Vitest, Biome, cac CLI framework