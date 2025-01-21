import { Text, View } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React from 'react';
import StyleSheet from 'react-native-extended-stylesheet';

import { Frame } from './components';
import { style } from './Scanner.style';
import { L10N } from '../../modules';

// !TODO: We should bring the camera here

const ScannerQR = ({ reveal }) => {
  return (
    <>
      <View style={[style.instructions, style.background]}>
        <Text align="center" bold secondary title style={[style.instructionsContent, style.text]}>
          {L10N.SCANNER_QR}
        </Text>
        <Text align="center" caption color="contentLight" style={style.instructionsContent}>
          {L10N.SCANNER_QR_CAPTION}
        </Text>
      </View>

      <View row wide>
        <View style={[style.section, style.background]} wide />

        <Frame align="center">
          {reveal && (
            <Text align="center" bold color={StyleSheet.value('$qrBackgroundColor')} secondary>
              {reveal}
            </Text>
          )}
        </Frame>

        <View style={[style.section, style.background]} wide />
      </View>
    </>
  );
};

ScannerQR.propTypes = {
  reveal: PropTypes.string,
};

export { ScannerQR };
