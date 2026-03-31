jest.mock('expo-crypto');

import { createEncryptedEnvelope, decryptEncryptedEnvelope, isEncryptedEnvelope } from '../persistenceCrypto';

describe('persistenceCrypto', () => {
  const PASSPHRASE = 'correct horse battery staple';
  const PAYLOAD = {
    secrets: [{ hash: '1', name: 'Email', value: '12345' }],
    settings: { language: 'es', theme: 'dark' },
  };

  it('encrypts and decrypts a store payload', async () => {
    const envelope = await createEncryptedEnvelope(PAYLOAD, PASSPHRASE);

    expect(isEncryptedEnvelope(envelope)).toBe(true);
    expect(JSON.stringify(envelope)).not.toContain('Email');

    await expect(decryptEncryptedEnvelope(envelope, PASSPHRASE)).resolves.toEqual(PAYLOAD);
  });

  it('rejects the wrong passphrase', async () => {
    const envelope = await createEncryptedEnvelope(PAYLOAD, PASSPHRASE);

    await expect(decryptEncryptedEnvelope(envelope, 'bad-passphrase')).rejects.toThrow(
      'Unable to unlock encrypted payload.',
    );
  });
});
