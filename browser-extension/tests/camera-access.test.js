/**
 * @jest-environment node
 */

require('../lib/camera-access.js');

const { PAGE_PATH, describeFailure, requestCameraOnce } = globalThis.SplitPassCameraAccess;

describe('describeFailure', () => {
  it('offers a plain retry after the first dismissal, with no tab detour', () => {
    const first = describeFailure(1);

    expect(first.showHelp).toBe(false);
    expect(first.title).toBeTruthy();
    expect(first.copy).toBeTruthy();
  });

  it('surfaces the permission page only once retrying has already failed', () => {
    expect(describeFailure(2).showHelp).toBe(true);
    expect(describeFailure(7).showHelp).toBe(true);
    expect(describeFailure(2).title).not.toBe(describeFailure(1).title);
  });

  it('treats a missing or zero count as a first failure', () => {
    expect(describeFailure().showHelp).toBe(false);
    expect(describeFailure(0).showHelp).toBe(false);
  });

  it('keeps a page path for the escalated case', () => {
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
