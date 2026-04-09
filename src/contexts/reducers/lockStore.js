import { resetToUnlock } from '../../modules';
import { DEFAULTS } from '../store.constants';

export const lockStore = async ([state, setState]) => {
  if (!state.store?.security?.unlocked) {
    resetToUnlock();
    return true;
  }

  state.store.lock();

  setState({
    ...state,
    secrets: DEFAULTS.secrets,
    security: state.store.security,
  });
  resetToUnlock();

  return true;
};
