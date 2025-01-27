import { StorageService } from './StorageService';

const store = await new StorageService({ defaults: { records: [] }, filename: 'com.satoshi-ltd.splitpass:nfc' });
const INFO = { id: '19801992202022', totalMemory: 492 };
const DELAY_RESPONSE = 500;

const parseResponse = (records = []) => ({
  info: { ...INFO, usedMemory: records.length * 64 },
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

  remove: (name, value) =>
    // eslint-disable-next-line no-undef, no-async-promise-executor
    new Promise(async (resolve) => {
      let records = await store.get('records').value;

      const targetRecord = `${name}|${value}`;
      records = records.filter((record) => record !== targetRecord);
      await store.save();

      setTimeout(() => resolve(parseResponse(records)), DELAY_RESPONSE);
    }),
};
