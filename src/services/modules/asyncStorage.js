import AsyncStorage from '@react-native-async-storage/async-storage';

export class AsyncStorageAdapter {
  constructor({ defaults = {}, filename = 'store' } = {}) {
    // eslint-disable-next-line no-async-promise-executor, no-undef
    return new Promise(async (resolve) => {
      this.key = filename;

      const store = await AsyncStorage.getItem(this.key);
      if (!store) await AsyncStorage.setItem(this.key, JSON.stringify(defaults));

      return resolve(this);
    });
  }

  async read() {
    const { key } = this;
    let data;

    try {
      data = JSON.parse(await AsyncStorage.getItem(key));
    } catch (error) {
      throw new Error(`${key} could not be loaded correctly.`);
    }

    return data;
  }

  async write(data = {}) {
    const { key } = this;

    try {
      AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      throw new Error(`${key} could not be saved correctly.`);
    }
  }

  async wipe() {
    const { key } = this;

    await AsyncStorage.removeItem(key);
  }
}
