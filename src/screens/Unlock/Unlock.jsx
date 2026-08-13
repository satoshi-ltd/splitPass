import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { AppState, KeyboardAvoidingView, Platform } from 'react-native';

import {
  getUnlockModeFlags,
  isReturningToForeground,
  resolveUnlockFailure,
  shouldAutoPromptBiometrics,
} from './Unlock.helpers';
import { style } from './Unlock.style';
import { EVENT } from '../../App.constants';
import { InputMask, Logo } from '../../components';
import { useStore } from '../../contexts';
import { AppScreen, Button, Text, View } from '../../design-system';
import { eventEmitter, getPassphraseStrength, L10N } from '../../modules';
import { BackupService, BiometricAuthService } from '../../services';

const Unlock = ({ navigation = {}, route: { params: { backup, mode = 'unlock' } = {} } = {} }) => {
  const { importBackup, resetAppData, settings, setupSecurity, store, unlockStore, updateSettings } = useStore();
  const appStateRef = useRef(AppState.currentState);
  const passphraseInputRef = useRef(null);
  const [biometricAutoTriggered, setBiometricAutoTriggered] = useState(false);
  const [biometricInvalidated, setBiometricInvalidated] = useState(false);
  const [biometricSubmitting, setBiometricSubmitting] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [form, setForm] = useState({ confirmPassphrase: '', passphrase: '' });
  const [submitting, setSubmitting] = useState(false);
  const { biometricEnabled, isExport, isImport, isSignIn, isSetup, showImportCancel } = getUnlockModeFlags(
    mode,
    settings,
  );
  const passphraseStrength =
    (isExport || isSetup) && form.passphrase.length > 0 ? getPassphraseStrength(form.passphrase) : undefined;
  const passphraseStrengthLabel = {
    medium: L10N.PASSPHRASE_STRENGTH_MEDIUM,
    strong: L10N.PASSPHRASE_STRENGTH_STRONG,
    weak: L10N.PASSPHRASE_STRENGTH_WEAK,
  }[passphraseStrength];
  const passphraseStrengthTone =
    passphraseStrength === 'weak' ? 'warning' : passphraseStrength === 'strong' ? 'accent' : 'secondary';
  const setupPassphraseValid = form.passphrase.length >= 8 && passphraseStrength !== 'weak';
  const setupConfirmValid = form.confirmPassphrase.length > 0 && form.passphrase === form.confirmPassphrase;
  const setupSubmitDisabled = isSetup && (!setupPassphraseValid || !setupConfirmValid);
  const remainingAttempts = Math.max(0, 3 - failedAttempts);
  const warningText = biometricInvalidated
    ? L10N.BIOMETRIC_UNLOCK_INVALIDATED
    : failedAttempts > 0
    ? L10N.MASTER_PASSPHRASE_ATTEMPTS_HINT({ remaining: remainingAttempts })
    : undefined;

  const resolveUnlockError = async (error) => {
    const resolution = resolveUnlockFailure({ errorCode: error?.code, failedAttempts });

    if (resolution.type === 'storageReset') {
      await resetAppData();
      navigation.reset({ index: 0, routes: [{ name: 'onboarding' }] });
      eventEmitter.emit(EVENT.NOTIFICATION, { error: true, text: L10N.MASTER_PASSPHRASE_STORAGE_RESET });
      return;
    }

    if (resolution.type === 'genericError') {
      eventEmitter.emit(EVENT.NOTIFICATION, { error: true, text: error?.message || L10N.ERROR });
      return;
    }

    setFailedAttempts(resolution.nextFailedAttempts);

    if (resolution.type === 'wipeout') {
      await resetAppData();
      navigation.reset({ index: 0, routes: [{ name: 'onboarding' }] });
      eventEmitter.emit(EVENT.NOTIFICATION, { error: true, text: L10N.MASTER_PASSPHRASE_WIPEOUT });
      return;
    }

    eventEmitter.emit(EVENT.NOTIFICATION, {
      error: true,
      text: L10N.MASTER_PASSPHRASE_INVALID({ remaining: resolution.remaining }),
    });
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

      return true;
    } catch (error) {
      if (error?.code === 'ERR_BIOMETRIC_INVALIDATED') {
        setBiometricInvalidated(true);
        if (!silent) eventEmitter.emit(EVENT.NOTIFICATION, { error: true, text: L10N.BIOMETRIC_UNLOCK_INVALIDATED });
        return false;
      }

      if (silent || error?.code === 'ERR_BIOMETRIC_CANCELED') return false;

      eventEmitter.emit(EVENT.NOTIFICATION, {
        error: true,
        text:
          error?.code === 'ERR_BIOMETRIC_NOT_AVAILABLE' ||
          error?.code === 'ERR_BIOMETRIC_NOT_ENROLLED' ||
          error?.code === 'ERR_BIOMETRIC_WEAK'
            ? L10N.BIOMETRIC_UNLOCK_NOT_AVAILABLE
            : error?.message || L10N.ERROR,
      });

      return false;
    } finally {
      setBiometricSubmitting(false);
    }
  };

  useEffect(() => {
    if (!biometricEnabled) return undefined;

    const subscription = AppState.addEventListener('change', (nextState) => {
      const previousState = appStateRef.current;
      appStateRef.current = nextState;

      if (isReturningToForeground(previousState, nextState)) setBiometricAutoTriggered(false);
    });

    return () => subscription.remove();
  }, [biometricEnabled]);

  useEffect(() => {
    if (!biometricEnabled || biometricAutoTriggered || biometricSubmitting) return undefined;

    let active = true;

    const autoPromptBiometrics = async () => {
      let availability;

      try {
        availability = await BiometricAuthService.isAvailable();
      } catch {
        availability = undefined;
      }

      if (!active) return;

      setBiometricAutoTriggered(true);

      if (!shouldAutoPromptBiometrics({ availability, biometricEnabled, biometricInvalidated, mode })) {
        passphraseInputRef.current?.focus();
        return;
      }

      const unlocked = await handleBiometricUnlock({ silent: true });

      if (active && !unlocked) passphraseInputRef.current?.focus();
    };

    autoPromptBiometrics();

    return () => {
      active = false;
    };
  }, [biometricAutoTriggered, biometricEnabled, biometricInvalidated, biometricSubmitting, mode]);

  const title =
    mode === 'setup'
      ? L10N.ONBOARDING_MASTER_PASSPHRASE_TITLE
      : mode === 'import'
      ? L10N.CONFIRM_IMPORT_ENCRYPTED
      : mode === 'export'
      ? L10N.EXPORT_BACKUP_TITLE
      : L10N.SIGNIN_TITLE;
  const caption =
    mode === 'setup'
      ? L10N.ONBOARDING_MASTER_PASSPHRASE_MESSAGE
      : mode === 'import'
      ? L10N.UNLOCK_BACKUP_CAPTION
      : mode === 'export'
      ? L10N.EXPORT_BACKUP_KEY_CAPTION
      : L10N.SIGNIN_SUBTITLE;

  const submitSetup = async () => {
    await setupSecurity(form.passphrase);
    await updateSettings({ onboarded: true });
    navigation.reset({ index: 0, routes: [{ name: 'main', params: { onboarding: true } }] });
  };

  const submitImport = async () => {
    if (!backup) return;

    await importBackup(backup, { passphrase: form.passphrase });
    navigation.reset({ index: 0, routes: [{ name: 'main', params: { screen: 'secrets' } }] });
    eventEmitter.emit(EVENT.NOTIFICATION, { text: L10N.CONFIRM_IMPORT_SUCCESS, title: L10N.SUCCESS });
  };

  const submitUnlock = async () => {
    await handleUnlocked(form.passphrase);
  };

  const submitExport = async () => {
    const exported = await BackupService.export({ store, passphrase: form.passphrase || undefined });

    if (typeof navigation?.canGoBack === 'function' && navigation.canGoBack()) navigation.goBack();
    else navigation.reset({ index: 0, routes: [{ name: 'main' }] });

    if (exported) eventEmitter.emit(EVENT.NOTIFICATION, { text: L10N.CONFIRM_EXPORT_SUCCESS, title: L10N.SUCCESS });
  };

  const handleSubmit = async () => {
    if (isExport) {
      if (form.passphrase.length > 0) {
        if (getPassphraseStrength(form.passphrase) === 'weak') {
          eventEmitter.emit(EVENT.NOTIFICATION, { error: true, text: L10N.EXPORT_BACKUP_KEY_WEAK });
          return;
        }
        if (form.passphrase !== form.confirmPassphrase) {
          eventEmitter.emit(EVENT.NOTIFICATION, { error: true, text: L10N.MASTER_PASSPHRASE_MISMATCH });
          return;
        }
      }
    } else if (mode === 'setup') {
      if (getPassphraseStrength(form.passphrase) === 'weak') {
        eventEmitter.emit(EVENT.NOTIFICATION, { error: true, text: L10N.MASTER_PASSPHRASE_WEAK });
        return;
      }
      if (form.passphrase !== form.confirmPassphrase) {
        eventEmitter.emit(EVENT.NOTIFICATION, { error: true, text: L10N.MASTER_PASSPHRASE_MISMATCH });
        return;
      }
    } else if (form.passphrase.length < 8) {
      eventEmitter.emit(EVENT.NOTIFICATION, { error: true, text: L10N.MASTER_PASSPHRASE_REQUIRED });
      return;
    }

    try {
      setSubmitting(true);

      if (mode === 'setup') await submitSetup();
      else if (mode === 'import') await submitImport();
      else if (mode === 'export') await submitExport();
      else await submitUnlock();
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

  const handleCancelImport = () => {
    if (!isImport && !isExport) return;

    if (typeof navigation?.canGoBack === 'function' && navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.reset({ index: 0, routes: [{ name: 'main' }] });
  };

  return (
    <KeyboardAvoidingView behavior="padding" enabled={Platform.OS === 'android'} style={style.keyboardAvoid}>
      <AppScreen
        contentContainerStyle={[style.content, isSignIn ? style.signInContent : null]}
        header={
          isSignIn ? null : (
            <View style={style.header}>
              <Text bold size="xl" tone="accent">
                {title}
              </Text>
              {caption ? (
                <Text bold size="l" tone="secondary" style={style.headerSubtitle}>
                  {caption}
                </Text>
              ) : null}
            </View>
          )
        }
        headerContainerStyle={style.headerContainer}
        headerSafeAreaStyle={style.headerSafeArea}
      >
        {isSignIn ? (
          <View align="center" style={style.hero}>
            <Logo size="l" />
            {caption ? (
              <Text align="center" bold size="l" tone="secondary" style={style.heroCaption}>
                {caption}
              </Text>
            ) : null}
          </View>
        ) : null}

        <View style={[style.formSection, isSignIn ? style.signInFormSection : null]}>
          {warningText ? (
            <View style={style.warningCard}>
              <Text size="s" tone="warning">
                {warningText}
              </Text>
            </View>
          ) : null}
          <View style={[style.form, isSignIn ? style.signInForm : null, isSetup ? style.setupForm : null]}>
            <View style={[style.fieldBox, isSignIn ? style.signInFieldBox : null]}>
              {!isSignIn && !isSetup && !isImport && !isExport ? (
                <Text semibold size="s" style={style.fieldLabel}>
                  {L10N.MASTER_PASSPHRASE}
                </Text>
              ) : null}
              <InputMask
                autoFocus={!biometricEnabled}
                containerStyle={style.inputShell}
                placeholder={isExport ? L10N.EXPORT_BACKUP_KEY_PLACEHOLDER : L10N.MASTER_PASSPHRASE_PLACEHOLDER}
                ref={passphraseInputRef}
                showToggle
                style={style.inputField}
                value={form.passphrase}
                onChange={(passphrase) => setForm((current) => ({ ...current, passphrase }))}
              />
            </View>

            {isSetup || isExport ? (
              <View style={style.fieldBox}>
                <InputMask
                  containerStyle={style.inputShell}
                  placeholder={L10N.MASTER_PASSPHRASE_CONFIRM}
                  showToggle
                  style={style.inputField}
                  value={form.confirmPassphrase}
                  onChange={(confirmPassphrase) => setForm((current) => ({ ...current, confirmPassphrase }))}
                />
                <Text size="xs" tone="secondary" style={style.setupHint}>
                  {isExport ? L10N.EXPORT_BACKUP_KEY_HINT : L10N.MASTER_PASSPHRASE_HINT}
                </Text>
                {passphraseStrengthLabel ? (
                  <Text semibold size="xs" tone={passphraseStrengthTone} style={style.setupHint}>
                    {passphraseStrengthLabel}
                  </Text>
                ) : null}
              </View>
            ) : null}
          </View>
        </View>

        <View style={[style.actions, isSignIn ? style.signInActions : null]}>
          <Button
            disabled={setupSubmitDisabled}
            loading={submitting}
            size="l"
            style={[
              style.button,
              isSignIn ? style.signInButton : null,
              isSetup ? style.setupButton : null,
              isImport ? style.importButton : null,
              isExport ? style.importButton : null,
            ]}
            variant="primary"
            onPress={handleSubmit}
          >
            {mode === 'setup'
              ? L10N.START
              : mode === 'import'
              ? L10N.IMPORT
              : mode === 'export'
              ? L10N.EXPORT
              : L10N.UNLOCK}
          </Button>
          {showImportCancel ? (
            <Button size="l" style={style.importCancelButton} variant="outlined" onPress={handleCancelImport}>
              {L10N.CANCEL}
            </Button>
          ) : null}
          {biometricEnabled ? (
            <Button
              loading={biometricSubmitting}
              size="l"
              style={style.biometricSecondaryButton}
              variant="outlined"
              onPress={() => handleBiometricUnlock({ silent: false })}
            >
              {L10N.BIOMETRIC_UNLOCK_BUTTON}
            </Button>
          ) : null}
        </View>
      </AppScreen>
    </KeyboardAvoidingView>
  );
};

Unlock.propTypes = {
  navigation: PropTypes.any,
  route: PropTypes.any,
};

export { Unlock };
