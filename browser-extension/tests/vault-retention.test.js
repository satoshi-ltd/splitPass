/**
 * @jest-environment node
 */

const DAY_MS = 24 * 60 * 60 * 1000;
const HALF_HOUR_MS = 30 * 60 * 1000;
const START = Date.UTC(2026, 8, 15, 12, 0, 0);
const PASSWORD = 'correct horse battery';
const VAULT_KEY = 'splitpass.browser.vault.v1';
const DOMAIN = 'example.com';

const makeArea = () => {
  const store = new Map();

  return {
    _store: store,
    get: (key) => Promise.resolve({ [key]: store.get(key) }),
    set: (object) => {
      Object.entries(object).forEach(([key, value]) => store.set(key, value));
      return Promise.resolve();
    },
    remove: (key) => {
      store.delete(key);
      return Promise.resolve();
    },
  };
};

const toB64 = (bytes) => {
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return globalThis.btoa(binary);
};

const encryptDocument = async (password, entries) => {
  const encoder = new TextEncoder();
  const salt = globalThis.crypto.getRandomValues(new Uint8Array(16));
  const baseKey = await globalThis.crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, [
    'deriveKey',
  ]);
  const key = await globalThis.crypto.subtle.deriveKey(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 600000 },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(12));
  const data = await globalThis.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(JSON.stringify({ entries }))
  );

  return {
    type: 'splitpass.browser.vault.v1',
    createdAt: 1,
    updatedAt: 1,
    kdf: { algorithm: 'PBKDF2', hash: 'SHA-256', iterations: 600000, salt: toB64(salt) },
    ciphertext: { iv: toB64(iv), data: toB64(new Uint8Array(data)) },
  };
};

let vault;
let local;
let session;
let clock;

beforeEach(() => {
  jest.resetModules();
  clock = START;
  jest.spyOn(Date, 'now').mockImplementation(() => clock);
  local = makeArea();
  session = makeArea();
  globalThis.chrome = { storage: { local, session }, runtime: { id: 'test' } };
  require('../lib/browser-api.js');
  require('../lib/vault.js');
  vault = globalThis.SplitPassVault;
});

afterEach(() => {
  jest.restoreAllMocks();
});

const travelAndUnlock = async (ms) => {
  clock += ms;
  await vault.unlockVault(PASSWORD);
};

describe('resolveEntryTtl', () => {
  it('grows the auto window with use and fixes the manual levels', () => {
    expect(vault.resolveEntryTtl('auto', 1)).toBe(7 * DAY_MS);
    expect(vault.resolveEntryTtl('auto', 2)).toBe(7 * DAY_MS);
    expect(vault.resolveEntryTtl('auto', 3)).toBe(30 * DAY_MS);
    expect(vault.resolveEntryTtl('auto', 9)).toBe(30 * DAY_MS);
    expect(vault.resolveEntryTtl('auto', 10)).toBe(90 * DAY_MS);
    expect(vault.resolveEntryTtl('extended', 1)).toBe(365 * DAY_MS);
    expect(vault.resolveEntryTtl('pinned', 50)).toBeNull();
  });
});

const skipWithoutCrypto = globalThis.crypto?.subtle ? describe : describe.skip;

