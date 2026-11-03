# Working in this repo

- Run `npm test` and `npx tsc --noEmit` before committing.
- `npm run smoke` and `npm run e2e` check production mode.
- All database access goes through `src/lib/store.ts`; item buttons through `src/actions/registry.ts`; model calls through `src/lib/llm.ts`.
- Fixture mode must keep working with no keys and no network.
- Colors come from the variables in `src/app/globals.css`. See `docs/DESIGN.md`.
- Demo content is invented. Never add real firms to fixtures.
