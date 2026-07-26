(function attachSplitPassVault(globalScope) {
  const VAULT_STORAGE_KEY = 'splitpass.browser.vault.v1';
  const SESSION_STORAGE_KEY = 'splitpass.browser.session.v1';
  const VAULT_TYPE = 'splitpass.browser.vault.v1';
  const SESSION_TYPE = 'splitpass.browser.session.v1';
  const ENTRY_TTL_MS = 7 * 24 * 60 * 60 * 1000;
  const SESSION_TTL_MS = 60 * 60 * 1000;
  const MAX_SESSION_TTL_MS = 8 * 60 * 60 * 1000;
  const MIN_MASTER_PASSWORD_LENGTH = 8;
  const PBKDF2_ITERATIONS = 600000;
  const PBKDF2_ITERATIONS_LEGACY = 250000;
  const textEncoder = new TextEncoder();
  const textDecoder = new TextDecoder();
  const browserApi = globalScope.browser || globalScope.chrome || {};

  function getStorageArea(name) {
    return browserApi?.storage?.[name] || null;
  }

  async function callStorage(area, method, payload) {
    if (!area || typeof area[method] !== 'function') {
      throw new Error('Browser storage is not available.');
    }

    try {
      const maybePromise = area[method](payload);
      if (maybePromise && typeof maybePromise.then === 'function') {
        return await maybePromise;
      }
    } catch (error) {
      if (!String(error?.message || '').includes('No matching signature')) {
        throw error;
      }
    }

    return await new Promise((resolve, reject) => {
      area[method](payload, (result) => {
        const runtimeError = browserApi?.runtime?.lastError;
        if (runtimeError) {
          reject(new Error(runtimeError.message));
          return;
        }
        resolve(result);
      });
    });
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

  function extractRegistrableDomain(hostname) {
    const labels = hostname.split('.').filter(Boolean);
    if (labels.length <= 2) return labels.join('.');

    let suffixLabels = 1;
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

  function pruneEntries(entries = [], timestamp = now()) {
    const validEntries = Array.isArray(entries)
      ? entries
          .filter((entry) => entry && typeof entry === 'object')
          .filter((entry) => typeof entry.domain === 'string' && typeof entry.secret === 'string')
          .filter((entry) => Number(entry.expiresAt) > timestamp)
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

        newestByFingerprint.set(fingerprint, {
          id: String(entry.id || createEntryId()),
          domain,
          secret,
          username,
          createdAt: Number(entry.createdAt || timestamp),
          lastUsedAt: Number(entry.lastUsedAt || entry.createdAt || timestamp),
          expiresAt: Number(entry.expiresAt || timestamp + ENTRY_TTL_MS),
          source: String(entry.source || 'popup_scan'),
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

    await writeVaultDocument({
      type: VAULT_TYPE,
      createdAt: Number(document?.createdAt || timestamp),
      updatedAt: timestamp,
      kdf: {
        algorithm: 'PBKDF2',
        hash: 'SHA-256',
        iterations: Number(document?.kdf?.iterations) || PBKDF2_ITERATIONS,
        salt: String(document?.kdf?.salt || ''),
      },
      ciphertext,
    });

    return payload.entries;
  }

  async function initializeVault(masterPassword = '') {
    ensureCrypto();

    const timestamp = now();
    const saltBytes = globalScope.crypto.getRandomValues(new Uint8Array(16));
    const key = await deriveVaultKey(masterPassword, saltBytes);
    const document = {
      type: VAULT_TYPE,
      createdAt: timestamp,
      updatedAt: timestamp,
      kdf: {
        algorithm: 'PBKDF2',
        hash: 'SHA-256',
        iterations: PBKDF2_ITERATIONS,
        salt: encodeBase64(saltBytes),
      },
      ciphertext: await encryptPayload({ entries: [] }, key),
    };

    await writeVaultDocument(document);
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

  async function saveRecentSecret(domain = '', secret = '', source = 'popup_scan', username = '') {
    const normalizedDomain = normalizeDomain(domain);
    const normalizedSecret = sanitizeSecret(secret);
    const normalizedUsername = sanitizeUsername(username);
    if (!normalizedDomain || !normalizedSecret) return null;

    const key = await requireUnlockedKey();
    const { document, entries } = await decryptVaultEntries(key);
    const timestamp = now();
    const fingerprint = buildEntryFingerprint(normalizedDomain, normalizedSecret, normalizedUsername);
    const nextEntries = pruneEntries(entries, timestamp).filter(
      (entry) => buildEntryFingerprint(entry.domain, entry.secret, entry.username) !== fingerprint
    );

    nextEntries.unshift({
      id: createEntryId(),
      domain: normalizedDomain,
      secret: normalizedSecret,
      username: normalizedUsername,
      createdAt: timestamp,
      lastUsedAt: timestamp,
      expiresAt: timestamp + ENTRY_TTL_MS,
      source: String(source || 'popup_scan'),
    });

    const persistedEntries = await persistEntries(document, nextEntries, key);
    return persistedEntries.find((entry) => buildEntryFingerprint(entry.domain, entry.secret, entry.username) === fingerprint) || null;
  }

  async function removeRecentSecret(domain = '', secret = '', username = '') {
    const normalizedDomain = normalizeDomain(domain);
    const normalizedSecret = sanitizeSecret(secret);
    const normalizedUsername = sanitizeUsername(username);
    if (!normalizedDomain || !normalizedSecret) return false;

    const key = await requireUnlockedKey();
    const { document, entries } = await decryptVaultEntries(key);
    const fingerprint = buildEntryFingerprint(normalizedDomain, normalizedSecret, normalizedUsername);
    const nextEntries = pruneEntries(entries).filter(
      (entry) => buildEntryFingerprint(entry.domain, entry.secret, entry.username) !== fingerprint
    );

    if (nextEntries.length === entries.length) {
      return false;
    }

    await persistEntries(document, nextEntries, key);
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
    ENTRY_TTL_MS,
    SESSION_TTL_MS,
    MIN_MASTER_PASSWORD_LENGTH,
    normalizeDomain,
    hasVault,
    initializeVault,
    isUnlocked,
    lockVault,
    purgeExpiredSecrets,
    removeRecentSecret,
    resetVault,
    saveRecentSecret,
    getRecentSecretsForDomain,
    unlockVault,
  };
})(globalThis);
