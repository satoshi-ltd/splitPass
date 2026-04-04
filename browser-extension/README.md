# SplitPass Scanner

Browser extension that reuses the current SplitPass QR `value`, copies decoded passwords from the popup, fills password fields from an in-page site panel, and keeps encrypted saved passwords per domain.

## What it supports

- SplitPass password QR values (`type=1`)
- SplitPass secure password QR values (`type=2`) after entering the 6-digit passcode
- encrypted recent-password storage protected by a master password
- encrypted saved passwords per domain with 7-day expiration and no fixed count limit
- Chrome and Brave as unpacked extensions
- Safari packaging through Safari Web Extensions conversion

## What it does not support yet

- shards
- cards
- seed phrases
- username persistence
- auto-detecting username vs password without field focus
- scanning inline on insecure `http://` pages

## How it works

1. Open the extension popup on an `http` or `https` page.
2. The popup always shows the scanner in a single view.
3. On first use, create a master password for the extension vault.
4. Unlock the vault to start the camera and reveal the saved passwords for the current domain below the scanner.
5. Scan the QR shown by SplitPass.
6. If the QR is secure, enter the passcode.
7. The popup copies the decoded password and saves it encrypted for the current domain.
8. Saved passwords expire after 7 days.

## Camera requirement

- The scanner runs only inside the extension popup, so the camera permission belongs to the extension popup itself.
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
- Pages with password fields can show a floating SplitPass panel for the current domain.
- The content script is limited to regular `http` and `https` pages instead of every browser URL.
