let depth = 0;

export const suspendAutoLock = () => {
  depth += 1;
};

export const resumeAutoLock = () => {
  depth = depth > 0 ? depth - 1 : 0;
};

export const isAutoLockSuspended = () => depth > 0;
