# SplitPass

An Expo / React Native app for handling high-value secrets without relying on a single storage location. It keeps a
password, a payment card or a BIP39 seed phrase in a vault encrypted with a master passphrase, and can split a secret
into shards that travel as QR codes or NFC tags and recombine later. A browser extension scans SplitPass QR codes and
fills the saved passwords.

**v1.4.19 · Expo SDK 55 · browser extension 0.1.0.**

- Stores passwords, payment cards and seed phrases locally, detecting seed phrases automatically.
- Splits secrets into shards for external storage and recovers them from QR or NFC.
- Encrypts the vault and every backup with the master passphrase; there is no recovery if it is lost.
- Exports and imports backups as opaque archive files.
- Generates passwords, schedules reminders and unlocks with biometrics when the device allows it.
- The extension (Chrome, Brave, Safari) keeps encrypted passwords per domain and fills them from a site panel.

How each of these works, and the security contracts behind them, is in [SPEC.md](SPEC.md).

## Develop

Requires the Node version in `.nvmrc` and Yarn 1.x.

```bash
yarn install
yarn start                # Expo dev client
yarn android              # or: yarn ios · yarn web
yarn test                 # Jest
yarn check:release        # package.json, app.json and build numbers agree
npx expo-doctor           # after dependency or Expo config changes
```

## Build

```bash
yarn build:local:dev      # dev build installed on the device or emulator
yarn build:local:prod     # signed APK in release-assets/
yarn build:dev            # the same dev build on EAS cloud
yarn build:prod           # the same signed APK on EAS cloud
```

Store assets live in `store-assets/`; SPEC section 10 describes the release steps.

## Browser extension

`browser-extension/` loads unpacked in Chrome and Brave and converts for Safari. Setup, retention and camera notes are
in [browser-extension/README.md](browser-extension/README.md).

## Documents

- [SPEC.md](SPEC.md) — how SplitPass works: secret model, security, storage, screens, services, extension, operations, design system.
- [ROADMAP.md](ROADMAP.md) — what is left and who has to move.
- [CHANGELOG.md](CHANGELOG.md) — what each version shipped.
- [AGENTS.md](AGENTS.md) — rules for working on the repository.
- Design kit: `design/index.html` (system), `browser-extension.html` (extension), `mobile.html` (app), `open-work.html`, `proposals.html`.
