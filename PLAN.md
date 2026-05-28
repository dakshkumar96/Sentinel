# Sentinel — Build Plan

**Product:** Agentic spend guardian for AI-channel ads (agencies, defensive, dashboard-led).  
**Core thesis:** Rules for hard limits; an agent for judgment; a smart escalation engine so humans only see what matters.

---

## Stack (hackathon-optimized)

| Layer | Choice | Why |
|-------|--------|-----|
| UI | Next.js 15 (App Router) + TypeScript | SSR/API routes in one repo; fast demo deploy |
| Styling | Tailwind + shadcn/ui | Polished cards, sheets, toasts for approval gates |
| Live data | SSE (`/api/events/stream`) | Mock spend feed feels real without WebSockets infra |
| Client state | Zustand | Campaigns, alerts, active investigation trace |
| Agent | Anthropic API (Claude) | Brand-safety + anomaly interpretation + escalate-or-act |
| Guardrails | Pure TypeScript + `config/charter.yaml` | Deterministic; never LLM for hard caps |
| Persistence (v1) | In-memory + optional JSON fixtures | No DB setup for demo; add SQLite later if needed |

---

## Architecture

```
Mock event stream ──► Ingest ──► Guardrails (instant) ──► Agent queue (judgment)
                                      │                         │
                                      ▼                         ▼
                              Auto-pause / block          Tool loop + conclusion
                                      │                         │
                                      └──────────┬──────────────┘
                                                 ▼
                                         Dashboard + HITL gates
```

### Two paths on every event

1. **Guardrail path (deterministic)** — budget ceiling, blocklisted category, absolute pacing. Act immediately; notify; no LLM.
2. **Agent path (judgment)** — anomaly signals (spend spike, zero conversions, placement context). Agent picks tools, gathers evidence, outputs: `healthy` | `act` | `escalate`.

### Escalation meta-decision

Agent outputs structured JSON:

- `confidence` (0–1)
- `client_stakes` (from config)
- `recommended_action`
- `requires_human` (boolean)

Policy in `charter.yaml`: e.g. never auto-pause above £500/day client without human if confidence < 0.85.

---

## Repo layout (see folders)

- `src/app` — pages + API routes  
- `src/components` — dashboard, alerts, reasoning trace (demo hero)  
- `src/server/guardrails` — hard rules  
- `src/server/agent` — orchestrator, tools, prompts  
- `src/server/mock` — stream + scripted demo scenarios  
- `src/types` — shared event/alert models  
- `config` — charter, sample brand guidelines  

---

## Build phases

### Phase 0 — Skeleton (30 min)
- [ ] `npm create next-app`, Tailwind, shadcn
- [ ] Types for `SpendEvent`, `Placement`, `Alert`, `Investigation`
- [ ] Empty dashboard shell (sidebar, main grid)

### Phase 1 — Mock world (2–3 hrs)
- [ ] `mock/stream.ts` emits events on interval + SSE route
- [ ] Fixtures: 3 clients, 6 placements, baseline spend curves
- [ ] **Scenarios** (`mock/scenarios.ts`): `healthy_spike`, `bad_spike`, `brand_safety`, `zero_conv_burn`
- [ ] Dashboard: campaign cards, spend sparklines, all-green default state

### Phase 2 — Guardrails (1–2 hrs)
- [ ] Parse `charter.yaml` → hard limits per client
- [ ] On ingest: if violated → `Alert` type `GUARDRAIL` + auto-pause flag
- [ ] UI: distinct styling (instant red, no “thinking” animation)

### Phase 3 — Agent + tools (3–4 hrs)
- [ ] `orchestrator.ts`: given signal → run tool loop (max N steps)
- [ ] Tools (all mock-backed for v1):
  - `get_conversion_trend(placementId, window)`
  - `get_conversation_context(placementId)`
  - `get_brand_guidelines(clientId)`
  - `get_historical_baseline(clientId, metric)`
  - `get_client_context(clientId)` (launch calendar, etc.)
- [ ] Claude prompt: evidence → conclusion + confidence + escalate?
- [ ] API: `POST /api/investigations` triggers run; push result to client

### Phase 4 — Demo UI (3–4 hrs) ← **your edge**
- [ ] **Reasoning trace** panel: tools light up sequentially (even if batched server-side, *stage* them 300ms apart)
- [ ] **Approval gate** sheet: Approve / Override / Pause + evidence summary
- [ ] Alert fatigue meter (optional): “12 signals today, 2 escalations”
- [ ] Demo mode toggle: fires scripted scenario on button press

### Phase 5 — Polish (2 hrs)
- [ ] Sound/haptics off by default; subtle pulse on red cards
- [ ] Audit log export (JSON) for judges
- [ ] README: 90s demo script + “rules vs agent” talking points

---

## Demo script (90 seconds)

1. **Calm state** — 3 clients, green metrics, low spend velocity.  
2. **Trigger: `bad_spike`** — ChatGPT placement 4× spend/hr. Trace shows: conversions flat, no launch in calendar → “Recommend pause” → approval card.  
3. **Trigger: `healthy_spike`** — Same visual spike; trace shows conversion lift → logs healthy, **no** gate (prove escalation engine).  
4. **Trigger: `brand_safety`** — Creative + layoffs conversation → escalate with transcript excerpt.  
5. **Trigger: `guardrail`** — Hard cap → instant pause, no LLM (say this out loud).

---

## API surface (v1)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/events/stream` | SSE mock/live events |
| POST | `/api/investigations` | Start agent run on signal id |
| GET | `/api/investigations/[id]` | Trace + conclusion |
| POST | `/api/decisions/[id]` | Human approve / override / pause |
| POST | `/api/demo/scenario` | Fire named scenario (judge-friendly) |

---

## “Is it agentic?” — judge script

- **Rules:** hard budget cap, blocklist → deterministic.  
- **Agent:** same 4× spike → different outcomes after tool-assisted reasoning.  
- **Meta:** agent sets `requires_human` from confidence × stakes; system enforces charter overrides.

---

## Out of scope for hackathon

- Real ChatGPT / Thrad / Meta ads APIs  
- Multi-tenant auth  
- Learning from agency feedback (stub `agency_preferences` in config only)

---

## Open decisions (pick together)

1. **Monorepo vs single app** — default: single Next app (this repo).  
2. **Agent loop** — single Claude call with tool-use API vs multi-step orchestrator (recommend: Claude tool use, one investigation = one session).  
3. **Rename** — working title Sentinel; fine to rebrand on dashboard.
