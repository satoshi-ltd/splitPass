# split/Pass — specification

How split/Pass works today: the contracts the code keeps, how it is built and operated, and the design system. Open
work lives in [ROADMAP.md](ROADMAP.md), shipped versions in [CHANGELOG.md](CHANGELOG.md), working rules in
[AGENTS.md](AGENTS.md), the product pitch and setup in [README.md](README.md).

## Contents

- [Current state](#current-state)
- [1. Product and decisions](#1-product-and-decisions)
- [2. Architecture](#2-architecture)
- [3. Secret model and payload formats](#3-secret-model-and-payload-formats)
- [4. Security](#4-security)
- [5. Storage and state](#5-storage-and-state)
- [6. Screens and flows](#6-screens-and-flows)
- [7. Device services](#7-device-services)
- [8. Browser extension](#8-browser-extension)
- [9. Design system](#9-design-system)
- [10. Operations](#10-operations)
- [11. Development and tests](#11-development-and-tests)
- [12. Code map](#12-code-map)

## Current state

- **1.4.20.** `package.json` and `app.json` carry the same version; Expo SDK 55, React Native 0.83, React 19, JavaScript
  only. iOS build number and Android version code are 12.
- **Ships:** the mobile app (iOS with tablet support, Android) and the browser extension `split/Pass Scanner` (manifest
  version 0.1.0, Chrome and Brave unpacked, Safari through Xcode conversion). A web target (`yarn web`) exists with NFC
  mocked and biometrics unavailable.
- **Distribution:** App Store assets live in `store-assets/app-store/<version>/`; Android builds are signed APKs from
  EAS or a local build, written to `release-assets/` ([10](#10-operations)). Bundle ids: iOS
  `com.satoshi-limited.splitpass`, Android `com.satoshilimited.splitpass`; Expo owner `satoshi-ltd`.
- **Network:** no backend, no telemetry. The app talks to the network only for opt-in website favicons, the marketplace
  WebView and the Terms and Privacy links.
- **Repository:** `git@github.com:satoshi-ltd/splitPass.git`. License Apache-2.0.

## 1. Product and decisions

split/Pass keeps high-value secrets out of a single storage location. A secret is encoded to a numeric payload that
lives in an encrypted on-device vault, on a QR code, on an NFC card, or split into shards.

- **Secret kinds:** password, payment card, BIP39 seed phrase (12 or 24 words) and TOTP (2FA) seed.
- **Where a secret lives:** the encrypted vault; a QR shown on screen; a text record on an NTAG NFC card; or Shamir
  shards (two of three recombine, one alone reveals nothing).
- **Master passphrase:** encrypts the whole vault and every export. Minimum 8 characters and not rated weak at setup.
  There is no recovery for a lost passphrase. Three wrong unlock attempts, or an unsupported encrypted payload, wipe the
  app data and return to onboarding.
- **New secrets are never PIN-protected.** Types `2`, `5`, `8` (6-digit PIN) exist only to read QR or NFC data made by
  earlier versions; the PIN is entered per view and never stored.
- **Privacy defaults:** `websiteFaviconsEnabled` and `externalSharingEnabled` default to off and stay opt-in;
  `clipboardAutoClearEnabled` defaults to on; biometric unlock and lock-immediately default to off.
- **Compatibility is a product rule:** every QR/NFC payload, shard format and encrypted store or backup an earlier
  release wrote must still decode or decrypt.
- **The extension is a separate vault** with its own master password; it never reads the app's data and supports a
  subset of secret types ([8](#8-browser-extension)).
- **Languages:** English, Spanish, Portuguese, French, German; fallback English (`src/modules/l10n.js`).
- **Themes:** light, dark, or follow the system; default follows the system.

## 2. Architecture

```
App.js → src/App.jsx
  SafeAreaProvider → StoreProvider (contexts/store.jsx) → AppProvider (contexts/app.jsx)
    Navigator (App.Navigator.jsx)  +  Notification (design-system)
```

| Layer | Path | Owns |
| --- | --- | --- |
| Bootstrap | `src/App.jsx`, `src/App.Navigator.jsx`, `src/App.constants.js` | Fonts, screen-capture protection, providers, stack navigator, secret-type constants |
| State | `src/contexts/` | `useStore` (vault state, reducers), `useApp` (colours, language, date format, auto-lock, notifications init) |
| Business and security | `src/modules/` | Payload codec, Shamir, envelope crypto, TOTP, strength, risk, l10n, event bus |
| Device | `src/services/` | Storage, backup, biometrics, clipboard, NFC, favicons, notifications, public settings |
| UI | `src/screens/`, `src/components/`, `src/design-system/` | Screens, app pieces, primitives |
| Theme | `src/theme/` | Palette, spacing, type, EStyleSheet themes |

- `App.jsx` loads fonts (`useFonts`), builds the initial EStyleSheet theme, and enables screen protection: Android
  `preventScreenCaptureAsync`, iOS `enableAppSwitcherProtectionAsync`. A missing native module only warns in development.
- `StoreProvider` constructs `StorageService` at mount, reads `PublicSettingsService`, applies language and theme, and
  renders children only once `store` exists. Reducers are bound as `fn(...args, [state, setState])` in `store.jsx`.
- `AppProvider` owns the auto-lock timer, `AppState` handling, notification initialisation once `onboarded`, and
  rebuilds EStyleSheet when the theme is `system` and the OS scheme changes.
- Screens reach persistence only through `useStore` and `src/services`.
- Cross-screen signalling uses `eventEmitter` (`src/modules/eventEmitter.js`): `notification` (`{title, text, error,
  variant}`) and `password-selected` (generator picker to Create). Confirm dialogs pass callbacks through
  `openConfirm` / `consumeConfirmCallbacks` (`src/modules/confirmNavigation.js`) because route params must stay
  serialisable.
- Styling: `react-native-extended-stylesheet` for `*.style.js` files (`$space*`, `$color*` variables from
  `CommonTheme`), plain `StyleSheet` with `theme` tokens and `useApp().colors` inside `design-system/`. Theme changes
  call `StyleSheet.build(resolveAppTheme(preference, scheme))`.

## 3. Secret model and payload formats

### 3.1 Payload types

A payload (`value`) is one type character followed by digits (the QR/NFC transport). Constants live in
`src/App.constants.js`; the codec is `src/modules/QRParser.js`.

| Type | Meaning | Created today |
| --- | --- | --- |
| `1` / `2` / `3` | Password / password with 6-digit PIN / legacy password shard | `1` only |
| `4` / `5` / `6` | Seed phrase / with PIN / legacy seed shard | `4` only |
| `7` / `8` / `9` | Card / with PIN / legacy card shard | `7` only |
| `A` | TOTP: the `otpauth://totp/...` URI | yes |
| `S` / `T` / `U` | Shard v2 of a password / seed phrase / card | yes |
| `B` | Username envelope, transport only | display only |

- Password, card and TOTP payloads encode each character as its 1-based index in the 95-character set
  (`src/modules/repositories/chars.js`: a-z, A-Z, 0-9 and 33 symbols including space) as two digits, `01`..`95`.
- Seed payloads encode each word as its 1-based index in the 2048-word BIP39 list (`repositories/bip39.js`) as four
  digits. `isSeedPhrase` accepts exactly 12 or 24 space-separated BIP39 words with no checksum check;
  `isSeedPhraseCandidate` is true when the text has whitespace and starts with a BIP39 word.
- Characters outside the 95-character set cannot be encoded: `QRParser.encode` returns `undefined` and the screens show
  `ERROR_SECRET_UNSUPPORTED_CHARS`. `getUnsupportedChars` lists them.
- `QRParser.encode(secret, optionsOrSecure)`: options `{type: 'card' | 'totp', secure}`; without a type, a TOTP URI
  becomes `A`, a 12/24-word BIP39 string becomes `4`, anything else `1`. `decode(qr, pin?)` returns the plain text or
  `undefined` (PIN of the wrong shape, invalid card, invalid TOTP).
- `Cypher` (`src/modules/cypher.js`): legacy PIN transform, digit-wise addition mod 10 of the 6-digit PIN cycled over
  the payload digits. `encrypt` and `decrypt` return `undefined` for non-digit input or a PIN that is not six digits.
- `USERNAME_TYPE = 'B'`: `B` + `encodeURIComponent(username)` + `:` + inner payload. `encodeWithUsername` runs only
  when the Viewer draws a QR for a saved secret that has a username and is neither a shard nor TOTP;
  `decodeWithUsername` unwraps it in the Scanner and the extension. A stored `value` never starts with `B`.

### 3.2 Cards

- Canonical card value: `number|MM/YY|CVV` with number of 13 to 19 digits (no Luhn check), month `01`..`12`, CVV of 3
  or 4 digits (`src/modules/secretValueDisplay.js`). A number alone is also a valid card value.
- A card is detected in Create when the secret field is 13 to 19 digits; expire and CVV inputs then appear.
- A saved card record also carries `cardNumber`, `expire`, `cvv` fields next to `value` (inside the encrypted vault).
- Display masks digits with `*`; the number is grouped in fours.

### 3.3 TOTP

- Stored `value` is `A` + password-charset encoding of the URI; the record also carries `issuer`, `account`,
  `algorithm`, `digits`, `period`, `kind: 'totp'`.
- `src/modules/totp.js`: RFC 6238 HMAC through `expo-crypto`; algorithms SHA1 (default), SHA256, SHA512; digits default
  6; period default 30 s; secret is base32. The Viewer refreshes the code every second and shows a countdown ring.
- TOTP secrets are never split, never written to NFC, and cannot be edited beyond name, notes and username.

### 3.4 Shards

- `QRParser.split(qr, shares = 3)` runs Shamir secret sharing over GF(2^8) (`src/modules/shamir.js`, polynomial
  `0x11b`, threshold 2, `x = 1..shares`, random coefficients from `expo-crypto`) on the UTF-8 bytes of the whole payload
  including its type character. A shard is a marker (`S`, `T` or `U` by the source type) followed by the bytes
  `[x, ...y]` in a URL-safe base64 alphabet without padding (`A-Za-z0-9-_`).
- `QRParser.combine(...shards)` recombines any two or more v2 shards by Lagrange interpolation and returns the
  original payload. `S`, `T`, `U` route by the first shard's marker.
- Legacy shards (`3`, `6`, `9`) are still read: passwords and seeds merge position by position, keeping the first digit
  that is not `0`; card shards carry eight `|`-separated segments where `_` marks a masked segment.
- Creating shards (Create with "split" on) opens the Viewer in read mode with three shard QRs; nothing is stored until
  the person saves a shard to the device, writes it to an NFC card or shares it.
- The Scanner needs two distinct shards, warns when a scanned shard is legacy, and rejects a repeated shard.

### 3.5 Records

A saved secret in the vault (`secrets` array):

| Field | Notes |
| --- | --- |
| `hash` | `UUID({entity: 'secret', name, value, createdAt})`, deterministic, uppercase (`src/contexts/reducers/modules/UUID.js`) |
| `name`, `username`, `notes` | `notes` never contains `\|` (stripped in Create) |
| `value` | payload string, never `B`-prefixed |
| `kind`, `brand` | visual hints from `deriveSecretVisual`: `card`, `totp`, `service`, `wallet`, `shard` |
| `createdAt`, `readAt` | ISO strings; `readAt` is stamped when the Viewer is left |
| `favorite` | boolean |
| card / TOTP extras | `cardNumber`, `expire`, `cvv`; `issuer`, `account`, `algorithm`, `digits`, `period` |

`consolidate` (`src/contexts/modules/consolidate.js`) turns dates into `Date` and derives `vault` from the name
(`Account`, `Finance`, `Social`, `others` by keyword, `src/App.constants.js`); `vault` is never persisted.

### 3.6 Derived analysis

- `getSecretStrength`: type `1` scores the decoded text; `2` scores payload length; every other type counts as strong.
- `getSecretRiskMap`: flags a secret as mediocre (not strong) and/or repeated (the same decoded type-`1` password on
  more than one secret). Home and Viewer show the warning.
- `getPassphraseStrength` (weak, medium, strong) gates the master passphrase and custom backup passphrase; the extension
  mirrors it in `browser-extension/lib/passphrase.js`.
- `generatePassword` (`src/modules/passwordGenerator.js`): lowercase filler plus configured capitals, digits and
  symbols (`!@#$%^&*()-_=+[]{};:,.?`), length at least 8, default 14 with 3 digits, 3 capitals and 2 symbols. Indexes come
  from `globalThis.crypto.getRandomValues`, with `Math.random` as the fallback when it is absent.

## 4. Security

### 4.1 Master passphrase lifecycle

| Event | Behaviour |
| --- | --- |
| Setup | Onboarding "Start" opens `passphrase` (Unlock, mode `setup`): length >= 8, strength not weak, confirmation equal. `setupSecurity` encrypts the current secrets and settings into a v3 envelope, clears any stored biometric passphrase, sets `onboarded`, and enters `main` (Create first when the vault is empty). |
| Unlock | `unlockStore(passphrase)` decrypts, hydrates settings, mirrors them to public settings, rebuilds the theme, and resets to `main` (or `onboarding` when `onboarded` is false). |
| Failed unlock | `ERR_PERSISTENCE_UNLOCK_FAILED` counts an attempt in the Unlock screen state; the third wipes app data and resets to onboarding. `ERR_PERSISTENCE_FORMAT` wipes at once. Other errors show a notification. |
| Auto-lock | See [4.4](#44-locking-and-session). |
| Logout (Settings) | Confirm; clear pending clipboard; delete the biometric passphrase; persist `biometricUnlockEnabled: false`; `lockStore`; reset to `unlock`. |
| Reset (Settings) | Confirm; delete biometric passphrase and public settings; `store.destroy()` writes plaintext defaults; reset reminders; reset to onboarding. |
| Session | The passphrase exists in memory in `StorageService.sessionPassphrase` only while unlocked; `lock()` drops it and the decrypted data. |

### 4.2 Envelopes (`src/modules/persistenceCrypto.js`)

| Version | Shape | Key derivation | Cipher |
| --- | --- | --- | --- |
| v3 (all writes) | `{v: 3, k: {a, m, p, s, t}, n, w, c}` | Argon2id, 64 MiB, 3 passes, parallelism 1, 16-byte salt, 32-byte key | AES-256-GCM: a random 32-byte data key is wrapped (`w`) by the derived key, the payload JSON (`c`) is sealed by the data key; one 12-byte nonce `n` is shared by the two seals; 16-byte tag appended; fields are base64url |
| v2 (read only) | `{type: 'splitpass.encrypted.v2', kdf: {salt}, ciphertext: {iv, ciphertext, tagLength}}` | 10,000 rounds of SHA-256 over salt + passphrase | AES-GCM |
| v1 (read only) | `{type: 'splitpass.encrypted.v1', kdf: {salt}, wrappedKey, ciphertext}` | same legacy KDF | AES-GCM with a wrapped data key |

- Decryption of v3 uses the fixed constants above, not the `k` fields; changing them needs a new envelope version.
- The passphrase must be at least 8 characters for every derivation.
- v3 has no brand marker, so exports do not identify their origin; v1 and v2 do.
- Errors: `ERR_PERSISTENCE_FORMAT` (not an envelope or malformed), `ERR_PERSISTENCE_UNLOCK_FAILED` (wrong passphrase or
  tampered data), `ERR_PERSISTENCE_WRITE_FAILED` (verification read-back failed).
- Every write re-derives a key with a new salt and reads the result back and decrypts it (`verifyPersistedEnvelope`)
  before the in-memory state is replaced.
- Migration: the first successful `unlock` of a v1 or v2 store rewrites it as v3 and sets `lastUnlockMigrated`; that
  unlock turns biometric unlock off and deletes the stored biometric passphrase.

### 4.3 Backups

- Export (`Settings > Export`) opens Unlock in `export` mode. An empty passphrase field exports the current v3 store
  envelope (protected by the master passphrase); a filled one requires strength not weak and a matching confirmation and
  re-encrypts the data under that custom passphrase.
- File: JSON of the envelope, named `archive-<UTC timestamp>-<6 random chars>.dat`, MIME `application/octet-stream`,
  written to the cache directory, shared, then deleted. No branded filename or marker appears in a v3 export.
- Import (`Settings > Import`): document picker, at most 10 MiB, file deleted from the cache afterwards. An encrypted
  file opens Unlock in `import` mode for the backup's passphrase; a legacy plaintext `{secrets, settings}` file asks for
  confirmation. Import replaces all secrets and settings (`replaceAll`); when a session exists the vault stays under the
  current master passphrase. A backup without `biometricUnlockEnabled` clears the stored biometric passphrase; with it, and
  an unchanged passphrase, the stored one is left as it was.
- Export and import call `suspendAutoLock` so the share and picker sheets do not lock the vault.
- A reminder notification asks for a backup weekly ([7.6](#76-notifications)).

### 4.4 Locking and session

- Auto-lock delay is `settings.autoLockSeconds` (default 300; no UI edits it, imports can set it). With
  `autoLockImmediatelyEnabled`, the vault locks on the `background` state; otherwise a timer starts on `background` or
  `inactive`, and on return to `active` the vault locks if the elapsed time reached the delay.
- `autoLockGuard` (`suspendAutoLock`, `resumeAutoLock`, `resetAutoLock`) counts suspenders; returning to `active` resets it.
- `lockStore` clears decrypted data, empties `secrets` in state, and resets navigation to `unlock`. The biometric
  passphrase stays in the OS keychain.
- Biometric unlock: `BiometricAuthService` stores the master passphrase in `expo-secure-store` (key
  `com.satoshi-ltd.splitpass.biometric.passphrase`, keychain service `com.satoshi-ltd.splitpass.biometric`,
  `requireAuthentication: true`). It requires strong biometrics and can be enabled only while unlocked. Unlock tries it
  automatically once per foreground when enabled and available; an invalidated credential shows a warning and falls back
  to the passphrase. In `__DEV__` on a device without strong biometrics the passphrase is mocked in AsyncStorage.
- Screen: Android blocks capture with `FLAG_SECURE`; iOS blurs the app-switcher snapshot.
- Clipboard: [7.5](#75-clipboard).

### 4.5 Invariants

- No log, notification or error carries a secret, shard, PIN, passphrase, decoded payload or decrypted backup.
- Storage never falls back to plaintext once configured; `settings` exist in plaintext only as the public copy
  ([5](#5-storage-and-state)).
- New encrypted writes are v3; older envelopes are readable and migrate forward.
- A stored `value` is never `B`-prefixed and is never PIN-transformed.
- PINs live only in component state for the current view.
- One shard reveals nothing about the payload.
- Remote privacy conveniences (favicons, external sharing) stay opt-in.

## 5. Storage and state

| Where | Key | Content |
| --- | --- | --- |
| AsyncStorage | `com.satoshi-ltd.splitpass` | The vault: a v3 envelope once configured; before setup, plaintext defaults `{security, secrets, settings}` (fresh install) or a legacy plaintext store |
| AsyncStorage | `com.satoshi-ltd.splitpass.public-settings` | Plaintext normalised settings, readable before unlock (language, theme, `onboarded`, toggles, reminders, auto-lock) |
| SecureStore | `com.satoshi-ltd.splitpass.biometric.passphrase` | Master passphrase behind biometrics |
| AsyncStorage (`__DEV__`) | `com.satoshi-ltd.splitpass.biometric.dev-passphrase` | Development mock of the above |
| File cache | `<cache>/favicons/<domain>.ico` | Favicon cache, only with favicons on |
| AsyncStorage (web) | `com.satoshi-ltd.splitpass:nfc` | Web NFC mock |

`StorageService` (`src/services/StorageService.js`, adapter `AsyncStorageAdapter`):

- `security` getter: `configured` (raw data is an envelope), `legacy` (plaintext store present), `unlocked` (decrypted
  data present and configured).
- Lifecycle: `initializeSecurity(passphrase, seed)`, `unlock`, `lock`, `replaceAll`, `wipe(key?)`, `destroy`.
- Backup: `exportBackup(passphrase?)`, `decryptBackup(raw, passphrase)`.
- Collection API: `get(key)` selects `secrets` or `settings`; `save`, `update(query, next)`, `remove(query)`,
  `find`, `findOne`, `value`. Each mutation persists the whole store through `persistCurrentData`. A locked store throws
  `Store is locked.`.

State (`DEFAULTS` in `src/contexts/store.constants.js`):

| Setting | Default | Meaning |
| --- | --- | --- |
| `autoLockImmediatelyEnabled` | `false` | Lock on `background` |
| `autoLockSeconds` | `300` | Delay otherwise |
| `biometricUnlockEnabled` | `false` | Offer biometric unlock |
| `clipboardAutoClearEnabled` | `true` | Clear copied values after 10 s |
| `externalSharingEnabled` | `false` | Show Share for QR images |
| `websiteFaviconsEnabled` | `false` | Fetch favicons |
| `language` | device language | `en`, `es`, `pt`, `fr`, `de` |
| `onboarded` | `false` | Onboarding finished |
| `reminders` | `[1]` | `[1]` weekly backup reminder on, `[0]` off |
| `theme` | `system` | `light`, `dark`, `system` |

Reducers (`src/contexts/reducers/`): `createSecret`, `createSecrets`, `readSecret` (stamps `readAt`, only when
unlocked), `updateSecret`, `deleteSecret`, `updateSettings` (saves and mirrors to public settings, rebuilds the theme
when it changes), `importBackup`, `resetAppData`, `setupSecurity`, `unlockStore`, `lockStore`. `useStore()` exposes
`store`, `security`, `secrets` (consolidated), `settings` and these actions.

## 6. Screens and flows

Routes (`src/App.Navigator.jsx`, native stack):

| Route | Screen | Purpose |
| --- | --- | --- |
| `onboarding` | Onboarding | Four slides, then "Start" to `passphrase` |
| `passphrase` | Unlock, mode `setup` | Create the master passphrase |
| `unlock` | Unlock, mode `unlock` | Passphrase or biometric sign-in |
| `main` | Main | Bottom tabs `secrets`, `create`, `settings`; the footer's centre button opens `scanner` |
| `scanner` | Scanner | Read QR or NFC; recombine shards; save |
| `secret` | Viewer | Show a secret's QR, value, TOTP; actions menu |
| `passwordGenerator` | Passwords | Generator modal; picker mode returns to Create |
| `language` | Language | Choose one of five languages |
| `marketplace` | Marketplace | WebView of `https://splitpass-marketplace.pages.dev/` |
| `confirm` | ConfirmScreen | Transparent confirm modal driven by `openConfirm` |
| `menu` | Menu | Registered transparent modal; nothing navigates to it |

Initial route: not configured, `onboarding`; configured and locked, `unlock`; unlocked, `main` if `onboarded` else
`onboarding`. The navigator is keyed by `configured:unlocked:onboarded`, and a lock while on any route resets to `unlock`.
Unlock also serves `export` and `import` modes (pushed from Settings).

- **Home (`secrets`):** search over name and username; favorites section; alphabetical sections (`#` first); sort by
  `readAt` or `createdAt`; summary of strong versus mediocre secrets; per-item menu (favorite, edit details, save to
  NFC card). Tap opens the Viewer with `readAt` for "last opened".
- **Create (`create`):** name, secret (masked, reveal toggle), generator shortcut, username, notes, split switch, and a
  TOTP mode with an in-place QR scanner. Modes: new, `hydrate` (from Scanner; secret fields locked), `edit` (name,
  notes, username; secret only for plain password and seed types). Split output goes to the Viewer, never to storage.
- **Viewer (`secret`):** QR (272 px; shards paginated; a locked-preview QR for PIN-protected types until the PIN is
  entered), masked value with reveal, copy, TOTP code with countdown, username copy, risk notice, "last opened".
  Menu: save to device / NFC card / share (create-flow shards), favorite, edit details, save to NFC card, share QR image
  (only with `externalSharingEnabled`), scan another shard, delete with confirmation.
- **Scanner (`scanner`):** QR tab (expo-camera, QR only) and NFC tab. An `otpauth://totp` QR goes to Create as TOTP.
  A supported payload is decoded (PIN prompt for `2`, `5`, `8`), shown masked, and "save to phone" stores it re-encoded as
  a plain type; a `B` envelope restores the username. Reached with `readMode` and `values` from a shard's Viewer.
  Reached with `writeMode` it writes the secret to an NFC card.
- **Settings:** security (biometric, lock immediately, backup reminder, export, import), privacy (external sharing,
  clipboard auto-clear, favicons), preferences (language, system theme, dark mode), about (marketplace, terms, privacy),
  account and data (logout, reset), development (demo secrets, `__DEV__` only).
- **Passwords:** length slider (8 and up), counters for digits, capitals, symbols, strength label, copy (with
  clipboard clearing); picker mode also emits `password-selected`.

## 7. Device services

- **Camera (7.1):** `expo-camera` `CameraView`, `barcodeTypes: ['qr']`, active only while the screen is focused. A denied
  permission shows a card that re-requests, or opens system settings when `canAskAgain` is false. Permission strings
  are in `app.json`; Android also declares `CAMERA` and `NFC`.
- **NFC (7.2, `src/services/NFCService.js`, `NFCService.web.js`):** `react-native-nfc-manager`, NDEF text records. Record
  text is `name|value|username|notes`, trailing empty fields trimmed; valid with a non-empty name and value. Cards:
  NTAG213 (144 bytes), NTAG215 (504), NTAG216 (888); iOS reads the version byte, Android assumes NTAG215. `read()`
  returns `{records, info: {id, totalMemory, usedMemory}}`; `write()` appends the record when absent, refuses past
  capacity (`NFC_CARD_IS_FULL`) and restores the previous message on other failures; `remove()` requires the same tag
  id. Errors are localised strings (`NFC_NOT_SUPPORTED`, `NFC_ACCESS_ERROR`, `NFC_CARD_IS_FULL`,
  `NFC_INVALID_ORIGIN_CARD`). `NFCCard` returns a mock tag in `__DEV__` on unsupported devices; on web the service is an
  in-memory `StorageService` mock. `SecurityService.checkCard` accepts a tag whose `info.id` is set.
- **Backup (7.3):** [4.3](#43-backups), through `expo-document-picker`, `expo-file-system/legacy` and `expo-sharing`.
- **Sharing (7.4):** `expo-sharing` sends a QR image captured with `react-native-view-shot`; the temp file is deleted
  afterwards. The Share action exists only with `externalSharingEnabled`.
- **Clipboard (7.5):** `ClipboardService.copyWithAutoClear(value, {ttlMs})`: default 10 s; `ttlMs: 0` disables clearing
  (used when the setting is off). At expiry the clipboard is wiped only if it still holds the copied value.
  `reconcilePendingClipboard` runs on return to `active`; `clearPendingClipboard` wipes unconditionally (logout).
- **Notifications (7.6):** `NotificationsService.init` runs once after onboarding: requests permission, dismisses opened
  notifications and schedules one weekly reminder (Saturday 08:00 local) titled `REMINDER_BACKUP`. `reminders([0])`
  cancels it; a language change reschedules so the text follows the language.
- **Favicons (7.7):** `FaviconService.resolve(domain)`, only when `websiteFaviconsEnabled`, domain from the secret's
  website or name: the site's `favicon.ico`, then DuckDuckGo and Google favicon endpoints; 4.5 s timeout per candidate,
  cache in `<cache>/favicons`, 60 s offline cooldown, 10 min failure cooldown, `invalidate` on image error.
- **Marketplace (7.8):** a `react-native-webview` of the split|Card store; Terms and Privacy open `satoshi-ltd.com` in
  the system browser.

## 8. Browser extension

Source in `browser-extension/`; Manifest V3; no build step, plain scripts attached to `globalThis`.

### 8.1 What it does

Scans a split/Pass QR with the popup camera, decodes it locally, fills the current page (or copies), and keeps the
secret in an encrypted per-domain vault. An in-page panel offers saved entries on pages with password or 2FA fields.

Supported payloads (`lib/splitpass.js`): `1` password, `2` password with PIN, `A` TOTP, and a `B` username envelope
around them. Everything else (`3`..`9`, `S`, `T`, `U`) answers `unsupported_type`.

### 8.2 Manifest

- Permissions: `alarms`, `clipboardWrite`, `storage`, `activeTab`. No host permissions, no `tabs`.
- Extension-page CSP: `default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: https:;
  font-src 'self'; connect-src 'none'; object-src 'none'; frame-src 'none'`.
- Content script on `http://*/*` and `https://*/*`, `document_idle`, top frame only, loading `browser-api`, `totp`,
  `secret-item`, `form-scan` and `content.js`. Web-accessible resources: `theme.css`, `item.css`, `content.css`, icons
  and fonts, with `use_dynamic_url`.
- Service worker `background.js` loads `browser-api`, `totp` and `vault`.

### 8.3 Components

| Piece | Role |
| --- | --- |
| Popup (`popup.html`, `popup.js`, 360 px) | Vault create, unlock and reset; lock; camera scan; passcode entry; list of the current domain's entries; heartbeat `splitpass.browser.ui.v1` in `storage.local` (1 s) |
| Content script (`content.js`) | Detects fields, renders the site panel in a closed shadow root, fills fields, generates TOTP codes; hides the panel while the popup heartbeat is fresh (3 s) |
| Background (`background.js`) | Message API for the content script; hourly purge alarm `splitpass.purgeExpiredVault` |
| Camera page (`camera-access.html`) | Normal tab that requests `getUserMedia` so the address bar can unblock a denied camera |
| `lib/vault.js` | Vault crypto, entries, retention, domain normalisation |
| `lib/form-scan.js` | Field scoring (username, password, OTP, vetoes) |
| `lib/secret-item.js` | Shared entry list markup and expiry labels |
| `lib/totp.js`, `lib/passphrase.js`, `lib/scanner-ui.js`, `lib/camera-access.js`, `lib/browser-api.js` | TOTP, strength meter, popup shell, camera errors, promise/callback storage wrapper |

Background message types (accepted only when `sender.id` equals the extension id): `splitpass.getVaultStatus`,
`getRecentSecretsForDomain`, `revealSecret`, `touchEntry`, `removeEntry`, `setRetention`. Entries sent to pages are
redacted: `secret` is replaced by `isTotp` and `totpPeriod`; the secret is fetched with `revealSecret` when an entry is
clicked. The popup calls the vault directly. Popup to tab messages: `splitpass.fillPassword`, `fillTotp`,
`refreshSitePanel`.

### 8.4 Vault crypto (`lib/vault.js`)

- Master password at least 8 characters; setup requires strength not weak and a matching confirmation.
- PBKDF2-SHA-256, 600,000 iterations, 16-byte salt, to an AES-256-GCM key with a random 12-byte IV per write. A vault
  stored with fewer iterations (a missing `iterations` field means 250,000) is re-salted and re-encrypted at 600,000 at unlock.
- `storage.local` key `splitpass.browser.vault.v1`: `{type, createdAt, updatedAt, expiresAt, kdf, ciphertext,
  emptyCiphertext}`. `emptyCiphertext` is an encrypted empty vault under the same key so the alarm can drop expired
  data without the password.
- `storage.session` key `splitpass.browser.session.v1`: the unlocked key exported as base64 with `expiresAt` (60 min,
  sliding on use) and `hardExpiresAt` (8 h from unlock). Lock or reset removes it.
- Entry: `{id, domain, secret, username, createdAt, lastUsedAt, expiresAt, retention, useCount}`. Entries are
  de-duplicated by domain, secret and username; an existing match is renewed instead of added.
- Reset deletes the vault and session; there is no recovery.

### 8.5 Domains

`normalizeDomain` reduces a URL or host to its registrable domain: the `PUBLIC_SUFFIXES` list first (multi-tenant hosts
such as `github.io` and `pages.dev` are suffixes); when nothing matches, a generic label (`co`, `com`, `ac`, ...) plus a
two-letter country TLD counts as a compound suffix (`com.ve`, `ac.in`). `member.lazada.co.th` becomes `lazada.co.th`,
`mail.bbc.com` becomes `bbc.com`, and two banks under `com.ve` stay separate. Only the registrable domain is stored,
never the URL or path. Both halves of the rule are load-bearing.

### 8.6 Retention

| Level | Expiry after last use |
| --- | --- |
| `auto` (default) | 7 days; 30 days from the third use; 90 days from the tenth |
| `extended` | 365 days |
| `pinned` | none |

Every fill or copy renews the timer and increments `useCount`. The expiry label cycles `auto` to `extended` to
`pinned` on click; `X` with confirmation deletes. The vault's `expiresAt` is the latest entry expiry, or `null` when
any entry is pinned or the vault is empty. The alarm replaces `ciphertext` with `emptyCiphertext` once that time has
passed; reads and writes also prune expired entries.

### 8.7 Fill and TOTP

- Field detection (`lib/form-scan.js`) scores `name`, `id`, `autocomplete`, `placeholder`, `title`, `aria-label`,
  `data-test*`, `class` and the associated `<label>`, in English, Spanish, Portuguese, French and German. Vetoes keep
  secrets out of search, promo, address, phone, name and payment fields. Segmented OTP inputs of 4 to 12 boxes are
  filled digit by digit. Scoring stays in `form-scan.js`, not in `content.js`.
- Password fill sets the username field when the entry has a username, then every visible password field, dispatching
  `input` and `change`; a second paint retry covers late-rendering forms.
- TOTP entries store the `otpauth://` URI; every use generates a fresh code (`lib/totp.js`, WebCrypto HMAC).
- When no field is found the popup copies the value to the clipboard (`clipboardWrite`); the extension does not clear
  the clipboard afterwards.
- The site panel shows only when the vault is unlocked and the domain has entries; the close button dismisses it until
  focus, visibility or storage changes.

### 8.8 Camera flow

The popup asks for the camera first (`facingMode: environment`). A dismissed dialog shows "Camera not started" with
`Try again`; a second denial shows "Camera blocked" and `Fix camera permission`, which opens `camera-access.html` in a
tab that closes itself on success. `navigator.permissions.query` is not used to gate any step. QR detection uses
`BarcodeDetector` with `qr_code`; a browser without it fails with a message. The camera is used only by the popup; the
site panel never opens it.

### 8.9 Packaging

Chrome and Brave: load the folder unpacked. Safari: `xcrun safari-web-extension-converter browser-extension --no-open`,
then sign and run the generated Xcode project (`browser-extension/safari/README.md`). The extension version is
independent of the app version.

### 8.10 Not supported

Shards, cards, seed phrases, PIN-protected types other than `2`, sync with the app, clipboard clearing.

## 9. Design system

Tokens are in `src/theme/palette.js`; `theme.js` derives app colours, type and spacing; `light.theme.js` and
`dark.theme.js` feed EStyleSheet variables through `common.theme.js`.

**Palette** (light / dark):

| Token | Light | Dark |
| --- | --- | --- |
| `accent` | `#F46A3A` | `#F46A3A` |
| `onAccent` | `#181310` | `#181310` |
| `background` | `#FFFBF7` | `#12100E` |
| `surface` | `#F3ECE5` | `#231D18` |
| `surfaceRaised` | `#FFFCF8` | `#2B241E` |
| `border` | `#E8DDD3` | `#4A3F38` |
| `content` / `contentMuted` | `#181310` / `#6F635A` | `#F7EFE8` / `#D0C4BA` |
| `danger` / `warning` / `success` / `info` | `#C62828` / `#9A6200` / `#2F7A53` / `#2563A6` | `#FF7262` / `#E2A53B` / `#6FC79A` / `#8FBEF5` |
| `inverse` / `onInverse` | `#181310` / `#FFFCF8` | `#FBF4ED` / `#181310` |
| `qrBackground` / `qrForeground` | `#FFFCF8` / `#181310` | `#FBF4ED` / `#181310` |
| `overlay` | `rgba(0,0,0,0.45)` | `rgba(0,0,0,0.6)` |

Also `disabled #999999`, `onScrim #FFFCF8`, `light`, `dark`, and `on*` counterparts for danger, warning, success, info.

- **Shape:** `radius = 0` everywhere (`borderRadius.sm..xl`); `radiusFull = 9999` is defined and no component uses it.
  Flat: no shadows.
- **Spacing:** `xxs 4`, `xs 8`, `sm 12`, `md 16`, `lg 24`, `xl 32`, `xxl 48` (`$spaceXXS`..`$spaceXXL`).
- **Type scale (size / line):** tiny 11/14, caption 13/16, body 15/20, input 16/20, subtitle 20/24, title 26/30. `Text`
  sizes: `xs` tiny, `s` caption, default body, `l` subtitle, `xl` title. Icon sizes 12, 16, 20, 24, 30.
- **Fonts:** Doto (Medium, Bold, Black from `@expo-google-fonts/doto`) is the UI font, registered as `font-default`,
  `font-semibold`, `font-bold`; the wordmark is `split` + accent `/` + `Pass` in Doto Black (`components/Logo`). Canela
  Text is loaded as `font-default-secondary` and `font-bold-secondary` and referenced by no style.
- **Motion:** quick 220 ms, standard 320 ms.
- **Tones** on `Text` and `Icon`: primary, secondary, accent, danger, warning, onAccent, onInverse, onScrim.

**Primitives** (`src/design-system/primitives`): `Button` (variants primary, secondary, outlined; sizes s 36, m 44, l 52
minimum height; icon-only; loading), `Icon` (MaterialCommunityIcons), `Input`, `Pressable`, `ScrollView`, `Text`,
`View` (`row`, `gap`, `spaceBetween`, `align`, `flex`).

**Components** (`src/design-system/components`): `AppScreen`, `Screen`, `Card`, `Confirm`, `HeaderBackButton`, `Menu`,
`Modal`, `Notification` (dark or accent, dismisses after 3 s), `Pagination`, `Setting` (row, toggle or value),
`Tabs`. App-level pieces in `src/components`: `Footer` (tab bar with scan action), `InputMask`, `Logo`, `NFCCard`, `QR`
(error correction M), `SecretFooterContent`, `SecretItem`, `Switch`.

**Extension tokens** (`browser-extension/theme.css`, `:root, :host`, dark through `prefers-color-scheme`): the same
palette names as CSS variables (`--color-accent #F46A3A`, `--color-background`, `--color-surface`, `--color-border`,
`--color-text`, `--color-text-secondary`, `--color-danger`, `--color-warning`), plus `--color-stage`, `--color-frame`,
overlay and placeholder tokens; `--font-primary` Doto; the same type and spacing scales; all radii `0`; no shadows.
`--color-on-accent` is `#FFFFFF`. `popup.css` fixes the popup at 360 px; `content.css` styles the fixed top-right panel
(360 px, `z-index` maximum) inside the closed shadow root.

`design/` is the design kit — `index.html` (brand, colour, type, spacing, primitives, components), `browser-extension.html` (the
browser extension popup and in-page panel, real extension CSS), `mobile.html` (every app screen at 390 × 844),
`proposals.html` (the boards of purely visual proposals). `node design/build.mjs` (`yarn design`) generates
`design/mobile-tokens.css` from `src/theme`, `design/extension-tokens.css` from the extension's `theme.css` (it lets
the Light / Dark switch reach the unmodified extension stylesheets) and `design/mobile-icons.css` (glyph classes of the
icon font in `node_modules/@expo/vector-icons`, so icons need `yarn install`); `design/kit.css`, `design/kit.js` and
`design/mobile.css` are the kit's own chrome and phone frames. The same command regenerates the
Proposals page from the boards of `design/src/proposals.mjs` (ID, area, title, why, a Now and a Proposed drawing, and
the accept; an empty state when there are none) and stamps the shared header and version banner into all four; the
generator takes `--check`, and `design/AGENTS.md` holds the kit's contract. A board is the whole proposal: an approved
one is a ROADMAP Queue task of type `ui` carrying its ID, and the generator refuses a `ui` task without a board.
`scripts/__tests__/design-kit.test.js` fails when tokens drift, a page is stale, the boards and the `ui` tasks disagree, or the kit links break.

## 10. Operations

### 10.1 Baseline

- Node `24.14.1` (`.nvmrc`, `engines.node >= 24.14.1`), Yarn 1.22.22 (`packageManager`), Expo SDK 55 (`resolutions`
  pins `expo ~55.0.12`), React Native 0.83.4, React 19.2.0. `postinstall` runs `patch-package`.
- `patches/react-native-argon2+4.0.0.patch` replaces `jcenter()` with `mavenCentral()` in the library's Android Gradle
  file; Android build errors about that file start there.
- `npx expo-doctor` runs after dependency or Expo config changes; `react-native-nfc-manager` is excluded from its
  directory check (`package.json`).

### 10.2 Scripts (`package.json`)

| Command | Does |
| --- | --- |
| `yarn start` | `expo start --dev-client` |
| `yarn start:go` | `expo start` (Expo Go) |
| `yarn android` / `ios` / `web` | Start Expo for that platform |
| `yarn test`, `yarn test:coverage` | Jest |
| `yarn check:release` | `scripts/check-release.mjs` |
| `yarn build:dev` / `build:prod` | EAS cloud Android build (`development` / `production` profile), APK downloaded to `release-assets/` |
| `yarn build:local:dev` / `build:local:prod` | Same with `eas build --local` |
| `yarn eas:login`, `yarn eas:whoami` | EAS account |

### 10.3 Environment

No environment variable is read by the app or the extension. The Android build script reads `ANDROID_HOME`,
`ANDROID_SDK_ROOT`, `JAVA_HOME`, `ANDROID_AVD` (default `Pixel_9_Pro_Fold`) and `ANDROID_SERIAL`. `.env.local` is not
part of the repository and nothing consumes it; never commit real values.

### 10.4 EAS (`eas.json`)

`appVersionSource: local`; `build.base` pins Node 24.14.1 and Yarn 1.22.22. Profiles `development` (development client,
internal, APK), `preview` (internal, APK), `production` (APK). `submit.production` is empty. Android permissions:
`CAMERA`, `NFC`; iOS `ITSAppUsesNonExemptEncryption: false`, Face ID description set; the NFC config plugin sets
`includeNdefEntitlement: false`.

### 10.5 Android builds (`scripts/android-build.mjs dev|prod [--local] [--install-only]`)

1. Requires `node_modules/expo` and a `check:release` script; runs it first.
2. Output APK: `release-assets/<package tail>-<version>-android[-dev].apk` (`release-assets/` is git-ignored).
3. Cloud: `npx eas-cli build --platform android --profile <profile> --json --non-interactive`, then downloads the
   reported `applicationArchiveUrl`. `--local` runs `eas build --local --output <apk>`.
4. `dev` also finds or boots an emulator (default AVD above, or a physical device, or `ANDROID_SERIAL`), waits up to 3
   minutes for boot, `adb install -r` (never uninstalls or clears data), sets `adb reverse tcp:8081 tcp:8081` and starts
   `MainActivity`. Metro is started by the developer. `--install-only` skips the build.

### 10.6 Versions (`scripts/bump-version.mjs`, `scripts/check-release.mjs [root]`)

Every commit bumps the patch version. `node scripts/bump-version.mjs [patch|minor|major|x.y.z] [--build]` rewrites the
`package.json` and `app.json` versions and the README and SPEC banners, renames `## Unreleased` in `CHANGELOG.md` to the
new version and date (or asks for an entry when there is none) and restamps the design kit. Minor and major are chosen
by the creator. `--build` advances `android.versionCode` and `ios.buildNumber` together and is used only for a native
release. The extension's manifest version is separate.

`check-release.mjs` fails unless the `package.json` version is `x.y.z`, `app.json` `expo.version` equals it,
`android.versionCode` equals `ios.buildNumber`, the README and SPEC banners carry the version and `CHANGELOG.md` has its
entry. It is the only automated release gate.

### 10.7 Store assets

`store-assets/app-store/<version>/` holds `final/` (iPhone 6.9-inch, 1320 × 2868) and `final-ipad/` (iPad 13-inch,
2064 × 2752) PNGs without alpha, the source captures, editorial backgrounds, contact sheets, the two composer scripts
(`python3 compose_screenshots.py`, `compose_ipad_screenshots.py`) and a `README.md` with release metadata and the
release-notes text.

### 10.8 Platform quirks

- Argon2id runs natively through `react-native-argon2`, so the app needs a development or release build.
- `react-native-extended-stylesheet` and `react-native-nfc-manager` need re-checking on each React Native or Expo SDK jump.
- expo-sharing can hang on iOS when a share target is cancelled; the auto-lock guard resets on return to `active`.
- iOS reports `inactive` while the biometric sheet is open, so biometric re-prompts key off `background` to `active` only.
- A stack route named `passphrase` and one named `unlock` render the same `Unlock` component.

## 11. Development and tests

```
yarn install
yarn start              # dev client; needs a development build for NFC, Argon2, secure-store
yarn test               # all Jest suites
yarn test src/modules/__tests__/QRParser.compat.test.js    # one file
yarn check:release
npx expo-doctor
```

- Jest runs with no preset and the default Node environment (`babel.config.js` uses `babel-preset-expo`). Root
  `__mocks__/` mocks `expo-constants`, `expo-crypto`, `expo-local-authentication`, `expo-secure-store` and
  `react-native-argon2`. The suites exercise pure modules, services with fake adapters, reducers and screen helpers.
- Test locations: `src/modules/__tests__/` (parser, cypher, shamir, envelopes, TOTP, strength, risk, l10n, guards),
  `src/services/__tests__/` (storage, backup, biometrics, clipboard, NFC, public settings),
  `src/contexts/**/__tests__/`, `src/screens/{Scanner,Unlock}/__tests__/`, `src/theme/__tests__/`,
  `scripts/__tests__/` (Android build script, release check) and `browser-extension/tests/` (decoder, vault crypto,
  domain rule, retention, TOTP, form scan, passphrase, camera access, list markup). The extension's directory is
  `tests/`, not `__tests__/`, because Chrome rejects extension folders containing a directory that starts with `_`.
- Before editing the codec or crypto, read `QRParser.*.test.js`, `persistenceCrypto.test.js`, `shamir.test.js`.
- Every functional change ships with a test that fails without it; a parser or envelope change also states its migration.

Manual smoke flows worth keeping (device or emulator):

1. Onboarding, passphrase setup, first secret; restart, unlock, wrong-passphrase counter, biometric unlock.
2. Unlock a v1 or v2 store or backup and confirm it migrates to v3; logout and sign in again; reset.
3. Create password, seed phrase, card and TOTP; reveal, copy, clipboard clears after 10 s.
4. Split a secret, save two shards (device and NFC card), scan both and recombine; scan a legacy shard and a legacy `2`
   payload with its PIN.
5. Viewer QR with a username, scanned back with the username restored.
6. Export with and without a custom passphrase, import both, opaque file name.
7. Background past the delay, and with lock immediately; unlock again.
8. Settings, language, marketplace, password generator (also as picker from Create).
9. Extension: create vault, scan a password QR, fill a login form, cycle retention, lock, alarm purge.

## 12. Code map

```
App.js                      Expo entry re-exporting src/App
src/App.jsx                 fonts, screen protection, providers
src/App.Navigator.jsx       stack navigator, confirm screen, initial route
src/App.constants.js        secret types, vault keywords, events, storage domain, URLs
src/contexts/               store.jsx, app.jsx, store.constants.js, reducers/, modules/consolidate.js
src/modules/                QRParser, cypher, shamir, persistenceCrypto, secretValueDisplay, isSeedPhrase, totp,
                            passwordGenerator (strength), secretRisk, secretVisual, findVault, l10n (+dictionaries),
                            autoLockGuard, confirmNavigation, eventEmitter, navigation, icon, repositories/
src/services/               StorageService, BackupService, BiometricAuthService, ClipboardService, NFCService(+web),
                            NotificationsService, PublicSettingsService, FaviconService, SecurityService, mock/,
                            modules/asyncStorage.js
src/screens/                Onboarding, Unlock, Main, Home, Create, Viewer, Scanner, Settings, Passwords, Language,
                            Marketplace
src/components/             Footer, InputMask, Logo, Menu, NFCCard, QR, SecretFooterContent, SecretItem, Switch
src/design-system/          primitives/, components/, index.js
src/theme/                  palette, theme, common/light/dark themes, layout
browser-extension/          manifest.json, popup.*, content.*, background.js, camera-access.*, theme.css, item.css,
                            scanner-ui.css, lib/, assets/, tests/, safari/
scripts/                    android-build.mjs, bump-version.mjs, check-release.mjs, __tests__/
design/                     build.mjs, src/ (generator modules, proposal boards), AGENTS.md, kit pages, tokens, kit.css, kit.js
store-assets/app-store/     per-version screenshots, composers, release notes
patches/                    react-native-argon2 patch
assets/                     icons, splash, onboarding images, Canela fonts
__mocks__/                  Jest mocks for native Expo modules and Argon2
.codex/subagents/           Codex subagent role definitions
```
