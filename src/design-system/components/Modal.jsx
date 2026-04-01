import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Dimensions, KeyboardAvoidingView, Modal as RNModal, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getStyles } from './Modal.styles';
import { useApp } from '../../contexts';
import { theme } from '../../theme';
import Pressable from '../primitives/Pressable';
import View from '../primitives/View';

const Modal = ({ children, gap, onClose }) => {
  const { colors } = useApp();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const [visible, setVisible] = useState(true);
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(Dimensions.get('window').height)).current;
  const screenHeight = Dimensions.get('window').height;

  useEffect(() => {
    backdropOpacity.setValue(0);
    translateY.setValue(screenHeight);

    Animated.parallel([
      Animated.timing(backdropOpacity, {
        duration: 180,
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: false,
      }),
    ]).start();
  }, [backdropOpacity, screenHeight, translateY]);

  const handleClose = () => {
    if (!onClose) return;

    Animated.parallel([
      Animated.timing(backdropOpacity, {
        duration: 160,
        toValue: 0,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        duration: theme.animations.duration.quick,
        toValue: screenHeight,
        useNativeDriver: false,
      }),
    ]).start(() => {
      setVisible(false);
      onClose();
    });
  };

  if (!visible) return null;

  return (
    <RNModal transparent animationType="none" visible={visible} onRequestClose={onClose ? handleClose : undefined}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <Pressable onPress={handleClose} style={styles.backdropPressable} />
        </Animated.View>
        <KeyboardAvoidingView behavior={Platform.OS === 'android' ? 'height' : 'padding'} style={styles.keyboardAvoid}>
          <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
            <SafeAreaView edges={['bottom']} style={styles.container}>
              <View gap={gap} style={styles.content}>
                {children}
              </View>
            </SafeAreaView>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </RNModal>
  );
};

Modal.propTypes = {
  children: PropTypes.node,
  gap: PropTypes.oneOfType([PropTypes.bool, PropTypes.number, PropTypes.string]),
  onClose: PropTypes.func,
};

export default Modal;
