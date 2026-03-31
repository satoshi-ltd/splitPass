import { UUID } from './modules';

export const createSecret = async ({ name, value, website, kind, brand, ...meta } = {}, [state, setState]) => {
  const { store } = state;
  const createdAt = new Date().toISOString();

  store.get('secrets');
  let secret = await store.save({
    hash: UUID({ entity: 'secret', name, value, createdAt }),
    name,
    value,
    website,
    kind,
    brand,
    ...meta,
    createdAt,
  });
  setState({ ...state, secrets: await store.value, security: state.store.security });

  return secret;
};
