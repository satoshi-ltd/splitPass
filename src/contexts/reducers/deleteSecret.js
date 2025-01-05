export const deleteSecret = async ({ hash }, [state, setState]) => {
  const { store } = state;

  store.get('secrets');
  await store.remove({ hash });
  setState({ ...state, secrets: await store.value });
};
