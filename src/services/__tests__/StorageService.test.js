/* global Uint8Array */
jest.mock('expo-crypto');
jest.mock('react-native-argon2');
jest.mock('../../modules', () => require('../../modules/persistenceCrypto'));

import { AESEncryptionKey, aesEncryptAsync, CryptoDigestAlgorithm, digest, getRandomBytes } from 'expo-crypto';

import { DEFAULTS } from '../../contexts/store.constants';
import { LEGACY_STORE_FORMAT, STORE_FORMAT } from '../../modules/persistenceCrypto';
import { StorageService } from '../StorageService';

let storage = {};
const PASSPHRASE_CASES = [
  ['numeric', '12345678'],
  ['generated-style', 'S7!k2#Lm9$Qa'],
  ['seed-phrase', 'abandon ability able about above absent absorb abstract absurd abuse access accident'],
];

class MemoryAdapter {
  constructor({ defaults = {}, filename = 'store' } = {}) {
    this.key = filename;

    if (!storage[this.key]) storage[this.key] = JSON.stringify(defaults);
  }

  async read() {
    return JSON.parse(storage[this.key]);
  }

  async write(data = {}) {
    storage[this.key] = JSON.stringify(data);
  }

  async wipe() {
    delete storage[this.key];
  }
}

const KEY_LENGTH = 32;
const LEGACY_ROUNDS = 10000;
const TEXT_ENCODER = new TextEncoder();

const concatBytes = (...parts) => {
  const length = parts.reduce((total, part = new Uint8Array()) => total + part.length, 0);
  const joined = new Uint8Array(length);
  let offset = 0;

  parts.forEach((part = new Uint8Array()) => {
    joined.set(part, offset);
    offset += part.length;
  });

  return joined;
};

const toHex = (bytes = new Uint8Array()) => Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
const toBase64 = (bytes = new Uint8Array()) => Buffer.from(bytes).toString('base64');
const encodeJson = (value = {}) => TEXT_ENCODER.encode(JSON.stringify(value));

const deriveLegacyKey = async (passphrase = '', salt = getRandomBytes(16)) => {
  let output = concatBytes(salt, TEXT_ENCODER.encode(`${passphrase}`));

  for (let round = 0; round < LEGACY_ROUNDS; round += 1) {
    output = new Uint8Array(await digest(CryptoDigestAlgorithm.SHA256, concatBytes(output, salt)));
  }

  return { keyBytes: output.slice(0, KEY_LENGTH), salt };
};

const sealLegacyParts = async (bytes = new Uint8Array(), keyBytes = new Uint8Array()) => {
  const key = await AESEncryptionKey.import(keyBytes);
  const sealed = await aesEncryptAsync(toBase64(bytes), key);

  return {
    ciphertext: toBase64(await sealed.ciphertext({ includeTag: true })),
    iv: toBase64(await sealed.iv()),
    tagLength: sealed.tagSize,
  };
};

const sealLegacyCombined = async (bytes = new Uint8Array(), keyBytes = new Uint8Array()) => {
  const key = await AESEncryptionKey.import(keyBytes);
  const sealed = await aesEncryptAsync(toBase64(bytes), key);

  return toBase64(await sealed.combined());
};

const createLegacyEnvelope = async (payload = {}, passphrase = '', format = STORE_FORMAT) => {
  const { keyBytes, salt } = await deriveLegacyKey(passphrase);

  if (format === LEGACY_STORE_FORMAT) {
    const dataKey = getRandomBytes(KEY_LENGTH);

    return {
      ciphertext: await sealLegacyCombined(encodeJson(payload), dataKey),
      kdf: {
        algorithm: 'sha256-iterative',
        rounds: LEGACY_ROUNDS,
        salt: toHex(salt),
      },
      type: LEGACY_STORE_FORMAT,
      wrappedKey: await sealLegacyCombined(dataKey, keyBytes),
    };
  }

  return {
    ciphertext: await sealLegacyParts(encodeJson(payload), keyBytes),
    kdf: {
      algorithm: 'sha256-iterative',
      rounds: LEGACY_ROUNDS,
      salt: toHex(salt),
    },
    type: STORE_FORMAT,
  };
};

