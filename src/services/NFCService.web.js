// import Constants from 'expo-constants';
// import { Platform } from 'react-native';

import { StorageService } from './StorageService';

const store = await new StorageService({ defaults: { records: [] }, filename: 'com.satoshi-ltd.splitpass:nfc' });
const INFO = { id: '19801992202022', totalMemory: 492 };
const DELAY_RESPONSE = 500;

// const IS_EXPO = Constants.appOwnership === 'expo';

const parseResponse = (records = []) => ({
  info: { ...INFO, usedMemory: records.length * 32 },
  records: records.map((record) => {
    const [name, value] = record.split('|');
    return { name, value };
  }),
});

export const NFCService = {
  read: async () =>
    // eslint-disable-next-line no-undef, no-async-promise-executor
    new Promise(async (resolve) => {
      const records = await store.get('records').value;

      setTimeout(() => resolve(parseResponse(records)), DELAY_RESPONSE);
    }),

  write: (value, name) =>
    // eslint-disable-next-line no-undef, no-async-promise-executor
    new Promise(async (resolve) => {
      const newRecord = `${name}|${value}`;
      let records = await store.get('records').value;

      if (!records.includes(newRecord)) await store.save(`${name}|${value}`);
      records = await store.get('records').value;

      setTimeout(() => resolve(parseResponse(records)), DELAY_RESPONSE);
    }),

  clone: (records = []) =>
    // eslint-disable-next-line no-undef, no-async-promise-executor
    new Promise(async () => {
      // ! TODO
    }),

  remove: (record) =>
    // eslint-disable-next-line no-undef, no-async-promise-executor
    new Promise(async () => {
      // ! TODO
    }),
};