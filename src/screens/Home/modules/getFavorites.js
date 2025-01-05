export const getFavorites = (qrs = []) => qrs.filter(({ favorite = false }) => favorite);
