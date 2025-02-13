import { L10N } from '../modules';

const NTAG_TYPES = {
  15: { type: 'NTAG213', totalMemory: 144 },
  17: { type: 'NTAG215', totalMemory: 504 },
  18: { type: 'NTAG216', totalMemory: 888 },
};

export const NFCService = {
  // -- private
  instance: async () => {
    const { default: NfcManager, Ndef, NfcEvents, NfcTech } = require('react-native-nfc-manager');

    const supported = await NfcManager.isSupported();
    if (!supported) throw new Error(L10N.NFC_NOT_SUPPORTED);

    NfcManager.start();

    return { Ndef, NfcEvents, NfcManager, NfcTech };
  },

  filterRecords: ({ ndefMessage = [] } = {}, Ndef) =>
    ndefMessage
      .filter((record) => record.type.toString() === '84')
      .map((record) => Ndef.text.decodePayload(record.payload))
      .filter((record) => /\|\d+$/.test(record)),

  response: (records = [], tag, bytes, { totalMemory } = {}) => ({
    records: records.map((record) => {
      const [name, value] = record.split('|');
      return { name, value };
    }),
    info: { id: tag.id, totalMemory, usedMemory: bytes.length },
  }),

  getNtag: async (NfcManager) => {
    let ntagType;
    try {
      const version = await NfcManager.nfcAHandler.transceive([0x60]);
      const storageSize = version[6];
      ntagType = NTAG_TYPES[storageSize];
    } catch {
      ntagType = undefined;
    }

    return ntagType;
  },

  // -- public
  read: async () =>
    // eslint-disable-next-line no-undef, no-async-promise-executor
    new Promise(async (resolve, reject) => {
      const { Ndef, NfcManager, NfcTech } = await NFCService.instance();

      try {
        await NfcManager.requestTechnology(NfcTech.Ndef);
        const tag = await NfcManager.getTag();

        const nTag = await NFCService.getNtag(NfcManager);
        if (!nTag) return reject(L10N.NFC_NOT_SUPPORTED);

        const records = NFCService.filterRecords(tag, Ndef);
        const bytes = Ndef.encodeMessage(records.map((record) => Ndef.textRecord(record)));

        resolve(NFCService.response(records, tag, bytes, nTag));
      } catch (error) {
        reject(L10N.NFC_ACCESS_ERROR);
      } finally {
        NfcManager.cancelTechnologyRequest();
      }
    }),

  write: (value, name) =>
    // eslint-disable-next-line no-undef, no-async-promise-executor
    new Promise(async (resolve, reject) => {
      const { Ndef, NfcManager, NfcTech } = await NFCService.instance();
      let backupBytes;

      try {
        await NfcManager.requestTechnology(NfcTech.Ndef);
        const tag = await NfcManager.getTag();

        const nTag = await NFCService.getNtag(NfcManager);
        if (!nTag) return reject(L10N.NFC_NOT_SUPPORTED);

        try {
          backupBytes = await NfcManager.ndefHandler.getNdefMessage();
        } catch {
          // ! TODO: Seems card is empty
        }

        const newRecord = `${name ? `${name}|` : ''}${value}`;
        const records = NFCService.filterRecords(tag, Ndef);

        if (!records.includes(newRecord)) records.push(newRecord);
        const bytes = Ndef.encodeMessage(records.map((record) => Ndef.textRecord(record)));

        if (bytes.length > nTag.totalMemory) return reject({ error: L10N.NFC_CARD_IS_FULL });
        await NfcManager.ndefHandler.writeNdefMessage(bytes);

        resolve(NFCService.response(records, tag, bytes, nTag));
      } catch (error) {
        if (backupBytes) await NfcManager.ndefHandler.writeNdefMessage(backupBytes);
        reject(L10N.NFC_ACCESS_ERROR);
      } finally {
        NfcManager.cancelTechnologyRequest();
      }
    }),

  remove: (value, name, targetTagId) =>
    // eslint-disable-next-line no-undef, no-async-promise-executor
    new Promise(async (resolve, reject) => {
      const { Ndef, NfcManager, NfcTech } = await NFCService.instance();
      let backupBytes;

      try {
        await NfcManager.requestTechnology(NfcTech.Ndef);

        const tag = await NfcManager.getTag();
        if (tag.id !== targetTagId) return reject(L10N.NFC_INVALID_ORIGIN_CARD);

        const nTag = await NFCService.getNtag(NfcManager);
        if (!nTag) return reject(L10N.NFC_NOT_SUPPORTED);

        try {
          backupBytes = await NfcManager.ndefHandler.getNdefMessage();
        } catch {
          // ! TODO: Seems card is empty
        }

        const targetRecord = `${name ? `${name}|` : ''}${value}`;
        const records = NFCService.filterRecords(tag, Ndef).filter((record) => record !== targetRecord);
        const bytes = Ndef.encodeMessage(records.map((record) => Ndef.textRecord(record)));

        await NfcManager.ndefHandler.writeNdefMessage(bytes);

        resolve(NFCService.response(records, tag, bytes, nTag));
      } catch {
        if (backupBytes) await NfcManager.ndefHandler.writeNdefMessage(backupBytes);
        reject(L10N.NFC_ACCESS_ERROR);
      } finally {
        NfcManager.cancelTechnologyRequest();
      }
    }),
};
