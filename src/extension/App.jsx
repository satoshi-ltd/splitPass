import React, { useState } from 'react';
import StyleSheet from 'react-native-extended-stylesheet';
// import { QrScanner } from '@yudiel/react-qr-scanner';

import { Text } from '../__primitives__/Text';
import { getPositionIconStyle } from './helpers/getPositionIconStyle';
import IconPNG from './assets/icon.png';
import { defaultTheme } from '../themes/default.theme';

StyleSheet.build(defaultTheme);

function App({ passwordField }) {
  const [isOpen, setIsOpen] = useState(false);

  const iconStyle = getPositionIconStyle(passwordField);
  // console.log('iconStyle', iconStyle);

  // const onDecode = (result) => {
  //   console.log(result);
  //   setIsOpen(false);
  //   var passwordFieldElement = document.getElementById(passwordFieldId);
  //   passwordFieldElement.value = result;
  // };
  // const onError = (error) => {
  //   console.log(error?.message);
  // };

  // const popupStyle = {
  //   display: 'block',
  //   position: 'absolute',
  //   left: '50px',
  //   top: '50px',
  //   width: '300px',
  //   height: '300px',
  //   backgroundColor: 'white',
  //   border: '1px solid black',
  //   padding: '20px',
  //   zIndex: 1000,
  //   boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  // };

  return (
    <>
      <img alt="icon" onClick={() => setIsOpen(true)} src={IconPNG} style={iconStyle} />
      <Text>Holaaaaa</Text>
      {/* {isOpen && (
        <div style={popupStyle}>
          <QrScanner onDecode={onDecode} onError={onError} scanDelay={2000} stopDecoding={!isOpen} />
        </div>
      )} */}
    </>
  );
}

export default App;
