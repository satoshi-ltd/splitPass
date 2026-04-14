import { VAULT_TYPE } from '../../../../App.constants';
import { groupByVault } from '../groupByVault';

const secret = (vault, name = 'x') => ({ name, vault });

describe('groupByVault', () => {
  it('returns all four vault buckets even when empty', () => {
    const result = groupByVault();
    expect(result).toHaveProperty(VAULT_TYPE[0]);
    expect(result).toHaveProperty(VAULT_TYPE[1]);
    expect(result).toHaveProperty(VAULT_TYPE[2]);
    expect(result).toHaveProperty(VAULT_TYPE[3]);
  });

  it('starts with empty arrays for all vaults', () => {
    const result = groupByVault([]);
    Object.values(result).forEach((arr) => expect(arr).toEqual([]));
  });

  it('places secrets into the correct vault bucket', () => {
    const s1 = secret('Account', 'gmail');
    const s2 = secret('Finance', 'bitcoin');
    const result = groupByVault([s1, s2]);
    expect(result.Account).toContain(s1);
    expect(result.Finance).toContain(s2);
  });

  it('groups multiple secrets into the same bucket', () => {
    const secrets = [secret('Social', 'twitter'), secret('Social', 'instagram'), secret('Account', 'gmail')];
    const result = groupByVault(secrets);
    expect(result.Social).toHaveLength(2);
    expect(result.Account).toHaveLength(1);
  });

  it('handles all four vault types', () => {
    const s = VAULT_TYPE.map((vault) => secret(vault));
    const result = groupByVault(s);
    VAULT_TYPE.forEach((vault) => expect(result[vault]).toHaveLength(1));
  });

  it('preserves original object references', () => {
    const s = secret('others', 'note');
    const result = groupByVault([s]);
    expect(result.others[0]).toBe(s);
  });
});
