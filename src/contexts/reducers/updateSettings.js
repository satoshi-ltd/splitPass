export const updateSettings = async (value, [state, setState]) => {
  const nextSettings = { ...state.settings, ...value };
  await state.store.get('settings').save(nextSettings);

  setState({ ...state, settings: nextSettings });
};
