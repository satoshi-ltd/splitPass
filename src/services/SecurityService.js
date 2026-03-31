export const SecurityService = {
  checkCard: async ({ tag = {} }) =>
    // eslint-disable-next-line no-undef, no-async-promise-executor
    new Promise(async (resolve) => {
      resolve(!!tag?.info?.id);
    }),
};
