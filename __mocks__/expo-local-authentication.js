const LocalAuthentication = {
  AuthenticationType: {
    FACIAL_RECOGNITION: 2,
    FINGERPRINT: 1,
    IRIS: 3,
  },
  SecurityLevel: {
    BIOMETRIC_STRONG: 3,
    BIOMETRIC_WEAK: 2,
    NONE: 0,
    SECRET: 1,
  },
  getEnrolledLevelAsync: jest.fn(async () => 3),
  hasHardwareAsync: jest.fn(async () => true),
  isEnrolledAsync: jest.fn(async () => true),
  supportedAuthenticationTypesAsync: jest.fn(async () => [1]),
};

module.exports = LocalAuthentication;
