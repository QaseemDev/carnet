# Carnet de Vie

Next.js 16 (App Router, Cache Components) · Tailwind v4 · next-intl (FR at `/`, EN at `/en`).

## Run
```bash
pnpm install
pnpm dev            # http://localhost:3000
```

## Check
```bash
pnpm lint && pnpm typecheck && pnpm test
pnpm build && pnpm test:e2e   # Playwright + axe against the production build (port 3417)
```
CI (`.github/workflows/ci.yml`) runs the same steps on pull requests and on pushes to `main`.

## Deploy
Vercel project `qaseem-elahis-projects/carnet-de-vie`, functions in `fra1` (`vercel.json`). Staging: https://carnet-de-vie-blue.vercel.app (deploys from `main`); every pull request gets a preview URL. Staging and previews send `noindex` until `ALLOW_INDEXING=true`.

Manual deploy: `npx vercel deploy` (preview) or `npx vercel deploy --prod`.

## Layout
- `src/app/[locale]/…` pages · `src/app/global-not-found.tsx` 404 for unknown URLs
- `src/components/brand/` header, footer, menu, switcher
- `src/i18n/` routing, messages (`fr.json`, `en.json`), `prototype-en.json` (strings not yet moved)
- `e2e/` Playwright specs
