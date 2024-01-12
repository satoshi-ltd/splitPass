import { QrScanner } from '@yudiel/react-qr-scanner';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import StyleSheet from 'react-native-extended-stylesheet';

import { style } from './App.style';
import IconPNG from './assets/icon.png';
import { getPositionIconStyle } from './helpers/getPositionIconStyle';
import { Popup } from '../components/Popup';
import { defaultTheme } from '../themes/default.theme';

StyleSheet.build(defaultTheme);

function App({ passwordField }) {
  const [isOpen, setIsOpen] = useState(false);

  const iconStyle = getPositionIconStyle(passwordField);

  const onDecode = (result) => {
    console.log(result);
    setIsOpen(false);
    passwordField.value = result;
  };
  const onError = (error) => {
    console.log(error?.message);
  };

  return (
    <>
      <Popup
        content={<QrScanner onDecode={onDecode} onError={onError} scanDelay={2000} stopDecoding={!isOpen} />}
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
