import { readSecret } from '../readSecret';

const SECRET = { hash: 'secret:1', name: 'Gmail', value: '1234' };

const createStore = ({ unlocked = true, missing = false } = {}) => {
  const store = {
    security: { configured: true, legacy: false, unlocked },
    get: jest.fn(() => store),
    findOne: jest.fn(async () => (missing ? undefined : SECRET)),
    update: jest.fn(async () => [SECRET]),
    value: [SECRET],
  };

  return store;
};

describe('readSecret reducer', () => {
  beforeEach(() => jest.clearAllMocks());

  it('stamps readAt and persists it', async () => {
    const store = createStore();
    const setState = jest.fn();

    const result = await readSecret({ hash: 'secret:1' }, [{ store }, setState]);

    expect(store.update).toHaveBeenCalledWith({ hash: 'secret:1' }, expect.objectContaining({ hash: 'secret:1' }));
    expect(Date.parse(result.readAt)).not.toBeNaN();
  });

  it('does nothing once the vault is locked', async () => {
    const store = createStore({ unlocked: false });
    const setState = jest.fn();

    await expect(readSecret({ hash: 'secret:1' }, [{ store }, setState])).resolves.toBeUndefined();

    expect(store.update).not.toHaveBeenCalled();
    expect(setState).not.toHaveBeenCalled();
  });

  it('does nothing when the secret is gone', async () => {
    const store = createStore({ missing: true });
    const setState = jest.fn();

    await expect(readSecret({ hash: 'secret:1' }, [{ store }, setState])).resolves.toBeUndefined();

    expect(store.update).not.toHaveBeenCalled();
    expect(setState).not.toHaveBeenCalled();
  });

  it('merges onto the latest state instead of the one it was called with', async () => {
    const store = createStore();
    const setState = jest.fn();

    await readSecret({ hash: 'secret:1' }, [{ store, settings: { theme: 'light' } }, setState]);

    const [updater] = setState.mock.calls[0];
    expect(updater({ store, settings: { theme: 'dark' } }).settings).toEqual({ theme: 'dark' });
  });
});
