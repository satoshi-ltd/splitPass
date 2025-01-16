import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { L10N } from '../modules';

const IS_WEB = Platform.OS === 'web';
const APIKEY = {
  ios: 'appl_UpcVUSYlXYWPnJiAoroqRrpKuhT',
  android: 'goog_bzzicUKLHqrXEdrltqKGmdXgyyI',
};

const initializePurchases = async () => {
  const Purchases = require('react-native-purchases').default;

  Purchases.setLogLevel(Purchases.LOG_LEVEL.VERBOSE);
  Purchases.configure({ apiKey: APIKEY[Platform.OS] });

  return Purchases;
};

export const PurchaseService = {
  getProducts: async () =>
    // eslint-disable-next-line no-undef, no-async-promise-executor
    new Promise(async (resolve, reject) => {
      if (Constants.appOwnership === 'expo' || IS_WEB) return resolve([]);

      try {
        const Purchases = await initializePurchases();

        const offerings = await Purchases.getOfferings();

        if (offerings.current !== null && offerings.current.availablePackages.length !== 0) {
          const plans = Object.fromEntries(
            offerings.current.availablePackages.map((item) => [
              item.identifier,
              {
                data: item,
                productId: item.identifier,
                price: item.product.priceString,
                pricePerMonth: item.product.pricePerMonthString,
                title: item.product.title,
              },
            ]),
          );
          resolve(plans);
        } else {
          resolve([]);
        }
      } catch (error) {
        reject(`${L10N.ERROR}: ${JSON.stringify(error)}`);
      }
    }),
  buy: async (plan) =>
    // eslint-disable-next-line no-undef, no-async-promise-executor
    new Promise(async (resolve, reject) => {
      if (Constants.appOwnership === 'expo' || IS_WEB) return resolve({ productIdentifier: 'lifetime' });

      try {
        const Purchases = await initializePurchases();

        const { customerInfo, productIdentifier } = await Purchases.purchasePackage(plan);

        if (typeof customerInfo.entitlements.active['pro'] !== 'undefined') {
          resolve({ customerInfo, productIdentifier });
        } else {
          reject(L10N.ERROR_PURCHASE);
        }
      } catch (error) {
        if (!error.userCancelled) {
          reject(`${L10N.ERROR}: ${JSON.stringify(error)}`);
        }
      }
    }),
  restore: async () =>
    // eslint-disable-next-line no-undef, no-async-promise-executor
    new Promise(async (resolve, reject) => {
      if (Constants.appOwnership === 'expo' || IS_WEB) return resolve({ productIdentifier: 'lifetime' });

      try {
        const Purchases = await initializePurchases();

        const customerInfo = await Purchases.restorePurchases();

        if (typeof customerInfo.entitlements.active['pro'] !== 'undefined') {
          resolve({ customerInfo, productIdentifier: customerInfo.entitlements.active['pro'].productIdentifier });
        } else {
          reject(L10N.ERROR_RESTORE);
        }
      } catch (error) {
        reject(`${L10N.ERROR}: ${JSON.stringify(error)}`);
      }
    }),
  checkSubscription: async (subscription) =>
    // eslint-disable-next-line no-undef, no-async-promise-executor
    new Promise(async (resolve, reject) => {
      if (Constants.appOwnership === 'expo' || IS_WEB || subscription.productIdentifier === 'lifetime')
        return resolve(true);

      try {
        const Purchases = await initializePurchases();

        const customerInfo = await Purchases.getCustomerInfo();
        if (typeof customerInfo.entitlements.active['pro'] !== 'undefined') {
          resolve(true);
        } else {
          resolve(false);
        }
      } catch (error) {
        reject(`${L10N.ERROR}: ${JSON.stringify(error)}`);
      }
    }),
};
