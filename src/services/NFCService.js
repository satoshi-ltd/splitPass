import { Platform } from 'react-native';

import { L10N } from '../modules';
const NTAG_TYPES = {
  15: { type: 'NTAG213', totalMemory: 144 },
  17: { type: 'NTAG215', totalMemory: 504 },
  18: { type: 'NTAG216', totalMemory: 888 },
};

const parseRecord = (record = '') => {
  const [name = '', value = '', username = '', notes = ''] = `${record}`.split('|');
  return { name, notes: notes || undefined, value, username: username || undefined };
};

const stringifyRecord = ({ name = '', value = '', username, notes } = {}) => {
  const fields = [name, value, username || '', notes || ''];
  while (fields.length > 2 && fields[fields.length - 1] === '') fields.pop();
  return fields.join('|');
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
      .filter((record) => {
        const { name, value } = parseRecord(record);
        return !!name && !!value;
      }),

  response: (records = [], tag, bytes, { totalMemory } = {}) => ({
    records: records.map(parseRecord),
    info: { id: tag.id, totalMemory, usedMemory: bytes.length },
  }),

  getNtag: async (NfcManager) => {
    // ! TODO
    if (Platform.OS === 'android') return { type: 'NTAG215', totalMemory: 504 };

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
  read: async () => {
    const instance = await NFCService.instance().catch((error) => {
      throw error?.message || error || L10N.NFC_NOT_SUPPORTED;
    });

    const { Ndef, NfcManager, NfcTech } = instance;

    try {
      await NfcManager.requestTechnology(NfcTech.Ndef);
      const tag = await NfcManager.getTag();

      const nTag = await NFCService.getNtag(NfcManager);
      if (!nTag) throw L10N.NFC_NOT_SUPPORTED;

      const records = NFCService.filterRecords(tag, Ndef);
      const bytes = Ndef.encodeMessage(records.map((record) => Ndef.textRecord(record)));

      return NFCService.response(records, tag, bytes, nTag);
    } catch (error) {
      throw error === L10N.NFC_NOT_SUPPORTED ? error : L10N.NFC_ACCESS_ERROR;
    } finally {
      NfcManager.cancelTechnologyRequest();
    }
  },

  write: async (value, name, username, notes) => {
    let backupRecords;

    const instance = await NFCService.instance().catch((error) => {
      throw error?.message || error || L10N.NFC_NOT_SUPPORTED;
    });

    const { Ndef, NfcManager, NfcTech } = instance;

    try {
      await NfcManager.requestTechnology(NfcTech.Ndef);
      const tag = await NfcManager.getTag();
      backupRecords = tag.ndefMessage;

      const nTag = await NFCService.getNtag(NfcManager);
      if (!nTag) throw L10N.NFC_NOT_SUPPORTED;

      const newRecord = stringifyRecord({ name, notes, value, username });
      const records = NFCService.filterRecords(tag, Ndef);

      if (!records.includes(newRecord)) records.push(newRecord);
      const bytes = Ndef.encodeMessage(records.map((record) => Ndef.textRecord(record)));

      if (bytes.length > nTag.totalMemory) throw { error: L10N.NFC_CARD_IS_FULL };
      await NfcManager.ndefHandler.writeNdefMessage(bytes);

      return NFCService.response(records, tag, bytes, nTag);
    } catch (error) {
      const isKnownRejection = error === L10N.NFC_NOT_SUPPORTED || error?.error === L10N.NFC_CARD_IS_FULL;
      if (!isKnownRejection && backupRecords?.length) {
        try {
          await NfcManager.ndefHandler.writeNdefMessage(Ndef.encodeMessage(backupRecords));
        } catch {}
      }
      throw isKnownRejection ? error : L10N.NFC_ACCESS_ERROR;
    } finally {
      NfcManager.cancelTechnologyRequest();
    }
  },

  remove: async (value, name, targetTagId, username, notes) => {
    let backupRecords;

    const instance = await NFCService.instance().catch((error) => {
      throw error?.message || error || L10N.NFC_NOT_SUPPORTED;
    });

    const { Ndef, NfcManager, NfcTech } = instance;

    try {
      await NfcManager.requestTechnology(NfcTech.Ndef);

      const tag = await NfcManager.getTag();
      if (tag.id !== targetTagId) throw L10N.NFC_INVALID_ORIGIN_CARD;

      const nTag = await NFCService.getNtag(NfcManager);
      if (!nTag) throw L10N.NFC_NOT_SUPPORTED;

      try {
        backupRecords = await NfcManager.ndefHandler.getNdefMessage();
      } catch {
        // Card may be empty; proceed without backup
      }

      const targetRecord = stringifyRecord({ name, notes, value, username });
      const records = NFCService.filterRecords(tag, Ndef).filter((record) => record !== targetRecord);
      const bytes = Ndef.encodeMessage(records.map((record) => Ndef.textRecord(record)));

      await NfcManager.ndefHandler.writeNdefMessage(bytes);

      return NFCService.response(records, tag, bytes, nTag);
    } catch (error) {
      const isKnownRejection = error === L10N.NFC_INVALID_ORIGIN_CARD || error === L10N.NFC_NOT_SUPPORTED;
      if (!isKnownRejection && backupRecords?.length) {
        try {
          await NfcManager.ndefHandler.writeNdefMessage(Ndef.encodeMessage(backupRecords));
        } catch {}
      }
      throw isKnownRejection ? error : L10N.NFC_ACCESS_ERROR;
    } finally {
      NfcManager.cancelTechnologyRequest();
    }
  },
};
