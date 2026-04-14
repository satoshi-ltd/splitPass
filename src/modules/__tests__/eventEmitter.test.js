import { eventEmitter } from '../eventEmitter';

beforeEach(() => {
  eventEmitter.removeAllListeners();
});

describe('eventEmitter', () => {
  describe('on / emit', () => {
    it('calls a registered listener when the event is emitted', () => {
      const listener = jest.fn();
      eventEmitter.on('test', listener);
      eventEmitter.emit('test');
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('passes arguments to the listener', () => {
      const listener = jest.fn();
      eventEmitter.on('data', listener);
      eventEmitter.emit('data', 1, 'hello');
      expect(listener).toHaveBeenCalledWith(1, 'hello');
    });

    it('calls multiple listeners registered for the same event', () => {
      const a = jest.fn();
      const b = jest.fn();
      eventEmitter.on('multi', a).on('multi', b);
      eventEmitter.emit('multi');
      expect(a).toHaveBeenCalledTimes(1);
      expect(b).toHaveBeenCalledTimes(1);
    });

    it('returns true when at least one listener exists', () => {
      eventEmitter.on('ping', jest.fn());
      expect(eventEmitter.emit('ping')).toBe(true);
    });

    it('returns false when no listener is registered', () => {
      expect(eventEmitter.emit('noop')).toBe(false);
    });

    it('does not call listeners for other events', () => {
      const listener = jest.fn();
      eventEmitter.on('a', listener);
      eventEmitter.emit('b');
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('once', () => {
    it('calls the listener only the first time the event fires', () => {
      const listener = jest.fn();
      eventEmitter.once('ping', listener);
      eventEmitter.emit('ping');
      eventEmitter.emit('ping');
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('removes itself after firing', () => {
      eventEmitter.once('ping', jest.fn());
      eventEmitter.emit('ping');
      expect(eventEmitter.listenerCount('ping')).toBe(0);
    });

    it('passes arguments to the once listener', () => {
      const listener = jest.fn();
      eventEmitter.once('data', listener);
      eventEmitter.emit('data', 42);
      expect(listener).toHaveBeenCalledWith(42);
    });
  });

  describe('removeListener / off', () => {
    it('removes the specified listener so it is not called again', () => {
      const listener = jest.fn();
      eventEmitter.on('click', listener);
      eventEmitter.removeListener('click', listener);
      eventEmitter.emit('click');
      expect(listener).not.toHaveBeenCalled();
    });

    it('off is an alias for removeListener', () => {
      const listener = jest.fn();
      eventEmitter.on('click', listener);
      eventEmitter.off('click', listener);
      eventEmitter.emit('click');
      expect(listener).not.toHaveBeenCalled();
    });

    it('can remove a once listener by its original reference', () => {
      const listener = jest.fn();
      eventEmitter.once('click', listener);
      eventEmitter.off('click', listener);
      eventEmitter.emit('click');
      expect(listener).not.toHaveBeenCalled();
    });

    it('keeps other listeners intact when removing one', () => {
      const a = jest.fn();
      const b = jest.fn();
      eventEmitter.on('event', a).on('event', b);
      eventEmitter.off('event', a);
      eventEmitter.emit('event');
      expect(a).not.toHaveBeenCalled();
      expect(b).toHaveBeenCalledTimes(1);
    });
  });

  describe('removeAllListeners', () => {
    it('removes all listeners for a specific event', () => {
      eventEmitter.on('a', jest.fn()).on('a', jest.fn()).on('b', jest.fn());
      eventEmitter.removeAllListeners('a');
      expect(eventEmitter.listenerCount('a')).toBe(0);
      expect(eventEmitter.listenerCount('b')).toBe(1);
    });

    it('removes listeners for all events when called without an argument', () => {
      eventEmitter.on('a', jest.fn()).on('b', jest.fn());
      eventEmitter.removeAllListeners();
      expect(eventEmitter.listenerCount('a')).toBe(0);
      expect(eventEmitter.listenerCount('b')).toBe(0);
    });
  });

  describe('listenerCount', () => {
    it('returns 0 for an event with no listeners', () => {
      expect(eventEmitter.listenerCount('unknown')).toBe(0);
    });

    it('returns the correct count after adding listeners', () => {
      eventEmitter.on('x', jest.fn()).on('x', jest.fn());
      expect(eventEmitter.listenerCount('x')).toBe(2);
    });

    it('decreases after removing a listener', () => {
      const listener = jest.fn();
      eventEmitter.on('x', listener);
      eventEmitter.off('x', listener);
      expect(eventEmitter.listenerCount('x')).toBe(0);
    });
  });

  describe('error handling in emit', () => {
    it('forwards listener errors to registered error listeners', () => {
      const errorHandler = jest.fn();
      eventEmitter.on('error', errorHandler);
      eventEmitter.on('boom', () => {
        throw new Error('oops');
      });
      eventEmitter.emit('boom');
      expect(errorHandler).toHaveBeenCalledWith(expect.any(Error));
    });

    it('continues calling other listeners even if one throws', () => {
      const safe = jest.fn();
      eventEmitter.on('risky', () => {
        throw new Error('fail');
      });
      eventEmitter.on('risky', safe);
      eventEmitter.emit('risky');
      expect(safe).toHaveBeenCalledTimes(1);
    });
  });
});
