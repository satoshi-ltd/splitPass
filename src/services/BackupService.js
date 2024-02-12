import { VaultService } from './VaultService';

export const BackupService = {
  import: async (qrs) => {
    // ! TODO
    console.log(qrs);
    await VaultService.wipe();
  },

  export: async () => {
    const txs = await VaultService.get();
    console.log(txs);
    // ! TODO
  },
};
