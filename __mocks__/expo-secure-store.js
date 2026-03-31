module.exports = {
  canUseBiometricAuthentication: jest.fn(async () => true),
  deleteItemAsync: jest.fn(async () => true),
  getItemAsync: jest.fn(async () => null),
  setItemAsync: jest.fn(async () => true),
};
