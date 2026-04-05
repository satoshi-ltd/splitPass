import * as FileSystem from 'expo-file-system/legacy';

const OFFLINE_COOLDOWN_MS = 60 * 1000;
const FAILURE_COOLDOWN_MS = 10 * 60 * 1000;
const DOWNLOAD_TIMEOUT_MS = 4500;
const MULTI_PART_TLDS = new Set([
  'co.uk',
  'org.uk',
  'ac.uk',
  'gov.uk',
  'com.au',
  'net.au',
  'org.au',
  'com.br',
  'com.mx',
  'co.th',
  'com.sg',
  'com.tr',
  'co.jp',
  'co.kr',
  'com.ar',
  'com.co',
  'com.pe',
  'co.id',
  'com.my',
  'co.nz',
]);

const KNOWN_FAVICON_URLS = {
  'atlassian.com': ['https://www.atlassian.com/favicon.ico', 'https://icons.duckduckgo.com/ip3/atlassian.com.ico'],
  'attlasian.com': ['https://www.atlassian.com/favicon.ico', 'https://icons.duckduckgo.com/ip3/atlassian.com.ico'],
  'booking.com': [
    'https://cf2.bstatic.com/static/img/favicon/4a3b40c4059be39cbf1ebaa5f97dbb7d150926b9.png',
    'https://cf2.bstatic.com/static/img/favicon/9ca83ba2a5a3293ff07452cb24949a5843af4592.svg',
    'https://www.booking.com/favicon.ico',
    'https://icons.duckduckgo.com/ip3/booking.com.ico',
  ],
  'coins.co.th': ['https://coins.co.th/favicon.ico', 'https://www.coins.co.th/favicon.ico'],
  'currenxie.com': ['https://currenxie.com/favicon.ico', 'https://www.currenxie.com/favicon.ico'],
  'dribbble.com': ['https://dribbble.com/favicon.ico', 'https://icons.duckduckgo.com/ip3/dribbble.com.ico'],
};

const state = {
  cacheDirReady: false,
  failures: new Map(),
  inflight: new Map(),
  memory: new Map(),
  offlineUntil: 0,
};

const getCacheDir = () => (FileSystem.cacheDirectory ? `${FileSystem.cacheDirectory}favicons` : '');
const now = () => Date.now();

