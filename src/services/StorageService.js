/* eslint-disable no-async-promise-executor */
import { createEncryptedEnvelope, decryptEncryptedEnvelope, isEncryptedEnvelope } from '../modules';
import { AsyncStorageAdapter } from './modules/asyncStorage';

// eslint-disable-next-line no-undef
const state = new WeakMap();

const clone = (value) => JSON.parse(JSON.stringify(value));
const isObject = (value) => !!value && typeof value === 'object' && !Array.isArray(value);
const normalizeData = ({ secrets = [], settings = {} } = {}, defaults = {}) => ({
  secrets: Array.isArray(secrets) ? [...secrets] : [...(defaults.secrets || [])],
  settings: { ...(defaults.settings || {}), ...(isObject(settings) ? settings : {}) },
});
const isLegacyStore = (value = {}) => isObject(value) && (Array.isArray(value.secrets) || isObject(value.settings));
const verifyPersistedEnvelope = async (adapter, passphrase) => {
  const persisted = await adapter.read();

  if (!isEncryptedEnvelope(persisted)) {
    const error = new Error('Encrypted payload could not be saved correctly.');
    error.code = 'ERR_PERSISTENCE_WRITE_FAILED';
    throw error;
  }

  await decryptEncryptedEnvelope(persisted, passphrase);

  return persisted;
};

export class StorageService {
  constructor({ adapter: Adapter = AsyncStorageAdapter, defaults = {}, filename = 'store' } = {}) {
    // eslint-disable-next-line no-undef
    return new Promise(async (resolve) => {
      const adapter = await new Adapter({ defaults, filename });
      const rawData = await adapter.read();
      const legacyData = isLegacyStore(rawData) ? normalizeData(rawData, defaults) : undefined;
      const configured = isEncryptedEnvelope(rawData);

      state.set(this, {
        adapter,
        data: configured ? undefined : legacyData,
        defaults: clone(defaults),
        filename,
        key: 'default',
        legacyData,
        rawData,
        sessionPassphrase: undefined,
      });

      resolve(this);
    });
  }

  get security() {
    const { data, legacyData, rawData } = state.get(this);

    return {
      configured: isEncryptedEnvelope(rawData),
      legacy: !isEncryptedEnvelope(rawData) && !!legacyData,
      unlocked: !!data && isEncryptedEnvelope(rawData),
    };
  }

  get previewData() {
    const { defaults, legacyData } = state.get(this);

    return legacyData ? normalizeData(legacyData, defaults) : undefined;
  }

  get sessionPassphrase() {
    return state.get(this).sessionPassphrase;
  }

  async initializeSecurity(passphrase, seedData) {
    const snapshot = state.get(this);
    const nextData = normalizeData(
      seedData || snapshot.data || snapshot.legacyData || snapshot.defaults,
      snapshot.defaults,
    );
    const rawData = await createEncryptedEnvelope(nextData, passphrase);

    await snapshot.adapter.write(rawData);
    const persisted = await verifyPersistedEnvelope(snapshot.adapter, passphrase);
    state.set(this, {
      ...snapshot,
      data: nextData,
      legacyData: undefined,
      rawData: persisted,
      sessionPassphrase: passphrase,
    });

    return clone(nextData);
  }

  async unlock(passphrase = '') {
    const snapshot = state.get(this);

    if (!isEncryptedEnvelope(snapshot.rawData)) {
      const error = new Error('Secure storage is not configured.');
      error.code = 'ERR_STORAGE_NOT_CONFIGURED';
      throw error;
    }

    const data = normalizeData(await decryptEncryptedEnvelope(snapshot.rawData, passphrase), snapshot.defaults);
    state.set(this, { ...snapshot, data, sessionPassphrase: passphrase });

    return clone(data);
  }

  lock() {
    const snapshot = state.get(this);

    state.set(this, { ...snapshot, data: undefined, key: 'default', sessionPassphrase: undefined });
  }

