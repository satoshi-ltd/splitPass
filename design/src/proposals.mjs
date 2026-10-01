import { L, btn, esc, extensionFigure, ic, lightSpec, note, s, scanCrop, spec, t } from './draw.mjs';

const permissionCard = ({ title, caption, button }) =>
  scanCrop(`<div class="m-scan-permission"><div class="m-scan-permission-body">${t(title, 'm-b m-l m-c-scrim')}${t(caption, 'm-s m-c-scrim')}${button}</div></div>`);

const [blockedTitle, ...blockedRest] = L.SCANNER_QR_PERMISSION_DENIED.split('. ');
const blockedCaption = blockedRest.join('. ');

const securePopup = extensionFigure('Secure QR · passcode');
const OVERLAY = '<div class="splitpass-empty">';
if (!securePopup.includes(OVERLAY)) throw new Error('the "Secure QR · passcode" popup no longer carries the camera overlay');

const onAccentRow = (label, inner, cls = '') =>
  `<div class="kit-ext-scope ${cls}"><p class="kit-board-label">${esc(label)}</p>${inner}</div>`;

const extensionButton = '<button class="splitpass-button splitpass-button-primary" type="button">Create vault</button>';

const strengthRow = (label, icon) =>
  `<div class="m-row m-ai-c m-jc-sb m-pb-xs"><div class="m-back">${ic('chevron-left', 'l')}</div><div class="m-row m-ai-c m-gap-xs">${label}${icon}</div></div>`;

export const REVIEW = [
  {
    id: 'UI-SCANNER-PERMISSION',
    area: 'Scanner · light theme',
    title: 'A blocked camera says the same sentence twice and hides its button',
    why: `When the camera is blocked, Scanner.qr.js prints "${L.SCANNER_QR_PERMISSION_DENIED}" as the title and again as the caption, and the outlined button has no tone, so its label takes the content colour: dark text on the 0.85 black scrim in the light theme.`,
    accept: 'when the camera is blocked, `Scanner.qr.js` shows a title and a distinct caption, and the outlined button reads on the scrim in the light theme; a test on the copy keys and the button tone.',
    now: permissionCard({ title: L.SCANNER_QR_PERMISSION_DENIED, caption: L.SCANNER_QR_PERMISSION_DENIED, button: btn({ text: L.SCANNER_QR_PERMISSION_SETTINGS, variant: 'outlined', size: 's' }) }),
    proposed: permissionCard({ title: blockedTitle, caption: blockedCaption, button: btn({ text: L.SCANNER_QR_PERMISSION_SETTINGS, variant: 'outlined', size: 's', tone: 'scrim' }) }),
  },
  {
    id: 'UI-EXT-SECURE-QR-OVERLAY',
    area: 'Extension popup',
    title: 'The camera says it is starting while it asks for a passcode',
    why: 'After a secure QR is read the popup stops the camera, which shows the stage overlay, and never resets its text, so "Starting camera" stays on screen above the passcode field. The board draws the recommended variant: the overlay is hidden and the passcode prompt stands alone. The alternative keeps the overlay with its own copy, for example "Secure QR found" and "Enter the passcode to continue."; it costs a new string and says what the prompt below already says.',
    accept: 'after a secure QR is detected the popup shows the passcode prompt and no camera-start message; `EXT-SECURE-QR-OVERLAY` carries the test in `browser-extension/tests/`.',
    now: securePopup,
    proposed: securePopup.replace(OVERLAY, '<div class="splitpass-empty splitpass-hidden">'),
  },
  {
    id: 'UI-UNLOCK-FORMAT-WIPE',
    area: 'Unlock · decision',
    title: 'An unreadable vault is erased before anyone can offer a backup',
    why: 'On ERR_PERSISTENCE_FORMAT the unlock screen erases all local data, resets to onboarding and shows a notification; the third wrong passphrase does the same. This board is a proposal for the creator\'s decision, not a decision: the recommended variant first offers a backup import and erases only on an explicit choice; the alternative keeps wiping at once. The copy on the right is illustrative, and the three-wrong-passphrases wipe is recorded in SPEC either way.',
    accept: 'the creator picks one of the two drawings; if the prompt wins, `UNLOCK-FORMAT-WIPE` becomes an agent task that implements it with tests, and this board is deleted when it ships.',
    proposedLabel: 'Option for the creator',
    now: spec(`${note({ title: L.ERROR, text: L.MASTER_PASSPHRASE_STORAGE_RESET })}${t(L.ONBOARDING_1_TITLE, 'm-b m-xl m-c-acc')}${t(L.ONBOARDING_1_MESSAGE, 'm-b m-l m-c-sec')}<div class="m-onb-foot"><div class="m-pagination"><span class="m-dot is-active"></span><span class="m-dot"></span><span class="m-dot"></span><span class="m-dot"></span></div>${btn({ text: L.NEXT })}</div>`),
    proposed: spec(`<div class="m-hero"><div class="m-t m-logo">split${s('/', 'm-logo m-c-acc')}Pass</div></div><div class="m-warn">${t('Encrypted local data could not be read. Import a backup, or erase this device.', 'm-s m-c-wrn')}</div><div class="m-actions">${btn({ text: L.IMPORT_BACKUP, size: 'l' })}${btn({ text: L.RESET_DATA_ACTION, size: 'l', variant: 'outlined' })}</div>`),
  },
  {
    id: 'EXT-TOKEN-PARITY',
    area: 'Extension · app',
    title: 'The same orange button has white text in the extension and dark text in the app',
    why: 'theme.css sets --color-on-accent to #FFFFFF while onAccent in palette.js is #181310, so a primary button changes its label colour between the app and the extension. Either the extension follows the app or SPEC records the difference as deliberate.',
    accept: "the extension's `--color-on-accent` and `--radius-full` match `onAccent` and `radiusFull` in `src/theme/palette.js`, or SPEC 9 records the difference as deliberate.",
    now: `${onAccentRow('Extension', extensionButton)}${spec(btn({ text: L.START, size: 'l' }))}`,
    proposed: `${onAccentRow('Extension', extensionButton, 'kit-on-accent-app')}${spec(btn({ text: L.START, size: 'l' }))}`,
  },
  {
    id: 'UI-GENERATOR-STRENGTH-CONTRAST',
    area: 'Password generator · light theme',
    title: 'The password strength label is unreadable in the light theme',
    why: 'The generator header draws the strength label and its shield in the accent colour, 2.93:1 against the light background, and only the colour tells weak from strong. The board draws the label in the content colour and keeps the accent for the shield of a strong password; the exact tones are illustrative.',
    accept: 'the strength label of the generator (`src/screens/Passwords`) meets 4.5:1 against the background in both themes (accent on background is 2.93:1 in light today), and weak and strong differ by more than colour; a test on the tone and the label.',
    now: lightSpec(`${strengthRow(t(L.PASSWORD_STRENGTH_WEAK, 'm-sb m-s m-c-acc'), ic('shield-check-outline', 's', 'm-c-acc'))}${strengthRow(t(L.PASSWORD_STRENGTH_VERY_STRONG, 'm-sb m-s m-c-acc'), ic('shield-check-outline', 's', 'm-c-acc'))}`),
    proposed: lightSpec(`${strengthRow(t(L.PASSWORD_STRENGTH_WEAK, 'm-sb m-s'), '')}${strengthRow(t(L.PASSWORD_STRENGTH_VERY_STRONG, 'm-sb m-s'), ic('shield-check-outline', 's', 'm-c-acc'))}`),
  },
];
