const maskSecret = (value = '') => `${value}`.replace(/[^\s]/g, '*');

const CARD_NUMBER_PATTERN = /^\d{13,19}$/;
const CARD_EXPIRE_PATTERN = /^(0[1-9]|1[0-2])\/\d{2}$/;
const CARD_CVV_PATTERN = /^\d{3,4}$/;
const CARD_SECRET_PATTERN = /^(\d{13,19})\|((?:0[1-9]|1[0-2])\/\d{2})\|(\d{3,4})$/;
const CARD_MASK_CHAR = '*';

const normalizeCardNumber = (value = '') => `${value}`.replace(/\D/g, '').slice(0, 19);

const normalizeCardExpire = (value = '') => {
  const digits = `${value}`.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;

  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
};

const normalizeCardCvv = (value = '') => `${value}`.replace(/\D/g, '').slice(0, 4);

const isCardNumber = (value = '') => {
  const normalized = normalizeCardNumber(value);
  const compact = `${value}`.replace(/\s/g, '');

  return CARD_NUMBER_PATTERN.test(normalized) && normalized.length === compact.length;
};

const isCardExpire = (value = '') => CARD_EXPIRE_PATTERN.test(`${value}`.trim());

const isCardCvv = (value = '') => CARD_CVV_PATTERN.test(`${value}`.trim());

const buildCardValue = (number = '', expire = '', cvv = '') => {
  const normalizedNumber = normalizeCardNumber(number);
  const normalizedExpire = normalizeCardExpire(expire);
  const normalizedCvv = normalizeCardCvv(cvv);

  if (!isCardNumber(normalizedNumber) || !isCardExpire(normalizedExpire) || !isCardCvv(normalizedCvv)) return undefined;

  return `${normalizedNumber}|${normalizedExpire}|${normalizedCvv}`;
};

const parseCardValue = (value = '') => {
  const text = `${value}`.trim();
  if (!text) return undefined;

  const canonical = text.match(CARD_SECRET_PATTERN);
  if (canonical) {
    const [, number, expire, cvv] = canonical;
    return { canonical: `${number}|${expire}|${cvv}`, cvv, expire, number };
  }

  if (!isCardNumber(text)) return undefined;

  const number = normalizeCardNumber(text);
  return { canonical: number, number };
};

const formatCardNumber = (value = '') => {
  const digits = parseCardValue(value)?.number || normalizeCardNumber(value);

  return digits.replace(/(.{4})/g, '$1 ').trim();
};

const getMaskedCardValue = (value = '') => {
  const card = parseCardValue(value);
  if (!card) return undefined;

  return {
    number: formatCardNumber(card.number).replace(/\d/g, CARD_MASK_CHAR),
    expire: card.expire ? card.expire.replace(/\d/g, CARD_MASK_CHAR) : undefined,
    cvv: card.cvv ? card.cvv.replace(/\d/g, CARD_MASK_CHAR) : undefined,
  };
};

const isCardValue = (value = '') => !!parseCardValue(value);

const getSecretValueTokens = (value = '') => `${value}`.split(/(\s+)/).filter(Boolean);

export {
  buildCardValue,
  formatCardNumber,
  getMaskedCardValue,
  getSecretValueTokens,
  isCardCvv,
  isCardExpire,
  isCardNumber,
  isCardValue,
  maskSecret,
  normalizeCardCvv,
  normalizeCardExpire,
  normalizeCardNumber,
  parseCardValue,
};
