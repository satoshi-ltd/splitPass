jest.mock('react-native', () => ({ Platform: { OS: 'android' } }));
jest.mock('../../modules', () => ({
  L10N: {
    NFC_ACCESS_ERROR: 'NFC access error',
    NFC_CARD_IS_FULL: 'Card is full',
    NFC_INVALID_ORIGIN_CARD: 'Wrong card',
    NFC_NOT_SUPPORTED: 'NFC not supported',
  },
}));

const TEXT_TYPE = { toString: () => '84' };

const toRecord = (text) => ({ payload: text, type: TEXT_TYPE });

const mockNfcManager = {
  isSupported: jest.fn(async () => true),
  start: jest.fn(),
  requestTechnology: jest.fn(async () => true),
  getTag: jest.fn(),
  cancelTechnologyRequest: jest.fn(),
  ndefHandler: {
    getNdefMessage: jest.fn(),
    writeNdefMessage: jest.fn(async () => true),
  },
};

const mockNdef = {
  encodeMessage: jest.fn((records) => ({ encoded: records, length: 32 })),
  textRecord: jest.fn((text) => ({ text })),
  text: { decodePayload: jest.fn((payload) => payload) },
};

jest.mock('react-native-nfc-manager', () => ({
  __esModule: true,
  default: mockNfcManager,
  Ndef: mockNdef,
  NfcEvents: {},
  NfcTech: { Ndef: 'Ndef' },
}));

import { NFCService } from '../NFCService';

const TAG_ID = 'tag-1';
const GMAIL = 'Gmail|1234|satoshi|work login';
const GITHUB = 'GitHub|5678';

const givenCard = (records = [GMAIL, GITHUB]) => {
  const ndefMessage = records.map(toRecord);
  mockNfcManager.getTag.mockResolvedValue({ id: TAG_ID, ndefMessage });
  mockNfcManager.ndefHandler.getNdefMessage.mockResolvedValue(ndefMessage);

  return ndefMessage;
};

describe('NFCService.remove', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNfcManager.isSupported.mockResolvedValue(true);
    mockNfcManager.requestTechnology.mockResolvedValue(true);
    mockNfcManager.ndefHandler.writeNdefMessage.mockResolvedValue(true);
    mockNdef.encodeMessage.mockImplementation((records) => ({ encoded: records, length: 32 }));
  });

  it('removes a record that carries notes when the notes are passed', async () => {
    givenCard();

    const { records } = await NFCService.remove('1234', 'Gmail', TAG_ID, 'satoshi', 'work login');

    expect(records.map(({ name }) => name)).toEqual(['GitHub']);
  });

  it('leaves the record untouched when the notes are dropped from the query', async () => {
    givenCard();

    const { records } = await NFCService.remove('1234', 'Gmail', TAG_ID, 'satoshi');

    expect(records.map(({ name }) => name)).toEqual(['Gmail', 'GitHub']);
  });

  it('rejects a card that is not the one the secret came from', async () => {
    givenCard();

    await expect(NFCService.remove('1234', 'Gmail', 'another-tag', 'satoshi', 'work login')).rejects.toBe('Wrong card');
    expect(mockNfcManager.ndefHandler.writeNdefMessage).not.toHaveBeenCalled();
  });

  it('rolls back with encoded bytes rather than the raw records it read', async () => {
    const backup = givenCard();
    mockNfcManager.ndefHandler.writeNdefMessage.mockRejectedValueOnce(new Error('tag lost'));

    await expect(NFCService.remove('1234', 'Gmail', TAG_ID, 'satoshi', 'work login')).rejects.toBe('NFC access error');

    const [rolledBack] = mockNfcManager.ndefHandler.writeNdefMessage.mock.calls[1];
    expect(mockNdef.encodeMessage).toHaveBeenCalledWith(backup);
    expect(rolledBack).toEqual({ encoded: backup, length: 32 });
  });

  it('reports the original failure even when the rollback itself fails', async () => {
    givenCard();
    mockNfcManager.ndefHandler.writeNdefMessage
      .mockRejectedValueOnce(new Error('tag lost'))
      .mockRejectedValueOnce(new Error('tag gone'));

    await expect(NFCService.remove('1234', 'Gmail', TAG_ID, 'satoshi', 'work login')).rejects.toBe('NFC access error');
  });

  it('does not roll back when the card was rejected before anything was written', async () => {
    givenCard();

    await expect(NFCService.remove('1234', 'Gmail', 'another-tag', 'satoshi')).rejects.toBe('Wrong card');
    expect(mockNfcManager.ndefHandler.writeNdefMessage).not.toHaveBeenCalled();
  });

  it('always releases the technology request', async () => {
    givenCard();

    await NFCService.remove('1234', 'Gmail', TAG_ID, 'satoshi', 'work login');

    expect(mockNfcManager.cancelTechnologyRequest).toHaveBeenCalled();
  });
});

describe('NFCService.write', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNfcManager.isSupported.mockResolvedValue(true);
    mockNfcManager.requestTechnology.mockResolvedValue(true);
    mockNfcManager.ndefHandler.writeNdefMessage.mockResolvedValue(true);
    mockNdef.encodeMessage.mockImplementation((records) => ({ encoded: records, length: 32 }));
  });

  it('appends a record and keeps the existing ones', async () => {
    givenCard();

    const { records } = await NFCService.write('9999', 'Stripe', 'satoshi', 'billing');

    expect(records.map(({ name }) => name)).toEqual(['Gmail', 'GitHub', 'Stripe']);
  });

  it('rolls back with encoded bytes when the write fails', async () => {
    const backup = givenCard();
    mockNfcManager.ndefHandler.writeNdefMessage.mockRejectedValueOnce(new Error('tag lost'));

    await expect(NFCService.write('9999', 'Stripe', 'satoshi', 'billing')).rejects.toBe('NFC access error');

    const [rolledBack] = mockNfcManager.ndefHandler.writeNdefMessage.mock.calls[1];
    expect(rolledBack).toEqual({ encoded: backup, length: 32 });
  });

  it('refuses to write past the tag capacity without rolling back', async () => {
    givenCard();
    mockNdef.encodeMessage.mockImplementation((records) => ({ encoded: records, length: 5000 }));

    await expect(NFCService.write('9999', 'Stripe', 'satoshi', 'billing')).rejects.toEqual({ error: 'Card is full' });
    expect(mockNfcManager.ndefHandler.writeNdefMessage).not.toHaveBeenCalled();
  });
});
