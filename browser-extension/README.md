# SplitPass Scanner

Browser extension that reuses the current SplitPass QR `value`, copies decoded passwords from the popup, fills password fields from an in-page site panel, and keeps encrypted saved passwords per domain.

## What it supports

- SplitPass password QR values (`type=1`)
- SplitPass secure password QR values (`type=2`) after entering the 6-digit passcode
- SplitPass 2FA QR values (`type=A`), stored as the TOTP URI and filled as a fresh code on every use
- encrypted recent-password storage protected by a master password
- encrypted saved passwords per domain with usage-based expiration and no fixed count limit
- Chrome and Brave as unpacked extensions
- Safari packaging through Safari Web Extensions conversion

## What it does not support yet

- shards
- cards
- seed phrases
- scanning inline on insecure `http://` pages

## How it works

1. Open the extension popup on an `http` or `https` page.
2. The popup always shows the scanner in a single view.
3. On first use, create a master password for the extension vault.
4. Unlock the vault to start the camera and reveal the saved passwords for the current domain below the scanner.
5. Scan the QR shown by SplitPass.
6. If the QR is secure, enter the passcode.
7. The popup copies the decoded password and saves it encrypted for the current domain.
8. Saved passwords expire based on how often you use them (see below).

## Retention

Every saved password shows when it expires. Each fill or copy renews the timer.

- `Auto` (default): 7 days after the last use, growing to 30 days from the third use and 90 days from the tenth.
- `1 year`: a fixed sliding window of 365 days after the last use.
- `No expiry`: never pruned until you delete it.

Click the expiry text on any item to cycle between the three levels. Click the `X` to delete the item immediately.

A background alarm checks hourly whether every saved password has expired. When that happens it replaces the encrypted payload with an empty one without needing the master password, so expired secrets do not linger on disk while the vault is locked. A `No expiry` item disables this wipe.

## Camera requirement

- The scanner runs only inside the extension popup. The camera permission belongs to the extension origin, so it is granted once and shared by the popup and `camera-access.html`.
- Browsers do not reliably show the camera prompt from an extension popup, and Brave tends to dismiss it, which surfaces as `Permission dismissed`. While the permission is undecided or blocked, the popup shows an `Allow camera access` button that opens `camera-access.html` in a normal tab, where the prompt works and the address bar lets you unblock a denied camera.
- The in-page site panel does not use the camera. It only shows saved passwords for the current domain and fills password fields.

## Load in Chrome

1. Open `chrome://extensions`.
2. Enable `Developer mode`.
3. Click `Load unpacked`.
4. Select `/Users/javi/git/splitPass/browser-extension`.

## Load in Brave

1. Open `brave://extensions`.
2. Enable `Developer mode`.
3. Click `Load unpacked`.
4. Select `/Users/javi/git/splitPass/browser-extension`.

## Prepare for Safari

Apple packages Safari web extensions through Xcode. The web extension code in this folder is the source.

Run:

```bash
xcrun safari-web-extension-converter /Users/javi/git/splitPass/browser-extension --no-open
```

Then open the generated Xcode project, set signing, and run it in Safari.

Additional Safari notes are in [safari/README.md](/Users/javi/git/splitPass/browser-extension/safari/README.md).

## Security notes

- The extension decodes the QR locally inside the popup.
- Recent passwords are stored only in encrypted form inside extension storage.
- The encrypted vault is unlocked with the master password.
- The passcode is only used in memory for the current popup scanner session.
- The extension stores only the hostname, never the full URL or path.
- Pages with password fields can show a floating SplitPass panel for the current domain. The panel only receives entry metadata; the secret is fetched from the background at the moment you click an entry.
- The content script is limited to regular `http` and `https` pages instead of every browser URL.
- `browser-extension/lib/form-scan.js` decides which field is the username, the password or the 2FA code. It scores each input on its attributes, its `<label>`, its `aria-label` and its shape, in English, Spanish, Portuguese, French and German, and vetoes search, promo-code, address and payment fields so a secret is never typed into one. Keep the scoring there rather than in `content.js`: it is pure DOM logic covered by `tests/form-scan.test.js`.
