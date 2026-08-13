import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';

import { DEFAULT_FORM } from './Create.constants';
import { style } from './Create.style';
import { CreateTotpScanner } from './Create.totpScanner';
import { EVENT } from '../../App.constants';
import { InputMask, Switch } from '../../components';
import { useStore } from '../../contexts';
import { AppScreen, Button, HeaderBackButton, Icon, Input, Pressable, Text, View } from '../../design-system';
import {
  buildTOTPURI,
  DEFAULT_ALGORITHM,
  deriveSecretVisual,
  eventEmitter,
  getTOTPDisplayName,
  ICON,
  isBase32Secret,
  isSeedPhrase,
  isSeedPhraseCandidate,
  isTOTPURI,
  L10N,
  normalizeTOTP,
  parseTOTPSecret,
  parseTOTPURI,
  QRParser,
} from '../../modules';
import {
  buildCardValue,
  isCardNumber,
  normalizeCardCvv,
  normalizeCardExpire,
  normalizeCardNumber,
  parseCardValue,
} from '../../modules/secretValueDisplay';

const collapseIdentifierSpacing = (value = '') =>
  `${value}`.replace(/\s+([.@/_-])/g, '$1').replace(/([.@/_-])\s+/g, '$1');

const normalizeNameInput = (value = '') => {
  const normalized = collapseIdentifierSpacing(value);
  const compact = normalized.trim();

  if (/^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(compact)) return compact.toLowerCase();
  if (/^[a-z0-9-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(compact)) return compact.toLowerCase();

  return normalized;
};

const normalizeUsernameInput = (value = '') => {
  const normalized = collapseIdentifierSpacing(value);
  return normalized.replace(/\s{2,}/g, ' ').trim();
};
const normalizeNotesInput = (value = '') => `${value}`.replace(/\|/g, '');

const Create = ({ navigation = {}, onComplete, route }) => {
  const { createSecret, updateSecret } = useStore();
  const [form, setForm] = useState(DEFAULT_FORM);
  const [revealSecret, setRevealSecret] = useState(false);
  const [showTotpFlow, setShowTotpFlow] = useState(false);
  const standardDraftRef = useRef({});
  const edit = route?.params?.edit;
  const hydrate = route?.params?.hydrate;
  const editMode = !!edit?.hash;
  const onboarding = !!route?.params?.onboarding;
  const hydrated = !!hydrate?.value;
  const editSecretEnabled = !!edit?.editableSecret;
  const isTotp = showTotpFlow;
  const isCard = !isTotp && isCardNumber(form.secret);
  const cardValue = isCard ? buildCardValue(form.secret, form.expire, form.cvv) : undefined;
  const normalizedTOTP = isTotp
    ? normalizeTOTP({
        account: form.account,
        algorithm: form.algorithm || DEFAULT_ALGORITHM,
        digits: form.digits,
        issuer: form.issuer,
        period: form.period,
        secret: form.secret,
      })
    : undefined;
  const totpValue = isTotp ? buildTOTPURI(normalizedTOTP) : '';

  useEffect(() => {
    if (!editMode) return;

    setForm((current) => ({
      ...current,
      name: edit.name ?? current.name,
      notes: edit.notes ?? current.notes,
      secret: edit.secret ?? current.secret,
      username: edit.username ?? current.username,
      split: false,
    }));
  }, [edit, editMode]);

  useEffect(() => {
    if (hydrated || isTotp || isCard || (!form.expire && !form.cvv)) return;

    setForm((current) => (current.expire || current.cvv ? { ...current, cvv: undefined, expire: undefined } : current));
  }, [form.cvv, form.expire, hydrated, isCard, isTotp]);

  useEffect(() => {
    if (!hydrate) return;

    const hydratedSecret = hydrate.secret || QRParser.decode(hydrate.value) || hydrate.value || '••••••••';
    const hydratedTOTP = hydrate.totp || parseTOTPURI(hydratedSecret);
    if (hydratedTOTP) {
      setForm((current) => ({
        ...current,
        account: hydratedTOTP.account,
        algorithm: hydratedTOTP.algorithm,
        digits: `${hydratedTOTP.digits}`,
        issuer: hydratedTOTP.issuer,
        name: hydrate.name || current.name || getTOTPDisplayName(hydratedTOTP),
        notes: hydrate.notes ?? current.notes,
        period: `${hydratedTOTP.period}`,
        secret: hydratedTOTP.secret,
        split: false,
        username: hydrate.username ?? current.username,
      }));
      setShowTotpFlow(true);
      return;
    }

    const hydratedCard = parseCardValue(hydratedSecret);

    setForm((current) => ({
      ...current,
      cvv: hydratedCard?.cvv,
      expire: hydratedCard?.expire,
      name: hydrate.name || current.name,
      notes: hydrate.notes ?? current.notes,
      secret: hydratedCard?.number || hydratedSecret,
      split: false,
      username: hydrate.username ?? current.username,
    }));
  }, [hydrate]);

  useEffect(() => {
    const handlePasswordSelected = (secret) => {
      if (!secret) return;
      setForm((current) => ({ ...current, secret }));
    };

    eventEmitter.on(EVENT.PASSWORD_SELECTED, handlePasswordSelected);

    return () => {
      eventEmitter.off(EVENT.PASSWORD_SELECTED, handlePasswordSelected);
    };
  }, []);

  const handleTotpRead = ({ secret, totp } = {}) => {
    const parsed = totp || parseTOTPURI(secret || '');
    if (!parsed) return;

    setForm((current) => ({
      ...current,
      account: parsed.account,
      algorithm: parsed.algorithm,
      digits: `${parsed.digits}`,
      issuer: parsed.issuer,
      name: current.name || getTOTPDisplayName(parsed),
      period: `${parsed.period}`,
      secret: parsed.secret,
    }));
    setShowTotpFlow(true);
  };

  const handlePressContinue = async () => {
    if (editMode) {
      const nextUpdate = {
        hash: edit.hash,
        name: `${form.name || ''}`.trim(),
        notes: `${form.notes || ''}`.trim() || undefined,
        username: `${form.username || ''}`.trim(),
      };
      if (editSecretEnabled) nextUpdate.value = QRParser.encode(form.secret || '');

      const updatedSecret = await updateSecret({
        ...nextUpdate,
      });
      if (!updatedSecret) return;

      eventEmitter.emit(EVENT.NOTIFICATION, { text: L10N.SECRET_DETAILS_UPDATED, title: L10N.SUCCESS });
      navigation.goBack();
      return;
    }

    const { account, cvv, expire, issuer, name, notes, secret, split = false, username } = form;
    const resolvedName = `${name || (isTotp ? issuer || account || L10N.SECRET_TYPE_TOTP : '')}`.trim();
    const secretValue = isCard ? cardValue : isTotp ? totpValue : secret;
    const visual = deriveSecretVisual({ name: resolvedName, secret: secretValue });

    let values;

    if (hydrated && !isTotp) {
      values = [hydrate.value];
    } else {
      const qr = QRParser.encode(secretValue, isCard ? { type: 'card' } : isTotp ? { type: 'totp' } : false);
      values = split ? QRParser.split(qr) : [qr];
    }

    if (split) {
      navigation.navigate('secret', {
        name: resolvedName,
        notes: `${notes || ''}`.trim() || undefined,
        readMode: true,
        returnToMain: true,
        username,
        values,
        ...visual,
      });
      return;
    }

    const persistedSecret = await createSecret({
      brand: visual.brand,
      digits: normalizedTOTP?.digits,
      cardNumber: isCard ? normalizeCardNumber(secret) : undefined,
      cvv: isCard ? normalizeCardCvv(cvv) : undefined,
      expire: isCard ? normalizeCardExpire(expire) : undefined,
      issuer: normalizedTOTP?.issuer,
      account: normalizedTOTP?.account,
      algorithm: normalizedTOTP?.algorithm,
      period: normalizedTOTP?.period,
      kind: isTotp ? 'totp' : visual.kind,
      name: resolvedName,
      notes: `${notes || ''}`.trim() || undefined,
      username,
      value: values[0],
    });

    if (onComplete)
      onComplete({
        account: normalizedTOTP?.account,
        algorithm: normalizedTOTP?.algorithm,
        cardNumber: isCard ? normalizeCardNumber(secret) : undefined,
        cvv: isCard ? normalizeCardCvv(cvv) : undefined,
        digits: normalizedTOTP?.digits,
        expire: isCard ? normalizeCardExpire(expire) : undefined,
        issuer: normalizedTOTP?.issuer,
        name: resolvedName,
        notes: `${notes || ''}`.trim() || undefined,
        period: normalizedTOTP?.period,
        username,
        values,
        ...(isTotp ? { kind: 'totp' } : visual),
      });
    else if (persistedSecret) {
      if (hydrated) {
        navigation.navigate('main', { screen: 'secrets' });
        return;
      }

      navigation.navigate('secret', {
        brand: persistedSecret.brand,
        hash: persistedSecret.hash,
        kind: persistedSecret.kind,
        name: persistedSecret.name,
        notes: persistedSecret.notes,
        returnToMain: true,
        username: persistedSecret.username,
      });
    }

    setForm({ ...DEFAULT_FORM });
  };

  const handleSecretChange = (nextSecret = '') => {
    if (isTotp) {
      const parsed = isTOTPURI(nextSecret) ? parseTOTPURI(nextSecret) : undefined;
      const secret = parsed?.secret || parseTOTPSecret(nextSecret);
      setForm((current) => ({
        ...current,
        account: parsed?.account || current.account,
        algorithm: parsed?.algorithm || current.algorithm,
        digits: parsed?.digits ? `${parsed.digits}` : current.digits,
        issuer: parsed?.issuer || current.issuer,
        period: parsed?.period ? `${parsed.period}` : current.period,
        secret,
      }));
      return;
    }

    const compact = `${nextSecret}`.replace(/\s/g, '');
    const secret = compact && /^\d+$/.test(compact) ? normalizeCardNumber(nextSecret) : nextSecret;

    setForm((current) => ({ ...current, secret }));
  };

  const secretIsSeed = !isTotp && !isCard && (isSeedPhrase(form.secret) || isSeedPhraseCandidate(form.secret));
  const isValidSecret = hydrated
    ? true
    : isTotp
    ? !!totpValue && isBase32Secret(form.secret)
    : isCard
    ? !!cardValue
    : !!form.secret;
  const isValid = editMode
    ? !!`${form.name || ''}`.trim() && (!editSecretEnabled || !!`${form.secret || ''}`)
    : isTotp
    ? isValidSecret
    : !!form.name && isValidSecret;
  const handleOpenTotpFlow = () => {
    setShowTotpFlow(true);
    setForm((current) => {
      standardDraftRef.current = {
        cvv: current.cvv,
        expire: current.expire,
        notes: current.notes,
        secret: current.secret,
        split: current.split,
        username: current.username,
      };

      return {
        ...current,
        account: current.account,
        algorithm: current.algorithm || DEFAULT_ALGORITHM,
        cvv: undefined,
        digits: current.digits || '6',
        expire: undefined,
        issuer: current.issuer,
        period: current.period || '30',
        split: false,
      };
    });
  };
  const handleCloseTotpFlow = () => {
    setShowTotpFlow(false);
    setForm((current) => ({
      ...current,
      account: undefined,
      algorithm: DEFAULT_ALGORITHM,
      cvv: standardDraftRef.current.cvv,
      digits: '6',
      expire: standardDraftRef.current.expire,
      issuer: undefined,
      notes: standardDraftRef.current.notes,
      period: '30',
      secret: standardDraftRef.current.secret,
      split: standardDraftRef.current.split ?? false,
      username: standardDraftRef.current.username,
    }));
  };
  const header = (
    <View style={style.header}>
      {editMode ? (
        <View row align="center" style={style.headerRow}>
          <HeaderBackButton onPress={() => navigation.goBack()} />
          <View flex style={style.headerText}>
            <Text bold size="xl" tone="accent">
              {L10N.EDIT_DETAILS}
            </Text>
            <Text bold size="l" tone="secondary" style={style.headerSubtitle}>
              {form.name || edit.name || ''}
            </Text>
          </View>
        </View>
      ) : (
        <>
          <Text bold size="xl" tone="accent">
            {hydrated ? L10N.SAVE_SECRET : onboarding ? L10N.FIRST_SECRET : L10N.NEW_SECRET}
          </Text>
          <Text bold size="l" tone="secondary" style={style.headerSubtitle}>
            {L10N.NEW_SECRET_SUBTITLE}
          </Text>
        </>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView behavior="padding" enabled={Platform.OS === 'android'} style={style.keyboardAvoid}>
      <AppScreen
        contentContainerStyle={style.content}
        header={header}
        headerContainerStyle={style.headerContainer}
        headerSafeAreaStyle={style.headerSafeArea}
      >
        <View style={style.form}>
          <View style={style.fieldBox}>
            <Text semibold size="s" style={style.fieldLabel}>
              {L10N.NAME}
            </Text>
            <Input
              autoCapitalize="none"
              autoCorrect={false}
              containerStyle={style.inputShell}
              keyboardType="visible-password"
              placeholder={L10N.NAME_PLACEHOLDER}
              value={form.name}
              onChange={(name) => setForm({ ...form, name: normalizeNameInput(name) })}
              style={style.inputField}
            />
          </View>

          {isTotp && !editMode ? (
            <View style={style.fieldBox}>
              <Text semibold size="s" style={style.fieldLabel}>
                {L10N.OTP_QR_LABEL}
              </Text>
              <View style={style.totpScannerCard}>
                <CreateTotpScanner onRead={handleTotpRead} />
                {normalizedTOTP ? (
                  <Text size="s" style={style.totpScannerMeta}>
                    {L10N.OTP_QR_READY({ account: normalizedTOTP.account, issuer: normalizedTOTP.issuer })}
                  </Text>
                ) : null}
              </View>
            </View>
          ) : null}

          {!isTotp && (!editMode || editSecretEnabled) ? (
            <View style={style.fieldBox}>
              <Text semibold size="s" style={style.fieldLabel}>
                {L10N.SECRET}
              </Text>
              <InputMask
                blurOnSubmit={!secretIsSeed}
                containerStyle={[style.inputShell, secretIsSeed && style.inputShellMultiline]}
                autoCapitalize="sentences"
                contextMenuHidden
                editable={!hydrated}
                keyboardType={isCard ? 'number-pad' : undefined}
                maxLength={isCard ? 19 : undefined}
                multiline={secretIsSeed}
                numberOfLines={secretIsSeed ? 3 : 1}
                placeholder={L10N.SECRET_PLACEHOLDER}
                onRevealChange={setRevealSecret}
                revealed={revealSecret}
                showToggle
                style={[style.inputField, secretIsSeed && style.inputFieldMultiline]}
                value={form.secret}
                onChange={handleSecretChange}
                actions={
                  <>
                    {!hydrated && !isCard ? (
                      <Pressable
                        onPress={() => navigation.navigate('passwordGenerator', { picker: true })}
                        style={[style.inputActionButton, secretIsSeed && style.inputActionButtonMultiline]}
                      >
                        <Icon name={ICON.CREATE_PASSWORD} tone="accent" size="s" />
                      </Pressable>
                    ) : null}
                  </>
                }
              />
            </View>
          ) : null}

          {isCard && !editMode ? (
            <View style={style.fieldBox}>
              <View row style={style.cardDetailsRow}>
                <View style={style.cardDetailField}>
                  <Text semibold size="s" style={style.fieldLabel}>
                    {L10N.EXPIRE}
                  </Text>
                  <InputMask
                    containerStyle={style.inputShell}
                    editable={!hydrated}
                    keyboardType="number-pad"
                    maxLength={5}
                    placeholder={L10N.EXPIRE_PLACEHOLDER}
                    revealed={revealSecret}
                    style={style.inputField}
                    value={form.expire}
                    onChange={(expire) => setForm((current) => ({ ...current, expire: normalizeCardExpire(expire) }))}
                  />
                </View>

                <View style={[style.cardDetailField, style.cardDetailFieldCompact]}>
                  <Text semibold size="s" style={style.fieldLabel}>
                    {L10N.CVV}
                  </Text>
                  <InputMask
                    containerStyle={style.inputShell}
                    editable={!hydrated}
                    keyboardType="number-pad"
                    maxLength={4}
                    placeholder={L10N.CVV_PLACEHOLDER}
                    revealed={revealSecret}
                    style={style.inputField}
                    value={form.cvv}
                    onChange={(cvv) => setForm((current) => ({ ...current, cvv: normalizeCardCvv(cvv) }))}
                  />
                </View>
              </View>
            </View>
          ) : null}

          {!isTotp ? (
            <View style={style.fieldBox}>
              <Text semibold size="s" style={style.fieldLabel}>
                {L10N.USERNAME}
              </Text>
              <Input
                autoCapitalize="none"
                autoCorrect={false}
                containerStyle={style.inputShell}
                keyboardType="visible-password"
                placeholder={L10N.USERNAME_PLACEHOLDER}
                value={form.username}
                onChange={(username) => setForm({ ...form, username: normalizeUsernameInput(username) })}
                style={style.inputField}
              />
            </View>
          ) : null}

          <View style={style.fieldBox}>
            <Text semibold size="s" style={style.fieldLabel}>
              {L10N.NOTES}
            </Text>
            <Input
              containerStyle={[style.inputShell, style.inputShellMultiline]}
              multiline
              numberOfLines={4}
              placeholder={L10N.NOTES_PLACEHOLDER}
              style={[style.inputField, style.inputFieldMultiline]}
              value={form.notes}
              onChange={(notes) => setForm({ ...form, notes: normalizeNotesInput(notes) })}
            />
          </View>

          {!editMode && !hydrated && !isTotp ? (
            <View row align="center" style={style.recoveryRow}>
              <Switch checked={form.split} onChange={(split) => setForm({ ...form, split })} />
              <Text size="s" style={style.caption}>
                {L10N.SHARD_EXPLANATION}
                <Text semibold size="s">
                  {L10N.SHARD_EXPLANATION_NUMBER}
                </Text>
                {L10N.SHARD_EXPLANATION_GUARDIANS}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={style.actions}>
          <Button disabled={!isValid} size="l" variant="primary" onPress={handlePressContinue} style={style.button}>
            {editMode ? L10N.SAVE_CHANGES : form.split ? L10N.CREATE_SHARDS : L10N.SAVE_SECRET}
          </Button>
          {editMode ? null : isTotp ? (
            <Button onPress={handleCloseTotpFlow} size="l" style={style.secondaryButton} variant="outlined">
              {L10N.BACK_TO_SECRET}
            </Button>
          ) : (
            <Button onPress={handleOpenTotpFlow} size="l" style={style.secondaryButton} variant="outlined">
              {L10N.OTP_QR_SCAN}
            </Button>
          )}
        </View>
      </AppScreen>
    </KeyboardAvoidingView>
  );
};

Create.propTypes = {
  navigation: PropTypes.any,
  onComplete: PropTypes.func,
  route: PropTypes.any,
};

export { Create };
