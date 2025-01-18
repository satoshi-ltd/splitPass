import { findVault } from '../../modules';

export const consolidate = ({ secrets = [], settings = {}, ...others } = {}) => {
  return {
    ...others,
    secrets: secrets.map(({ createdAt, readAt, ...secret }) => ({
      ...secret,
      vault: findVault(secret),
      createdAt: new Date(createdAt),
      readAt: readAt ? new Date(readAt) : undefined,
    })),
    settings,
  };
};
