import { SECRET_TYPE } from '../App.constants';
import { getSecretStrength } from './passwordGenerator';
import { QRParser } from './QRParser';

const PASSWORD_REPEAT_TYPES = [SECRET_TYPE.PASSWORD];

const EMPTY_RISK = { isMediocre: false, isRepeated: false };

const normalizeRepeatedCandidate = ({ value = '' } = {}) => {
  const [type] = `${value}`;

  if (!PASSWORD_REPEAT_TYPES.includes(type)) return '';

  const decoded = QRParser.decode(value);
  const normalized = `${decoded || ''}`.trim();

  return normalized;
};

const getSecretRiskMap = (secrets = []) => {
  const list = Array.isArray(secrets) ? secrets : [];
  const repeatedCandidates = {};
  const snapshots = list.map((secret = {}) => {
    const hash = secret.hash;
    const repeatedCandidate = normalizeRepeatedCandidate(secret);
    const isMediocre = getSecretStrength(secret) !== 'strong';

    if (hash && repeatedCandidate) {
      const hashes = repeatedCandidates[repeatedCandidate] || [];
      repeatedCandidates[repeatedCandidate] = [...hashes, hash];
    }

    return { hash, isMediocre, repeatedCandidate };
  });
  const repeatedValues = {};
  Object.keys(repeatedCandidates).forEach((value) => {
    if (repeatedCandidates[value].length > 1) repeatedValues[value] = true;
  });

  return snapshots.reduce((result, { hash, isMediocre, repeatedCandidate }) => {
    if (!hash) return result;

    result[hash] = {
      isMediocre,
      isRepeated: repeatedCandidate ? !!repeatedValues[repeatedCandidate] : false,
    };

    return result;
  }, {});
};

const getSecretRisk = ({ hash } = {}, riskMap = {}) => {
  if (!hash) return EMPTY_RISK;

  return riskMap?.[hash] || EMPTY_RISK;
};

export { getSecretRisk, getSecretRiskMap };
