jest.mock('expo-crypto');
jest.mock('../../modules', () => require('../../modules/persistenceCrypto'));

import { DEFAULTS } from '../../contexts/store.constants';
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
      await sourceStore.get('secrets').save({ hash: 'secret:1', name: 'Wallet', value: 'wallet-2026!' });

      const backup = await sourceStore.exportBackup();

      expect(backup.type).toBe('splitpass.encrypted.v2');
      expect(JSON.stringify(backup)).not.toContain('wallet-2026!');
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

      expect(unlocked.secrets).toEqual([{ hash: 'secret:1', name: 'Wallet', value: 'wallet-2026!' }]);
    },
  );
});
