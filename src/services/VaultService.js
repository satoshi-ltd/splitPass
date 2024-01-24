import { AsyncStorageService } from './AsyncStorageService';
import { STORAGE_DOMAIN } from '../App.constants';

const STORAGE_KEY = `${STORAGE_DOMAIN}:vault`;

export const VaultService = {
  get: async () => {
    return (await AsyncStorageService.get(STORAGE_KEY)) || [];
  },

  add: async (qr, name, timestamp = new Date().getTime()) => {
    const vault = await VaultService.get();

    AsyncStorageService.set(STORAGE_KEY, [...vault, { qr, name, timestamp }]);
  },

  remove: async (qr) => {
    let vault = await VaultService.get();

    await AsyncStorageService.set(
      STORAGE_KEY,
      vault.filter((item = {}) => item.qr === qr),
    );
  },

  wipe: async () => {
    AsyncStorageService.remove(STORAGE_KEY);
  },
};
