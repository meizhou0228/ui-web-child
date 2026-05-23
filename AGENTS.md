# Repository Guidelines

## Project Structure & Module Organization

This Vite + React 18 + TypeScript H5 app tracks child points and rewards. Source code lives in `src/`: route pages in `src/pages`, reusable UI in `src/components`, Zustand slices/selectors in `src/store`, hooks in `src/hooks`, static data in `src/constants`, types in `src/types`, utilities in `src/utils`, and global styles in `src/styles`. Tests are colocated in `__tests__` folders plus setup/factories in `test/`. Public assets belong under `public/assets`, with icons grouped by domain, plus `audio`, `lottie`, and `models`.

## Build, Test, and Development Commands

- `npm install`: install dependencies from `package-lock.json`.
- `npm run dev`: start the Vite dev server at `http://localhost:5173`.
- `npm run build`: run TypeScript project build and produce `dist/`.
- `npm run preview`: preview the production build locally.
- `npm test`: run Vitest in watch mode.
- `npm run test:run`: run the full test suite once.
- `npm run test:coverage`: run Vitest with coverage output.
- `npm run typecheck`: run TypeScript checks without emitting files.

## Coding Style & Naming Conventions

Use TypeScript with strict settings and React JSX. Prefer domain-specific files such as `TaskItem.tsx`, `tasksSlice.ts`, and `presetRewards.ts`. Use the `@/` alias for imports from `src`. Keep UI, business logic, constants, and types separated: complex JSX goes into `components/`, stateful logic over roughly 50 lines goes into `hooks/`, and interfaces/constants/mock data go into `types.ts` or `constants.ts` style modules. No single component, page, or logic file should exceed 500 lines; split before adding more code.

## Testing Guidelines

Vitest runs in `jsdom` with Testing Library setup from `test/setup.ts`. Name tests `*.test.ts` or `*.test.tsx` and place them near the target module in `__tests__`. Add store tests for slice behavior, component tests for interactions, and utility tests for date, export/import, and milestone logic. Run `npm run test:run` and `npm run typecheck`.

## Commit & Pull Request Guidelines

Git history uses Conventional Commit prefixes, especially `feat:` and `chore:`. Keep messages imperative and scoped to one change, for example `feat: add daily limit for chores`. Pull requests should include a short summary, test results, linked issue or spec when relevant, and screenshots or recordings for visual UI changes.

## Security & Configuration Tips

The app is fully client-side and stores data under localStorage key `ui-web-child:v1`. Do not add secrets, API keys, or private user data to the repository or browser storage. Keep generated build artifacts in `dist/` out of source changes unless explicitly requested.
