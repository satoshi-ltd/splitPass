import { createNavigationContainerRef } from '@react-navigation/native';

const navigationRef = createNavigationContainerRef();

const resetToUnlock = () => {
  if (!navigationRef.isReady()) return false;

  navigationRef.resetRoot({ index: 0, routes: [{ name: 'unlock' }] });
  return true;
};

export { navigationRef, resetToUnlock };
