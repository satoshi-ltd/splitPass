import { useState } from 'react';

import { Cypher } from '../../helpers/cypher';
import { QRParser } from '../../helpers/QRParser';
import { QR_TYPE, STEPS } from '../../App.constants';

const { PASSWORD, PASSWORD_ENCRYPTED, SEED_PHRASE, SEED_PHRASE_ENCRYPTED } = QR_TYPE;

const hasAllData = (secret, type) => {
  if (
    (type === PASSWORD && secret.includes('00')) ||
    (type === SEED_PHRASE && secret.includes('0000'))
  ) {
    return false;
  }
  return true;
};

export const useQRDecoder = (onDataDecoded) => {
  const [decodedData, setDecodedData] = useState([]);
  const [currentStep, setCurrentStep] = useState(STEPS.QR);

  const decodeData = (newData) => {
    const shards = newData.map(({ secret }) => secret);
    const secret = QRParser.combine(...shards);
    return secret;
  };

  const checkData = (newData) => {
    const secret = decodeData(newData);

    if (hasAllData(secret, newData[0].type)) {
      const secretDecrypted = QRParser.decode(secret);
      onDataDecoded(secretDecrypted);
      setDecodedData([]);
    }

    setCurrentStep(STEPS.QR);
  };

  const handleQRDecoding = (result) => {
    const [type, ...digits] = result;

    const newData = [...decodedData, { secret: result, digits: digits.join(''), type }];
    setDecodedData(newData);
    if ([PASSWORD_ENCRYPTED, SEED_PHRASE_ENCRYPTED].includes(type)) {
      return setCurrentStep(STEPS.PIN);
    }

    checkData(newData);
  };

  const handlePinChange = (pin) => {
    if (pin) {
      const newData = decodedData.map((item) => {
        if ([PASSWORD_ENCRYPTED, SEED_PHRASE_ENCRYPTED].includes(item.type)) {
          let type = PASSWORD;
          if (type === SEED_PHRASE_ENCRYPTED) type = SEED_PHRASE;
          const digits = Cypher.decrypt(item.digits, pin);
          return { digits, secret: `${type}${digits}`, type };
        }
        return item;
      });
      setDecodedData(newData);

      checkData(newData);
    }
  };

  return { decodedData, currentStep, handleQRDecoding, handlePinChange };
};
