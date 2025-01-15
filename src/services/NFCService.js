import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { L10N } from '../modules';

const IS_MOCK = Platform.OS === 'web' || Constants.appOwnership === 'expo';

const TOTAL_MEMORY = 492;

const TAG_MOCK = {
  secrets: [
    '4000812771161163312421349138600180611163115910353092506140275186700831307139902341880124300411462',
    'hello world',
    'hola mundo',
  ],
  info: {
    id: '1234567891012345',
    totalMemory: TOTAL_MEMORY,
    usedMemory: undefined,
  },
};

export const NFCService = {
  instance: async () => {
    const {
      //
      default: NfcManager,
      Ndef,
      NfcEvents,
      NfcTech,
    } = require('react-native-nfc-manager');

    const supported = await NfcManager.isSupported();
    if (!supported) throw new Error(L10N.NFC_NOT_SUPPORTED);

    NfcManager.start();

    return { Ndef, NfcEvents, NfcManager, NfcTech };
  },

  info: (tag = {}, bytes) => ({ id: tag.id, totalMemory: TOTAL_MEMORY, usedMemory: bytes?.length }),

  // info: () =>
  //   // eslint-disable-next-line no-undef, no-async-promise-executor
  //   new Promise(async (resolve, reject) => {
  //     //
  //   }),

  read: async () =>
    // eslint-disable-next-line no-undef, no-async-promise-executor
    new Promise(async (resolve, reject) => {
      if (IS_MOCK) return setTimeout(() => resolve(TAG_MOCK), 500);

      const { Ndef, NfcEvents, NfcManager, NfcTech } = await NFCService.instance();

      try {
        await NfcManager.requestTechnology(NfcTech.Ndef);
        const tag = await NfcManager.getTag();

        // ! TODO: Determine usedMemory

        const secrets = tag?.ndefMessage
          ?.filter((record) => record.type.toString() === '84') // ! TODO: Research which is the best way
          ?.map((record) => Ndef.text.decodePayload(record.payload));

        resolve({ secrets, info: { id: tag.id, totalMemory: TOTAL_MEMORY, usedMemory: undefined } });
      } catch (error) {
        console.error(JSON.stringify(error));
        reject(`${L10N.ERROR}: ${JSON.stringify(error)}`);
      } finally {
        NfcManager.cancelTechnologyRequest();
      }
    }),

  write: (values = []) =>
    // eslint-disable-next-line no-undef, no-async-promise-executor
    new Promise(async (resolve, reject) => {
      if (IS_MOCK) resolve(true);

      const { Ndef, NfcManager, NfcTech } = await NFCService.instance();

      try {
        await NfcManager.requestTechnology(NfcTech.Ndef);
        const tag = await NfcManager.getTag();

        const bytes = Ndef.encodeMessage(values.map((secret) => Ndef.textRecord(secret)));
        await NfcManager.ndefHandler.writeNdefMessage(bytes);

        resolve({ records: values, info: NFCService.info(tag, bytes) });
      } catch (error) {
        reject(error);
      } finally {
        await NfcManager.cancelTechnologyRequest();
      }
    }),

  append: (value, name) =>
    // eslint-disable-next-line no-undef, no-async-promise-executor
    new Promise(async (resolve, reject) => {
      const { Ndef, NfcManager, NfcTech } = await NFCService.instance();

      try {
        await NfcManager.requestTechnology(NfcTech.Ndef);
        const tag = await NfcManager.getTag();

        const newRecord = `${name ? `${name}|` : ''}${value}`;
        const records =
          tag?.ndefMessage
            ?.filter((record) => record.type.toString() === '84')
            ?.map((record) => Ndef.text.decodePayload(record.payload))
            ?.filter((record) => record !== newRecord) || [];
        records.push(newRecord);

        const bytes = Ndef.encodeMessage(records.map((record) => Ndef.textRecord(record)));

        if (bytes.length > tag.maxSize) {
          reject({ error: 'No more space' });
        } else {
          await NfcManager.writeNdefMessage(bytes);
          resolve({ records, info: NFCService.info(tag, bytes) });
        }
      } catch (error) {
        reject(error);
      } finally {
        NfcManager.cancelTechnologyRequest();
      }
    }),

  //
  remove: () => {},
};
