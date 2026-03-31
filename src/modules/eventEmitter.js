const listenersByEvent = new Map();

const getListeners = (eventName) => listenersByEvent.get(eventName) || [];

export const eventEmitter = {
  on(eventName, listener) {
    listenersByEvent.set(eventName, [...getListeners(eventName), listener]);
    return this;
  },

  once(eventName, listener) {
    const wrapped = (...args) => {
      this.removeListener(eventName, wrapped);
      listener(...args);
    };

    wrapped.__original = listener;

    return this.on(eventName, wrapped);
  },

  emit(eventName, ...args) {
    const listeners = [...getListeners(eventName)];

    if (!listeners.length) return false;

    listeners.forEach((listener) => {
      try {
        listener(...args);
      } catch (error) {
        if (eventName !== 'error') {
          getListeners('error').forEach((errorListener) => {
            try {
              errorListener(error);
            } catch {}
          });
        }
      }
    });

    return true;
  },

  removeListener(eventName, listener) {
    const next = getListeners(eventName).filter(
      (registered) => registered !== listener && registered.__original !== listener,
    );

    if (next.length) {
      listenersByEvent.set(eventName, next);
    } else {
      listenersByEvent.delete(eventName);
    }

    return this;
  },

  off(eventName, listener) {
    return this.removeListener(eventName, listener);
  },

  removeAllListeners(eventName) {
    if (typeof eventName === 'string') {
      listenersByEvent.delete(eventName);
    } else {
      listenersByEvent.clear();
    }

    return this;
  },

  listenerCount(eventName) {
    return getListeners(eventName).length;
  },
};
