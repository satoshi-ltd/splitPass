/**
 * @jest-environment node
 */

require('../lib/camera-access.js');

const { POPUP_COPY, PAGE_PATH, needsAccessPage, queryCameraPermission, requestCameraOnce } =
  globalThis.SplitPassCameraAccess;

describe('queryCameraPermission', () => {
  it('reports the browser state when the query is supported', async () => {
    for (const state of ['granted', 'prompt', 'denied']) {
      expect(await queryCameraPermission({ query: async () => ({ state }) })).toBe(state);
    }
  });

  it('falls back to unknown when the query is missing, throws or answers oddly', async () => {
    expect(await queryCameraPermission(null)).toBe('unknown');
    expect(await queryCameraPermission({})).toBe('unknown');
    expect(
      await queryCameraPermission({
        query: async () => {
          throw new TypeError('camera is not a valid PermissionName');
        },
      })
    ).toBe('unknown');
    expect(await queryCameraPermission({ query: async () => ({ state: 'weird' }) })).toBe('unknown');
  });
});

describe('needsAccessPage', () => {
  it('routes prompt and denied through the tab page and lets the rest use the popup', () => {
    expect(needsAccessPage('prompt')).toBe(true);
    expect(needsAccessPage('denied')).toBe(true);
    expect(needsAccessPage('granted')).toBe(false);
    expect(needsAccessPage('unknown')).toBe(false);
  });

  it('ships copy for both routed states and a page path', () => {
    expect(POPUP_COPY.prompt.title).toBeTruthy();
    expect(POPUP_COPY.denied.title).toBeTruthy();
    expect(PAGE_PATH).toBe('camera-access.html');
  });
});

describe('requestCameraOnce', () => {
  it('stops every track right after the grant', async () => {
    const stop = jest.fn();
    const result = await requestCameraOnce({
      getUserMedia: async () => ({ getTracks: () => [{ stop }, { stop }] }),
    });

    expect(result).toEqual({ ok: true, blocked: false, message: '' });
    expect(stop).toHaveBeenCalledTimes(2);
  });

  it('flags NotAllowedError as blocked and passes other failures through', async () => {
    const dismissed = Object.assign(new Error('Permission dismissed'), { name: 'NotAllowedError' });
    expect(
      await requestCameraOnce({
        getUserMedia: async () => {
          throw dismissed;
        },
      })
    ).toEqual({ ok: false, blocked: true, message: 'Permission dismissed' });

    const busy = Object.assign(new Error('Device in use'), { name: 'NotReadableError' });
    expect(
      await requestCameraOnce({
        getUserMedia: async () => {
          throw busy;
        },
      })
    ).toEqual({ ok: false, blocked: false, message: 'Device in use' });
  });

  it('reports a missing camera API without throwing', async () => {
    expect(await requestCameraOnce(null)).toMatchObject({ ok: false, blocked: false });
    expect(await requestCameraOnce({})).toMatchObject({ ok: false, blocked: false });
  });
});
