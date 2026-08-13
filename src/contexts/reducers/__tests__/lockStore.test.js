jest.mock('../../../modules', () => ({ resetToUnlock: jest.fn() }));

import { resetToUnlock } from '../../../modules';
import { lockStore } from '../lockStore';

const createStore = ({ unlocked = true } = {}) => ({
  lock: jest.fn(),
  security: { configured: true, legacy: false, unlocked },
});

const applyUpdater = (setState, latestState) => {
  const [updater] = setState.mock.calls[0];

  return typeof updater === 'function' ? updater(latestState) : updater;
};

describe('lockStore reducer', () => {
  beforeEach(() => jest.clearAllMocks());

  it('locks the store and routes back to unlock', async () => {
    const store = createStore();
    const setState = jest.fn();

    await lockStore([{ store, secrets: [{ hash: 'secret:1' }] }, setState]);

    expect(store.lock).toHaveBeenCalled();
    expect(resetToUnlock).toHaveBeenCalled();
    expect(applyUpdater(setState, { store }).secrets).toEqual([]);
  });

  it('keeps settings written after the render it was called from', async () => {
    const store = createStore();
    const setState = jest.fn();
    const staleState = { store, settings: { biometricUnlockEnabled: true } };
    const latestState = { store, settings: { biometricUnlockEnabled: false } };

    await lockStore([staleState, setState]);

    expect(applyUpdater(setState, latestState).settings).toEqual({ biometricUnlockEnabled: false });
  });

  it('routes to unlock without touching an already locked store', async () => {
    const store = createStore({ unlocked: false });
    const setState = jest.fn();

    await lockStore([{ store }, setState]);

    expect(store.lock).not.toHaveBeenCalled();
    expect(setState).not.toHaveBeenCalled();
    expect(resetToUnlock).toHaveBeenCalled();
  });
});
