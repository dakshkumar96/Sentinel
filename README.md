# Sentinel

Agentic spend guardian for AI-channel advertising — built for agencies.

**Status:** Phase 1 live — dashboard + mock stream + demo scenarios.

## Dashboard features

Agency command center for AI-channel spend (ChatGPT-style placements, Thrad publishers, and similar).

**Legend:** ✅ Done · 🎬 Demo (scripted via scenario buttons) · 🔜 Planned

| Status | Feature | What you see |
|--------|---------|----------------|
| ✅ | **Live spend watch** | Per-client and per-placement spend updating in real time (mock SSE); calm green state by default. |
| ✅ | **Campaign & placement grid** | Cards for each client/placement with channel, status, and spend velocity. |
| ✅ | **Spend sparklines** | Spend trend per placement; turns amber/red when a scenario fires. |
| ✅ | **Demo scenario controls** | One-click triggers: `healthy_spike`, `bad_spike`, `brand_safety`, `zero_conv_burn`, `guardrail_cap` + reset. |
| 🎬 | **Guardrail alerts** | Instant guardrail-style alert and auto-pause — **demo only** (`guardrail_cap` button). Not yet wired to `charter.yaml` on live ticks (Phase 2). |
| 🎬 | **Spend anomaly cards** | Cards pulse red/amber and alerts fire — **demo only** (`healthy_spike` / `bad_spike`). No live agent investigation yet. |
| 🎬 | **Brand-safety review** | Pre-written alert with conversation excerpt — **demo only** (`brand_safety` button). No LLM judgment yet (Phase 3). |
| 🎬 | **Zero-conversion burn** | Scripted alert and spend burst on Contoso — **demo only** (`zero_conv_burn` button). |
| 🎬 | **Escalation tuning** | Healthy spike skips human gate; bad spike asks for approval — **hard-coded per scenario**, not learned (Phase 3–4). |
| 🎬 | **Human-in-the-loop gates** | Approve / Override / Dismiss on alerts in the sidebar — **not** a slide-over sheet yet (Phase 4). |
| 🎬 | **Alert sidebar** | Open alerts, guardrail vs agent badges, human actions. No full audit log export yet (Phase 4–5). |
| 🔜 | **Agent reasoning trace** | Tools lighting up, evidence, confidence — stub only (Phase 3–4). |

**Not on the dashboard (by design):** bidding/optimization, full cross-channel reporting, or replacing platform-native hard budget controls.

See [PLAN.md](./PLAN.md) for Phase 2+ (real guardrails, Claude agent, reasoning trace UI).

## Quick start

```bash
cd sentinel
npm install
cp .env.example .env.local   # add ANTHROPIC_API_KEY
npm run dev
```

**Blank or white page?** The dev server often breaks if `.next` was deleted while it was running. Fix:

```bash
# Ctrl+C to stop the server, then:
rm -rf .next
npm run dev
```

Hard-refresh the browser (Cmd+Shift+R).

## Deploy to production (Vercel)

Code is on `main` at [github.com/dakshkumar96/Sentinel](https://github.com/dakshkumar96/Sentinel).

**Option A — Vercel dashboard (recommended, no CLI login):**

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import **dakshkumar96/Sentinel**
3. Root directory: `sentinel` if the repo root is the monorepo parent, otherwise leave as **`.`** if the Next app is the repo root
4. Deploy — every push to `main` auto-deploys

**Option B — CLI:**

```bash
vercel login
cd sentinel
npx vercel --prod
```

No env vars required for Phase 1 (mock data only). Add `ANTHROPIC_API_KEY` in Vercel when Phase 3 agent work ships.

`create-next-app` is not a global command — use `npx` if scaffolding a fresh folder:

```bash
npx create-next-app@latest my-app --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

This repo was bootstrapped manually because `sentinel/` already had project files.

## Docs

- [PLAN.md](./PLAN.md) — architecture, phases, demo script
- [docs/PRD.md](./docs/PRD.md) — product requirements summary

## Structure

```
config/          Charter + brand guidelines (YAML)
docs/            PRD
src/app/         Next.js routes + API
src/components/  Dashboard UI
src/server/      Guardrails, agent, mock stream
src/types/       Shared TypeScript models
```
