# SplitPass

SplitPass is an Expo / React Native app for handling high-value secrets without relying on a single storage location. It lets a user keep a password, payment card, or BIP39 seed phrase on-device, protect the local vault with a master passphrase, and split secrets into recoverable pieces for QR and NFC workflows.

## What the product does
- Stores passwords, payment cards, and seed phrases locally.
- Detects BIP39 seed phrases automatically.
- Encodes secrets into numeric payloads suitable for QR and NFC transport.
- Supports split recovery flows for passwords, seed phrases, and cards.
- Encrypts the on-device vault with a master passphrase requested during setup and on app unlock.
- Exports encrypted local backups as opaque archive files and requires the same master passphrase to import them.
- Keeps legacy PIN-based `secure` QR/NFC payloads readable for compatibility.
- Optionally embeds the username in the displayed QR code (`B`-type envelope) so a scanner can recover both the secret and its associated username in a single scan; the stored value is never affected.
- Includes reminder scheduling, a password generator flow, and a marketplace webview entry.
- Exposes a password generator flow and a marketplace webview entry.

## Security model
- The main security boundary is now the master passphrase.
- The app encrypts local `secrets` and `settings` before writing them to AsyncStorage.
- New vault writes and backup exports use the opaque `v3` envelope with `Argon2id` key derivation and AES-GCM encryption.
- Existing `v1` and `v2` encrypted payloads remain readable and are migrated forward after a correct unlock.
- The app requests the master passphrase on first setup and again each time the vault is unlocked after app restart or logout.
- There is no recovery path if the master passphrase is lost.
- Backups are exported as encrypted archive files, not plaintext secret lists or branded JSON payloads.
- Legacy `secure` secrets still exist only as compatibility for old QR/NFC data. New secrets are no longer created in that legacy mode.
- PINs remain ephemeral and are only used where legacy `secure` payload compatibility still requires them.
- The app auto-locks shortly after moving to the background and keeps sharing/favicons off by default until the user opts in.

## Core recovery model
- A secret is normalized into a numeric representation.
- The numeric payload can be stored in the encrypted local vault or split into shards.
- The app reconstructs the payload from scanned data, decrypts it if needed, and decodes it back to the original secret.

## Main user flows
- Create a secret and store it locally in the encrypted vault.
- Set a master passphrase after onboarding and use it to unlock the app later.
- Split a secret into shards for external storage or QR/NFC recovery.
- Scan QR or NFC inputs to recover an existing secret.
- Read legacy PIN-protected `secure` QR/NFC payloads and re-save them under the new encrypted local storage model.
- Export and import encrypted local archive files.
- Log out to lock the in-memory vault and return to the sign-in screen.
- Manage theme, language, reminder, biometric, sharing, and favicon privacy settings.
- Open the built-in password generator and marketplace flows.

## Security boundaries
- The app is designed to avoid single points of failure when shards are used correctly.
- The master passphrase is never meant to be recoverable by the app.
- PINs are intended to stay in the user's memory only when legacy compatibility flows ask for them.
- Compatibility matters: QR payloads, shard formats, and stored backups must continue to work across releases.
- Backup files and local storage must never contain plaintext secrets after secure setup.
- Backup files should avoid revealing SplitPass branding or vault purpose before decryption.
- Biometric unlock is an explicit convenience tradeoff and requires re-entering the current master passphrase before enabling it.
- This is still client software. Recovery safety depends on the user storing enough material in separate locations and testing recovery before relying on it.

## Tech stack
- Expo / React Native
- React Navigation
- AsyncStorage
- Native Argon2id bridge for local key derivation
- Jest
- `react-native-extended-stylesheet`
- Device integrations for camera, sharing, document picker, notifications, NFC, and webview

