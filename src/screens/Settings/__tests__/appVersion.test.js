import { appVersion } from '../helpers/appVersion';

describe('Settings app version', () => {
  it('shows the version and the build number', () => {
    expect(appVersion({ ios: { buildNumber: '12' }, android: { versionCode: 12 }, version: '1.4.21' })).toBe(
      'v1.4.21 (12)',
    );
  });

  it('falls back to the Android version code', () => {
    expect(appVersion({ android: { versionCode: 7 }, version: '1.0.0' })).toBe('v1.0.0 (7)');
  });

  it('shows the version alone without a build number', () => {
    expect(appVersion({ version: '1.0.0' })).toBe('v1.0.0');
  });

  it('shows nothing without a config', () => {
    expect(appVersion()).toBeUndefined();
  });
});
