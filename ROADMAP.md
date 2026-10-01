# SplitPass roadmap

Updated 2026-09-30 · 1.4.15, Expo SDK 55, browser extension 0.1.0.

This is the task pool. [SPEC.md](SPEC.md) owns current state, contracts, operations and the design system;
[CHANGELOG.md](CHANGELOG.md) records what each version shipped; [AGENTS.md](AGENTS.md) defines how work is done.

## How this file works

Every task is one entry that a single commit can finish, with fixed fields (decisions only need their question):

- **ID** — stable, never reused. Keep an existing ID when SPEC or the changelog cites it.
- **type** — `bug`, `feature`, `chore`, `ui` (a visual change whose board is in `design/proposals.html`), `verify`
  (evidence from a real device or browser), `deploy` (build, submission or publish outside the repository) or
  `decision`.
- **owner** — `agent` (finished in the repository and proved with tests) or `creator` (@soyjavi: a device, a native
  build, a store account, credentials or a product choice).
- **priority** — `high`, `normal` or `low`. Within a lane, order is priority, then position.
- **depends** — IDs that must finish first.
- **accept** — what proves it done. Agent tasks need evidence a test or command can show.

Lanes: **Queue** (approved agent tasks, in order; only the creator moves a task here, except a bug the creator
reports, which enters at the top), **In progress** (at most one), **Needs creator** (`verify`, `deploy` and `decision`
tasks, and agent work waiting on one of them), **Proposed** (not approved, never worked on). When a task ships, delete
it and record it in the changelog and in the SPEC section it changes.

A purely visual idea is not filed here: it is a board in `design/proposals.html` until the creator approves it, and
then it is one Queue line of type `ui` with the board's ID, whose accept is "the board". When a task mixes logic and a
screen, the screen is the board `UI-<TASKID>` and the logic stays under its own ID with the line "the interface follows
board UI-<TASKID>" in its accept; a board ID never equals a non-`ui` task ID. `node design/build.mjs --check` verifies
that every `ui` task has its board.

## Queue

_None._

## In progress

_None._

## Needs creator

### Devices and stores

- **VERIFY-SMOKE-SDK55** — The app on real devices after the SDK 55 upgrade
  `verify · creator · high`
  accept: on an Android and an iOS device, the smoke flows of SPEC 11 pass with the release build: onboarding and
  master passphrase, restart and unlock, legacy vault migration to `v3`, create, reveal, split and recombine, QR scan,
  backup export and import, auto-lock after backgrounding; failures become `bug` tasks.
- **VERIFY-NFC-SDK55** — NFC write, read and delete on hardware
  `verify · creator · normal`
  accept: an NFC tag is written from the Viewer, read in the Scanner and deleted on an Android and an iOS device with
  `react-native-nfc-manager` as installed.
- **DEPLOY-STORE-1.4.15** — Store assets and submission for the current version
  `deploy · creator · normal`
  accept: `store-assets/app-store/` holds screenshots for the version being submitted (today only `1.4.14`), or the
  creator confirms `1.4.14` still applies; the build is submitted to both stores.

- **VERIFY-ONBOARDING-CROP** — Onboarding image on short phones
  `verify · creator · low`
  accept: on a short Android and iPhone the first three onboarding slides keep the image below the safe area with
  three-line copy; the image is sized at `slideSize * 1.2` in `Onboarding.jsx`. A failure becomes a `bug` task.

### Browser extension

- **VERIFY-EXT-CAMERA** — Camera permission flow in each browser
  `verify · creator · normal`
  accept: in Chrome and Brave the popup requests the camera, offers `Try again` after a dismissed dialog and
  `Fix camera permission` after a second failure, and `camera-access.html` closes itself once access is granted; the
  Safari conversion is checked the same way or its gap is recorded.
- **DEPLOY-EXT-STORES** — Publish the extension
  `decision · creator · low`
  accept: a decision on Chrome Web Store and Safari distribution (today it loads unpacked); each approved channel
  becomes a `deploy` task.

## Proposed

