export const updateSecret = async ({ hash, ...update } = {}, [state, setState]) => {
  const { store } = state;

  store.get('secrets');
  let secret = await store.findOne({ hash });
  if (!secret) return undefined;

  secret = { ...secret, ...update };
  await store.update({ hash }, secret);
  setState({ ...state, secrets: await store.value });

  return secret;
};
