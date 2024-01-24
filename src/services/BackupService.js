import { VaultService } from './VaultService';

export const BackupService = {
  import: async (qrs) => {
    // ! TODO
    await VaultService.wipe();
  },

  export: async () => {
    const txs = await VaultService.get();
    // ! TODO
  },
};
