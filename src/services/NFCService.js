import { L10N } from '../modules';

const TOTAL_MEMORY = 492;

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

  response: (records = [], tag, bytes) => ({
    records: records.map((record) => {
      const [name, value] = record.split('|');
      return { name, value };
    }),
    info: { id: tag.id, totalMemory: TOTAL_MEMORY, usedMemory: bytes.length },
  }),

  // -- public
  read: async () =>
    // eslint-disable-next-line no-undef, no-async-promise-executor
    new Promise(async (resolve, reject) => {
      const { Ndef, NfcManager, NfcTech } = await NFCService.instance();

      try {
        await NfcManager.requestTechnology(NfcTech.Ndef);

        const tag = await NfcManager.getTag();
        const records = NFCService.filterRecords(tag, Ndef);
        const bytes = Ndef.encodeMessage(records.map((record) => Ndef.textRecord(record)));

        resolve(NFCService.response(records, tag, bytes));
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

        // ! TODO: Test this one
        backupBytes = await NfcManager.ndefHandler.getNdefMessage();

        const newRecord = `${name ? `${name}|` : ''}${value}`;
        const records = NFCService.filterRecords(tag, Ndef);
        if (!records.includes(newRecord)) records.push(newRecord);
        const bytes = Ndef.encodeMessage(records.map((record) => Ndef.textRecord(record)));
        if (bytes.length > TOTAL_MEMORY) return reject({ error: L10N.NFC_CARD_IS_FULL });

        await NfcManager.ndefHandler.writeNdefMessage(bytes);
        resolve(NFCService.response(records, tag, bytes));
      } catch (error) {
        await NfcManager.ndefHandler.writeNdefMessage(backupBytes);
        reject(L10N.NFC_ACCESS_ERROR);
      } finally {
        NfcManager.cancelTechnologyRequest();
      }
    }),

  // clone: (records = []) =>
  //   // eslint-disable-next-line no-undef, no-async-promise-executor
  //   new Promise(async (resolve, reject) => {
  //     const { Ndef, NfcManager, NfcTech } = await NFCService.instance();

  //     try {
  //       await NfcManager.requestTechnology(NfcTech.Ndef);
  //       const tag = await NfcManager.getTag();

  //       const bytes = Ndef.encodeMessage(records.map((record) => Ndef.textRecord(record)));
  //       if (bytes.length > TOTAL_MEMORY) return reject({ error: L10N.NFC_CARD_IS_FULL });

  //       await NfcManager.ndefHandler.writeNdefMessage(bytes);
  //       resolve(NFCService.response(records, tag, bytes));
  //     } catch (error) {
  //       reject(L10N.NFC_ACCESS_ERROR);
  //     } finally {
  //       NfcManager.cancelTechnologyRequest();
  //     }
  //   }),

  // //
  // remove: (record) => {},
};
