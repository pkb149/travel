# Travel — Claude Instructions

## What this is
Generic travel platform. Vietnam is first seeded trip (`data/vietnam.ts`, 23 days 11/22–12/14), not whole project. Create any trip via **UI** (+ New trip), **API** (`POST /api/trips` on Workers), or skill.

## Stack
- Frontend: Next.js 16 (App Router, TS, Tailwind 4, Zustand) → **Cloudflare Pages** `travel` → `https://travel-7l1.pages.dev` (suffix `-7l1` due to global name collision; clean alternatives like `wander-world`, `voyage-world`, `tripnest`, `trips-world` exist — `travel-world` → `travel-world-2b0`, etc.)
- API: Hono on **Cloudflare Workers** → `api/` isolated → `travel-api.workers.dev` (NOT `travel.workers.dev`; UI never on Workers)
- CLI: Wrangler 4.x, **D1** `travel-db` (01eec730-0aed-432a-8d8d-26f6e348652c, migrated remote), **R2** `travel-attachments` (S3-like for images)

## Code segregation (mandatory)
- `app/`, `components/`, `lib/`, `data/` — frontend only, no imports from `api/`
- `api/` — Workers only, own `wrangler.jsonc` + `src/index.ts` + `tsconfig.json`, no imports from frontend
- Shared types in `lib/types.ts`; D1/R2 bindings shared but code not
- Root `wrangler.jsonc` is Pages (`pages_build_output_dir: "out"`); `api/wrangler.jsonc` is Workers (`main: "src/index.ts"`, `name: "travel-api"`); `tsconfig.json` excludes `api`, `.open-next`, `out`

## Auth between Pages and Workers
- Worker verifies `/api/*` (except `/api/health`): `X-API-Secret === API_SECRET` (service) OR `Authorization: Bearer <Google JWT>` (user)
- CORS allowlist: `FRONTEND_URL=https://travel-7l1.pages.dev` + `localhost:3000`, no wildcard
- Secrets via `wrangler secret put` and `.dev.vars`, never committed

## Commands
- `make dev` — localhost:3000
- `make build` — `next build` → `out/` (static export, `images.unoptimized`)
- `make deploy` — Pages to `travel-7l1.pages.dev`
- `make deploy-api` — Workers `travel-api`
- `make check` — lint + build (eslint ignores `.open-next`/`.vercel`/`out`)
- `make d1-migrate` — `wrangler d1 migrations apply travel-db --remote` (local may fail workerd bug)
- `make test-ui` / `make test-ui-deployed` — Playwright UI tests (§9 of project-creation skill)
- `wrangler whoami` — OAuth prashantkumarbharadwaj@gmail.com
- `gh auth status` / `gh repo create <name> --public --source=. --remote=origin --push` — GitHub via gh CLI (mandatory on creation)

## Data
- Store: `lib/store.ts` (`travel:trips:v2` in localStorage, `useTravel` with `trips[]`, `activeId`, CRUD for trips + days, each DayNode has flights/hotels/cabs/attachments → will sync to D1/R2)
- Migrations: `migrations/0001_init.sql` applied remote; local D1 at limit 10/10 (deleted `factory` to make room)
- Upload: `scripts/upload-trip.mjs` (API→D1) or `scripts/playwright-upload.mjs` (UI Import)

## Skills — GLOBAL ONLY (no project-local copies)
- `project-creation` at `~/.claude/skills/project-creation/SKILL.md` — scaffold, Pages vs Workers, segregation, auth, D1+R2 mandatory, Makefile+CLAUDE.md, Playwright UI tests (§9), GitHub `gh` repo creation (§10)
- `travel-planner` at `~/.claude/skills/travel-planner/SKILL.md` — given date range, plans trip using full personalised profile (see below), generates Trip JSON and uploads to https://travel-7l1.pages.dev via `scripts/upload-trip.mjs` or `scripts/playwright-upload.mjs`. Playwright extraction for ChatGPT shares uses scroll + `[data-message-author-role]` selectors. Demo Greece trip in `data/greece_demo.json` already inserted into D1.
- **No** `.claude/skills/` in project repo — global skills only (user requested). Project `.claude/` contains only `settings.local.json`.

## Personalised Travel Profile (travel-planner skill — full, not just Vietnam)
- Source: ChatGPT share 6a8c670a + explicit preferences (160-line profile in travel-planner SKILL.md)
- Formula: Glamorous+energetic+socially open+beach+activities+nightlife+romantic+photogenic+safe for women+efficient+good value; NOT isolated/conservative/relaxing/nature-only/slow
- Safety: safe for women, liberal (bikini-friendly, many female tourists), no Maldives-style conservative bubble
- Beach: real beaches, beach clubs, sunset dinners, island hopping, snorkeling, beach nightlife + non-beach balance
- Weather: warm/reliable/low rain, Hoi An exception for wife, progression Hanoi cool→Phu Quoc beach
- Travel: efficient, Singapore/Hong Kong stopover vs 12-13h direct, short domestic flights, add days not cram, no Da Lat/Cu Chi/hostels/long transfers
- Budget: ~₹4L/2pax, price-conscious (shift dates, gateways, separate tickets, visa-first)
- Stay: proper hotels/resorts, not hostels, glamorous but not inflated famous-name premium (~₹15K baseline)
- Couple: wife loves Hoi An romantic — protect it; couple's vacation not checklist
- Exclusions: Cu Chi, Da Lat, hostels, Maldives-style, Ha Long crowded (prefer Lan Ha, Mon Cheri/Genesis Regal)

## Notes
- No auth yet — localStorage + export/import JSON; add next-auth + Google when multi-user
- Old Pages `travel-vietnam` deleted; worker `travel-vietnam.workers.dev` deleted (404); keep `travel` (7l1) as production
- GitHub: use `gh` CLI for repo creation/push on every new scaffold (see skill §10)
