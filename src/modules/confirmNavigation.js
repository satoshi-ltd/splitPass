let confirmCallbackSequence = 0;

const confirmCallbacks = new Map();

const registerConfirmCallbacks = ({ onAccept, onCancel } = {}) => {
  if (typeof onAccept !== 'function' && typeof onCancel !== 'function') return undefined;

  const callbackId = `confirm-${Date.now()}-${confirmCallbackSequence++}`;
  confirmCallbacks.set(callbackId, { onAccept, onCancel });
  return callbackId;
};

const consumeConfirmCallbacks = (callbackId) => {
  if (!callbackId) return {};

  const callbacks = confirmCallbacks.get(callbackId) || {};
  confirmCallbacks.delete(callbackId);
  return callbacks;
};

const openConfirm = (navigation, params = {}, callbacks = {}) => {
  navigation.navigate('confirm', {
    ...params,
    callbackId: registerConfirmCallbacks(callbacks),
  });
};

export { consumeConfirmCallbacks, openConfirm };
