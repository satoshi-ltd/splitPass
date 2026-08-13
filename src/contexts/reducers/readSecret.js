export const readSecret = async ({ hash } = {}, [state, setState]) => {
  const { store } = state;

  if (!store?.security?.unlocked) return undefined;

  store.get('secrets');
  const secret = await store.findOne({ hash });
  if (!secret) return undefined;

  const stamped = { ...secret, readAt: new Date().toISOString() };
  await store.update({ hash }, stamped);
  setState((current) => ({ ...current, secrets: [...(store.value || [])], security: store.security }));

  return stamped;
};
