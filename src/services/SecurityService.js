export const SecurityService = {
  checkCard: async ({ tag = {} }) => !!tag?.info?.id,
};
