import Slider from '@react-native-community/slider';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { style } from './Passwords.style';
import { EVENT } from '../../App.constants';
import { useApp } from '../../contexts';
import { AppScreen, Button, HeaderBackButton, Icon, Text, View } from '../../design-system';
import { eventEmitter, generatePassword, getPasswordStrength, ICON, L10N } from '../../modules';
import { ClipboardService } from '../../services';

const DEFAULT_CONFIG = {
  length: 14,
  digits: 3,
  capitals: 3,
  symbols: 2,
};

const STRENGTH_CONFIG = {
  weak: { icon: ICON.WARNING, label: () => L10N.PASSWORD_STRENGTH_WEAK, tone: 'warning' },
  strong: { icon: ICON.SECURE, label: () => L10N.PASSWORD_STRENGTH_STRONG, tone: 'accent' },
  veryStrong: { icon: ICON.SHIELD, label: () => L10N.PASSWORD_STRENGTH_VERY_STRONG, tone: 'accent' },
};

const renderPassword = (password = '') =>
  password.split('').map((character, index) => (
    <Text key={`${character}-${index}`} bold size="l" tone={/\d/.test(character) ? 'accent' : 'onInverse'}>
      {character}
    </Text>
  ));

const Passwords = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { colors, theme } = useApp();
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [password, setPassword] = useState('');
  const isPicker = !!route?.params?.picker;

  const strength = useMemo(() => getPasswordStrength(config), [config]);
  const strengthMeta = STRENGTH_CONFIG[strength];
  const usedCharacters = config.digits + config.capitals + config.symbols;
  const footerContrast = theme === 'dark' ? 'light' : 'dark';

  useEffect(() => {
    setPassword(generatePassword(config));
  }, [config]);

  const handleLengthChange = (length = DEFAULT_CONFIG.length) => {
    setConfig((current) => {
      const nextLength = Math.max(8, Math.round(length), current.digits + current.capitals + current.symbols);
      return { ...current, length: nextLength };
    });
  };

  const handleCounter = (field) => (step) => {
    setConfig((current) => {
      const nextValue = Math.max(0, current[field] + step);
      const nextTotal =
        (field === 'digits' ? nextValue : current.digits) +
        (field === 'capitals' ? nextValue : current.capitals) +
        (field === 'symbols' ? nextValue : current.symbols);

      if (step > 0 && nextTotal > current.length) return current;

      return {
        ...current,
        [field]: nextValue,
      };
    });
  };

  const handleRefresh = () => {
    setPassword(generatePassword(config));
  };

  const handleCopy = async () => {
    await ClipboardService.copyWithAutoClear(password);
    eventEmitter.emit(EVENT.NOTIFICATION, { text: L10N.CREATE_PASSWORD_COPY_SUCCESS, title: L10N.SUCCESS });

    if (isPicker) {
      eventEmitter.emit(EVENT.PASSWORD_SELECTED, password);
      navigation.goBack();
      return;
    }
  };

  const header = (
    <View row spaceBetween align="center" style={style.header}>
      <HeaderBackButton onPress={() => navigation.goBack()} />
      <View row align="center" style={style.headerStatus}>
        <Text semibold size="s" tone={strengthMeta.tone}>
          {strengthMeta.label()}
        </Text>
        <Icon name={strengthMeta.icon} size="s" tone={strengthMeta.tone} />
      </View>
    </View>
  );

  const footer = (
    <View
      style={[
        style.footer,
        footerContrast === 'light' ? style.footerLight : style.footerDark,
        { paddingBottom: Math.max(insets.bottom, 16) },
      ]}
    >
      <View row spaceBetween align="center" style={style.footerRow}>
        <View row align="center" style={style.passwordWrap}>
          {renderPassword(password, footerContrast)}
        </View>

        <View row align="center" style={style.footerActions}>
          <Button icon={ICON.REFRESH} onPress={handleRefresh} size="m" tone="onInverse" variant="outlined" />
          <Button icon={ICON.COPY} onPress={handleCopy} size="m" tone="onInverse" variant="outlined" />
        </View>
      </View>
    </View>
  );

  return (
    <AppScreen
      contentContainerStyle={style.content}
      footer={footer}
      header={header}
      scrollable={false}
      style={style.screen}
    >
      <View style={style.hero}>
        <Text bold size="xl" tone="accent">
          {L10N.CREATE_TITLE}
        </Text>
        <Text bold size="l" tone="secondary" style={style.subtitle}>
          {L10N.CREATE_PASSWORD_SUBTITLE}
        </Text>
      </View>

      <View style={style.controlGroup}>
        <Text semibold size="s">
          {L10N.CREATE_PASSWORD_CHARACTERS}
        </Text>
        <View row align="center" spaceBetween style={style.sliderRow}>
          <Text tone="secondary" style={style.metricValue}>
            {config.length}
          </Text>
          <Slider
            maximumTrackTintColor={colors.border}
            minimumTrackTintColor={colors.text}
            minimumValue={8}
            maximumValue={32}
            step={1}
            thumbTintColor={colors.text}
            value={config.length}
            onValueChange={handleLengthChange}
            style={style.slider}
          />
        </View>
      </View>

      {[
        { field: 'digits', label: L10N.PASSWORDS_DIGITS, value: config.digits },
        { field: 'capitals', label: L10N.PASSWORDS_CAPITALS, value: config.capitals },
        { field: 'symbols', label: L10N.PASSWORDS_SYMBOLS, value: config.symbols },
      ].map(({ field, label, value }) => (
        <View key={field} style={style.counterGroup}>
          <Text semibold size="s">
            {label}
          </Text>
          <View row align="center" spaceBetween style={style.counterRow}>
            <Text tone="secondary" style={style.metricValue}>
              {value}
            </Text>

            <View row style={style.counterActions}>
              <Button
                icon={ICON.ADD}
                size="l"
                variant="primary"
                onPress={() => handleCounter(field)(1)}
                disabled={usedCharacters >= config.length}
                style={style.counterButton}
              />
              <Button
                icon={ICON.MINUS}
                size="l"
                variant="secondary"
                onPress={() => handleCounter(field)(-1)}
                disabled={value === 0}
                style={style.counterButton}
              />
            </View>
          </View>
        </View>
      ))}
    </AppScreen>
  );
};

Passwords.propTypes = {
  navigation: PropTypes.any,
  route: PropTypes.any,
};

export { Passwords };
