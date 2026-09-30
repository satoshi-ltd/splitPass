import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8');

const dictionary = await import(`data:text/javascript;base64,${Buffer.from(read('src/modules/l10n.dictionaries.js'), 'utf8').toString('base64')}`);
const L = dictionary.EN;

const esc = (value) => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const t = (text, cls = '') => `<div class="m-t ${cls}">${esc(text)}</div>`;
const s = (text, cls = '') => `<span class="m-t ${cls}">${esc(text)}</span>`;
const ic = (name, size = '', extra = '') => `<span class="i${size ? ` i-${size}` : ''} ic-${name}${extra ? ` ${extra}` : ''}"></span>`;

const btn = ({ text, variant = 'primary', size = 'm', tone = '', grow = false }) =>
  `<div class="m-btn${variant === 'outlined' ? ' m-btn-outlined' : ''}${size === 's' ? ' m-btn-s' : ''}${size === 'l' ? ' m-btn-l' : ''}${grow ? ' m-btn-grow' : ''}${tone ? ` m-c-${tone}` : ''}">${esc(text)}</div>`;

const note = ({ title, text }) =>
  `<div class="m-note">${ic('alert-outline', '', 'm-c-dng')}<div class="m-note-text"><span class="m-note-title">${esc(title)}</span><span class="m-xs">${esc(text)}</span></div></div>`;

const spec = (inner, cls = '') => `<div class="m-phone kit-spec${cls ? ` ${cls}` : ''}">${inner}</div>`;
const scanCrop = (inner) => `<div class="m-phone kit-spec kit-spec-crop m-scan" data-phone-theme="light">${inner}</div>`;

const setting = ({ icon, title }) =>
  `<div class="m-setting"><div class="m-setting-left"><div class="m-setting-thumb">${ic(icon)}</div><div class="m-setting-body">${t(title, 'm-sb')}</div></div><div class="m-setting-action">${ic('chevron-right', '', 'm-c-sec')}</div></div>`;

const nfcStrip = (wordmark) =>
  `<div class="m-nfc-card kit-nfc-mini" data-phone-theme="light"><div class="m-nfc-row">${t(wordmark, 'm-b m-l m-c-qrfg')}</div><div class="m-nfc-row">${t('0000 0000 0000 00', 'm-xs m-nfc-embossed m-c-qrfg')}${t('SATOSHI LTD.', 'm-xs m-nfc-embossed m-c-qrfg')}</div></div>`;

const permissionCard = ({ title, caption, button }) =>
  scanCrop(`<div class="m-scan-permission"><div class="m-scan-permission-body">${t(title, 'm-b m-l m-c-scrim')}${t(caption, 'm-s m-c-scrim')}${button}</div></div>`);

const [blockedTitle, ...blockedRest] = L.SCANNER_QR_PERMISSION_DENIED.split('. ');
const blockedCaption = blockedRest.join('. ');

const homeSubtitle = (tail) =>
  `<div class="m-t m-b m-l m-c-sec">${esc(L.HOME_SUBTITLE_INTRO)} ${s('1', 'm-b m-l')} ${esc(tail)}</div>`;

const extensionFigure = (title) => {
  const source = read('design/browser-extension.html');
  const figure = source.split('<figure class="kit-figure">').find((piece) => piece.includes(`<strong>${title}</strong>`));
  if (!figure) throw new Error(`design/browser-extension.html has no figure titled "${title}"`);
  return figure.slice(0, figure.indexOf('<figcaption>')).trim();
};

const securePopup = extensionFigure('Secure QR · passcode');
const OVERLAY = '<div class="splitpass-empty">';
if (!securePopup.includes(OVERLAY)) throw new Error('the "Secure QR · passcode" popup no longer carries the camera overlay');

const onAccentRow = (label, inner, cls = '') =>
  `<div class="kit-ext-scope ${cls}"><p class="kit-board-label">${esc(label)}</p>${inner}</div>`;

const extensionButton = '<button class="splitpass-button splitpass-button-primary" type="button">Create vault</button>';

