export const importBackup = ({ secrets = [], settings = {} }, [state, setState]) =>
  // eslint-disable-next-line no-undef, no-async-promise-executor
  new Promise(async (resolve) => {
    const { store } = state;

    await store.wipe('secrets');
    await store.wipe('settings');
    await store.get('secrets').save(secrets);
    await store.get('settings').save(settings);

    setState({
      ...state,
      secrets,
      settings,
    });
    resolve(true);
  });
