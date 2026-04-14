import { getFavorites } from '../getFavorites';

const secret = (name, favorite = false) => ({ name, favorite });

describe('getFavorites', () => {
  it('returns an empty array when called with no arguments', () => {
    expect(getFavorites()).toEqual([]);
  });

  it('returns an empty array when no secrets are favorites', () => {
    expect(getFavorites([secret('gmail'), secret('twitter')])).toEqual([]);
  });

  it('returns only the favorited secrets', () => {
    const fav = secret('gmail', true);
    const notFav = secret('twitter', false);
    expect(getFavorites([fav, notFav])).toEqual([fav]);
  });

  it('returns all secrets when all are favorites', () => {
    const items = [secret('a', true), secret('b', true)];
    expect(getFavorites(items)).toEqual(items);
  });

  it('defaults the favorite flag to false when absent', () => {
    const items = [{ name: 'no-flag' }];
    expect(getFavorites(items)).toEqual([]);
  });

  it('preserves the original object references', () => {
    const fav = secret('gmail', true);
    const result = getFavorites([fav]);
    expect(result[0]).toBe(fav);
  });
});
