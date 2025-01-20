export const SecurityService = {
  checkCard: async ({ subscription, tag = {} }) =>
    // eslint-disable-next-line no-undef, no-async-promise-executor
    new Promise(async (resolve) => {
      const isPremium = !!subscription?.productIdentifier;
      if (isPremium) resolve(true);

      if (!isPremium) {
        const response = await fetch('https://splitpass.satoshi-ltd.com/cards/valid', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tagId: tag.info?.id }),
        });
        const { isValid } = (await response?.json()) || {};

        resolve(isValid);
      }
    }),
};
