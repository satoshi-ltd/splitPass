export const updateSubscription = async (subscription, [state, setState]) => {
  await state.store.wipe('subscription');
  await state.store.get('subscription').save(subscription);

  setState({ ...state, subscription });
};
