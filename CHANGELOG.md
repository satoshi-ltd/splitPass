# Changelog

## 1.4.18 — 2026-09-30

- No change for people using the app or the extension: the extension's source drops its code comments.

## 1.4.17 — 2026-09-30

- The confirm button of the passcode prompt is readable again in the dark theme; its icon now picks the colour that contrasts with the button.

## 1.4.16 — 2026-09-30

- The extension asks for the camera from the popup first and offers `Try again` after a dismissed dialog; `Fix camera permission` appears only after a second failure, and the permission tab closes itself once access is granted.
- `yarn build:dev`, `yarn build:prod` and their `:local` variants build the Android APK through one script that runs `yarn check:release` first and writes to `release-assets/`.
- `node scripts/bump-version.mjs` bumps every version location and dates the changelog; `yarn check:release` also checks the README and SPEC banners and the changelog entry.
- The design kit (`design/`) documents the system, the extension and every app screen, and renders open work and proposals from `ROADMAP.md`.

## 1.4.15 — 2026-09-16

- The extension keeps saved passwords under a retention model: Auto (7, 30 or 90 days by use), 1 year, or No expiry, shown on every item and cycled with a click.
- An hourly alarm wipes expired payloads without needing the master password, and a real field detector decides where a password is filled.

## 1.4.14 — 2026-08-13

- A secret is marked as read when its Viewer is left, not on every focus.

## 1.4.13 — 2026-08-13

- No change for people using the app: NFC now has tests. Version 1.4.12 removed a screen nothing could reach.

## 1.4.11 — 2026-08-13

- The OTP scanner offers a way out of a denied camera.

## 1.4.10 — 2026-08-13

- Logging out no longer undoes the setting it has just written.

## 1.4.9 — 2026-08-13

- A recombined secret can be kept, and the right one is kept.

## 1.4.8 — 2026-08-13

- The biometric button is offered only when the device can honour it.

## 1.4.7 — 2026-08-13

- NFC deletions report what actually happened, and iOS follows the system theme.

## 1.4.6 — 2026-08-13

- The extension no longer shares credentials across unrelated domains.

## 1.4.5 — 2026-08-13

- The vault locks in three cases where it used to stay open.

## 1.4.4 — 2026-08-13

- Three silent paths to irreversible data loss are closed.

## 1.4.3 — 2026-08-13

- The app drops the assets nothing references.

## 1.4.2 — 2026-08-13

- Forms stay clear of the virtual keyboard.

## 1.4.1 — 2026-08-13

- The wordmark is drawn with Doto instead of the legacy images.

## 1.4.0 — 2026-08-13

- With biometrics on, the vault prompts for them automatically when it is locked.

## 1.3.0 — 2026-07-27

- Sharing a secret produces real Shamir shards, and the master passphrase must pass a strength gate.
- Backups can be exported under a chosen passphrase.
- Auto-lock and clipboard clearing are hardened; auto-lock no longer fires during the file picker or other modals.
- One square, flat, contrast-audited theme across app and extension, with dark mode following the OS.
- The extension scopes entries by public suffix, derives keys with a stronger KDF, caps sessions and shows a passphrase-strength meter.
