import { StorageService } from './StorageService';

const storePromise = new StorageService({ defaults: { records: [] }, filename: 'com.satoshi-ltd.splitpass:nfc' });
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

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const NFCService = {
  read: async () => {
    const store = await storePromise;
    const records = store.get('records').value;

    await delay(DELAY_RESPONSE);
    return parseResponse(records);
  },

  write: async (value, name, username, notes) => {
    const store = await storePromise;
    const newRecord = stringifyRecord({ name, notes, value, username });
    let records = store.get('records').value;

    if (!records.includes(newRecord)) await store.save(newRecord);
    records = store.get('records').value;

    await delay(DELAY_RESPONSE);
    return parseResponse(records);
  },

  remove: async (value, name, targetTagId, username, notes) => {
    const store = await storePromise;
    let records = store.get('records').value;

    const targetRecord = stringifyRecord({ name, notes, value, username });
    records = records.filter((record) => record !== targetRecord);
    await store.save();

    await delay(DELAY_RESPONSE);
    return parseResponse(records);
  },
};
