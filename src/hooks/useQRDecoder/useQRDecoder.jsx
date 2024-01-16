import { useState } from 'react';

import { hasAllData } from '../../helpers/hasAllData';
import { Cypher } from '../../helpers/Cypher';
import { QRParser } from '../../helpers/QRParser';
import { QR_TYPE, STEPS } from '../../App.constants';

const { PASSWORD, PASSWORD_ENCRYPTED, SEED_PHRASE, SEED_PHRASE_ENCRYPTED } = QR_TYPE;

export const useQRDecoder = (onDataDecoded) => {
  const [decodedData, setDecodedData] = useState([]);
  const [currentStep, setCurrentStep] = useState(STEPS.QR);

  const decodeData = (newData) => {
    const shards = newData.map(({ secret }) => secret);
    const secretDecrypted = QRParser.decode(QRParser.combine(...shards));
    return secretDecrypted;
  };

  const checkData = (newData) => {
    if (hasAllData(newData)) {
      const secret = decodeData(newData);
      onDataDecoded(secret);
      setDecodedData([]);
      setCurrentStep(STEPS.QR);
    }
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
