# SplitPass Scanner

Browser extension that reuses the current SplitPass QR `value` and either copies the decoded secret from the popup or fills a password field from its inline launcher.

## What it supports

- SplitPass password QR values (`type=1`)
- SplitPass secure password QR values (`type=2`) after entering the 6-digit passcode
- Chrome and Brave as unpacked extensions
- Safari packaging through Safari Web Extensions conversion

## What it does not support yet

- shards
- cards
- seed phrases
- auto-detecting username vs password without field focus
- scanning inline on insecure `http://` pages

## How it works

1. Open the extension popup to scan and copy, or use the inline SplitPass launcher shown on password fields to scan and fill.
2. The scanner starts the camera automatically.
3. Scan the QR shown by SplitPass.
4. If the QR is secure, enter the passcode.
5. The popup copies the decoded secret to the clipboard and keeps the success state visible until you close it.
6. The inline launcher fills only the password field that opened that scanner.

## Camera requirement

- The popup scanner runs inside the extension popup, so the camera permission belongs to the extension popup itself.
- The inline scanner opened from a password field runs inside the current page and needs that page to allow camera access, which usually means `https://`, `localhost`, or `127.0.0.1`.

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
- It does not persist the scanned secret.
- The passcode is only used in memory for the current scanner session.
- The popup does not hydrate page fields.
- Password fields get a small inline SplitPass launcher on the right side.
- The content script is limited to regular `http` and `https` pages instead of every browser URL.
