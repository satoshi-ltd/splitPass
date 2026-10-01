jest.mock('../../../App.constants', () => ({ SATOSHI_URLS: { PRIVACY: 'https://example.test/privacy', TERMS: 'https://example.test/terms' } }));
jest.mock('../../../modules', () => ({
  ICON: new Proxy({}, { get: (_, name) => String(name) }),
  L10N: new Proxy({}, { get: (_, name) => String(name) }),
}));

import { ABOUT_OPTIONS } from '../Settings.constants';

describe('Settings about options', () => {
  it('offers only the terms and the privacy policy, as links', () => {
    expect(ABOUT_OPTIONS()).toEqual([
      { icon: 'FILE', text: 'TERMS', url: 'https://example.test/terms' },
      { icon: 'FILE', text: 'PRIVACY', url: 'https://example.test/privacy' },
    ]);
  });
});