- **EXPO-55-STABILIZE** — Settle the SDK 55 integrations
  `chore · agent · normal`
  accept: `npx expo-doctor` is clean and the Jest suite is green with camera, notifications, sharing, document picker,
  constants and filesystem on their SDK 55 APIs, with no deprecated-API warnings from the app's own code.
- **STYLE-NO-EXTENDED** — Retire `react-native-extended-stylesheet`
  `chore · agent · low`
  accept: no import of `react-native-extended-stylesheet` remains; styles read `src/theme/theme.js` and
  `src/theme/palette.js`; light and dark render as before (tokens compared in a test); the dependency is removed.
- **ARGON2-OWNERSHIP** — Native Argon2 or a repo-owned implementation
  `decision · creator · low`
  accept: a decision on keeping `react-native-argon2` with `patches/react-native-argon2+4.0.0.patch` or replacing it;
  an approved replacement becomes agent tasks that keep `v3` envelopes decryptable.
- **EXT-PAYLOAD-TYPES** — Shards, cards and seed phrases in the extension
  `decision · creator · low`
  accept: a decision on which of the three types the extension may hold and how they are displayed; each approved one
  becomes an agent task with tests.
- **DOCS-FLOW-FOLD** — Fold `FLOW.md` into SPEC
  `chore · agent · low`
  accept: SPEC's screens and flows section carries the navigation and recovery diagrams in English, checked against
  `src/App.Navigator.jsx`, and `FLOW.md` is deleted.
- **DOCS-SUBAGENTS** — Reconcile `.codex/subagents/` with the document set
  `chore · agent · low`
  accept: each subagent file points to the SPEC section it owns instead of restating contracts, and
  `.codex/subagents/release-checklist.md` matches SPEC's operations section.
- **UNLOCK-FORMAT-WIPE** — An unreadable vault envelope wipes the app without a backup prompt
  `decision · creator · normal`
  accept: a decision on whether `ERR_PERSISTENCE_FORMAT` (`src/screens/Unlock/Unlock.helpers.js`) keeps wiping all
  data at once or first offers a backup import; the three-wrong-passphrases wipe is recorded in SPEC 4 either way;
  the interface follows board UI-UNLOCK-FORMAT-WIPE.
- **COMPAT-GOLDEN-FIXTURES** — Freeze what earlier versions wrote
  `chore · agent · high`
  accept: committed fixtures decrypt with a known passphrase in tests: a `v1`, a `v2` and a `v3` store envelope and a
  backup archive of each kind, plus one QR / NFC payload of every type earlier versions produced (`1`–`9`, `A`, `S`,
  `T`, `U`, and the `B` username envelope); each decodes to its known secret. The fixtures are never regenerated,
  and a change that breaks one fails the suite. No production code changes.
- **CRYPTO-V3-PARAMS** — Read Argon2 parameters from the `v3` envelope
  `chore · agent · low · depends: COMPAT-GOLDEN-FIXTURES`
  accept: `decryptV3Envelope` (`src/modules/persistenceCrypto.js`) derives the key from the envelope's stored `k`
  parameters instead of constants, so a later change to the defaults cannot lock out existing vaults and backups; the
  `v3` fixtures still decrypt unchanged, and a test decrypts an envelope written with non-default parameters. QR and
  NFC payloads are not touched.
- **STORAGE-SINGLE-DERIVATION** — One key derivation per vault write
  `chore · agent · low`
  accept: `StorageService.persistCurrentData` no longer runs a second Argon2id derivation to verify what it just
  wrote, or a test shows the verification reuses the derived key; `v3` files stay byte-compatible.
- **STATE-STALE-REDUCERS** — Reducers overwrite each other with a stale snapshot
  `bug · agent · normal`
  accept: `src/contexts/reducers/*` update through the previous state, and a test running two reducers back to back
  keeps both updates.
- **GENERATOR-NO-FALLBACK** — The password generator never falls back to `Math.random`
  `bug · agent · normal`
  accept: `src/modules/passwordGenerator.js` uses a cryptographic source available on Hermes or fails visibly; a test
  proves no path reaches `Math.random`.
