import { UUID } from './modules';

export const createSecret = async ({ name, value } = {}, [state, setState]) => {
  const { store } = state;
  const createdAt = new Date();

  store.get('secrets');
  let secret = await store.save({
    hash: UUID({ entity: 'secret', name, value, createdAt }),
    name,
    value,
    createdAt,
  });
  setState({ ...state, secrets: await store.value });

  return secret;
};
