import { Text, View } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React from 'react';
import StyleSheet from 'react-native-extended-stylesheet';
import { CameraView, useCameraPermissions } from 'expo-camera';

import { style } from './Scanner.style';

// !TODO: We should bring the camera here

const ScannerQR = ({ reveal }) => {
  return (
    <>
      <View row wide>
        <View style={style.section} wide />

        <View style={style.frame}>
          <View style={[style.corner, style.topLeft]} />
          <View style={[style.corner, style.topRight]} />
          <View style={[style.corner, style.bottomLeft]} />
          <View style={[style.corner, style.bottomRight]} />

          {reveal && (
            <View align="center" style={style.reveal}>
              <Text align="center" bold caption color={StyleSheet.value('$qrBackgroundColor')}>
                {reveal}
              </Text>
            </View>
          )}
        </View>

        <View style={style.section} wide />
      </View>
    </>
  );
};

ScannerQR.propTypes = {
  reveal: PropTypes.string,
};

export { ScannerQR };