export const REVIEW = [
  {
    id: 'UI-SCANNER-PERMISSION',
    area: 'Scanner · light theme',
    title: 'A blocked camera says the same sentence twice and hides its button',
    why: `When the camera is blocked, Scanner.qr.js prints "${L.SCANNER_QR_PERMISSION_DENIED}" as the title and again as the caption, and the outlined button has no tone, so its label takes the content colour: dark text on the 0.85 black scrim in the light theme.`,
    now: permissionCard({ title: L.SCANNER_QR_PERMISSION_DENIED, caption: L.SCANNER_QR_PERMISSION_DENIED, button: btn({ text: L.SCANNER_QR_PERMISSION_SETTINGS, variant: 'outlined', size: 's' }) }),
    proposed: permissionCard({ title: blockedTitle, caption: blockedCaption, button: btn({ text: L.SCANNER_QR_PERMISSION_SETTINGS, variant: 'outlined', size: 's', tone: 'scrim' }) }),
  },
  {
    id: 'UI-COPY-PLURALS',
    area: 'Home · Settings · NFC card',
    title: 'One secret is plural, and the card has two spellings',
    why: 'The Home subtitle joins "strong secrets." to any count, so one secret reads "1 strong secrets."; the NFC card draws "split/Card" while GET_SPLITCARD and the other card strings write "split|Card". The board draws the slash; which spelling wins is the creator\'s call.',
    now: spec(`${homeSubtitle(L.HOME_SUBTITLE_ALL_STRONG)}${setting({ icon: 'shopping-outline', title: L.GET_SPLITCARD })}${nfcStrip('split/Card')}`),
    proposed: spec(`${homeSubtitle('strong secret.')}${setting({ icon: 'shopping-outline', title: L.GET_SPLITCARD.replace('|', '/') })}${nfcStrip('split/Card')}`),
  },
  {
    id: 'EXT-SECURE-QR-OVERLAY',
    area: 'Extension popup',
    title: 'The camera says it is starting while it asks for a passcode',
    why: 'processRawValue stops the camera, which shows the stage overlay, and never resets its text, so a secure QR leaves "Starting camera" on screen above the passcode prompt.',
    now: securePopup,
    proposed: securePopup.replace(OVERLAY, '<div class="splitpass-empty splitpass-hidden">'),
  },
  {
    id: 'UNLOCK-FORMAT-WIPE',
    area: 'Unlock · decision',
    title: 'An unreadable vault is erased before anyone can offer a backup',
    why: 'On ERR_PERSISTENCE_FORMAT the unlock screen erases all local data, resets to onboarding and shows a notification; the third wrong passphrase does the same. The creator decides whether the format case keeps wiping at once or first offers a backup import; the copy on the right is illustrative, and the three-wrong-passphrases wipe is recorded in SPEC either way.',
    proposedLabel: 'Option for the creator',
    now: spec(`${note({ title: L.ERROR, text: L.MASTER_PASSPHRASE_STORAGE_RESET })}${t(L.ONBOARDING_1_TITLE, 'm-b m-xl m-c-acc')}${t(L.ONBOARDING_1_MESSAGE, 'm-b m-l m-c-sec')}<div class="m-onb-foot"><div class="m-pagination"><span class="m-dot is-active"></span><span class="m-dot"></span><span class="m-dot"></span><span class="m-dot"></span></div>${btn({ text: L.NEXT })}</div>`),
    proposed: spec(`<div class="m-hero"><div class="m-t m-logo">split${s('/', 'm-logo m-c-acc')}Pass</div></div><div class="m-warn">${t('Encrypted local data could not be read. Import a backup, or erase this device.', 'm-s m-c-wrn')}</div><div class="m-actions">${btn({ text: L.IMPORT_BACKUP, size: 'l' })}${btn({ text: L.RESET_DATA_ACTION, size: 'l', variant: 'outlined' })}</div>`),
  },
  {
    id: 'EXT-TOKEN-PARITY',
    area: 'Extension · app',
    title: 'The same orange button has white text in the extension and dark text in the app',
    why: 'theme.css sets --color-on-accent to #FFFFFF while onAccent in palette.js is #181310, so a primary button changes its label colour between the app and the extension. Either the extension follows the app or SPEC records the difference as deliberate.',
    now: `${onAccentRow('Extension', extensionButton)}${spec(btn({ text: L.START, size: 'l' }))}`,
    proposed: `${onAccentRow('Extension', extensionButton, 'kit-on-accent-app')}${spec(btn({ text: L.START, size: 'l' }))}`,
  },
];
