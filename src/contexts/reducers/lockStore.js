import { DEFAULTS } from '../store.constants';

export const lockStore = async ([state, setState]) => {
  state.store.lock();

  setState({
    ...state,
    secrets: DEFAULTS.secrets,
    security: state.store.security,
  });

  return true;
};
