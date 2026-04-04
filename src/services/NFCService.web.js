import { StorageService } from './StorageService';

const store = new StorageService({ defaults: { records: [] }, filename: 'com.satoshi-ltd.splitpass:nfc' });
const INFO = { id: '19801992202022', totalMemory: 492 };
const DELAY_RESPONSE = 500;
const parseRecord = (record = '') => {
  const [name = '', value = '', username = '', notes = ''] = `${record}`.split('|');
  return { name, notes: notes || undefined, value, username: username || undefined };
};
const stringifyRecord = ({ name = '', value = '', username, notes } = {}) => {
  const fields = [name, value, username || '', notes || ''];
  while (fields.length > 2 && fields[fields.length - 1] === '') fields.pop();
  return fields.join('|');
};

const parseResponse = (records = []) => ({
  info: { ...INFO, usedMemory: records.length * 64 },
  records: records.map(parseRecord),
});

export const NFCService = {
  read: async () =>
    // eslint-disable-next-line no-undef, no-async-promise-executor
    new Promise(async (resolve) => {
      const records = await store.get('records').value;

      setTimeout(() => resolve(parseResponse(records)), DELAY_RESPONSE);
    }),

  write: (value, name, username, notes) =>
    // eslint-disable-next-line no-undef, no-async-promise-executor
    new Promise(async (resolve) => {
      const newRecord = stringifyRecord({ name, notes, value, username });
      let records = await store.get('records').value;

      if (!records.includes(newRecord)) await store.save(newRecord);
      records = await store.get('records').value;

      setTimeout(() => resolve(parseResponse(records)), DELAY_RESPONSE);
    }),

  remove: (value, name, targetTagId, username, notes) =>
    // eslint-disable-next-line no-undef, no-async-promise-executor
    new Promise(async (resolve) => {
      let records = await store.get('records').value;

      const targetRecord = stringifyRecord({ name, notes, value, username });
      records = records.filter((record) => record !== targetRecord);
      await store.save();

      setTimeout(() => resolve(parseResponse(records)), DELAY_RESPONSE);
    }),
};
