(function attachSplitPassVault(globalScope) {
  const VAULT_STORAGE_KEY = 'splitpass.browser.vault.v1';
  const SESSION_STORAGE_KEY = 'splitpass.browser.session.v1';
  const VAULT_TYPE = 'splitpass.browser.vault.v1';
  const SESSION_TYPE = 'splitpass.browser.session.v1';
  const DAY_MS = 24 * 60 * 60 * 1000;
  const RETENTION = { AUTO: 'auto', EXTENDED: 'extended', PINNED: 'pinned' };
  const RETENTION_LEVELS = new Set(Object.values(RETENTION));
  const AUTO_TTL_TIERS = [
    { minUses: 10, ttlMs: 90 * DAY_MS },
    { minUses: 3, ttlMs: 30 * DAY_MS },
    { minUses: 1, ttlMs: 7 * DAY_MS },
  ];
  const EXTENDED_TTL_MS = 365 * DAY_MS;
  const SESSION_TTL_MS = 60 * 60 * 1000;
  const MAX_SESSION_TTL_MS = 8 * 60 * 60 * 1000;
  const MIN_MASTER_PASSWORD_LENGTH = 8;
  const PBKDF2_ITERATIONS = 600000;
  const PBKDF2_ITERATIONS_LEGACY = 250000;
  const textEncoder = new TextEncoder();
  const textDecoder = new TextDecoder();
  const browserApi = globalScope.browser || globalScope.chrome || {};
  const { callStorage } = globalScope.SplitPassBrowserApi;

  function getStorageArea(name) {
    return browserApi?.storage?.[name] || null;
  }

  async function storageGet(areaName, key) {
    const result = await callStorage(getStorageArea(areaName), 'get', key);
    return result?.[key];
  }

  async function storageSet(areaName, key, value) {
    await callStorage(getStorageArea(areaName), 'set', { [key]: value });
  }

  async function storageRemove(areaName, key) {
    await callStorage(getStorageArea(areaName), 'remove', key);
  }

  function ensureCrypto() {
    if (!globalScope.crypto?.subtle) {
      throw new Error('Web Crypto is not available in this browser.');
    }
  }

  function encodeBase64(bytes = new Uint8Array()) {
    let binary = '';

    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });

    return globalScope.btoa(binary);
  }

  function decodeBase64(value = '') {
    const binary = globalScope.atob(String(value || ''));
    return Uint8Array.from(binary, (char) => char.charCodeAt(0));
  }

  const PUBLIC_SUFFIXES = new Set([
    'co.uk', 'org.uk', 'gov.uk', 'ac.uk', 'me.uk', 'ltd.uk', 'plc.uk', 'net.uk', 'sch.uk',
    'com.au', 'net.au', 'org.au', 'edu.au', 'gov.au', 'id.au',
    'co.nz', 'net.nz', 'org.nz', 'govt.nz',
    'co.za', 'org.za', 'net.za',
    'co.jp', 'or.jp', 'ne.jp', 'ac.jp', 'go.jp', 'ad.jp',
    'co.kr', 'or.kr', 'ne.kr', 'go.kr',
    'co.in', 'net.in', 'org.in', 'gen.in', 'firm.in',
    'co.th', 'or.th', 'ac.th', 'go.th', 'in.th',
    'com.br', 'net.br', 'org.br', 'gov.br',
    'com.mx', 'com.ar', 'com.co', 'com.pe', 'com.uy', 'com.ec', 'com.bo',
    'com.cn', 'net.cn', 'org.cn', 'gov.cn',
    'com.tr', 'com.sg', 'com.hk', 'com.tw', 'com.my', 'com.ph', 'com.vn', 'com.pk', 'com.sa',
    'co.il', 'co.id', 'com.ua', 'com.ru', 'com.pl', 'com.es', 'com.gr',
    'github.io', 'gitlab.io', 'bitbucket.io', 'github.dev',
    'herokuapp.com', 'herokussl.com',
    'vercel.app', 'now.sh', 'netlify.app', 'netlify.com',
    'pages.dev', 'workers.dev', 'r2.dev',
    'web.app', 'firebaseapp.com', 'appspot.com',
    'azurewebsites.net', 'cloudapp.net', 'trafficmanager.net',
    'cloudfront.net', 's3.amazonaws.com', 'elasticbeanstalk.com', 'amazonaws.com',
    'glitch.me', 'repl.co', 'replit.dev', 'surge.sh', 'onrender.com', 'fly.dev',
    'ngrok.io', 'ngrok-free.app', 'pythonanywhere.com', 'wordpress.com', 'blogspot.com',
    'translate.goog', 'freshdesk.com', 'myshopify.com', 'zendesk.com',
  ]);

  const GENERIC_SECOND_LEVELS = new Set([
    'ac', 'co', 'com', 'edu', 'go', 'gob', 'gov', 'id', 'in', 'mil', 'ne', 'net', 'nom', 'or', 'org', 'sch', 'web',
  ]);

  function extractRegistrableDomain(hostname) {
    const labels = hostname.split('.').filter(Boolean);
    if (labels.length <= 2) return labels.join('.');

    // Fallback for compound suffixes missing from the list (com.ve, ac.in): generic label + 2-char country TLD.
    const isCompoundCountrySuffix =
      labels[labels.length - 1].length === 2 && GENERIC_SECOND_LEVELS.has(labels[labels.length - 2]);
    let suffixLabels = isCompoundCountrySuffix ? 2 : 1;
    for (let count = labels.length - 1; count >= 2; count -= 1) {
      if (PUBLIC_SUFFIXES.has(labels.slice(labels.length - count).join('.'))) {
        suffixLabels = count;
        break;
      }
    }

    return labels.slice(Math.max(0, labels.length - suffixLabels - 1)).join('.');
  }

  function normalizeDomain(value = '') {
    const rawValue = String(value || '').trim();

    if (!rawValue) return '';

    try {
      const url = rawValue.includes('://') ? new URL(rawValue) : new URL(`https://${rawValue}`);
      const hostname = url.hostname.replace(/\.$/, '').toLowerCase();
      return extractRegistrableDomain(hostname);
    } catch {
      return '';
    }
  }

  function createEntryId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }

  function sanitizeSecret(secret = '') {
    return String(secret || '');
  }

  function sanitizeUsername(username = '') {
    return String(username || '');
  }

  function now() {
    return Date.now();
  }

  function buildEntryFingerprint(domain = '', secret = '', username = '') {
    return `${normalizeDomain(domain)}\u0000${sanitizeSecret(secret)}\u0000${sanitizeUsername(username)}`;
  }

  function normalizeRetention(value) {
    return RETENTION_LEVELS.has(value) ? value : RETENTION.AUTO;
  }

  function normalizeUseCount(value) {
    return Math.max(1, Math.floor(Number(value) || 1));
  }

  function resolveEntryTtl(retention = RETENTION.AUTO, useCount = 1) {
    if (retention === RETENTION.PINNED) return null;
    if (retention === RETENTION.EXTENDED) return EXTENDED_TTL_MS;

    const uses = normalizeUseCount(useCount);
    return AUTO_TTL_TIERS.find((tier) => uses >= tier.minUses).ttlMs;
  }

  function resolveExpiresAt(retention, useCount, from) {
    const ttlMs = resolveEntryTtl(retention, useCount);
    return ttlMs === null ? null : from + ttlMs;
  }

  function isEntryAlive(entry, timestamp) {
    return entry.retention === RETENTION.PINNED || Number(entry.expiresAt) > timestamp;
  }

  function resolveVaultExpiresAt(entries = []) {
    if (!entries.length || entries.some((entry) => entry.retention === RETENTION.PINNED)) return null;
    return Math.max(...entries.map((entry) => Number(entry.expiresAt)));
  }

  const matchesFingerprint = (fingerprint) => (entry) =>
    buildEntryFingerprint(entry.domain, entry.secret, entry.username) === fingerprint;

  function pruneEntries(entries = [], timestamp = now()) {
    const validEntries = Array.isArray(entries)
      ? entries
          .filter((entry) => entry && typeof entry === 'object')
          .filter((entry) => typeof entry.domain === 'string' && typeof entry.secret === 'string')
          .filter((entry) => isEntryAlive(entry, timestamp))
      : [];

    const newestByFingerprint = new Map();

    validEntries
      .sort((left, right) => Number(right.lastUsedAt || 0) - Number(left.lastUsedAt || 0))
      .forEach((entry) => {
        const domain = normalizeDomain(entry.domain);
        const secret = sanitizeSecret(entry.secret);
        const username = sanitizeUsername(entry.username);
        const fingerprint = buildEntryFingerprint(domain, secret, username);
        if (!domain || !secret || newestByFingerprint.has(fingerprint)) return;

        const retention = normalizeRetention(entry.retention);
        newestByFingerprint.set(fingerprint, {
          id: String(entry.id || createEntryId()),
          domain,
          secret,
          username,
          createdAt: Number(entry.createdAt || timestamp),
          lastUsedAt: Number(entry.lastUsedAt || entry.createdAt || timestamp),
          expiresAt: retention === RETENTION.PINNED ? null : Number(entry.expiresAt),
          retention,
          useCount: normalizeUseCount(entry.useCount),
        });
      });

    return Array.from(newestByFingerprint.values()).sort((left, right) => right.lastUsedAt - left.lastUsedAt);
  }

  async function deriveVaultKey(masterPassword = '', saltBytes = new Uint8Array(), iterations = PBKDF2_ITERATIONS) {
    ensureCrypto();

    const normalizedPassword = String(masterPassword || '');
    if (normalizedPassword.length < MIN_MASTER_PASSWORD_LENGTH) {
      throw new Error(`The master password must contain at least ${MIN_MASTER_PASSWORD_LENGTH} characters.`);
    }

    const importedKey = await globalScope.crypto.subtle.importKey(
      'raw',
      textEncoder.encode(normalizedPassword),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    return await globalScope.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        hash: 'SHA-256',
        salt: saltBytes,
        iterations: Number(iterations) || PBKDF2_ITERATIONS,
      },
      importedKey,
      {
        name: 'AES-GCM',
        length: 256,
      },
      true,
      ['encrypt', 'decrypt']
    );
  }

  async function exportKey(key) {
    const rawKey = await globalScope.crypto.subtle.exportKey('raw', key);
    return encodeBase64(new Uint8Array(rawKey));
  }

  async function importSessionKey(encodedKey = '') {
    ensureCrypto();

    return await globalScope.crypto.subtle.importKey('raw', decodeBase64(encodedKey), 'AES-GCM', true, [
      'encrypt',
      'decrypt',
    ]);
  }

  async function encryptPayload(payload = {}, key) {
    const iv = globalScope.crypto.getRandomValues(new Uint8Array(12));
    const ciphertext = await globalScope.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      textEncoder.encode(JSON.stringify(payload))
    );

    return {
      iv: encodeBase64(iv),
      data: encodeBase64(new Uint8Array(ciphertext)),
    };
  }

  async function decryptPayload(payload = {}, key) {
    const plaintext = await globalScope.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: decodeBase64(payload.iv) },
      key,
      decodeBase64(payload.data)
    );

    return JSON.parse(textDecoder.decode(new Uint8Array(plaintext)));
  }

  async function readVaultDocument() {
    const document = await storageGet('local', VAULT_STORAGE_KEY);
    return document && document.type === VAULT_TYPE ? document : null;
  }

  async function writeVaultDocument(document) {
    await storageSet('local', VAULT_STORAGE_KEY, document);
  }

  async function readSessionDocument() {
    const document = await storageGet('session', SESSION_STORAGE_KEY);
    if (!document || document.type !== SESSION_TYPE) return null;

    const hardExpiresAt = Number(document.hardExpiresAt || 0);
    if (Number(document.expiresAt || 0) <= now() || (hardExpiresAt && hardExpiresAt <= now())) {
      await storageRemove('session', SESSION_STORAGE_KEY);
      return null;
    }

    return document;
  }

  async function writeSessionKey(key, { hardExpiresAt } = {}) {
    const hardExpiry = Number(hardExpiresAt) || now() + MAX_SESSION_TTL_MS;

    await storageSet('session', SESSION_STORAGE_KEY, {
      type: SESSION_TYPE,
      key: await exportKey(key),
      expiresAt: Math.min(now() + SESSION_TTL_MS, hardExpiry),
      hardExpiresAt: hardExpiry,
    });
  }

  async function getUnlockedKey() {
    const sessionDocument = await readSessionDocument();
    if (!sessionDocument?.key) return null;

    const key = await importSessionKey(sessionDocument.key);
    await writeSessionKey(key, { hardExpiresAt: sessionDocument.hardExpiresAt });
    return key;
  }

  async function requireUnlockedKey() {
    const key = await getUnlockedKey();
    if (!key) {
      const error = new Error('The vault is locked.');
      error.code = 'ERR_VAULT_LOCKED';
      throw error;
    }
    return key;
  }

  async function decryptVaultEntries(key) {
    const document = await readVaultDocument();
    if (!document?.ciphertext) {
      return { document: null, entries: [] };
    }

    try {
      const payload = await decryptPayload(document.ciphertext, key);
      const entries = pruneEntries(payload?.entries || []);
      return { document, entries };
    } catch {
      const error = new Error('Unable to unlock the vault.');
      error.code = 'ERR_VAULT_UNLOCK_FAILED';
      throw error;
    }
  }

  async function persistEntries(document, entries, key) {
    const timestamp = now();
    const payload = { entries: pruneEntries(entries, timestamp) };
    const ciphertext = await encryptPayload(payload, key);
    // emptyCiphertext lets purgeExpiredVault drop expired entries without the key, keeping unlock's password check.
    const emptyCiphertext = await encryptPayload({ entries: [] }, key);

    await writeVaultDocument({
      type: VAULT_TYPE,
      createdAt: Number(document?.createdAt || timestamp),
      updatedAt: timestamp,
      expiresAt: resolveVaultExpiresAt(payload.entries),
      kdf: {
        algorithm: 'PBKDF2',
        hash: 'SHA-256',
        iterations: Number(document?.kdf?.iterations) || PBKDF2_ITERATIONS,
        salt: String(document?.kdf?.salt || ''),
      },
      ciphertext,
      emptyCiphertext,
    });

    return payload.entries;
  }

  async function initializeVault(masterPassword = '') {
    ensureCrypto();

    const saltBytes = globalScope.crypto.getRandomValues(new Uint8Array(16));
    const key = await deriveVaultKey(masterPassword, saltBytes);

    await persistEntries({ kdf: { salt: encodeBase64(saltBytes), iterations: PBKDF2_ITERATIONS } }, [], key);
    await writeSessionKey(key);
    return true;
  }

  async function unlockVault(masterPassword = '') {
    const document = await readVaultDocument();
    if (!document?.kdf?.salt) {
      const error = new Error('The vault is not initialized.');
      error.code = 'ERR_VAULT_MISSING';
      throw error;
    }

    const storedIterations = Number(document.kdf.iterations) || PBKDF2_ITERATIONS_LEGACY;
    const key = await deriveVaultKey(masterPassword, decodeBase64(document.kdf.salt), storedIterations);
    const { entries } = await decryptVaultEntries(key);

    if (storedIterations < PBKDF2_ITERATIONS) {
      const saltBytes = globalScope.crypto.getRandomValues(new Uint8Array(16));
      const upgradedKey = await deriveVaultKey(masterPassword, saltBytes, PBKDF2_ITERATIONS);

      await persistEntries(
        { createdAt: document.createdAt, kdf: { salt: encodeBase64(saltBytes), iterations: PBKDF2_ITERATIONS } },
        entries,
        upgradedKey
      );
      await writeSessionKey(upgradedKey);
      return true;
    }

    await writeSessionKey(key);
    return true;
  }

  async function lockVault() {
    await storageRemove('session', SESSION_STORAGE_KEY);
    return true;
  }

  async function resetVault() {
    await storageRemove('session', SESSION_STORAGE_KEY);
    await storageRemove('local', VAULT_STORAGE_KEY);
    return true;
  }

  async function hasVault() {
    return !!(await readVaultDocument());
  }

  async function isUnlocked() {
    return !!(await getUnlockedKey());
  }

  async function getRecentSecretsForDomain(domain = '') {
    const normalizedDomain = normalizeDomain(domain);
    if (!normalizedDomain) return [];

    const key = await requireUnlockedKey();
    const { document, entries } = await decryptVaultEntries(key);
    const cleanedEntries = pruneEntries(entries);

    if (document && cleanedEntries.length !== entries.length) {
      await persistEntries(document, cleanedEntries, key);
    }

    return cleanedEntries.filter((entry) => entry.domain === normalizedDomain);
  }

  function renewEntry(entry, timestamp) {
    const useCount = entry.useCount + 1;
    const expiresAt = resolveExpiresAt(entry.retention, useCount, timestamp);
    return { ...entry, useCount, lastUsedAt: timestamp, expiresAt };
  }

  async function loadLiveEntries() {
    const key = await requireUnlockedKey();
    const { document, entries } = await decryptVaultEntries(key);
    const timestamp = now();
    return { key, document, timestamp, entries: pruneEntries(entries, timestamp) };
  }

  async function saveRecentSecret(domain = '', secret = '', username = '') {
    const normalizedDomain = normalizeDomain(domain);
    const normalizedSecret = sanitizeSecret(secret);
    const normalizedUsername = sanitizeUsername(username);
    if (!normalizedDomain || !normalizedSecret) return null;

    const { key, document, timestamp, entries } = await loadLiveEntries();
    const matches = matchesFingerprint(buildEntryFingerprint(normalizedDomain, normalizedSecret, normalizedUsername));
    const previous = entries.find(matches);
    const nextEntry = previous
      ? renewEntry(previous, timestamp)
      : {
          id: createEntryId(),
          domain: normalizedDomain,
          secret: normalizedSecret,
          username: normalizedUsername,
          createdAt: timestamp,
          lastUsedAt: timestamp,
          expiresAt: resolveExpiresAt(RETENTION.AUTO, 1, timestamp),
          retention: RETENTION.AUTO,
          useCount: 1,
        };

    const keptEntries = entries.filter((entry) => !matches(entry));
    const persistedEntries = await persistEntries(document, [nextEntry, ...keptEntries], key);
    return persistedEntries.find(matches) || null;
  }

  async function touchEntry(id = '') {
    const { key, document, timestamp, entries } = await loadLiveEntries();
    const previous = entries.find((entry) => entry.id === id);
    if (!previous) return null;

    const persistedEntries = await persistEntries(
      document,
      [renewEntry(previous, timestamp), ...entries.filter((entry) => entry.id !== id)],
      key
    );
    return persistedEntries.find((entry) => entry.id === id) || null;
  }

  async function revealSecret(id = '') {
    const { entries } = await loadLiveEntries();
    return entries.find((entry) => entry.id === id)?.secret || null;
  }

  async function removeEntry(id = '') {
    const { key, document, entries } = await loadLiveEntries();
    const nextEntries = entries.filter((entry) => entry.id !== id);
    if (nextEntries.length === entries.length) return false;

    await persistEntries(document, nextEntries, key);
    return true;
  }

  async function setRetention(id = '', retention = RETENTION.AUTO) {
    if (!RETENTION_LEVELS.has(retention)) return null;

    const { key, document, timestamp, entries } = await loadLiveEntries();
    if (!entries.some((entry) => entry.id === id)) return null;

    const nextEntries = entries.map((entry) =>
      entry.id === id
        ? { ...entry, retention, expiresAt: resolveExpiresAt(retention, entry.useCount, timestamp) }
        : entry
    );
    const persistedEntries = await persistEntries(document, nextEntries, key);
    return persistedEntries.find((entry) => entry.id === id) || null;
  }

  async function purgeExpiredVault() {
    const document = await readVaultDocument();
    const expiresAt = document?.expiresAt;
    if (typeof expiresAt !== 'number' || expiresAt > now() || !document.emptyCiphertext) return false;

    await writeVaultDocument({ ...document, ciphertext: document.emptyCiphertext, expiresAt: null, updatedAt: now() });
    return true;
  }

  async function purgeExpiredSecrets() {
    const key = await requireUnlockedKey();
    const { document, entries } = await decryptVaultEntries(key);
    const cleanedEntries = pruneEntries(entries);

    if (document) {
      await persistEntries(document, cleanedEntries, key);
    }

    return cleanedEntries;
  }

  globalScope.SplitPassVault = {
    RETENTION,
    SESSION_TTL_MS,
    MIN_MASTER_PASSWORD_LENGTH,
    normalizeDomain,
    resolveEntryTtl,
    hasVault,
    initializeVault,
    isUnlocked,
    lockVault,
    purgeExpiredSecrets,
    purgeExpiredVault,
    removeEntry,
    resetVault,
    revealSecret,
    saveRecentSecret,
    setRetention,
    touchEntry,
    getRecentSecretsForDomain,
    unlockVault,
  };
})(globalThis);
