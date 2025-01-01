import { VAULT_TYPE } from '../../../App.constants';

export const groupByVault = (secrets = []) => {
  const group = {
    [VAULT_TYPE[0]]: [],
    [VAULT_TYPE[1]]: [],
    [VAULT_TYPE[2]]: [],
    [VAULT_TYPE[3]]: [],
  };

  secrets.forEach((secret) => {
    group[secret.vault].push(secret);
  });

  return group;
};