skipWithoutCrypto('SplitPassVault retention', () => {
  it('starts a new secret at auto retention with a 7-day window', async () => {
    await vault.initializeVault(PASSWORD);

    const entry = await vault.saveRecentSecret(DOMAIN, 'pw', 'alice');

    expect(entry).toMatchObject({
      retention: 'auto',
      useCount: 1,
      createdAt: START,
      lastUsedAt: START,
      expiresAt: START + 7 * DAY_MS,
    });
    expect(local._store.get(VAULT_KEY).expiresAt).toBe(START + 7 * DAY_MS);
  });

  it('renews on use, keeps identity and widens the window from the third use', async () => {
    await vault.initializeVault(PASSWORD);
    const first = await vault.saveRecentSecret(DOMAIN, 'pw', 'alice');

    clock += HALF_HOUR_MS;
    await vault.saveRecentSecret(DOMAIN, 'pw', 'alice');
    clock += HALF_HOUR_MS;
    const third = await vault.touchEntry(first.id);

    expect(third.id).toBe(first.id);
    expect(third.createdAt).toBe(START);
    expect(third.useCount).toBe(3);
    expect(third.lastUsedAt).toBe(clock);
    expect(third.expiresAt).toBe(clock + 30 * DAY_MS);
    expect(await vault.getRecentSecretsForDomain(DOMAIN)).toHaveLength(1);
  });

  it('prunes an auto secret once its window has passed', async () => {
    await vault.initializeVault(PASSWORD);
    await vault.saveRecentSecret(DOMAIN, 'pw', '');

    await travelAndUnlock(8 * DAY_MS);

    expect(await vault.getRecentSecretsForDomain(DOMAIN)).toHaveLength(0);
  });

  it('pins a secret so it survives without an expiry', async () => {
    await vault.initializeVault(PASSWORD);
    const saved = await vault.saveRecentSecret(DOMAIN, 'pw', 'alice');

    const pinned = await vault.setRetention(saved.id, 'pinned');
    expect(pinned).toMatchObject({ retention: 'pinned', expiresAt: null });
    expect(local._store.get(VAULT_KEY).expiresAt).toBeNull();

    await travelAndUnlock(400 * DAY_MS);
    const [entry] = await vault.getRecentSecretsForDomain(DOMAIN);
    expect(entry).toMatchObject({ secret: 'pw', retention: 'pinned', expiresAt: null });
  });

  it('extends a secret to a one-year window and drives the document expiry', async () => {
    await vault.initializeVault(PASSWORD);
    const saved = await vault.saveRecentSecret(DOMAIN, 'pw', '');
    await vault.saveRecentSecret('other.com', 'pw2', '');

    const extended = await vault.setRetention(saved.id, 'extended');

    expect(extended.expiresAt).toBe(START + 365 * DAY_MS);
    expect(local._store.get(VAULT_KEY).expiresAt).toBe(START + 365 * DAY_MS);
  });

  it('lets a rescanned secret inherit its retention level', async () => {
    await vault.initializeVault(PASSWORD);
    const saved = await vault.saveRecentSecret(DOMAIN, 'pw', 'alice');
    await vault.setRetention(saved.id, 'pinned');

    const rescanned = await vault.saveRecentSecret(DOMAIN, 'pw', 'alice');

    expect(rescanned).toMatchObject({ retention: 'pinned', expiresAt: null, useCount: 2 });
  });

  it('rejects unknown levels and missing entries', async () => {
    await vault.initializeVault(PASSWORD);
    const saved = await vault.saveRecentSecret(DOMAIN, 'pw', '');

    expect(await vault.setRetention(saved.id, 'forever')).toBeNull();
    expect(await vault.setRetention('missing-id', 'pinned')).toBeNull();
  });

  it('reveals, touches and removes entries by id', async () => {
    await vault.initializeVault(PASSWORD);
    const saved = await vault.saveRecentSecret(DOMAIN, 'pw', 'alice');

    expect(await vault.revealSecret(saved.id)).toBe('pw');
    expect(await vault.revealSecret('missing-id')).toBeNull();

    clock += HALF_HOUR_MS;
    const touched = await vault.touchEntry(saved.id);
    expect(touched).toMatchObject({ id: saved.id, useCount: 2, lastUsedAt: clock, createdAt: START });
    expect(await vault.touchEntry('missing-id')).toBeNull();

    expect(await vault.removeEntry('missing-id')).toBe(false);
    expect(await vault.removeEntry(saved.id)).toBe(true);
    expect(await vault.getRecentSecretsForDomain(DOMAIN)).toHaveLength(0);
  });

  it('refuses to reveal while locked', async () => {
    await vault.initializeVault(PASSWORD);
    const saved = await vault.saveRecentSecret(DOMAIN, 'pw', '');
    await vault.lockVault();

    await expect(vault.revealSecret(saved.id)).rejects.toMatchObject({ code: 'ERR_VAULT_LOCKED' });
  });

  it('wipes a fully expired vault while locked and keeps the password check', async () => {
    await vault.initializeVault(PASSWORD);
    await vault.saveRecentSecret(DOMAIN, 'pw', '');
    await vault.lockVault();
    const before = local._store.get(VAULT_KEY);

    clock += 8 * DAY_MS;
    expect(await vault.purgeExpiredVault()).toBe(true);

    const after = local._store.get(VAULT_KEY);
    expect(after.ciphertext).toEqual(before.emptyCiphertext);
    expect(after.expiresAt).toBeNull();
    expect(after.kdf).toEqual(before.kdf);

    await expect(vault.unlockVault('wrong password here')).rejects.toMatchObject({ code: 'ERR_VAULT_UNLOCK_FAILED' });
    await expect(vault.unlockVault(PASSWORD)).resolves.toBe(true);
    expect(await vault.getRecentSecretsForDomain(DOMAIN)).toHaveLength(0);
  });

  it('leaves a live or pinned vault alone', async () => {
    await vault.initializeVault(PASSWORD);
    const saved = await vault.saveRecentSecret(DOMAIN, 'pw', '');
    expect(await vault.purgeExpiredVault()).toBe(false);

    await vault.setRetention(saved.id, 'pinned');
    clock += 400 * DAY_MS;
    expect(await vault.purgeExpiredVault()).toBe(false);

    await vault.unlockVault(PASSWORD);
    expect(await vault.getRecentSecretsForDomain(DOMAIN)).toHaveLength(1);
  });

  it('reads legacy entries as auto retention with a single use', async () => {
    local._store.set(
      VAULT_KEY,
      await encryptDocument(PASSWORD, [
        {
          id: 'legacy',
          domain: DOMAIN,
          secret: 'pw',
          username: '',
          createdAt: START - DAY_MS,
          lastUsedAt: START - DAY_MS,
          expiresAt: START + 3 * DAY_MS,
          source: 'popup_scan',
        },
      ])
    );

    expect(await vault.purgeExpiredVault()).toBe(false);
    await vault.unlockVault(PASSWORD);

    const [entry] = await vault.getRecentSecretsForDomain(DOMAIN);
    expect(entry).toMatchObject({ retention: 'auto', useCount: 1, createdAt: START - DAY_MS, expiresAt: START + 3 * DAY_MS });

    const touched = await vault.saveRecentSecret(DOMAIN, 'pw', '');
    expect(touched).toMatchObject({ useCount: 2, createdAt: START - DAY_MS, expiresAt: START + 7 * DAY_MS });
    expect(touched.source).toBeUndefined();
    expect(local._store.get(VAULT_KEY).emptyCiphertext).toBeDefined();
  });
});
