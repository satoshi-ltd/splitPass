import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import Svg, { Circle } from 'react-native-svg';

import { getStyles } from './SecretFooterContent.style';
import { useApp } from '../../contexts';
import { Button, Input, Text, View } from '../../design-system';
import { ICON } from '../../modules';
import { getSecretValueTokens } from '../../modules/secretValueDisplay';

const TOTP_RING_SIZE = 44;
const TOTP_RING_STROKE = 4;
const TOTP_RING_RADIUS = (TOTP_RING_SIZE - TOTP_RING_STROKE) / 2;
const TOTP_RING_CIRCUMFERENCE = 2 * Math.PI * TOTP_RING_RADIUS;
const TOTP_LOW_TIME_THRESHOLD = 5;

const clampNumber = (value, min, max) => Math.min(max, Math.max(min, value));

const getTotpTrackColor = (contrast) => {
  if (contrast === 'accent') return 'rgba(255, 255, 255, 0.26)';
  if (contrast === 'light') return 'rgba(24, 19, 16, 0.18)';

  return 'rgba(255, 252, 248, 0.22)';
};

const TotpCountdownRing = ({ colors, contrast, expiresIn, period, styles }) => {
  const normalizedPeriod = Number.isFinite(period) && period > 0 ? period : 30;
  const normalizedSeconds = clampNumber(Math.ceil(expiresIn || 0), 0, normalizedPeriod);
  const progress = normalizedSeconds / normalizedPeriod;
  const strokeDashoffset = TOTP_RING_CIRCUMFERENCE * (1 - progress);
  const isLowTime = normalizedSeconds <= Math.min(TOTP_LOW_TIME_THRESHOLD, normalizedPeriod);
  const trackColor = getTotpTrackColor(contrast);
  const strokeColor = isLowTime ? colors.danger : contrast === 'accent' ? colors.onAccent : colors.accent;
  const tone = isLowTime ? 'danger' : contrast === 'accent' ? 'onAccent' : 'accent';

  return (
    <View style={styles.totpCountdownWrap}>
      <Svg height={TOTP_RING_SIZE} width={TOTP_RING_SIZE}>
        <Circle
          cx={TOTP_RING_SIZE / 2}
          cy={TOTP_RING_SIZE / 2}
          fill="none"
          r={TOTP_RING_RADIUS}
          stroke={trackColor}
          strokeWidth={TOTP_RING_STROKE}
        />
        <Circle
          cx={TOTP_RING_SIZE / 2}
          cy={TOTP_RING_SIZE / 2}
          fill="none"
          r={TOTP_RING_RADIUS}
          stroke={strokeColor}
          strokeDasharray={`${TOTP_RING_CIRCUMFERENCE} ${TOTP_RING_CIRCUMFERENCE}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          strokeWidth={TOTP_RING_STROKE}
          transform={`rotate(-90 ${TOTP_RING_SIZE / 2} ${TOTP_RING_SIZE / 2})`}
        />
      </Svg>
      <View pointerEvents="none" style={styles.totpCountdownValueWrap}>
        <Text align="center" bold size="l" style={styles.totpCountdownText} tone={tone}>
          {normalizedSeconds}
        </Text>
      </View>
    </View>
  );
};

const SecretFooterContent = ({
  cardValue,
  contrast = 'dark',
  disableCopy = false,
  disableReveal = false,
  isCard = false,
  isSeed = false,
  mode = 'value',
  onCopy,
  onMenu,
  onPasscodeCancel,
  onPasscodeChange,
  onPasscodeSubmit,
  onToggleReveal,
  passcodePlaceholder,
  passcodeValue = '',
  revealIcon = ICON.EYE,
  shardCaption = '',
  shardLabel = '',
  onShardAction,
  showCopy = false,
  showMenu = false,
  showReveal = false,
  totpExpiresIn,
  totpPeriod = 30,
  value = '',
  valueCaption = '',
  valueVariant = 'default',
}) => {
  const { colors, theme } = useApp();
  const styles = useMemo(() => getStyles(colors, contrast), [colors, contrast]);
  const textTone = contrast === 'accent' ? 'onAccent' : 'onInverse';
  const contrastTone = contrast === 'accent' ? 'onAccent' : 'onInverse';
  const digitTone = contrast === 'accent' ? 'primary' : 'accent';
  const totpTone = textTone;
  const confirmButtonTone =
    contrast === 'accent'
      ? theme === 'dark'
        ? 'onInverse'
        : 'primary'
      : contrast === 'light'
      ? 'onAccent'
      : 'primary';
  const actionCount = [showReveal, showCopy, showMenu].filter(Boolean).length;
  const normalizedValue = `${value}`.trim();
  const contentLength = normalizedValue.replace(/\s+/g, ' ').length;
  const isPasscodeReady = passcodeValue.length === 6;
  const isCompactValue = valueVariant === 'totp';
  const showTotpCountdown = isCompactValue && Number.isFinite(totpExpiresIn);
  const useTitleSize = !isSeed && !isCard && contentLength > 0 && contentLength <= (actionCount >= 2 ? 10 : 12);
  const useBodySize = isCard || (!isSeed && contentLength > (actionCount >= 2 ? 14 : 18));
  const useCaptionSize = isSeed || contentLength > (actionCount >= 2 ? 24 : 30);
  const valueSize = isCompactValue ? 'xl' : useCaptionSize ? 's' : useTitleSize ? 'xl' : useBodySize ? undefined : 'l';
  const valueTextStyle = useCaptionSize
    ? styles.valueTextDense
    : useBodySize
    ? styles.valueTextCompact
    : useTitleSize
    ? styles.valueTextHero
    : null;

  if (mode === 'passcode') {
    return (
      <View style={styles.passcodeRow}>
        <Input
          keyboardType="number-pad"
          maxLength={6}
          placeholder={passcodePlaceholder}
          placeholderTone={contrastTone}
          tone={contrastTone}
          value={passcodeValue}
          variant="transparent"
          onChange={onPasscodeChange}
          containerStyle={styles.passcodeInputWrap}
          style={styles.passcodeInput}
        />
        <Button
          disabled={!isPasscodeReady}
          icon={ICON.CHECK}
          onPress={onPasscodeSubmit}
          size="m"
          style={[
            styles.passcodeButton,
            isPasscodeReady ? styles.passcodeButtonConfirm : styles.passcodeButtonConfirmDisabled,
          ]}
          tone={confirmButtonTone}
          variant="outlined"
        />
        <Button
          icon={ICON.CLOSE}
          onPress={onPasscodeCancel}
          size="m"
          style={styles.passcodeButton}
          tone={contrastTone}
          variant="outlined"
        />
      </View>
    );
  }

  if (mode === 'shard') {
    return (
      <View style={styles.valueRow}>
        <View style={styles.shardWrap}>
          <Text bold size="l" tone={textTone}>
            {shardLabel}
          </Text>
          {shardCaption ? (
            <Text size="s" style={styles.shardCaption} tone={textTone}>
              {shardCaption}
            </Text>
          ) : null}
        </View>

        {onShardAction || showMenu ? (
          <View style={styles.controlsWrap}>
            <View style={styles.actionsWrap}>
              {onShardAction ? (
                <Button icon={ICON.SCAN} onPress={onShardAction} size="m" tone={contrastTone} variant="outlined" />
              ) : null}
              {showMenu ? (
                <Button icon={ICON.DOTS} onPress={onMenu} size="m" tone={contrastTone} variant="outlined" />
              ) : null}
            </View>
          </View>
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.valueRow}>
      <View style={styles.valueMain}>
        {isCard && cardValue?.number ? (
          <View style={styles.cardValueWrap}>
            <Text
              adjustsFontSizeToFit
              bold
              ellipsizeMode="clip"
              minimumFontScale={0.72}
              numberOfLines={1}
              size="l"
              style={styles.cardNumberText}
              tone={textTone}
            >
              {cardValue.number}
            </Text>
            {cardValue.expire || cardValue.cvv ? (
              <View style={styles.cardMetaRow}>
                <Text bold size="s" style={styles.cardMetaText} tone={textTone}>
                  {[cardValue.expire, cardValue.cvv].filter(Boolean).join('   ')}
                </Text>
              </View>
            ) : null}
          </View>
        ) : isCompactValue ? (
          <View style={styles.totpWrap}>
            <View style={styles.totpTextBlock}>
              <Text bold size="xl" style={styles.totpCodeText} tone={totpTone}>
                {value}
              </Text>
              {valueCaption ? (
                <Text size="s" style={[styles.valueCaption, styles.totpCaptionText]} tone={textTone}>
                  {valueCaption}
                </Text>
              ) : null}
            </View>
          </View>
        ) : (
          <View style={styles.valueBlock}>
            {isSeed ? (
              <Text bold size={valueSize} style={[styles.seedValueText, valueTextStyle]} tone={textTone}>
                {value}
              </Text>
            ) : (
              <View style={styles.valueWrap}>
                {getSecretValueTokens(value).map((token, index) => {
                  if (/^\s+$/.test(token)) {
                    return (
                      <Text key={`${token}-${index}`} bold size={valueSize} style={valueTextStyle} tone={textTone}>
                        {token}
                      </Text>
                    );
                  }

                  return (
                    <View key={`${token}-${index}`} style={styles.valueGroup}>
                      {token.split('').map((character, charIndex) => (
                        <Text
                          key={`${character}-${index}-${charIndex}`}
                          bold
                          size={valueSize}
                          style={valueTextStyle}
                          tone={/\d/.test(character) ? digitTone : textTone}
                        >
                          {character}
                        </Text>
                      ))}
                    </View>
                  );
                })}
              </View>
            )}
            {valueCaption ? (
              <Text size="s" style={styles.valueCaption} tone={textTone}>
                {valueCaption}
              </Text>
            ) : null}
          </View>
        )}
      </View>

      {showTotpCountdown || showReveal || showCopy || showMenu ? (
        <View style={styles.controlsWrap}>
          {showTotpCountdown ? (
            <TotpCountdownRing
              colors={colors}
              contrast={contrast}
              expiresIn={totpExpiresIn}
              period={totpPeriod}
              styles={styles}
            />
          ) : null}
          {showReveal || showCopy || showMenu ? (
            <View style={styles.actionsWrap}>
              {showReveal ? (
                <Button
                  disabled={disableReveal}
                  icon={revealIcon}
                  onPress={onToggleReveal}
                  size="m"
                  tone={contrastTone}
                  variant="outlined"
                />
              ) : null}
              {showCopy ? (
                <Button
                  disabled={disableCopy}
                  icon={ICON.COPY}
                  onPress={onCopy}
                  size="m"
                  tone={contrastTone}
                  variant="outlined"
                />
              ) : null}
              {showMenu ? (
                <Button icon={ICON.DOTS} onPress={onMenu} size="m" tone={contrastTone} variant="outlined" />
              ) : null}
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
};

SecretFooterContent.propTypes = {
  cardValue: PropTypes.shape({
    cvv: PropTypes.string,
    expire: PropTypes.string,
    number: PropTypes.string,
  }),
  contrast: PropTypes.oneOf(['accent', 'dark', 'light']),
  disableCopy: PropTypes.bool,
  disableReveal: PropTypes.bool,
  isCard: PropTypes.bool,
  isSeed: PropTypes.bool,
  mode: PropTypes.oneOf(['passcode', 'shard', 'value']),
  onCopy: PropTypes.func,
  onMenu: PropTypes.func,
  onPasscodeCancel: PropTypes.func,
  onPasscodeChange: PropTypes.func,
  onPasscodeSubmit: PropTypes.func,
  onShardAction: PropTypes.func,
  onToggleReveal: PropTypes.func,
  passcodePlaceholder: PropTypes.string,
  passcodeValue: PropTypes.string,
  revealIcon: PropTypes.string,
  shardCaption: PropTypes.string,
  shardLabel: PropTypes.string,
  showCopy: PropTypes.bool,
  showMenu: PropTypes.bool,
  showReveal: PropTypes.bool,
  totpExpiresIn: PropTypes.number,
  totpPeriod: PropTypes.number,
  value: PropTypes.string,
  valueCaption: PropTypes.string,
  valueVariant: PropTypes.oneOf(['default', 'totp']),
};

export { SecretFooterContent };
