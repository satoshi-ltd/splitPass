import { VAULTS_KEYWORDS } from '../App.constants';

export const findVault = ({ name } = {}) => {
  for (const [vault, keywords] of Object.entries(VAULTS_KEYWORDS)) {
    if (keywords.some((keyword) => name.toLowerCase().includes(keyword))) {
      return vault;
    }
  }

  return 'others';
};
