import { read } from './paths.mjs';

const dictionary = await import(`data:text/javascript;base64,${Buffer.from(read('src/modules/l10n.dictionaries.js'), 'utf8').toString('base64')}`);
export const L = dictionary.EN;

export const esc = (value) => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const t = (text, cls = '') => `<div class="m-t ${cls}">${esc(text)}</div>`;
export const s = (text, cls = '') => `<span class="m-t ${cls}">${esc(text)}</span>`;
export const ic = (name, size = '', extra = '') => `<span class="i${size ? ` i-${size}` : ''} ic-${name}${extra ? ` ${extra}` : ''}"></span>`;

export const btn = ({ text, variant = 'primary', size = 'm', tone = '', grow = false }) =>
  `<div class="m-btn${variant === 'outlined' ? ' m-btn-outlined' : ''}${size === 's' ? ' m-btn-s' : ''}${size === 'l' ? ' m-btn-l' : ''}${grow ? ' m-btn-grow' : ''}${tone ? ` m-c-${tone}` : ''}">${esc(text)}</div>`;

export const note = ({ title, text }) =>
  `<div class="m-note">${ic('alert-outline', '', 'm-c-dng')}<div class="m-note-text"><span class="m-note-title">${esc(title)}</span><span class="m-xs">${esc(text)}</span></div></div>`;

export const spec = (inner, cls = '') => `<div class="m-phone kit-spec${cls ? ` ${cls}` : ''}">${inner}</div>`;
export const scanCrop = (inner) => `<div class="m-phone kit-spec kit-spec-crop m-scan" data-phone-theme="light">${inner}</div>`;

export const setting = ({ icon, title }) =>
  `<div class="m-setting"><div class="m-setting-left"><div class="m-setting-thumb">${ic(icon)}</div><div class="m-setting-body">${t(title, 'm-sb')}</div></div><div class="m-setting-action">${ic('chevron-right', '', 'm-c-sec')}</div></div>`;

export const nfcStrip = (wordmark) =>
  `<div class="m-nfc-card kit-nfc-mini" data-phone-theme="light"><div class="m-nfc-row">${t(wordmark, 'm-b m-l m-c-qrfg')}</div><div class="m-nfc-row">${t('0000 0000 0000 00', 'm-xs m-nfc-embossed m-c-qrfg')}${t('SATOSHI LTD.', 'm-xs m-nfc-embossed m-c-qrfg')}</div></div>`;

export const lightSpec = (inner) => `<div class="m-phone kit-spec" data-phone-theme="light">${inner}</div>`;

export const extensionFigure = (title) => {
  const source = read('design/browser-extension.html');
  const figure = source.split('<figure class="kit-figure">').find((piece) => piece.includes(`<strong>${title}</strong>`));
  if (!figure) throw new Error(`design/browser-extension.html has no figure titled "${title}"`);
  return figure.slice(0, figure.indexOf('<figcaption>')).trim();
};
