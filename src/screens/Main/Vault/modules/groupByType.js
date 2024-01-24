import { QR_TYPE } from '../../../../App.constants';

const { PASSWORD, PASSWORD_ENCRYPTED } = QR_TYPE;

export const groupByType = (dataSource = [], search) => {
  const result = {};

  dataSource
    .filter((item) => (search ? JSON.stringify(item).toLowerCase().includes(search.toLowerCase()) : true))
    .forEach(({ qr, name, timestamp }) => {
      const [type] = qr;
      const qrType = [PASSWORD, PASSWORD_ENCRYPTED].includes(type) ? 'Master' : 'Shard';

      result[qrType] = result[qrType] || [];
      result[qrType].push({ qr, name, timestamp });
    });

  return result;
};
