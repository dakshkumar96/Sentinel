# Sentinel

Agentic spend guardian for AI-channel advertising — built for agencies.

**Status:** Hackathon scaffold — see [PLAN.md](./PLAN.md) for build phases.

## Quick start

```bash
cd sentinel
npm install
cp .env.example .env.local   # add ANTHROPIC_API_KEY
npm run dev
```

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
