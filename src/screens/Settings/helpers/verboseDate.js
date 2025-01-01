export const verboseDate = (date = new Date(), { locale = 'en-US', ...props } = {}) =>
  date.toLocaleDateString ? date.toLocaleDateString(locale, props) : date;
