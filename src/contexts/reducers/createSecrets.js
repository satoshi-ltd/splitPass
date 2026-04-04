import { UUID } from './modules';

export const createSecrets = async (items = [], [state, setState]) => {
  const { store } = state;
  const pending = Array.isArray(items)
    ? items.filter(Boolean).map((item = {}) => {
        const createdAt = new Date().toISOString();
        const { name, value, username, notes, kind, brand, ...meta } = item;

        delete meta.website;

        return {
          hash: UUID({ entity: 'secret', name, value, createdAt }),
          name,
          value,
          username,
          notes,
          kind,
          brand,
          ...meta,
          createdAt,
        };
      })
    : [];

  if (!pending.length) return [];

  store.get('secrets');
  await store.save(pending);
  setState({ ...state, secrets: await store.value, security: state.store.security });

  return pending;
};
