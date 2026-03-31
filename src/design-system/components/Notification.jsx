import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EVENT } from '../../App.constants';
import { useApp } from '../../contexts';
import { eventEmitter, ICON, L10N } from '../../modules';
import { theme } from '../../theme';
import Icon from '../primitives/Icon';
import Pressable from '../primitives/Pressable';
import Text from '../primitives/Text';
import View from '../primitives/View';

const getStyles = (colors) =>
  StyleSheet.create({
    notification: {
      borderRadius: theme.borderRadius.md,
      left: theme.spacing.md,
      padding: theme.spacing.md,
      position: 'absolute',
      right: theme.spacing.md,
      zIndex: 30,
    },
    dark: {
      backgroundColor: colors.inverse,
    },
    accent: {
      backgroundColor: colors.accent,
    },
    row: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    text: {
      flex: 1,
    },
  });

const DEFAULT_DISMISS_MS = 3000;

const Notification = () => {
  const { top } = useSafeAreaInsets();
  const { colors } = useApp();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const [height, setHeight] = useState(0);
  const [value, setValue] = useState();
  const [rendered, setRendered] = useState(false);
  const isVisibleRef = useRef(false);
  const anim = useRef(new Animated.Value(0)).current;
  const dismissTimerRef = useRef();
  const hiddenOffset = (height || 96) + Math.max(0, top) + theme.spacing.lg;

  useEffect(() => {
    const hide = () => {
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
      isVisibleRef.current = false;
      Animated.timing(anim, {
        toValue: 0,
        duration: theme.animations.duration.quick,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished && !isVisibleRef.current) setRendered(false);
      });
    };

    const show = (data = {}) => {
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
      setValue(data);
      setRendered(true);
      isVisibleRef.current = true;
      Animated.timing(anim, {
        toValue: 1,
        duration: theme.animations.duration.quick,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();

      if (!data.error) dismissTimerRef.current = setTimeout(hide, DEFAULT_DISMISS_MS);
    };

    const listener = (data = {}) => {
      if (isVisibleRef.current) {
        Animated.timing(anim, {
          toValue: 0,
          duration: 160,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }).start(({ finished }) => {
          if (finished) show(data);
        });
      } else {
        show(data);
      }
    };

    eventEmitter.on(EVENT.NOTIFICATION, listener);
    return () => {
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
      eventEmitter.off(EVENT.NOTIFICATION, listener);
    };
  }, [anim]);

  if (!rendered) return null;

  const { error, text, title, variant } = value || {};
  const accent = variant === 'accent' && !error;
  const iconTone = error ? 'danger' : accent ? 'onAccent' : 'onInverse';
  const contentTone = accent ? 'onAccent' : 'onInverse';
  const handleClose = () => {
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    isVisibleRef.current = false;
    Animated.timing(anim, {
      toValue: 0,
      duration: theme.animations.duration.quick,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) setRendered(false);
    });
  };

  return (
    <Animated.View
      onLayout={({ nativeEvent: { layout } = {} }) => {
        const nextHeight = Math.ceil(layout?.height || 0);
        if (nextHeight && nextHeight !== height) setHeight(nextHeight);
      }}
      style={[
        styles.notification,
        accent ? styles.accent : styles.dark,
        {
          top: Math.max(0, top) + theme.spacing.xs,
          transform: [
            {
              translateY: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [-hiddenOffset, 0],
              }),
            },
          ],
        },
      ]}
    >
      <Pressable onPress={handleClose}>
        <View style={styles.row}>
          <Icon name={error ? ICON.WARNING : ICON.INFO} tone={iconTone} />
          <View style={styles.text}>
            <Text bold tone={contentTone}>
              {title || (error ? L10N.ERROR : L10N.INFO)}
            </Text>
            {text ? (
              <Text size="xs" tone={contentTone}>
                {text}
              </Text>
            ) : null}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

export default Notification;
