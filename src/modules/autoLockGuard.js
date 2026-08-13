let depth = 0;

export const suspendAutoLock = () => {
  depth += 1;
};

export const resumeAutoLock = () => {
  depth = depth > 0 ? depth - 1 : 0;
};

// Backstop for suspenders that never resume: expo-sharing hangs on iOS when a share target is cancelled.
export const resetAutoLock = () => {
  depth = 0;
};

export const isAutoLockSuspended = () => depth > 0;
