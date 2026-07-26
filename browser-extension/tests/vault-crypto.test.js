/**
 * @jest-environment node
 */

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

let vault;
let local;
let session;

beforeEach(() => {
  jest.resetModules();
  local = makeArea();
  session = makeArea();
  globalThis.chrome = { storage: { local, session }, runtime: { id: 'test' } };
  require('../lib/vault.js');
  vault = globalThis.SplitPassVault;
});

const VAULT_KEY = 'splitpass.browser.vault.v1';
const SESSION_KEY = 'splitpass.browser.session.v1';
const skipWithoutCrypto = globalThis.crypto?.subtle ? describe : describe.skip;

const toB64 = (bytes) => {
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return globalThis.btoa(binary);
};

const buildLegacyVault = async (password, iterations) => {
  const encoder = new TextEncoder();
  const salt = globalThis.crypto.getRandomValues(new Uint8Array(16));
  const baseKey = await globalThis.crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, [
    'deriveKey',
  ]);
  const key = await globalThis.crypto.subtle.deriveKey(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(12));
  const data = await globalThis.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(JSON.stringify({ entries: [] }))
  );

  return {
    type: 'splitpass.browser.vault.v1',
    createdAt: 1,
    updatedAt: 1,
    kdf: { algorithm: 'PBKDF2', hash: 'SHA-256', iterations, salt: toB64(salt) },
    ciphertext: { iv: toB64(iv), data: toB64(new Uint8Array(data)) },
  };
};

skipWithoutCrypto('SplitPassVault crypto', () => {
  it('initializes a new vault at 600k PBKDF2 iterations and unlocked', async () => {
    await vault.initializeVault('correct horse battery');

    expect(await vault.hasVault()).toBe(true);
    expect(await vault.isUnlocked()).toBe(true);
    expect(local._store.get(VAULT_KEY).kdf.iterations).toBe(600000);
  });

  it('writes an absolute session lifetime cap', async () => {
    await vault.initializeVault('correct horse battery');
    const sessionDoc = session._store.get(SESSION_KEY);

    expect(sessionDoc.hardExpiresAt).toBeGreaterThan(sessionDoc.expiresAt - 1);
    expect(sessionDoc.expiresAt).toBeLessThanOrEqual(sessionDoc.hardExpiresAt);
  });

  it('round-trips unlock with the right password and rejects the wrong one', async () => {
    await vault.initializeVault('correct horse battery');
    await vault.lockVault();
    expect(await vault.isUnlocked()).toBe(false);

    await expect(vault.unlockVault('correct horse battery')).resolves.toBe(true);
    expect(await vault.isUnlocked()).toBe(true);

    await vault.lockVault();
    await expect(vault.unlockVault('wrong password here')).rejects.toMatchObject({
      code: 'ERR_VAULT_UNLOCK_FAILED',
    });
  });

  it('keeps saved secrets readable after a lock/unlock cycle', async () => {
    await vault.initializeVault('correct horse battery');
    await vault.saveRecentSecret('myapp.herokuapp.com', 'super-secret', 'popup_scan', 'alice');
    await vault.lockVault();
    await vault.unlockVault('correct horse battery');

    const entries = await vault.getRecentSecretsForDomain('myapp.herokuapp.com');
    expect(entries).toHaveLength(1);
    expect(entries[0].secret).toBe('super-secret');

    const siblingTenant = await vault.getRecentSecretsForDomain('evil.herokuapp.com');
    expect(siblingTenant).toHaveLength(0);
  });

  it('migrates a legacy 250k vault to 600k on unlock without locking the user out', async () => {
    local._store.set(VAULT_KEY, await buildLegacyVault('correct horse battery', 250000));

    await expect(vault.unlockVault('correct horse battery')).resolves.toBe(true);
    expect(local._store.get(VAULT_KEY).kdf.iterations).toBe(600000);

    await vault.lockVault();
    await expect(vault.unlockVault('correct horse battery')).resolves.toBe(true);
  });
});