- **NFC-PIPE-FIELDS** — A `|` in a name or username corrupts NFC records
  `bug · agent · normal`
  accept: NFC records round-trip names and usernames containing `|`, with the existing record format still readable.
- **NFC-TAG-TYPES** — Android NFC assumes NTAG215
  `chore · agent · low`
  accept: `src/services/NFCService.js` reads the tag's capacity instead of hard-coding NTAG215 and refuses a payload
  that does not fit with a clear error.
- **MARKETPLACE-ORIGINS** — Restrict the marketplace WebView
  `decision · creator · normal`
  accept: a decision on the origins the WebView may load; an approved list becomes an agent task with a test.
- **EXT-CLIPBOARD-CLEAR** — The extension clears copied secrets
  `feature · agent · normal`
  accept: a password copied from the popup is cleared from the clipboard after the app's timeout when unchanged; a
  test in `browser-extension/tests/`.
- **DEPS-DECLARE** — Declare what the app imports and drop what it does not
  `chore · agent · normal`
  accept: `qrcode` and `@expo/vector-icons` are in `package.json`; `expo-blur`, `expo-haptics` and `expo-linking` are
  removed or used; `npx expo-doctor` is clean.
- **DEAD-CODE-SWEEP** — Delete what nothing reaches
  `chore · agent · low`
  accept: `src/services/QRService.js`, `src/modules/verboseDate.js`, `src/modules/pinToMnemonic.js`, `src/mocks/` and
  the unused `menu` route are deleted, or their use is shown; the Canela font loads only if a style references it.
- **RELEASE-AAB** — Play Store needs an app bundle
  `chore · agent · low`
  accept: `eas.json` has a production profile that builds an AAB and a `submit.production` entry, next to the APK
  profile `yarn build:prod` uses; `scripts/__tests__/android-build.test.js` still passes.
- **STORE-ASSETS-README** — Store asset notes name the current version
  `chore · agent · low`
  accept: `store-assets/app-store/1.4.14/README.md` states the version it applies to and the 1.4.15 decision from
  DEPLOY-STORE-1.4.15 is recorded.
- **UI-TOKEN-LITERALS** — Screens read colours and sizes from the theme
  `chore · agent · low`
  accept: the scanner header in `src/App.Navigator.jsx`, the passcode grounds in `SecretFooterContent` and the
  `fontSize: 16` in Home, Unlock and Create use theme tokens, and the Passwords metric size joins the type scale; a
  test greps the screens for literal colours.
- **EXT-SECURE-QR-OVERLAY** — The scanner overlay reads "Starting camera" while the passcode is requested
  `bug · agent · low`
  accept: after a secure QR is detected the popup shows the passcode prompt without the camera-start message; a test
  in `browser-extension/tests/`;
  the interface follows board UI-EXT-SECURE-QR-OVERLAY.
- **EXT-DEAD-CSS** — Delete extension styles no script uses
  `chore · agent · low`
  accept: `.splitpass-inline-button` and `.splitpass-inline-recent-*` are removed from `scanner-ui.css`, and the
  literal `#fff` in `item.css` and `scanner-ui.css` uses `--color-on-accent`.
- **EXT-THEME-SETTING** — An in-extension theme setting
  `decision · creator · low`
  accept: a decision on whether the extension keeps following only the OS (`prefers-color-scheme`) or gains a setting.
- **THEME-UNUSED-TOKENS** — Tokens no component reads
  `chore · agent · low`
  accept: `radiusFull`, `surfaceRaised`, `disabled`, `success`, `info` and their `on*` pairs are used by a component
  or removed from `src/theme/palette.js`, and `design/index.html` follows after `yarn design`.
- **UI-DISABLED-BUTTON-CONTRAST** — Disabled outlined and secondary buttons fall just under AA
  `chore · agent · low`
  accept: the label of a disabled outlined or secondary `Button` meets 4.5:1 against its fill in both themes
  (`textSecondary` on `border` is 4.36:1 in light today); a test over the palette.
