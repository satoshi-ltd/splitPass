import { formatDateTime } from '../../../modules';

export const verboseDate = (date = new Date(), { locale, ...props } = {}) => formatDateTime(date, locale, props);
