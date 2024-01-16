import { AsyncStorageService } from './AsyncStorageService';

const STORAGE_KEY = 'vault';

export const VaultService = {
  get: async () => (await AsyncStorageService.get(STORAGE_KEY)) || [],

  addQr: async (qr, name, timestamp = new Date().getTime()) => {
    const vault = await VaultService.get();

    AsyncStorageService.set(STORAGE_KEY, [...vault, { qr, name, timestamp }]);
  },

  removeQr: async (qr) => {
    let vault = await VaultService.get();

    AsyncStorageService.set(
      STORAGE_KEY,
      vault.filter((item = {}) => item.qr === qr),
    );
  },
};