  async replaceAll(nextData, passphrase = this.sessionPassphrase) {
    const snapshot = state.get(this);

    if (!passphrase) throw new Error('Master passphrase required.');

    const data = normalizeData(nextData, snapshot.defaults);
    const rawData = await createEncryptedEnvelope(data, passphrase);
    await snapshot.adapter.write(rawData);
    const persisted = await verifyPersistedEnvelope(snapshot.adapter, passphrase);
    state.set(this, { ...snapshot, data, legacyData: undefined, rawData: persisted, sessionPassphrase: passphrase });

    return clone(data);
  }

  async exportBackup() {
    const { defaults, rawData } = state.get(this);

    if (isEncryptedEnvelope(rawData)) return clone(rawData);

    return normalizeData(this.previewData || defaults, defaults);
  }

  async decryptBackup(rawBackup = {}, passphrase = '') {
    const { defaults } = state.get(this);

    if (!isEncryptedEnvelope(rawBackup)) return normalizeData(rawBackup, defaults);

    return normalizeData(await decryptEncryptedEnvelope(rawBackup, passphrase), defaults);
  }

  async persistCurrentData() {
    const snapshot = state.get(this);

    if (!snapshot.sessionPassphrase) throw new Error('Master passphrase required.');

    const rawData = await createEncryptedEnvelope(snapshot.data, snapshot.sessionPassphrase);
    await snapshot.adapter.write(rawData);
    const persisted = await verifyPersistedEnvelope(snapshot.adapter, snapshot.sessionPassphrase);
    state.set(this, { ...snapshot, rawData: persisted });
  }

  findOne(query) {
    const queryFields = Object.keys(query);

    return this.value.find((row) => {
      const found = !queryFields.some((field) => !(row[field] === query[field]));

      return found;
    });
  }

  find(query = {}) {
    const queryFields = Object.keys(query);
    const values = [];

    this.value.forEach((row) => {
      const found = !queryFields.some((field) => !(row[field] === query[field]));
      if (found) values.push(row);
    });

    return values.length > 0 ? values : undefined;
  }

  get(key) {
    state.set(this, Object.assign(state.get(this), { key }));

    return this;
  }

  async save(value) {
    if (!value) return;

    const snapshot = state.get(this);
    const { data, key } = snapshot;

    if (!data) throw new Error('Store is locked.');

    const isArray = data[key] === undefined || Array.isArray(data[key]);
    if (isArray) {
      data[key] = data[key] ? (Array.isArray(value) ? [...data[key], ...value] : [...data[key], value]) : [value];
    } else {
      data[key] = { ...data[key], ...value };
    }

    await this.persistCurrentData();

    return value;
  }

  async update(query, nextData) {
    const { data, key } = state.get(this);

    if (!data) throw new Error('Store is locked.');

    const queryFields = Object.keys(query);
    const values = [];

    data[key] = this.value.map((row) => {
      const found = !queryFields.some((field) => !(row[field] === query[field]));
      let changes;

      if (found) {
        changes = Object.assign(row, nextData);
        values.push(changes);
      }

      return changes || row;
    });

    if (values.length > 0) await this.persistCurrentData();

    return values;
  }

  async remove(query) {
    const { data, key } = state.get(this);

    if (!data) throw new Error('Store is locked.');

    const queryFields = Object.keys(query);
    const values = [];

    data[key] = this.value.filter((row) => {
      const found = !queryFields.some((field) => !(row[field] === query[field]));
      if (found) values.push(row);

      return !found;
    });

    if (values.length > 0) await this.persistCurrentData();

    return values;
  }

  get value() {
    const { data, key } = state.get(this);

    return data ? data[key] : undefined;
  }

  async wipe(key) {
    const snapshot = state.get(this);
    const { data = {}, defaults = {} } = snapshot;
    const nextData = clone(key ? { ...data, [key]: defaults[key] } : defaults);

    if (!snapshot.sessionPassphrase) {
      state.set(this, { ...snapshot, data: nextData });
      return;
    }

    await this.replaceAll(nextData, snapshot.sessionPassphrase);
  }

  async destroy() {
    const snapshot = state.get(this);

    await snapshot.adapter.wipe();
    await snapshot.adapter.write(clone(snapshot.defaults));
    state.set(this, {
      ...snapshot,
      data: clone(snapshot.defaults),
      key: 'default',
      legacyData: clone(snapshot.defaults),
      rawData: clone(snapshot.defaults),
      sessionPassphrase: undefined,
    });
  }
}
