import { consumeConfirmCallbacks, openConfirm } from '../confirmNavigation';

describe('confirmNavigation', () => {
  describe('consumeConfirmCallbacks', () => {
    it('returns an empty object when called with no id', () => {
      expect(consumeConfirmCallbacks()).toEqual({});
    });

    it('returns an empty object for an unrecognised id', () => {
      expect(consumeConfirmCallbacks('no-such-id')).toEqual({});
    });
  });

  describe('openConfirm', () => {
    it('calls navigation.navigate with "confirm" and the provided params', () => {
      const navigation = { navigate: jest.fn() };
      openConfirm(navigation, { title: 'Delete?' }, { onAccept: jest.fn() });

      expect(navigation.navigate).toHaveBeenCalledWith('confirm', expect.objectContaining({ title: 'Delete?' }));
    });

    it('includes a callbackId in the navigation params', () => {
      const navigation = { navigate: jest.fn() };
      openConfirm(navigation, {}, { onAccept: jest.fn() });

      const [, params] = navigation.navigate.mock.calls[0];
      expect(params).toHaveProperty('callbackId');
      expect(typeof params.callbackId).toBe('string');
    });

    it('round-trips: consumeConfirmCallbacks recovers the registered callbacks', () => {
      const navigation = { navigate: jest.fn() };
      const onAccept = jest.fn();
      const onCancel = jest.fn();

      openConfirm(navigation, {}, { onAccept, onCancel });

      const [, params] = navigation.navigate.mock.calls[0];
      const callbacks = consumeConfirmCallbacks(params.callbackId);

      expect(callbacks.onAccept).toBe(onAccept);
      expect(callbacks.onCancel).toBe(onCancel);
    });

    it('consuming a callbackId removes it (single-use)', () => {
      const navigation = { navigate: jest.fn() };
      openConfirm(navigation, {}, { onAccept: jest.fn() });

      const [, params] = navigation.navigate.mock.calls[0];
      consumeConfirmCallbacks(params.callbackId);

      expect(consumeConfirmCallbacks(params.callbackId)).toEqual({});
    });

    it('registers separate callbacks for each call to openConfirm', () => {
      const nav = { navigate: jest.fn() };
      const onAccept1 = jest.fn();
      const onAccept2 = jest.fn();

      openConfirm(nav, {}, { onAccept: onAccept1 });
      openConfirm(nav, {}, { onAccept: onAccept2 });

      const id1 = nav.navigate.mock.calls[0][1].callbackId;
      const id2 = nav.navigate.mock.calls[1][1].callbackId;

      expect(id1).not.toBe(id2);
      expect(consumeConfirmCallbacks(id1).onAccept).toBe(onAccept1);
      expect(consumeConfirmCallbacks(id2).onAccept).toBe(onAccept2);
    });

    it('omits the callbackId when neither onAccept nor onCancel is a function', () => {
      const navigation = { navigate: jest.fn() };
      openConfirm(navigation, { title: 'Info' }, {});

      const [, params] = navigation.navigate.mock.calls[0];
      expect(params.callbackId).toBeUndefined();
    });
  });
});
