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
- Current encrypted writes use an opaque `v3` envelope with `Argon2id` key derivation and AES-GCM encryption.
- Existing `v1` / `v2` encrypted stores and backups remain readable and are migrated forward after a successful unlock.
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

## Browser Extension Notes
- Source lives in `browser-extension/`. Tests are in `browser-extension/tests/` (not `__tests__`) because Chrome refuses to load an extension that contains a directory whose name starts with `_`.
- `browser-extension/lib/vault.js` `normalizeDomain` strips every subdomain down to the registrable domain before saving or looking up entries (e.g. `member.lazada.co.th` → `lazada.co.th`). Compound TLDs such as `co.th`, `co.uk`, and `com.au` are detected by checking whether the second-to-last segment is ≤ 3 characters. Do not revert this to a plain `url.hostname` return — it would cause the same secret to appear as a different entry on different subdomains.
- `browser-extension/lib/secret-item.js` `resolveSiteLabel` capitalises the first dot-segment of whatever domain it receives. It intentionally stays simple because `normalizeDomain` has already done the subdomain stripping.

## Critical Modules
- `src/modules/QRParser.js`: public encoding and decoding boundary. Keep backward compatibility. `USERNAME_TYPE = 'B'` is the display-time envelope (`encodeWithUsername` / `decodeWithUsername`); the stored `value` field is never written in `B` format — the wrapping happens only when rendering QR codes in the Viewer and is unwrapped transparently in the Scanner.
- `src/modules/secretValueDisplay.js`: card parsing, normalization, masking, and canonical card value handling.
- `src/modules/cypher.js`: PIN-based numeric transform. PIN is never persisted.
- `src/modules/persistenceCrypto.js`: encrypted envelope format for local storage and backup payloads.
- `src/modules/isSeedPhrase.js`: seed phrase detection.
- `src/services/StorageService.js`: persistence contract for secrets and settings.
- `src/services/ClipboardService.js`: clipboard writes with best-effort timed clearing.
- `src/services/NFCService.js`, `src/screens/Scanner/*`: hardware-dependent recovery path.
- `src/services/BackupService.js`, `src/services/NotificationsService.js`: backup import/export and reminder flows.

## Security Invariants
- One shard must not expose usable secret content.
- Existing QR payload formats must continue to decode after changes.
- The `B` username envelope (`USERNAME_TYPE`) is a display/transport wrapper only. Never persist a `value` field that starts with `B`; the stored secret value must always be the raw typed payload (`1`–`9`, `A`).
- Existing stored secrets and backups must remain readable.
- The master passphrase is the primary local security control. Never log it, persist it outside the current session, or downgrade the vault back to plaintext storage.
- Backup export must stay encrypted once secure setup is enabled.
- Backup export should stay opaque: avoid branded filenames, branded envelope markers, or plaintext hints about the file purpose.
- New encrypted writes must use the `v3` envelope; legacy envelopes are compatibility-only.
- PIN handling must remain ephemeral. Never log secret values, shards, PINs, decoded payloads, or decrypted backup contents.
- Remote privacy-sensitive conveniences should stay opt-in. Website favicons and external sharing default to off.
- App backgrounding must not leave the vault open indefinitely; keep auto-lock behavior coherent with unlock/logout/reset flows.
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
- `react-native-argon2` is patched via `patch-package`; if Android build errors mention its Gradle files, inspect `patches/react-native-argon2+4.0.0.patch` before changing app code.
- When editing privacy defaults, keep `websiteFaviconsEnabled` and `externalSharingEnabled` opt-in unless the user explicitly asks otherwise.

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
  - legacy encrypted vault unlock -> automatic `v3` migration
  - logout -> sign-in screen -> unlock
  - create secret
  - reveal secure secret with PIN
  - split and recombine shards
  - create and reveal card secrets
  - QR scan path
  - backup export and import, including opaque archive naming
  - background app -> auto-lock timeout -> unlock again
  - settings, language, marketplace, and password generator entry flows

## Known Risk Areas
- `react-native-extended-stylesheet` may be sensitive to React Native upgrades.
- `react-native-nfc-manager` and Expo camera integrations need compatibility checks on each Expo SDK jump.
- `expo-constants` usage via `appOwnership` may need revisiting if Expo changes runtime semantics.
- `react-native-argon2` needs the local patch to avoid deprecated Android repositories during builds.
- The repo currently has user changes in progress. Read diffs before editing shared files.

## Backlog To Keep In View
- Stabilize Expo SDK 55 across camera, notifications, sharing, document picker, constants, and filesystem usage.
- Keep README and subagent definitions aligned with the real codebase.
- Keep master passphrase, encrypted storage, and encrypted backup behavior documented whenever flows change.
- Revisit the long-term viability of the Argon2 native integration versus a repo-owned implementation.
- Replace legacy assumptions only when tests and manual flows confirm compatibility.