const normalizeDomain = (value = '') =>
  `${value}`
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split(/[/?#:]/)[0]
    .replace(/\.+$/, '');

const resolveRootDomain = (domain = '') => {
  const normalized = normalizeDomain(domain);
  if (!normalized) return '';

  const parts = normalized.split('.');
  if (parts.length <= 2) return normalized;

  const lastTwo = parts.slice(-2).join('.');
  if (MULTI_PART_TLDS.has(lastTwo) && parts.length >= 3) return parts.slice(-3).join('.');

  return parts.slice(-2).join('.');
};

const isLikelyOffline = () => {
  if (now() < state.offlineUntil) return true;
  if (globalThis?.navigator?.onLine === false) return true;

  return false;
};

const markOffline = () => {
  state.offlineUntil = now() + OFFLINE_COOLDOWN_MS;
};

const buildCachePath = (domain = '') => {
  const safe = normalizeDomain(domain).replace(/[^a-z0-9.-]+/g, '-');
  const dir = getCacheDir();
  if (!dir || !safe) return '';
  return `${dir}/${safe}.ico`;
};

const resolveKnownDomain = (domain = '') => {
  const normalized = normalizeDomain(domain);
  const known = Object.keys(KNOWN_FAVICON_URLS).find((item) => normalized === item || normalized.endsWith(`.${item}`));
  return known || '';
};

const resolveCandidateUrls = (domain = '') => {
  const normalized = normalizeDomain(domain);
  const known = resolveKnownDomain(normalized);
  const candidates = [];
  const root = resolveRootDomain(normalized);
  const domains = root && root !== normalized ? [normalized, root] : [normalized];

  if (known && KNOWN_FAVICON_URLS[known]) candidates.push(...KNOWN_FAVICON_URLS[known]);
  domains.forEach((item) => {
    candidates.push(`https://www.${item}/favicon.ico`);
    candidates.push(`https://${item}/favicon.ico`);
    candidates.push(`https://icons.duckduckgo.com/ip3/${item}.ico`);
    candidates.push(`https://www.google.com/s2/favicons?sz=64&domain=${encodeURIComponent(item)}`);
  });

  return [...new Set(candidates)];
};

const ensureCacheDir = async () => {
  if (state.cacheDirReady) return;

  const dir = getCacheDir();
  if (!dir) return;
  const info = await FileSystem.getInfoAsync(dir).catch(() => ({}));
  if (!info?.exists) await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  state.cacheDirReady = true;
};

const isNetworkError = (error) => {
  const message = `${error?.message || error || ''}`.toLowerCase();
  if (!message) return false;
  return (
    message.includes('network') ||
    message.includes('timed out') ||
    message.includes('internet') ||
    message.includes('offline') ||
    message.includes('host') ||
    message.includes('dns')
  );
};

const resolveHeader = (headers = {}, key = '') => {
  const needle = `${key}`.toLowerCase();
  const foundKey = Object.keys(headers || {}).find((item) => `${item}`.toLowerCase() === needle);
  return foundKey ? headers[foundKey] : undefined;
};

const isValidImageResponse = (download = {}) => {
  const status = Number(download?.status || 0);
  if (!Number.isFinite(status) || status < 200 || status >= 300) return false;

  const contentType = `${resolveHeader(download?.headers, 'content-type') || ''}`.toLowerCase();
  if (!contentType) return true;

  return contentType.includes('image/') || contentType.includes('application/octet-stream');
};

const downloadWithTimeout = async (url, to) => {
  let timeout;
  try {
    return await Promise.race([
      FileSystem.downloadAsync(url, to),
      new Promise((_, reject) => {
        timeout = setTimeout(() => reject(new Error('Favicon download timed out.')), DOWNLOAD_TIMEOUT_MS);
      }),
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
};

const readCachedPath = async (domain = '') => {
  const normalized = normalizeDomain(domain);
  if (!normalized) return '';

  const memoized = state.memory.get(normalized);
  if (memoized !== undefined) return memoized;

  const localUri = buildCachePath(normalized);
  if (!localUri) return '';
  const info = await FileSystem.getInfoAsync(localUri).catch(() => ({}));

  if (info?.exists) {
    state.memory.set(normalized, localUri);
    return localUri;
  }

  return '';
};

const markFailure = (domain = '') => {
  const normalized = normalizeDomain(domain);
  if (!normalized) return;
  state.failures.set(normalized, now() + FAILURE_COOLDOWN_MS);
};

const canRetry = (domain = '') => {
  const normalized = normalizeDomain(domain);
  if (!normalized) return false;

  const expiresAt = state.failures.get(normalized) || 0;
  return now() >= expiresAt;
};

const resolve = async (domain = '') => {
  const normalized = normalizeDomain(domain);
  if (!normalized) return '';

  const cached = await readCachedPath(normalized);
  if (cached) return cached;

  if (isLikelyOffline()) return '';
  if (!canRetry(normalized)) return '';

  if (state.inflight.has(normalized)) return state.inflight.get(normalized);

  const pending = (async () => {
    try {
      await ensureCacheDir();

      const cachePath = buildCachePath(normalized);
      if (!cachePath) return '';
      const existing = await FileSystem.getInfoAsync(cachePath).catch(() => ({}));
      if (existing?.exists) {
        state.memory.set(normalized, cachePath);
        return cachePath;
      }

      const tempPath = `${cachePath}.tmp`;
      const urls = resolveCandidateUrls(normalized);

      for (const url of urls) {
        try {
          await FileSystem.deleteAsync(tempPath, { idempotent: true }).catch(() => undefined);
          const downloaded = await downloadWithTimeout(url, tempPath);
          if (!isValidImageResponse(downloaded)) continue;
          const info = await FileSystem.getInfoAsync(tempPath).catch(() => ({}));
          if (!info?.exists || !info?.size) continue;

          await FileSystem.moveAsync({ from: tempPath, to: cachePath });
          state.memory.set(normalized, cachePath);
          state.failures.delete(normalized);
          return cachePath;
        } catch (error) {
          if (isNetworkError(error)) markOffline();
        }
      }

      markFailure(normalized);
      return '';
    } finally {
      state.inflight.delete(normalized);
    }
  })();

  state.inflight.set(normalized, pending);
  return pending;
};

export const FaviconService = {
  invalidate: async (domain = '') => {
    const normalized = normalizeDomain(domain);
    if (!normalized) return;

    state.memory.delete(normalized);
    state.failures.delete(normalized);
    const cachePath = buildCachePath(normalized);
    if (cachePath) await FileSystem.deleteAsync(cachePath, { idempotent: true }).catch(() => undefined);
  },
  resolve,
};
