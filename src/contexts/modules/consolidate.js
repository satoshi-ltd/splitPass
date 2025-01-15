import { VAULTS_KEYWORDS } from '../../App.constants';

const findVault = ({ name } = {}) => {
  for (const [vault, keywords] of Object.entries(VAULTS_KEYWORDS)) {
    if (keywords.some((keyword) => name.toLowerCase().includes(keyword))) {
      return vault;
    }
  }

  return 'others';
};

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
