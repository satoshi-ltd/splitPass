import { isAutoLockSuspended, resumeAutoLock, suspendAutoLock } from '../autoLockGuard';

describe('autoLockGuard', () => {
  it('is not suspended by default', () => {
    expect(isAutoLockSuspended()).toBe(false);
  });

  it('suspends while a system modal is open and resumes after', () => {
    suspendAutoLock();
    expect(isAutoLockSuspended()).toBe(true);
    resumeAutoLock();
    expect(isAutoLockSuspended()).toBe(false);
  });

  it('reference-counts nested suspensions', () => {
    suspendAutoLock();
    suspendAutoLock();
    resumeAutoLock();
    expect(isAutoLockSuspended()).toBe(true);
    resumeAutoLock();
    expect(isAutoLockSuspended()).toBe(false);
  });

  it('never drops below zero', () => {
    resumeAutoLock();
    resumeAutoLock();
    expect(isAutoLockSuspended()).toBe(false);
    suspendAutoLock();
    expect(isAutoLockSuspended()).toBe(true);
    resumeAutoLock();
  });
});
