import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { L10N } from '../modules';

const IS_WEB = Platform.OS === 'web';
const TAG_MOCK = {}; // TODO add a mock for web

const initializeNFC = async () => {
  const { default: NfcManager, NfcTech, Ndef } = require('react-native-nfc-manager');

  const supported = await NfcManager.isSupported();
  if (!supported) throw new Error(L10N.NFC_NOT_SUPPORTED);

  NfcManager.start();

  return { NfcManager, NfcTech, Ndef };
};

export const NFCService = {
  readTag: async () =>
    // eslint-disable-next-line no-undef, no-async-promise-executor
    new Promise(async (resolve, reject) => {
      if (Constants.appOwnership === 'expo' || IS_WEB) return resolve(TAG_MOCK);

      const { NfcManager, NfcTech } = await initializeNFC();

      try {
        await NfcManager.requestTechnology(NfcTech.Ndef);

        const tag = await NfcManager.getTag();

        resolve(tag);
      } catch (error) {
        reject(`${L10N.ERROR}: ${JSON.stringify(error)}`);
      } finally {
        await NfcManager.cancelTechnologyRequest();
      }
    }),
  writeTag: async (data) =>
    // eslint-disable-next-line no-undef, no-async-promise-executor
    new Promise(async (resolve, reject) => {
      if (Constants.appOwnership === 'expo' || IS_WEB) return resolve(true);

      const { NfcManager, NfcTech, Ndef } = await initializeNFC();

      try {
        await NfcManager.requestTechnology(NfcTech.Ndef);

        const bytes = Ndef.encodeMessage([Ndef.textRecord(data)]);

        if (bytes) {
          await NfcManager.ndefHandler.writeNdefMessage(bytes);
          resolve(true);
        } else {
          reject(`${L10N.ERROR}: ${L10N.NFC_WRITE_ERROR}`);
        }
      } catch (error) {
        reject(`${L10N.ERROR}: ${JSON.stringify(error)}`);
      } finally {
        await NfcManager.cancelTechnologyRequest();
      }
    }),
};
