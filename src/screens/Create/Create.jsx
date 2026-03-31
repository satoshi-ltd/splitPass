import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView } from 'react-native';

import { DEFAULT_FORM } from './Create.constants';
import { style } from './Create.style';
import { EVENT } from '../../App.constants';
import { InputMask, Switch } from '../../components';
import { useStore } from '../../contexts';
import { AppScreen, Button, Icon, Input, Pressable, Text, View } from '../../design-system';
import {
  deriveSecretVisual,
  eventEmitter,
  ICON,
  isSeedPhrase,
  isSeedPhraseCandidate,
  L10N,
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

const Create = ({ navigation = {}, onComplete, route }) => {
  const { createSecret } = useStore();
  const [form, setForm] = useState(DEFAULT_FORM);
  const [revealSecret, setRevealSecret] = useState(false);
  const hydrate = route?.params?.hydrate;
  const onboarding = !!route?.params?.onboarding;
  const hydrated = !!hydrate?.value;
  const isCard = isCardNumber(form.secret);
  const cardValue = isCard ? buildCardValue(form.secret, form.expire, form.cvv) : undefined;

  useEffect(() => {
    if (hydrated || isCard || (!form.expire && !form.cvv)) return;

    setForm((current) => (current.expire || current.cvv ? { ...current, cvv: undefined, expire: undefined } : current));
  }, [form.cvv, form.expire, hydrated, isCard]);

  useEffect(() => {
    if (!hydrate?.value) return;

    const hydratedSecret = hydrate.secret || QRParser.decode(hydrate.value) || '••••••••';
    const hydratedCard = parseCardValue(hydratedSecret);

    setForm((current) => ({
      ...current,
      cvv: hydratedCard?.cvv,
      expire: hydratedCard?.expire,
      name: hydrate.name || current.name,
      secret: hydratedCard?.number || hydratedSecret,
      split: false,
      website: hydrate.website || current.website,
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

  const handlePressContinue = async () => {
    const { cvv, expire, name, secret, split = false, website } = form;
    const secretValue = isCard ? cardValue : secret;
    const visual = deriveSecretVisual({ name, secret, website });

    let values;

    if (hydrated) {
      values = [hydrate.value];
    } else {
      const qr = QRParser.encode(secretValue, isCard ? { type: 'card' } : false);
      values = split ? QRParser.split(qr) : [qr];
    }

    setForm({ ...DEFAULT_FORM });

    if (split) {
      navigation.navigate('secret', {
        name,
        readMode: true,
        returnToMain: true,
        values,
        website,
        ...visual,
      });
      return;
    }

    const persistedSecret = await createSecret({
      brand: visual.brand,
      cardNumber: isCard ? normalizeCardNumber(secret) : undefined,
      cvv: isCard ? normalizeCardCvv(cvv) : undefined,
      expire: isCard ? normalizeCardExpire(expire) : undefined,
      kind: visual.kind,
      name,
      value: values[0],
      website,
    });

    if (onComplete)
      onComplete({
        cardNumber: isCard ? normalizeCardNumber(secret) : undefined,
        cvv: isCard ? normalizeCardCvv(cvv) : undefined,
        expire: isCard ? normalizeCardExpire(expire) : undefined,
        name,
        values,
        website,
        ...visual,
      });
    else if (persistedSecret) {
      eventEmitter.emit(EVENT.NOTIFICATION, { text: L10N.SECRET_SAVED_IN_DEVICE, title: L10N.SUCCESS });
      if (hydrated) {
        navigation.navigate('main', { screen: 'secrets' });
        return;
      }

      navigation.navigate('secret', {
        brand: persistedSecret.brand,
        hash: persistedSecret.hash,
        kind: persistedSecret.kind,
        name: persistedSecret.name,
        returnToMain: true,
        values: [persistedSecret.value],
        website: persistedSecret.website,
      });
    }
  };

  const handleSecretChange = (nextSecret = '') => {
    const compact = `${nextSecret}`.replace(/\s/g, '');
    const secret = compact && /^\d+$/.test(compact) ? normalizeCardNumber(nextSecret) : nextSecret;

    setForm((current) => ({ ...current, secret }));
  };

  const secretIsSeed = !isCard && (isSeedPhrase(form.secret) || isSeedPhraseCandidate(form.secret));
  const isValidSecret = hydrated ? true : isCard ? !!cardValue : !!form.secret;
  const isValid = !!form.name && isValidSecret;
  const header = (
    <View style={style.header}>
      <Text bold size="xl" tone="accent">
        {hydrated ? L10N.SAVE_SECRET : onboarding ? L10N.FIRST_SECRET : L10N.NEW_SECRET}
      </Text>
      <Text bold size="l" tone="secondary" style={style.headerSubtitle}>
        {L10N.NEW_SECRET_SUBTITLE}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView behavior="padding" style={style.keyboardAvoid}>
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
              autoFocus
              containerStyle={style.inputShell}
              placeholder={L10N.NAME_PLACEHOLDER}
              value={form.name}
              onChange={(name) => setForm({ ...form, name })}
              style={style.inputField}
            />
          </View>

          <View style={style.fieldBox}>
            <Text semibold size="s" style={style.fieldLabel}>
              {L10N.SECRET}
            </Text>
            <InputMask
              blurOnSubmit={!secretIsSeed}
              containerStyle={[style.inputShell, secretIsSeed && style.inputShellMultiline]}
              contextMenuHidden
              editable={!hydrated}
              keyboardType={isCard ? 'number-pad' : undefined}
              maxLength={isCard ? 19 : undefined}
              multiline={secretIsSeed}
              numberOfLines={secretIsSeed ? 3 : 1}
              placeholder={L10N.SECRET_PLACEHOLDER}
              revealed={revealSecret}
              style={[style.inputField, secretIsSeed && style.inputFieldMultiline]}
              value={form.secret}
              onChange={handleSecretChange}
              actions={
                <>
                  <Pressable
                    onPress={() => setRevealSecret((current) => !current)}
                    style={[
                      style.inputActionButton,
                      secretIsSeed && style.inputActionButtonMultiline,
                      !form.secret && style.inputActionButtonDisabled,
                    ]}
                  >
                    <Icon name={revealSecret ? ICON.EYE_OFF : ICON.EYE} tone="secondary" size="s" />
                  </Pressable>
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

          {isCard ? (
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
          ) : null}

          <View style={style.fieldBox}>
            <Text semibold size="s" style={style.fieldLabel}>
              {L10N.WEBSITE}
            </Text>
            <Input
              autoCapitalize="none"
              autoCorrect={false}
              containerStyle={style.inputShell}
              keyboardType="url"
              placeholder={L10N.WEBSITE_PLACEHOLDER}
              value={form.website}
              onChange={(website) => setForm({ ...form, website })}
              style={style.inputField}
            />
          </View>

          {!hydrated ? (
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

        <Button disabled={!isValid} size="l" variant="primary" onPress={handlePressContinue} style={style.button}>
          {L10N.CONTINUE}
        </Button>
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
