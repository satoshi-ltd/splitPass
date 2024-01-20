import { QrScanner } from '@yudiel/react-qr-scanner';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import StyleSheet from 'react-native-extended-stylesheet';

import { style } from './App.style';
import IconPNG from './assets/icon.png';
import { getPositionIconStyle } from './helpers/getPositionIconStyle';
import { STEPS } from '../App.constants';
import { InputPin } from '../components/InputPin';
import { Popup } from '../components/Popup';
import { useQRDecoder } from '../hooks';
import { defaultTheme } from '../themes/default.theme';

StyleSheet.build(defaultTheme);

function App({ passwordField }) {
  const [isOpen, setIsOpen] = useState(false);
  const iconStyle = getPositionIconStyle(passwordField);

  const onDataDecoded = (secret) => {
    setIsOpen(false);
    passwordField.value = secret;
  };
  const { currentStep, handleQRDecoding, handlePinChange } =
    useQRDecoder(onDataDecoded);

  return (
    <>
      <Popup
        content={
          <>
            {currentStep === STEPS.QR ? (
              <QrScanner
                onDecode={handleQRDecoding}
                scanDelay={2000}
                stopDecoding={!isOpen}
              />
            ) : null}
            {currentStep === STEPS.PIN ? (
              <InputPin align="center" onChange={handlePinChange} />
            ) : null}
          </>
        }
        isOpen={isOpen}
        popupStyle={style.container}
        style={iconStyle}
      >
        <img alt="icon" onClick={() => setIsOpen(!isOpen)} src={IconPNG} />
      </Popup>
    </>
  );
}

App.propTypes = {
  passwordField: PropTypes.node,
};

export default App;
