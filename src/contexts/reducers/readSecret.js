export const readSecret = async ({ hash } = {}, [state, setState]) => {
  const { store } = state;

  store.get('secrets');
  let secret = await store.findOne({ hash });
  if (!secret) return undefined;

  secret = { ...secret, readAt: new Date() };
  await store.update({ hash }, secret);
  setState({ ...state, memories: await store.value });

  return secret;
};
