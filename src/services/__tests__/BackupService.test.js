jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn(async () => ({ assets: [], canceled: true })),
}));
jest.mock('expo-file-system/legacy', () => ({
  deleteAsync: jest.fn(async () => true),
  documentDirectory: 'file:///vault/',
  readAsStringAsync: jest.fn(async () => '{}'),
  writeAsStringAsync: jest.fn(async () => true),
}));
jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(async () => true),
  shareAsync: jest.fn(async () => true),
}));
jest.mock('../../modules', () => ({
  suspendAutoLock: jest.fn(),
  resumeAutoLock: jest.fn(),
  L10N: {
    ERROR: 'Error',
    ERROR_EXPORT: 'Could not export your data.',
    ERROR_IMPORT: 'Unsupported file format. Select a compatible file.',
  },
  isEncryptedEnvelope: (value = {}) =>
    !!value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    ((value.v === 3 && value.k && value.n && value.w && value.c) ||
      value.type === 'splitpass.encrypted.v1' ||
      value.type === 'splitpass.encrypted.v2'),
}));

import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

import { BackupService, getBackupFileName } from '../BackupService';

describe('BackupService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(global.Math, 'random').mockReturnValue(0.123456789);
  });

  afterEach(() => {
    Math.random.mockRestore();
  });

  it('builds an opaque archive filename', () => {
    const fileName = getBackupFileName();

    expect(fileName).toMatch(/^archive-\d{8}T\d{6}Z-[a-z0-9]{6}\.dat$/);
    expect(fileName).not.toContain('splitpass');
    expect(fileName).not.toContain('backup');
  });

  it('exports encrypted data as an opaque archive', async () => {
    const store = {
      exportBackup: jest.fn(async () => ({ c: 'cipher', k: { a: 'argon2id' }, n: 'nonce', v: 3, w: 'wrapped' })),
    };

    const result = await BackupService.export({ store });

    expect(result).toBe(true);
    expect(FileSystem.writeAsStringAsync).toHaveBeenCalledWith(
      expect.stringMatching(/archive-\d{8}T\d{6}Z-[a-z0-9]{6}\.dat$/),
      expect.any(String),
    );
    expect(Sharing.shareAsync).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ mimeType: 'application/octet-stream' }),
    );
    expect(JSON.stringify(FileSystem.writeAsStringAsync.mock.calls[0][1])).not.toContain('splitpass');
  });

  it('forwards a custom passphrase to the store when exporting', async () => {
    const store = {
      exportBackup: jest.fn(async () => ({ c: 'cipher', k: { a: 'argon2id' }, n: 'nonce', v: 3, w: 'wrapped' })),
    };

    await BackupService.export({ store, passphrase: 'export-only-key' });

    expect(store.exportBackup).toHaveBeenCalledWith('export-only-key');
  });

  it('accepts any file type and recognizes opaque encrypted archives', async () => {
    DocumentPicker.getDocumentAsync.mockResolvedValue({
      assets: [{ uri: 'file:///vault/archive.dat' }],
      canceled: false,
    });
    FileSystem.readAsStringAsync.mockResolvedValue(
      JSON.stringify({ c: 'cipher', k: { a: 'argon2id' }, n: 'nonce', v: 3, w: 'wrapped' }),
    );

    const result = await BackupService.import();

    expect(DocumentPicker.getDocumentAsync).toHaveBeenCalledWith(
      expect.objectContaining({ copyToCacheDirectory: true, multiple: false, type: '*/*' }),
    );
    expect(result).toEqual({
      format: 'encrypted',
      payload: { c: 'cipher', k: { a: 'argon2id' }, n: 'nonce', v: 3, w: 'wrapped' },
    });
  });

  it.each([
    ['an unrelated object', { name: 'invoice', total: 42 }],
    ['an empty object', {}],
    ['a bare array', [{ hash: 'secret:1' }]],
    ['a scalar', 12],
  ])('rejects %s instead of importing it as an empty vault', async (_label, contents) => {
    DocumentPicker.getDocumentAsync.mockResolvedValue({
      assets: [{ uri: 'file:///vault/whatever.json' }],
      canceled: false,
    });
    FileSystem.readAsStringAsync.mockResolvedValue(JSON.stringify(contents));

    await expect(BackupService.import()).rejects.toBe('Unsupported file format. Select a compatible file.');
  });

  it('still accepts a legacy store that carries secrets or settings', async () => {
    DocumentPicker.getDocumentAsync.mockResolvedValue({
      assets: [{ uri: 'file:///vault/legacy.json' }],
      canceled: false,
    });
    FileSystem.readAsStringAsync.mockResolvedValue(JSON.stringify({ secrets: [{ hash: 'secret:1' }] }));

    await expect(BackupService.import()).resolves.toEqual({
      format: 'legacy',
      payload: { secrets: [{ hash: 'secret:1' }], settings: {} },
    });
  });
});
