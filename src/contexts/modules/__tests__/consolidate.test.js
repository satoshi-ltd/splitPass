jest.mock('../../../modules', () => {
  const { findVault } = jest.requireActual('../../../modules/findVault');
  return { findVault };
});

import { consolidate } from '../consolidate';

const makeSecret = (overrides = {}) => ({
  name: 'gmail',
  value: '1abc',
  createdAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
});

describe('consolidate', () => {
  it('returns an empty secrets array when called with no arguments', () => {
    const result = consolidate();
    expect(result.secrets).toEqual([]);
  });

  it('converts createdAt strings to Date instances', () => {
    const result = consolidate({ secrets: [makeSecret()] });
    expect(result.secrets[0].createdAt).toBeInstanceOf(Date);
  });

  it('converts readAt strings to Date instances when present', () => {
    const result = consolidate({
      secrets: [makeSecret({ readAt: '2024-06-15T12:00:00.000Z' })],
    });
    expect(result.secrets[0].readAt).toBeInstanceOf(Date);
  });

  it('keeps readAt as undefined when absent', () => {
    const result = consolidate({ secrets: [makeSecret()] });
    expect(result.secrets[0].readAt).toBeUndefined();
  });

  it('strips createdAt and readAt from the raw object (those props come from Date conversion)', () => {
    const result = consolidate({ secrets: [makeSecret({ readAt: '2024-06-15T12:00:00.000Z' })] });
    const secret = result.secrets[0];
    expect(secret.createdAt).toBeInstanceOf(Date);
    expect(secret.readAt).toBeInstanceOf(Date);
  });

  it('assigns a vault based on the secret name', () => {
    const result = consolidate({ secrets: [makeSecret({ name: 'gmail' })] });
    expect(result.secrets[0].vault).toBe('Account');
  });

  it('assigns the Finance vault for finance-related names', () => {
    const result = consolidate({ secrets: [makeSecret({ name: 'Bitcoin wallet' })] });
    expect(result.secrets[0].vault).toBe('Finance');
  });

  it('assigns "others" for unrecognised names', () => {
    const result = consolidate({ secrets: [makeSecret({ name: 'my secret note' })] });
    expect(result.secrets[0].vault).toBe('others');
  });

  it('passes settings and other top-level properties through unchanged', () => {
    const settings = { theme: 'dark' };
    const result = consolidate({ secrets: [], settings, extra: 'data' });
    expect(result.settings).toBe(settings);
    expect(result.extra).toBe('data');
  });

  it('processes multiple secrets correctly', () => {
    const result = consolidate({
      secrets: [makeSecret({ name: 'gmail' }), makeSecret({ name: 'Bitcoin wallet' }), makeSecret({ name: 'notes' })],
    });
    expect(result.secrets[0].vault).toBe('Account');
    expect(result.secrets[1].vault).toBe('Finance');
    expect(result.secrets[2].vault).toBe('others');
  });
});
