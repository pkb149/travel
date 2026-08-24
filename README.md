# Travel — Vietnam Tour Planner

Personalised travel website. Vietnam is the first country. Each day is an editable node with flights, hotels, cabs/local commute, attachments.

## Stack (via `project-creation` skill)

- **CLI**: `wrangler` 4.x
- **Frontend**: Next.js 16 (App Router, Tailwind 4)
- **Deploy**: Cloudflare Pages (`wrangler pages deploy`)
- **Backend**: Only if needed (Pages Functions / separate Worker)
- **DB**: D1 (`travel-db`), **Storage**: R2 (`travel-attachments`)
- **Auth**: Google OAuth (next-auth) when needed

Skill: `.claude/skills/project-creation/SKILL.md` (also at `~/.claude/skills/project-creation/SKILL.md`)

## Dev

```bash
npm install
npm run dev          # http://localhost:3000
npm run build
npm run lint
```

## Data

- `data/vietnam.ts` — 23 days from screenshot (11/22 → 12/14, Singapore → Home via Hanoi, Da Nang, Hoi An, HCMC, Phu Quoc)
- `lib/store.ts` — zustand + localStorage persistence (`travel:trip:vietnam-2026`)
- Each `DayNode` has `flights[]`, `hotels[]`, `cabs[]`, `attachments[]` + `plan` chips

## Editing

- Click **Edit** on any day card → right panel opens
- Edit date/base/emoji/plan (use `→` to separate steps)
- Add/remove flights (airline, flightNo, PNR, time, attachment link), hotels (check-in/out, booking ref, cost), cabs/transfers (type, provider, cost), attachments (PDF/image/link)
- File upload adds entry by name (wire to R2 later)
- Duplicate / Add day after / Delete / filter by base / search / Export-Import JSON / Reset

## Wrangler / D1 / Deploy

```bash
wrangler whoami
npm run d1:create              # wrangler d1 create travel-db
npm run d1:migrate:local       # apply migrations locally
npm run d1:migrate:remote      # apply remotely
npm run types                  # wrangler types

# Pages deploy
npm run build
npx @cloudflare/next-on-pages
wrangler pages deploy .vercel/output/static --project-name travel-vietnam
# or: npm run deploy
```

Migrations in `migrations/0001_init.sql`. Config in `wrangler.jsonc`.

## Next steps

- Wire D1: persist trips server-side, replace localStorage with API
- Wire R2: actual file uploads via presigned URLs
- Add Google Auth (next-auth) if multi-user
- Drag-to-reorder, map view, calendar view
