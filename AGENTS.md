# SplitPass — agent instructions

SplitPass is an Expo / React Native app that stores passwords, payment cards and BIP39 seed phrases in a vault
encrypted with a master passphrase, or splits them into shards for QR and NFC recovery, plus a browser extension that
scans SplitPass QR codes and fills saved passwords. These are the rules for working on it. Personal rules of the
creator (@soyjavi) live in `~/.claude/CLAUDE.md` and apply on top.

## Documents

Five documents, each answering one question. Put information in the one that owns it and nowhere else.

| File | Question | Never contains |
| --- | --- | --- |
| `README.md` | What is SplitPass, and how do I install, run and develop it? (for humans) | Status beyond its one-line version banner, contracts, history |
| `AGENTS.md` | Which rules apply when working here? | Status, tasks, history |
| `ROADMAP.md` | What is left to do? (its header defines fields and lanes) | Shipped work |
| `SPEC.md` | How does SplitPass work today? Secret model, payload formats, security, storage, screens, services, extension, operations, design system | Dates, statuses beyond its current-state summary, test counts, investigation logs |
| `CHANGELOG.md` | What did each version ship? | Implementation detail, test counts, review narrative |

- Start from README, SPEC's current state and ROADMAP; then read the SPEC section the task touches.
- **SPEC** is present tense and edited in place: when behaviour changes, rewrite the section that owns it. If secure
  storage or a payload format changes, SPEC states the migration story in the same change.
- **CHANGELOG** entries: `## x.y.z — YYYY-MM-DD`, at most five bullets of what changed for someone using the app or
  the extension, then a `Needs:` line only when a native build, a store submission or an extension reload is required.
  While working, entries collect under `## Unreleased`; the bump renames it to the new version and date.
- Update the owning document in the same change as the code. Decisions go to the list below or to SPEC, remaining
  work to ROADMAP, never to chat history or extra status files. `design/` is the design kit, not a document;
  `browser-extension/README.md` and `store-assets/` keep their own purpose.

## Workflow

- **Task pool:** `ROADMAP.md`. Only `owner: agent` tasks in Queue are worked on; only the creator approves a task into
  Queue. Anything needing a device, a native build, a store account, credentials or a product choice becomes a
  `creator` task. Ideas, including your own, go to Proposed.
- **Commits:** never run `git commit`, `git push`, `git tag` or any ref-mutating command unless the creator asks in
  the current turn; no AI attribution lines anywhere. Remote: `git@github.com:satoshi-ltd/splitPass.git`. There is no CI; the only workflow publishes the site
  (`.github/workflows/publish-site.yml`, SPEC 10.9).
- **Versions:** every commit bumps the patch version: `node scripts/bump-version.mjs` rewrites `package.json`,
  `app.json` (`version`), the README and SPEC banners and the design kit banner, and dates `## Unreleased` in the
  changelog. Minor and major bumps happen only when the creator names them (`node scripts/bump-version.mjs minor`,
  `major` or `x.y.z`). Build numbers (`android.versionCode`, `ios.buildNumber`) move together and only for a native
  release (`--build`). The extension's manifest version is its own and changes only when the creator says so.
  `yarn check:release` checks that everything agrees, banners and changelog included.
- **Validation:** `yarn test` before claiming done; `yarn check:release` after touching versions; `npx expo-doctor`
  after dependency or Expo config changes. Keep implemented, built on a device and verified apart in reports.
- **Autonomous loop:** `/loop /next-task` (the user-level `next-task` skill and `adversarial-reviewer` agent in
  `~/.claude/`) takes one Queue task, implements it with tests, has the reviewer try to break it, applies the
  findings, validates, bumps the version and changelog, then commits and pushes. That invocation is the creator's explicit request to commit and push;
  outside it, commit only when asked. Stop when Queue is empty or everything is blocked on the creator.
- **Review checklist** on top of the generic one: QR payloads and stored backups still decode; `v1` / `v2` stores still
  unlock and migrate to `v3`; nothing sensitive reaches logs, errors, clipboard past its timeout or plaintext storage;
  the master passphrase lifecycle (setup, unlock, logout, reset, export, import) stays coherent; Android and iOS
  differences (NFC, camera, biometrics, theme); extension domain scoping.
- Interruptions: a bug the creator reports goes to the top of Queue; a requested feature goes to Queue; ideas go to
  Proposed; questions get answered. Say where each item went.
- Conversation with the creator is Spanish; code, comments, docs and the product's source strings are English (the app
  has its own language files).

## Engineering rules

- Zero code comments and no docstrings; one-line non-obvious signals only. Every functional change ships with a test
  that fails without it. No TypeScript, no overengineering; keep changes local and reversible.