## Project structure
```text
src/
  components/   reusable UI
  contexts/     global state and reducers
  design-system/ primitives and app-level UI building blocks
  modules/      crypto, parsing, helpers
  screens/      app flows
  services/     device integrations
  theme/        design tokens and themes
browser-extension/ browser extension source for QR scan and password fill
  tests/          Jest tests (named `tests/` not `__tests__/` — Chrome rejects extension directories starting with `_`)
```

## Local setup
### Prerequisites
- Node version from `.nvmrc`
- Yarn 1.x

### Environment
- Copy the expected variables into `.env.local` if needed by your local workflow.
- Do not commit real secret values.

### Commands
```bash
yarn install
yarn start
yarn android
yarn ios
yarn web
yarn test
npx expo-doctor
```

## Upgrade baseline
- The repo is being aligned to Expo SDK 55.
- Use `yarn` as the single package manager for this project.
- Keep dependency changes paired with `expo-doctor` and targeted smoke testing.
- `react-native-argon2` is patched locally with `patch-package` during `postinstall` to keep Android builds off `jcenter()`.

## Test focus
- QR encode / decode compatibility
- shard split / combine compatibility
- master passphrase signup / signin / unlock lifecycle
- `v1` / `v2` -> `v3` encrypted store migration
- encrypted local persistence across app restart
- encrypted backup export / import, including opaque archive naming
- legacy PIN encryption and decryption compatibility
- card encode / decode compatibility
- scanner and viewer flows
- `B`-type username envelope: encode → display in Viewer → scan in Scanner → recover username + inner secret

## Subagents
- Codex should actively delegate bounded work into `.codex/subagents/` instead of staying single-threaded on multi-area tasks.
- If a request touches more than one subsystem, use `maintainer.md` first to split ownership and then hand off to the relevant subagents.
- Typical split:
  - `expo-upgrade.md` for Expo, React Native, dependency, `app.json`, or `eas.json` changes.
  - `crypto-core.md` for `QRParser`, `cypher`, seed phrase logic, card payloads, or compatibility-sensitive encoding changes.
  - `ui-flow.md` for screens, navigation, design-system components, and style-file work.
  - `device-services.md` for NFC, QR scanning, backups, notifications, sharing, document picker, or service wiring.
  - `docs-release.md` for `README.md`, `AGENTS.md`, subagent docs, and release checklists.
- Prompts that say "review", "audit", "update docs", "upgrade Expo", "fix scanner plus UI", or "touch several files" should normally result in subagent delegation, not solo work.
- Practical routing examples:
  - code review across app areas: `maintainer.md` + the relevant technical subagent
  - documentation refresh: `docs-release.md`
  - Expo SDK drift or install fallout: `expo-upgrade.md`
  - scanner, NFC, backup, or camera breakage: `device-services.md`
  - payload, card, shard, or PIN compatibility work: `crypto-core.md`
- Handoffs must include changed files, validations run, open risks, and any compatibility assumptions.

## Repository docs
- Agent-facing maintenance guide: [AGENTS.md](./AGENTS.md)
- Subagent catalog: [.codex/subagents/README.md](./.codex/subagents/README.md)
- Primary subagents:
  - [.codex/subagents/maintainer.md](./.codex/subagents/maintainer.md)
  - [.codex/subagents/expo-upgrade.md](./.codex/subagents/expo-upgrade.md)
  - [.codex/subagents/crypto-core.md](./.codex/subagents/crypto-core.md)
  - [.codex/subagents/ui-flow.md](./.codex/subagents/ui-flow.md)
  - [.codex/subagents/device-services.md](./.codex/subagents/device-services.md)
  - [.codex/subagents/docs-release.md](./.codex/subagents/docs-release.md)
- Browser extension notes: [browser-extension/README.md](./browser-extension/README.md)

## Current roadmap
- Finish Expo SDK 55 stabilization.
- Keep crypto and recovery flows backward compatible.
- Improve operational documentation so future work can be delegated safely.
- Reduce dependency drift and unsupported runtime assumptions.
