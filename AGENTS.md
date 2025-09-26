# Repository Guidelines

## Project Structure & Module Organization
- `src/app`: Expo Router entry points for native and web; marketing widgets live under `(landing)`.
- `src/modules`: Feature domains (manager, user, master views) wired into screens via hooks and services.
- `src/common`: Shared UI, constants, theming, and utilities exposed through path aliases such as `@components/*` and `@constants/*`.
- `src/services` & `src/backend-migration`: API clients and migration adapters, including sample integrations.
- `functions`: Firebase Cloud Functions (run npm commands from this subfolder); `public` and `assets` contain web exports and static media.
- `tests` / `tests-examples`: Playwright end-to-end specs and reference scripts; keep new suites beside similar flows.

## Build, Test, and Development Commands
- `npm run dev` (alias `npm run start`): launches the Expo development server with hot reload.
- `npm run web`: starts the web preview (`expo start --web`) while suppressing noisy Expo warnings.
- `npm run build`: generates the static web bundle in `dist/`; run `npm run build:functions` first when Cloud Functions change.
- `npm run build:all`: sequentially builds Firebase functions and the web bundle for deployment.
- `npx playwright test`: executes the E2E suite defined in `playwright.config.ts`.

## Version Management Commands
- `npm run release:patch`: increments patch version (1.0.0 → 1.0.1) for bug fixes, commits with automated message, and pushes to repository.
- `npm run release:minor`: increments minor version (1.0.0 → 1.1.0) for new features, commits with automated message, and pushes to repository.
- `npm run release:major`: increments major version (1.0.0 → 2.0.0) for breaking changes, commits with automated message, and pushes to repository.
- Version info automatically reflects in app settings screen via `AppVersion.ts` utility that directly imports `package.json`.

### Version Management Implementation Details
```typescript
// AppVersion.ts - Simple direct package.json import approach
// @ts-ignore
import packageJson from "../../../../package.json";

export class AppVersion {
  static getVersion(): string { return packageJson.version; }
  static getFormattedVersion(): string { return `Version ${packageJson.version}`; }
  static getAppName(): string { return "Shiftize -シフタイズ-"; }
}
```
- Settings screen (`src/app/(main)/user/settings.tsx`) displays app name and version dynamically
- No complex build scripts needed - package.json changes automatically reflect in app
- Uses `@ts-ignore` to bypass TypeScript import restrictions for JSON files

## Coding Style & Naming Conventions
- TypeScript is strict (`tsconfig.json`); favor typed React function components and hooks.
- Follow the ESLint ruleset (`eslint.config.js`) and run `npx eslint src --max-warnings=0` before committing.
- Use 2-space indentation, PascalCase for components, camelCase for functions/variables, and kebab-case for file names under `app/(landing)`.
- Import via configured aliases (e.g., `@features/manager/...`) instead of deep relative paths.

## Testing Guidelines
- Place Playwright specs under `tests/` using a `*.spec.ts` suffix; mirror the route or feature under test in folder names.
- Include at least one happy-path and one failure-state assertion for new flows.
- Smoke-test visual regressions with `npx playwright test --project=chromium` after changing marketing layouts.

## Commit & Pull Request Guidelines
- Use imperative, type-prefixed commit messages (e.g., `feat: add shift draft banner`, `fix: sync calendar scroll`) and reference issues with `(#123)` when applicable.
- PRs should describe intent, testing done (`npx playwright test` results, manual checks), and attach screenshots for UI changes (desktop + mobile when relevant).
- Keep changes scoped; separate infrastructure updates (Firebase, Expo config) from UI features.

## Security & Configuration Tips
- Store secrets in `.env` or Expo config profiles; never commit raw API keys or Firebase service credentials.
- When adding config, prefer `EXPO_PUBLIC_` variables for web-safe values and document new keys in `README.md`.
- Review Firebase rules before deploying `functions/`; run `npm run build:functions` locally to surface lint/TypeScript errors.
## Open Tasks
| Area | Detail | Owner | Status |
| --- | --- | --- | --- |
| Gantt chart UI | Replace hard-coded `#fafbfc` / `#f5f5f5` backgrounds with theme-based whites in `GanttChartMonthView.styles.ts` and related components. | TBD | Backlog |
| Home view | Align `home-common-screen.css` and `HomeGanttMobileScreen` backgrounds with iOS 26 white palette (remove `#1565c0`, `#f5f5f5`, `#e3f2fd`). | TBD | Backlog |
| Teacher settings screens | Swap residual `#f5f5f5` surfaces in user/teacher settings (`user-shift-forms` styles, modal sheets) for theme tokens. | TBD | Backlog |
| Legacy lint cleanup | Refactor `gantt-chart-common` and `user-shift-forms` legacy modules to eliminate unused code/`any` usage and clear remaining ESLint violations. | TBD | Backlog |


## AI Agent Configuration & Management

### Claude Code Agent Types
- **general-purpose**: Complex questions, code search, multi-step tasks
- **statusline-setup**: Configure Claude Code status line settings
- **output-style-setup**: Create Claude Code output styles
- **error-warning-fixer**: Fix errors, warnings, alerts, TypeScript/linting issues
- **code-refactor-security**: Refactor code for best practices and security
- **shift-app-release-manager**: Manage releases, versioning, changelog for shift scheduler app

### AI Agent Usage Guidelines
- Use Task tool to launch specialized agents based on task requirements
- Launch multiple agents concurrently for optimal performance
- Provide detailed task descriptions for autonomous execution
- Agents are stateless - include all necessary context in prompts

### AI Development Workflow
1. **Code Generation**: Write initial implementation
2. **Error Fixing**: Use error-warning-fixer agent for issues
3. **Refactoring**: Use code-refactor-security agent for optimization
4. **Release Management**: Use shift-app-release-manager for versioning

## Agent Progress
- 2025-09-26: SimpleLanding リファクタリングを開始。データ/型/スタイルを分離し、テーマカラーへ置換。Lint (`SimpleLanding*`) がパスする状態を確認。
- 2025-09-26: AppSpecifications をデータ・型・スタイルへ分離し、テーマトークンを適用。Lint OK。
- 2025-09-26: Changelogをデータ/型/スタイル分離し、文言を英語化。Lint OK。
- 2025-09-26: DevelopmentStoryをデータ/型/スタイル分離し、英語コピーとテーマカラーを適用。Lint OK。
- 2025-09-26: Features ウィジェットをデータ/型分離し、英語コピーへ更新。Lint OK。
- 2025-09-27: AI agent documentation section added to AGENTS.md for better development workflow management.