- Styles live in style files (`*.style.js`, `src/theme/*`, extension `*.css`), not inline; the app stays on JavaScript +
  `StyleSheet` / `react-native-extended-stylesheet` unless a compatibility fix requires otherwise.
- Code and design kit stay in step: after a visible change to a token, a component, a screen or an extension view,
  regenerate `design/` (`yarn design`); the design-kit contract, board format and lifecycle live in
  `design/AGENTS.md`. `scripts/__tests__/design-kit.test.js` fails until the generated files match.
- **Views in sync.** The views (System and every interface tab) show what ships; Proposals shows what is proposed.
  Shipping a proposal is one change: the code, the views regenerated so they show the new design, the board deleted,
  its `ui` line deleted, and the changelog and the spec updated. A board left standing after its change shipped, or a
  view that still draws the old look, fails the adversarial review before the commit.
- Do not overwrite changes already present in the worktree; read diffs before editing shared files.
- Before editing `QRParser`, `cypher`, `persistenceCrypto`, `isSeedPhrase` or `secretValueDisplay`, read their tests in
  `src/modules/__tests__/`. Keep public module signatures stable unless the same change carries the migration.
- Before editing scanner, backup, notifications or NFC behaviour, inspect both the service and the calling
  screen. Prefer adapter fixes over broad rewrites when an SDK upgrade breaks an API.
- `react-native-argon2` is patched by `patch-package`; when an Android build error mentions its Gradle files, read
  `patches/react-native-argon2+4.0.0.patch` before touching app code.
- Extension tests live in `browser-extension/tests/`, never `__tests__/`: Chrome refuses to load an extension holding a
  directory that starts with `_`.
- `normalizeDomain` (`browser-extension/lib/vault.js`) reduces a host to its registrable domain using `PUBLIC_SUFFIXES`
  first and a generic-label plus two-letter-TLD fallback second. Both halves are load-bearing: without the list,
  multi-tenant hosts like `github.io` share one entry; without the fallback, hosts under an unlisted compound suffix
  collapse onto the bare suffix and share credentials. Never replace it with `url.hostname`.
  `resolveSiteLabel` stays simple because `normalizeDomain` has already stripped subdomains.
- Package manager is `yarn`; Node comes from `.nvmrc`. The app reads no environment variables; never commit `.env*`
  files or EAS credentials.
- Codex delegation: `.codex/subagents/` splits work by area (`crypto-core`, `ui-flow`, `device-services`,
  `expo-upgrade`, `docs-release`, `maintainer` to slice). Every handoff states ownership, files touched, validations run
  and unresolved risks.
- Parallel shell calls use absolute paths; a `cd` in one call leaks into its siblings.

## Product decisions (non-negotiable)

- One shard never exposes usable secret content. Existing QR payload formats must keep decoding, and existing stored
  secrets and backups must stay readable.
- `USERNAME_TYPE = 'B'` is a display and transport envelope, wrapped only when the Viewer renders a QR and unwrapped
  transparently by the Scanner. Never persist a `value` that starts with `B`: the stored value is the raw typed
  payload (`1`–`9`, `A`, `S`, `T`, `U`).
- The master passphrase is the primary local security control. Never log it, persist it beyond the current session or
  downgrade the vault to plaintext. There is no recovery for a lost passphrase.
- New encrypted writes use the opaque `v3` envelope (`Argon2id` and AES-GCM); `v1` / `v2` are read-only compatibility
  and migrate forward after a successful unlock. Legacy PIN-based `secure` payloads exist only to read old QR / NFC
  data; new secrets are never created in that mode.
- Backup export stays encrypted once secure setup is enabled and stays opaque: no branded filenames, envelope markers
  or plaintext hints about its purpose.
- PIN handling is ephemeral. Never log secret values, shards, PINs, decoded payloads or decrypted backup contents;
  errors must not leak sensitive content.
- Clipboard writes clear themselves on a timer, best effort. Backgrounding never leaves the vault open indefinitely;
  auto-lock stays coherent with unlock, logout and reset.
- Privacy conveniences are opt-in: website favicons and external sharing default to off unless the creator says
  otherwise. Biometric unlock can only be enabled from an unlocked vault.
- The extension holds only what its SPEC section lists, encrypted under its own master password; expired secrets are
  wiped without that password.
- The UI is square and flat (radius 0) on one audited palette for light and dark, set in Doto.

## Live environment boundaries

- Native builds, installs and store submissions are the creator's unless the turn asks for them. Source changes and
  reviews do not authorize them; `yarn build:*` and `eas` commands are never run incidentally.
- Metro and Expo dev servers are the creator's: never start or restart them; ask when a configuration change needs one.
- Physical devices, NFC tags and store accounts are the creator's; prepare and document, never operate them.
- EAS credentials and signing keys are never printed, committed or copied.
- Tests never touch a real vault, real backups or a real device keychain.
