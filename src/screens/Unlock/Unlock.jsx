import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView } from 'react-native';

import { style } from './Unlock.style';
import { EVENT } from '../../App.constants';
import { InputMask } from '../../components';
import { useStore } from '../../contexts';
import { AppScreen, Button, Text, View } from '../../design-system';
import { eventEmitter, ICON, L10N } from '../../modules';
import { BiometricAuthService } from '../../services';

const Unlock = ({ navigation = {}, route: { params: { backup, mode = 'unlock' } = {} } = {} }) => {
  const { importBackup, resetAppData, settings, setupSecurity, unlockStore, updateSettings } = useStore();
  const [attemptedBiometric, setAttemptedBiometric] = useState(false);
  const [biometricInvalidated, setBiometricInvalidated] = useState(false);
  const [biometricSubmitting, setBiometricSubmitting] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [form, setForm] = useState({ confirmPassphrase: '', passphrase: '' });
  const [submitting, setSubmitting] = useState(false);
  const biometricEnabled = mode === 'unlock' && !!settings?.biometricUnlockEnabled;

  const resolveUnlockError = async (error) => {
    if (error?.code === 'ERR_PERSISTENCE_FORMAT') {
      await resetAppData();
      navigation.reset({ index: 0, routes: [{ name: 'onboarding' }] });
      eventEmitter.emit(EVENT.NOTIFICATION, { error: true, text: L10N.MASTER_PASSPHRASE_STORAGE_RESET });
      return;
    }

    if (error?.code && error.code !== 'ERR_PERSISTENCE_UNLOCK_FAILED') {
      eventEmitter.emit(EVENT.NOTIFICATION, { error: true, text: error?.message || L10N.ERROR });
      return;
    }

    const nextFailedAttempts = failedAttempts + 1;
    const remaining = Math.max(0, 3 - nextFailedAttempts);

    setFailedAttempts(nextFailedAttempts);

    if (nextFailedAttempts >= 3) {
      await resetAppData();
      navigation.reset({ index: 0, routes: [{ name: 'onboarding' }] });
      eventEmitter.emit(EVENT.NOTIFICATION, { error: true, text: L10N.MASTER_PASSPHRASE_WIPEOUT });
      return;
    }

    eventEmitter.emit(EVENT.NOTIFICATION, { error: true, text: L10N.MASTER_PASSPHRASE_INVALID({ remaining }) });
  };

  const handleUnlocked = async (passphrase) => {
    const unlocked = await unlockStore(passphrase);

    if (biometricInvalidated) {
      await updateSettings({ biometricUnlockEnabled: false });
      setBiometricInvalidated(false);
    }

    setFailedAttempts(0);
    navigation.reset({ index: 0, routes: [{ name: unlocked?.settings?.onboarded ? 'main' : 'onboarding' }] });
  };

  const handleBiometricUnlock = async ({ silent } = {}) => {
    try {
      setBiometricSubmitting(true);
      const passphrase = await BiometricAuthService.readPassphrase();
      await handleUnlocked(passphrase);
    } catch (error) {
      if (error?.code === 'ERR_BIOMETRIC_INVALIDATED') {
        setBiometricInvalidated(true);
        if (!silent) eventEmitter.emit(EVENT.NOTIFICATION, { error: true, text: L10N.BIOMETRIC_UNLOCK_INVALIDATED });
        return;
      }

      if (silent || error?.code === 'ERR_BIOMETRIC_CANCELED') return;

      eventEmitter.emit(EVENT.NOTIFICATION, {
        error: true,
        text:
          error?.code === 'ERR_BIOMETRIC_NOT_AVAILABLE' ||
          error?.code === 'ERR_BIOMETRIC_NOT_ENROLLED' ||
          error?.code === 'ERR_BIOMETRIC_WEAK'
            ? L10N.BIOMETRIC_UNLOCK_NOT_AVAILABLE
            : error?.message || L10N.ERROR,
      });
    } finally {
      setBiometricSubmitting(false);
    }
  };

  useEffect(() => {
    if (!biometricEnabled || attemptedBiometric) return;

    setAttemptedBiometric(true);
    handleBiometricUnlock({ silent: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attemptedBiometric, biometricEnabled]);

  const title =
    mode === 'setup'
      ? L10N.ONBOARDING_MASTER_PASSPHRASE_TITLE
      : mode === 'import'
      ? L10N.CONFIRM_IMPORT_ENCRYPTED
      : L10N.UNLOCK_APP;
  const caption =
    mode === 'setup'
      ? L10N.ONBOARDING_MASTER_PASSPHRASE_MESSAGE
      : mode === 'import'
      ? L10N.UNLOCK_BACKUP_CAPTION
      : L10N.UNLOCK_APP_CAPTION;

  const handleSubmit = async () => {
    if (form.passphrase.length < 8) {
      eventEmitter.emit(EVENT.NOTIFICATION, { error: true, text: L10N.MASTER_PASSPHRASE_REQUIRED });
      return;
    }
    if (mode === 'setup' && form.passphrase !== form.confirmPassphrase) {
      eventEmitter.emit(EVENT.NOTIFICATION, { error: true, text: L10N.MASTER_PASSPHRASE_MISMATCH });
      return;
    }

    try {
      setSubmitting(true);

      if (mode === 'setup') {
        await setupSecurity(form.passphrase);
        await updateSettings({ onboarded: true });
        navigation.reset({ index: 0, routes: [{ name: 'main', params: { onboarding: true } }] });
        return;
      }

      if (mode === 'import' && backup) {
        await importBackup(backup, { passphrase: form.passphrase });
        navigation.reset({ index: 0, routes: [{ name: 'main', params: { screen: 'secrets' } }] });
        eventEmitter.emit(EVENT.NOTIFICATION, { text: L10N.CONFIRM_IMPORT_SUCCESS, title: L10N.SUCCESS });
        return;
      }

      await handleUnlocked(form.passphrase);
    } catch (error) {
      if (mode === 'unlock') {
        await resolveUnlockError(error);
        return;
      }

      eventEmitter.emit(EVENT.NOTIFICATION, { error: true, text: error?.message || L10N.ERROR });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={style.keyboardAvoid}>
      <AppScreen
        contentContainerStyle={style.content}
        header={
          <View style={style.header}>
            <Text bold size="xl" tone="accent">
              {title}
            </Text>
            <Text bold size="l" tone="secondary" style={style.headerSubtitle}>
              {caption}
            </Text>
          </View>
        }
        headerContainerStyle={style.headerContainer}
        headerSafeAreaStyle={style.headerSafeArea}
      >
        <View style={style.form}>
          {biometricEnabled ? (
            <Button
              icon={ICON.BIOMETRIC}
              loading={biometricSubmitting}
              size="l"
              style={style.biometricButton}
              variant="outlined"
              onPress={() => handleBiometricUnlock({ silent: false })}
            >
              {L10N.BIOMETRIC_UNLOCK_BUTTON}
            </Button>
          ) : null}

          <View style={style.fieldBox}>
            <Text semibold size="s" style={style.fieldLabel}>
              {L10N.MASTER_PASSPHRASE}
            </Text>
            <InputMask
              autoFocus
              containerStyle={style.inputShell}
              placeholder={L10N.MASTER_PASSPHRASE_PLACEHOLDER}
              style={style.inputField}
              value={form.passphrase}
              onChange={(passphrase) => setForm((current) => ({ ...current, passphrase }))}
            />
          </View>

          {mode === 'setup' ? (
            <View style={style.fieldBox}>
              <Text semibold size="s" style={style.fieldLabel}>
                {L10N.MASTER_PASSPHRASE_CONFIRM}
              </Text>
              <InputMask
                containerStyle={style.inputShell}
                placeholder={L10N.MASTER_PASSPHRASE_PLACEHOLDER}
                style={style.inputField}
                value={form.confirmPassphrase}
                onChange={(confirmPassphrase) => setForm((current) => ({ ...current, confirmPassphrase }))}
              />
            </View>
          ) : null}

          <Text size="s" tone="secondary" style={style.caption}>
            {L10N.MASTER_PASSPHRASE_HINT}
          </Text>
        </View>

        <Button loading={submitting} size="l" style={style.button} variant="primary" onPress={handleSubmit}>
          {mode === 'setup' ? L10N.START : mode === 'import' ? L10N.CONFIRM_IMPORT_ENCRYPTED : L10N.UNLOCK}
        </Button>
      </AppScreen>
    </KeyboardAvoidingView>
  );
};

Unlock.propTypes = {
  navigation: PropTypes.any,
  route: PropTypes.any,
};

export { Unlock };
