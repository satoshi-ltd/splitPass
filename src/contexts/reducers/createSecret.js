import { UUID } from './modules';

export const createSecret = async (input = {}, [state, setState]) => {
  const { store } = state;
  const createdAt = new Date().toISOString();
  const { name, value, username, notes, kind, brand, ...meta } = input || {};

  delete meta.website;

  store.get('secrets');
  let secret = await store.save({
    hash: UUID({ entity: 'secret', name, value, createdAt }),
    name,
    value,
    username,
    notes,
    kind,
    brand,
    ...meta,
    createdAt,
  });
  setState({ ...state, secrets: await store.value, security: state.store.security });

  return secret;
};
