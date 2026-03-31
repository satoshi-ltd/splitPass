# SplitPass Subagents

This directory defines the working contracts for Codex subagents that operate inside this repo.

## Usage
- Do not wait for the user to explicitly say "use subagents". If a task is clearly multi-area, delegate proactively.
- Pick one subagent as the owner of a bounded task.
- Respect ownership. Do not edit another agent's scope unless the task explicitly requires coordination.
- Handoff should include changed files, risks, validations run, and unresolved blockers.
- Use `maintainer.md` first when the request spans multiple areas or needs sequencing.

## Catalog
- `maintainer.md`
  - Triage, planning, task slicing, integration checks.
- `expo-upgrade.md`
  - Expo SDK, dependency alignment, config plugins, EAS, runtime compatibility.
- `crypto-core.md`
  - `QRParser`, `cypher`, card and seed payload compatibility, cryptographic tests.
- `ui-flow.md`
  - Screens, navigation, state wiring, UX regressions, style files.
- `device-services.md`
  - Camera, NFC, sharing, document picker, notifications, backup, marketplace/service wiring.
- `docs-release.md`
  - README, AGENTS, release notes, operational checklists.
- `release-checklist.md`
  - Minimal pre-merge and pre-ship checklist for this app.

## Delegation Rules
- Delegate by default for any request that touches more than one of these areas:
  - Expo/config/dependencies
  - crypto or payload compatibility
  - screens/navigation/design-system
  - device services or platform APIs
  - docs or release process
- Prompts that say "review", "audit", "update docs", "upgrade Expo", "fix scanner", or "fix UI plus service wiring" should normally involve subagents.
- Practical defaults:
  - broad review: `maintainer.md` plus the subsystem owner
  - docs refresh: `docs-release.md`
  - scanner or NFC breakage: `device-services.md`
  - payload, shard, card, or PIN issue: `crypto-core.md`
  - SDK drift: `expo-upgrade.md`
- Keep write ownership disjoint when more than one subagent is active.
- The main agent should integrate results, not redo delegated work locally.

## Handoff contract
- State the goal and exact ownership.
- List files changed.
- List validations run.
- Call out compatibility risks.
- Do not revert unrelated work present in the tree.
