# PRD — Sentinel (summary)

Full narrative lives in hackathon brief; this file is the build-facing summary.

## Problem

Agencies running AI-native placements (ChatGPT-style, conversational ads) lack tooling to catch runaway spend, zero-conversion burn, and contextual brand-safety risk in real time.

## Core question

**When can an agent act alone, and when must it ask a human?**

## Solution

- **Deterministic guardrails** — hard caps, blocklists; instant action; no LLM.
- **Agentic layer** — investigates anomalies with tools + reasoning; concludes healthy / act / escalate.
- **Escalation engine** — confidence × client stakes × agency preferences; fights alert fatigue.

## Primary user

Performance/account lead at a mid-size agency (many clients, one human watching).

## v1 features

1. Live spend watch (mock stream)
2. Reasoning traces (demo hero)
3. Human-in-the-loop gates (Approve / Override / Pause)
4. Brand-safety judgment (LLM on conversation + creative)
5. Confidence-tuned escalation

## Non-goals

- Bidding / growth optimization
- Full cross-channel reporting
- Replacing hard budget controls

## Success metrics (demo)

- Money saved (halted spend)
- Escalation precision
- Time-to-catch
- Human acceptance rate of recommendations

See [PLAN.md](../PLAN.md) for implementation scope.
