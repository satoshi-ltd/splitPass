export const readSecret = async ({ hash } = {}, [state, setState]) => {
  const { store } = state;

  store.get('secrets');
  let secret = await store.findOne({ hash });
  if (!secret) return undefined;

  secret = { ...secret, readAt: new Date().toISOString() };
  await store.update({ hash }, secret);
  setState({ ...state, secrets: [...(store.value || [])], security: state.store.security });

  return secret;
};
