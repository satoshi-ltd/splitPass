# SplitPass Agent Guide

## Working Rules
- No commit unless the user explicitly asks for it.
- No TypeScript.
- Prefer style files over inline styles.
- No overengineering. Keep changes local and reversible.
- Do not overwrite user changes already present in the worktree.

## Product Snapshot
- SplitPass is an Expo / React Native app for storing sensitive secrets as local encrypted entries or as split shares.
- Main secret types are passwords, payment cards, and BIP39 seed phrases.
- Recovery flows rely on QR and NFC import paths.
- The security model now centers on a master passphrase for local vault encryption and encrypted backup import/export.
- Legacy PIN-based `secure` payloads still exist only for compatibility with previously created QR/NFC data.

## Architecture Map
- `src/App.jsx`, `src/App.Navigator.jsx`: app bootstrap, fonts, navigation shell.
- `src/contexts/store.jsx`, `src/contexts/app.jsx`: central state, theme, language, and app lifecycle wiring.
- `src/design-system/*`: shared primitives and app-level UI shells.
- `src/screens/*`: user flows such as onboarding, main, create, scanner, viewer, settings, vault, language, marketplace, and password generator.
- `src/components/*`: reusable UI pieces.
- `src/modules/*`: business and security core.
- `src/services/*`: device and platform integrations.
- `src/theme/*`: shared visual tokens and themes.

## Critical Modules
- `src/modules/QRParser.js`: public encoding and decoding boundary. Keep backward compatibility.
- `src/modules/secretValueDisplay.js`: card parsing, normalization, masking, and canonical card value handling.
- `src/modules/cypher.js`: PIN-based numeric transform. PIN is never persisted.
- `src/modules/persistenceCrypto.js`: encrypted envelope format for local storage and backup payloads.
- `src/modules/isSeedPhrase.js`: seed phrase detection.
- `src/services/StorageService.js`: persistence contract for secrets and settings.
- `src/services/NFCService.js`, `src/screens/Scanner/*`: hardware-dependent recovery path.
- `src/services/BackupService.js`, `src/services/NotificationsService.js`: backup import/export and reminder flows.

## Security Invariants
- One shard must not expose usable secret content.
- Existing QR payload formats must continue to decode after changes.
- Existing stored secrets and backups must remain readable.
- The master passphrase is the primary local security control. Never log it, persist it outside the current session, or downgrade the vault back to plaintext storage.
- Backup export must stay encrypted once secure setup is enabled.
- PIN handling must remain ephemeral. Never log secret values, shards, PINs, decoded payloads, or decrypted backup contents.
- Errors must not leak sensitive content.

## Current Environment Baseline
- Package manager: `yarn` is the official workflow in this repo.
- Node target: use the version in `.nvmrc`.
- Expo target: SDK 55 stable.
- Local env file: `.env.local` exists. Document variable names only; never print secret values.

## Commands
```bash
yarn install
yarn start
yarn android
yarn ios
yarn web
yarn test
npx expo-doctor
```

## How To Work Safely
- Before editing crypto or parser modules, read their tests in `src/modules/__tests__/`.
- Before editing scanner, backup, notifications, NFC, or marketplace/webview behavior, inspect both the service and the calling screen.
- Keep public module signatures stable unless there is a migration plan in the same change.
- Prefer adapter fixes over broad rewrites when SDK upgrades break an API.
- Preserve the current JavaScript + StyleSheet pattern unless a change is required for compatibility.
- Treat the master passphrase lifecycle as a critical path: onboarding setup, unlock, logout, reset, export, and import must stay coherent together.
- If secure storage format changes, document the migration story explicitly in the same change.

## Subagent Policy
- Do not default to solo execution for broad tasks. If a request spans multiple subsystems, delegate.
- Use `.codex/subagents/maintainer.md` to slice work whenever the task touches two or more of: crypto, screens/navigation, services, docs, Expo/config.
- Expected routing:
  - `expo-upgrade.md`: Expo SDK, React Native, dependency alignment, `app.json`, `eas.json`, install or `expo-doctor` fallout.
  - `crypto-core.md`: `QRParser`, `cypher`, `isSeedPhrase`, `secretValueDisplay`, payload compatibility, shard behavior, card support.
  - `ui-flow.md`: screens, navigation, design-system, style files, user-visible regressions.
  - `device-services.md`: NFC, QR scan integration, backup import/export, notifications, sharing, document picker, and service wiring.
  - `docs-release.md`: `README.md`, `AGENTS.md`, subagent docs, checklists, rollout notes.
- Prompts containing "review", "audit", "update docs", "upgrade", "refactor across files", or "fix X and Y" should normally trigger subagent use.
- Practical defaults:
  - broad review: `maintainer.md` plus the relevant technical owner
  - docs-only change: `docs-release.md`
  - UI plus service issue: `maintainer.md` + `ui-flow.md` + `device-services.md`
  - parser or compatibility issue: `crypto-core.md`
  - SDK or install drift: `expo-upgrade.md`
- Every handoff must state ownership, files touched, validations run, and unresolved risks.

## Testing Expectations
- Run targeted tests for touched crypto modules.
- Run the full Jest suite after cross-cutting changes.
- Run `npx expo-doctor` after dependency or Expo config changes.
- Smoke test these flows when possible:
  - onboarding -> master passphrase setup
  - app restart -> unlock with the same master passphrase
  - logout -> sign-in screen -> unlock
  - create secret
  - reveal secure secret with PIN
  - split and recombine shards
  - create and reveal card secrets
  - QR scan path
  - backup export and import
  - settings, language, marketplace, and password generator entry flows

## Known Risk Areas
- `react-native-extended-stylesheet` may be sensitive to React Native upgrades.
- `react-native-nfc-manager` and Expo camera integrations need compatibility checks on each Expo SDK jump.
- `expo-constants` usage via `appOwnership` may need revisiting if Expo changes runtime semantics.
- The repo currently has user changes in progress. Read diffs before editing shared files.

## Backlog To Keep In View
- Stabilize Expo SDK 55 across camera, notifications, sharing, document picker, constants, and filesystem usage.
- Keep README and subagent definitions aligned with the real codebase.
- Keep master passphrase, encrypted storage, and encrypted backup behavior documented whenever flows change.
- Replace legacy assumptions only when tests and manual flows confirm compatibility.
