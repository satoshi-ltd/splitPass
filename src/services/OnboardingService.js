import { AsyncStorageService } from './AsyncStorageService';
import { STORAGE_DOMAIN } from '../App.constants';

const STORAGE_KEY = `${STORAGE_DOMAIN}:onboarding`;

export const OnboardingService = {
  get: async () => {
    return (await AsyncStorageService.get(STORAGE_KEY)) || false;
  },

  set: async (onboarded = true) => {
    AsyncStorageService.set(STORAGE_KEY, onboarded);
  },

  wipe: async () => {
    AsyncStorageService.removeItem(STORAGE_KEY);
  },
};
