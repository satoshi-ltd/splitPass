import { L10N } from '../../../modules';
import { ServiceRates } from '../../../services';

export const getLatestRates = async ({
  store: {
    settings: { baseCurrency },
    updateRates,
  },
}) => {
  const rates = await ServiceRates.get({ baseCurrency, latest: true }).catch(() => alert(L10N.ERROR_SERVICE_RATES));

  if (rates) await updateRates(rates);
};
