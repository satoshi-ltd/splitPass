/* eslint-disable no-async-promise-executor */
import { AsyncStorageAdapter } from './modules/asyncStorage';

// eslint-disable-next-line no-undef
const state = new WeakMap();

export class StorageService {
  constructor({ adapter: Adapter = AsyncStorageAdapter, defaults = {}, filename = 'store' } = {}) {
    // eslint-disable-next-line no-undef
    return new Promise(async (resolve) => {
      const adapter = await new Adapter({ defaults, filename });

      state.set(this, {
        adapter,
        data: await adapter.read(),
        defaults: JSON.parse(JSON.stringify(defaults)),
        filename,
        key: 'default',
      });

      resolve(this);
    });
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

    const { adapter, data, key } = state.get(this);
    const isArray = data[key] === undefined || Array.isArray(data[key]);
    if (isArray) {
      data[key] = data[key] ? (Array.isArray(value) ? [...data[key], ...value] : [...data[key], value]) : [value];
    } else {
      data[key] = { ...data[key], ...value };
    }

    await adapter.write(data);

    return value;
  }

  async update(query, nextData) {
    const { adapter, data, key } = state.get(this);
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

    if (values.length > 0) await adapter.write(data);

    return values;
  }

  async remove(query) {
    const { adapter, data, key } = state.get(this);
    const queryFields = Object.keys(query);
    const values = [];

    data[key] = this.value.filter((row) => {
      const found = !queryFields.some((field) => !(row[field] === query[field]));
      if (found) values.push(row);

      return !found;
    });

    if (values.length > 0) await adapter.write(data);

    return values;
  }

  get value() {
    const { data, key } = state.get(this);

    return data[key];
  }

  async wipe(key) {
    const { adapter, data = {}, defaults = {} } = state.get(this);

    const nextData = JSON.parse(JSON.stringify(key ? { ...data, [key]: defaults[key] } : defaults));
    await adapter.write(nextData);
    state.set(this, Object.assign(state.get(this), { data: nextData, memoryPool: [] }));
  }
}