describe('StorageService secure lifecycle', () => {
  beforeEach(() => {
    storage = {};
  });

  it.each(PASSPHRASE_CASES)('supports signup and signin with a %s master passphrase', async (label, passphrase) => {
    const filename = `signup-${label.replace(/[^a-z0-9]+/gi, '-')}`;
    const store = await new StorageService({ adapter: MemoryAdapter, defaults: DEFAULTS, filename });

    await store.initializeSecurity(passphrase, {
      secrets: [],
      settings: { ...DEFAULTS.settings },
    });
    await store.get('settings').save({ ...DEFAULTS.settings, onboarded: true });
    await store.get('secrets').save({ hash: 'secret:1', name: 'Email', value: 'demo-passphrase' });

    const rebootedStore = await new StorageService({
      adapter: MemoryAdapter,
      defaults: DEFAULTS,
      filename,
    });
    const unlocked = await rebootedStore.unlock(passphrase);

    expect(unlocked.settings.onboarded).toBe(true);
    expect(unlocked.secrets).toEqual([{ hash: 'secret:1', name: 'Email', value: 'demo-passphrase' }]);
    expect(storage[filename]).not.toContain('demo-passphrase');
    expect(storage[filename]).not.toContain(passphrase);
  });

  it.each(PASSPHRASE_CASES)(
    'keeps batch secret saves readable after restart with a %s master passphrase',
    async (label, passphrase) => {
      const filename = `batch-${label.replace(/[^a-z0-9]+/gi, '-')}`;
      const store = await new StorageService({ adapter: MemoryAdapter, defaults: DEFAULTS, filename });

      await store.initializeSecurity(passphrase, {
        secrets: [],
        settings: { ...DEFAULTS.settings, onboarded: true },
      });
      await store.get('secrets').save([
        { hash: 'secret:1', name: 'Gmail', value: 'gmail-2026!' },
        { hash: 'secret:2', name: 'GitHub', value: 'github-2026!' },
      ]);

      const rebootedStore = await new StorageService({
        adapter: MemoryAdapter,
        defaults: DEFAULTS,
        filename,
      });
      const unlocked = await rebootedStore.unlock(passphrase);

      expect(unlocked.secrets).toHaveLength(2);
      expect(unlocked.secrets.map(({ name }) => name)).toEqual(['Gmail', 'GitHub']);
    },
  );

  it.each(PASSPHRASE_CASES)(
    'exports encrypted backups and requires the same %s master passphrase to import',
    async (label, passphrase) => {
      const sourceStore = await new StorageService({
        adapter: MemoryAdapter,
        defaults: DEFAULTS,
        filename: `export-source-${label.replace(/[^a-z0-9]+/gi, '-')}`,
      });

      await sourceStore.initializeSecurity(passphrase, {
        secrets: [],
        settings: { ...DEFAULTS.settings, onboarded: true },
      });
      await sourceStore.get('secrets').save([
        { hash: 'secret:1', name: 'Wallet', value: 'wallet-2026!' },
        {
          account: 'satoshi',
          algorithm: 'SHA1',
          digits: 6,
          hash: 'secret:2',
          issuer: 'GitHub',
          kind: 'totp',
          name: 'GitHub 2FA',
          period: 30,
          value: 'otpauth://totp/GitHub:satoshi?secret=JBSWY3DPEHPK3PXP&issuer=GitHub',
        },
      ]);

      const backup = await sourceStore.exportBackup();

      expect(backup.v).toBe(3);
      expect(backup.type).toBeUndefined();
      expect(JSON.stringify(backup)).not.toContain('wallet-2026!');
      expect(JSON.stringify(backup)).not.toContain('splitpass');
      await expect(sourceStore.decryptBackup(backup, 'wrong-passphrase')).rejects.toThrow(
        'Unable to unlock encrypted payload.',
      );

      const targetStore = await new StorageService({
        adapter: MemoryAdapter,
        defaults: DEFAULTS,
        filename: `export-target-${label.replace(/[^a-z0-9]+/gi, '-')}`,
      });
      await targetStore.initializeSecurity(passphrase, {
        secrets: [],
        settings: { ...DEFAULTS.settings, onboarded: true },
      });

      const decryptedBackup = await targetStore.decryptBackup(backup, passphrase);
      await targetStore.replaceAll(decryptedBackup, passphrase);

      const rebootedTargetStore = await new StorageService({
        adapter: MemoryAdapter,
        defaults: DEFAULTS,
        filename: `export-target-${label.replace(/[^a-z0-9]+/gi, '-')}`,
      });
      const unlocked = await rebootedTargetStore.unlock(passphrase);

      expect(unlocked.secrets).toEqual([
        { hash: 'secret:1', name: 'Wallet', value: 'wallet-2026!' },
        {
          account: 'satoshi',
          algorithm: 'SHA1',
          digits: 6,
          hash: 'secret:2',
          issuer: 'GitHub',
          kind: 'totp',
          name: 'GitHub 2FA',
          period: 30,
          value: 'otpauth://totp/GitHub:satoshi?secret=JBSWY3DPEHPK3PXP&issuer=GitHub',
        },
      ]);
    },
  );

  it('exports a backup encrypted with a custom key distinct from the master passphrase', async () => {
    const masterPassphrase = 'master-pass-2026';
    const exportPassphrase = 'export-only-key-2026';
    const filename = 'export-custom-key';
    const store = await new StorageService({ adapter: MemoryAdapter, defaults: DEFAULTS, filename });

    await store.initializeSecurity(masterPassphrase, {
      secrets: [],
      settings: { ...DEFAULTS.settings, onboarded: true },
    });
    await store.get('secrets').save({ hash: 'secret:1', name: 'Wallet', value: 'wallet-2026!' });

    const backup = await store.exportBackup(exportPassphrase);

    expect(backup.v).toBe(3);
    expect(JSON.stringify(backup)).not.toContain('wallet-2026!');
    await expect(store.decryptBackup(backup, masterPassphrase)).rejects.toThrow('Unable to unlock encrypted payload.');

    const decrypted = await store.decryptBackup(backup, exportPassphrase);

    expect(decrypted.secrets).toEqual([{ hash: 'secret:1', name: 'Wallet', value: 'wallet-2026!' }]);
  });

  it('exports with the master passphrase when no custom key is provided', async () => {
    const passphrase = 'master-pass-2026';
    const filename = 'export-default-key';
    const store = await new StorageService({ adapter: MemoryAdapter, defaults: DEFAULTS, filename });

    await store.initializeSecurity(passphrase, {
      secrets: [],
      settings: { ...DEFAULTS.settings, onboarded: true },
    });
    await store.get('secrets').save({ hash: 'secret:1', name: 'Wallet', value: 'wallet-2026!' });

    const backup = await store.exportBackup();
    const decrypted = await store.decryptBackup(backup, passphrase);

    expect(decrypted.secrets).toEqual([{ hash: 'secret:1', name: 'Wallet', value: 'wallet-2026!' }]);
  });

  it('unlocks a v2 vault and rewrites it to the current encrypted envelope', async () => {
    const filename = 'legacy-v2-store';
    const payload = {
      secrets: [{ hash: 'legacy:1', name: 'Legacy', value: 'legacy-passphrase' }],
      settings: { ...DEFAULTS.settings, onboarded: true },
    };

    storage[filename] = JSON.stringify(await createLegacyEnvelope(payload, PASSPHRASE_CASES[1][1], STORE_FORMAT));

    const store = await new StorageService({ adapter: MemoryAdapter, defaults: DEFAULTS, filename });
    const unlocked = await store.unlock(PASSPHRASE_CASES[1][1]);
    const persisted = JSON.parse(storage[filename]);

    expect(unlocked.secrets).toEqual(payload.secrets);
    expect(store.lastUnlockMigrated).toBe(true);
    expect(persisted.v).toBe(3);
    expect(persisted.type).toBeUndefined();
  });

  it('stays locked when the vault is locked while a save is still writing', async () => {
    const filename = 'lock-during-persist';
    const store = await new StorageService({ adapter: MemoryAdapter, defaults: DEFAULTS, filename });

    await store.initializeSecurity(PASSPHRASE_CASES[0][1], { secrets: [], settings: { ...DEFAULTS.settings } });

    const pendingSave = store.get('secrets').save({ hash: 'secret:1', name: 'Email', value: 'demo-passphrase' });
    store.lock();
    await pendingSave;

    expect(store.sessionPassphrase).toBeUndefined();
    expect(store.security.unlocked).toBe(false);
    expect(store.value).toBeUndefined();
  });

  it('stays locked when the vault is locked while replaceAll is still writing', async () => {
    const filename = 'lock-during-replace';
    const store = await new StorageService({ adapter: MemoryAdapter, defaults: DEFAULTS, filename });

    await store.initializeSecurity(PASSPHRASE_CASES[0][1], { secrets: [], settings: { ...DEFAULTS.settings } });

    const pendingReplace = store.replaceAll(
      { secrets: [{ hash: 'secret:9', name: 'Imported', value: 'imported-2026!' }], settings: DEFAULTS.settings },
      PASSPHRASE_CASES[0][1],
    );
    store.lock();
    await pendingReplace;

    expect(store.sessionPassphrase).toBeUndefined();
    expect(store.security.unlocked).toBe(false);
  });

  it('unlocks a v1 vault and rewrites it to the current encrypted envelope', async () => {
    const filename = 'legacy-v1-store';
    const payload = {
      secrets: [{ hash: 'legacy:2', name: 'Cold wallet', value: 'seed-protected' }],
      settings: { ...DEFAULTS.settings, onboarded: true },
    };

    storage[filename] = JSON.stringify(
      await createLegacyEnvelope(payload, PASSPHRASE_CASES[0][1], LEGACY_STORE_FORMAT),
    );

    const store = await new StorageService({ adapter: MemoryAdapter, defaults: DEFAULTS, filename });
    const unlocked = await store.unlock(PASSPHRASE_CASES[0][1]);
    const persisted = JSON.parse(storage[filename]);

    expect(unlocked.secrets).toEqual(payload.secrets);
    expect(store.lastUnlockMigrated).toBe(true);
    expect(persisted.v).toBe(3);
    expect(persisted.type).toBeUndefined();
  });
});
