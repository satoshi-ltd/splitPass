/* global Set, __DEV__ */
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Linking } from 'react-native';

import { ABOUT_OPTIONS, ACCOUNT_DATA_OPTIONS, DEVELOPMENT_OPTIONS, GENERAL_OPTIONS } from './Settings.constants';
import { style } from './Settings.style';
import { EVENT } from '../../App.constants';
import { useStore } from '../../contexts';
import { AppScreen, Icon, Setting, Text, View } from '../../design-system';
import { eventEmitter, getLanguageLabel, ICON, L10N, openConfirm } from '../../modules';
import { BackupService, BiometricAuthService, getDemoSecrets, NotificationsService } from '../../services';

const Settings = ({ navigation = {} }) => {
  const {
    createSecrets,
    lockStore,
    secrets,
    settings,
    store,
    importBackup = () => {},
    resetAppData = () => {},
    updateSettings,
  } = useStore();

  const [activity, setActivity] = useState({});
  const [biometricAvailability, setBiometricAvailability] = useState({ available: false, ready: false });

  const {
    biometricUnlockEnabled = false,
    language,
    reminders = [],
    theme = 'light',
    websiteFaviconsEnabled = true,
  } = settings || {};
  const reminderEnabled = (reminders[0] ?? 1) === 1;
  const appearanceSubtitle = theme === 'dark' ? L10N.DARK_MODE : L10N.LIGHT_MODE;
  const reminderSubtitle = reminderEnabled ? L10N.REMINDER_BACKUP_SCHEDULE : undefined;

  useEffect(() => {
    let active = true;

    BiometricAuthService.isAvailable()
      .then((availability) => {
        if (!active) return;

        setBiometricAvailability({ available: availability.available, ready: true });
      })
      .catch(() => {
        if (!active) return;

        setBiometricAvailability({ available: false, ready: true });
      });

    return () => {
      active = false;
    };
  }, []);

  const handleOption = ({ callback, screen, url }) => {
    if (url) Linking.openURL(url);
    if (screen) navigation.navigate(screen);
    else if (callback === 'handleExport') handleExport();
    else if (callback === 'handleImport') handleImport();
    else if (callback === 'handleLoadDemoSecrets') handleLoadDemoSecrets();
    else if (callback === 'handleLogout') handleLogout();
    else if (callback === 'handleResetData') handleResetData();
  };

  const handleExport = async () => {
    try {
      setActivity((prev) => ({ ...(prev || {}), handleExport: true }));
      const exported = await BackupService.export({ store });
      if (exported) eventEmitter.emit(EVENT.NOTIFICATION, { text: L10N.CONFIRM_EXPORT_SUCCESS, title: L10N.SUCCESS });
    } catch (error) {
      eventEmitter.emit(EVENT.NOTIFICATION, { error: true, text: error });
    } finally {
      setActivity((prev) => ({ ...(prev || {}), handleExport: false }));
    }
  };

  const handleImport = async () => {
    setActivity((prev) => ({ ...(prev || {}), handleImport: true }));
    const backup = await BackupService.import().catch((error) => {
      eventEmitter.emit(EVENT.NOTIFICATION, { error: true, text: error });
      return undefined;
    });

    if (backup?.format === 'encrypted') {
      navigation.navigate('unlock', { backup, mode: 'import' });
      setActivity((prev) => ({ ...(prev || {}), handleImport: false }));
      return;
    }

    if (backup) {
      openConfirm(
        navigation,
        {
          caption: L10N.CONFIRM_IMPORT_CAPTION(backup.payload),
          title: L10N.CONFIRM_IMPORT,
        },
        {
          onCancel: () => setActivity((prev) => ({ ...(prev || {}), handleImport: false })),
          onAccept: async () => {
            await importBackup(backup);
            navigation.navigate('secrets');
            eventEmitter.emit(EVENT.NOTIFICATION, { text: L10N.CONFIRM_IMPORT_SUCCESS, title: L10N.SUCCESS });
            setActivity((prev) => ({ ...(prev || {}), handleImport: false }));
          },
        },
      );
    } else {
      setActivity((prev) => ({ ...(prev || {}), handleImport: false }));
    }
  };

  const handleChangeReminder = (item = {}) => {
    const value = typeof item === 'object' ? item.value : item ? 1 : 0;
    NotificationsService.reminders([value]);
    updateSettings({ reminders: [value] });
  };

  const handleAppearance = (value) => {
    updateSettings({ theme: value ? 'dark' : 'light' });
  };

  const handleBiometricUnlock = async (value) => {
    try {
      setActivity((prev) => ({ ...(prev || {}), biometricUnlock: true }));

      if (!value) {
        await BiometricAuthService.clearPassphrase();
        await updateSettings({ biometricUnlockEnabled: false });
        eventEmitter.emit(EVENT.NOTIFICATION, { text: L10N.BIOMETRIC_UNLOCK_DISABLED, title: L10N.SUCCESS });
        return;
      }

      if (!biometricAvailability.available) {
        eventEmitter.emit(EVENT.NOTIFICATION, { error: true, text: L10N.BIOMETRIC_UNLOCK_NOT_AVAILABLE });
        return;
      }

      if (!store?.sessionPassphrase) {
        eventEmitter.emit(EVENT.NOTIFICATION, { error: true, text: L10N.BIOMETRIC_UNLOCK_REQUIRES_SESSION });
        return;
      }

      await BiometricAuthService.savePassphrase(store.sessionPassphrase);
      await updateSettings({ biometricUnlockEnabled: true });
      eventEmitter.emit(EVENT.NOTIFICATION, { text: L10N.BIOMETRIC_UNLOCK_ENABLED, title: L10N.SUCCESS });
    } catch (error) {
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
      setActivity((prev) => ({ ...(prev || {}), biometricUnlock: false }));
    }
  };

  const handleWebsiteFavicons = (value) => {
    updateSettings({ websiteFaviconsEnabled: !!value });
  };

  const handleLoadDemoSecrets = async () => {
    try {
      setActivity((prev) => ({ ...(prev || {}), handleLoadDemoSecrets: true }));
      const existing = new Set(
        (secrets || []).map(({ name, value, username }) => `${name}::${value}::${username || ''}`),
      );
      const pending = getDemoSecrets().filter(
        ({ name, value, username }) => !existing.has(`${name}::${value}::${username || ''}`),
      );

      await createSecrets(pending);

      eventEmitter.emit(EVENT.NOTIFICATION, {
        text: pending.length ? L10N.DEMO_SECRETS_ADDED({ count: pending.length }) : L10N.DEMO_SECRETS_ALREADY_LOADED,
      });
      navigation.navigate('secrets');
    } catch (error) {
      eventEmitter.emit(EVENT.NOTIFICATION, { error: true, text: error });
    } finally {
      setActivity((prev) => ({ ...(prev || {}), handleLoadDemoSecrets: false }));
    }
  };

  const handleLogout = () => {
    openConfirm(
      navigation,
      {
        caption: L10N.CONFIRM_LOG_OUT_CAPTION,
        title: L10N.CONFIRM_LOG_OUT,
      },
      {
        onAccept: async () => {
          await lockStore();
          navigation.reset({ index: 0, routes: [{ name: 'unlock' }] });
        },
      },
    );
  };

  const handleResetData = () => {
    openConfirm(
      navigation,
      {
        accept: L10N.RESET_DATA_ACTION,
        caption: L10N.RESET_DATA_CAPTION,
        title: L10N.RESET_DATA,
      },
      {
        onAccept: async () => {
          await resetAppData();
          navigation.reset({ index: 0, routes: [{ name: 'onboarding' }] });
        },
      },
    );
  };

  const RightValueChevron = ({ value }) => (
    <View row align="center" gap="xxs">
      <Text size="s" tone="secondary">
        {value}
      </Text>
      <Icon name={ICON.RIGHT} tone="secondary" />
    </View>
  );

  RightValueChevron.propTypes = {
    value: PropTypes.string,
  };

  const header = (
    <View style={style.header}>
      <Text bold size="xl" tone="accent">
        {L10N.SETTINGS}
      </Text>
      <Text bold size="l" tone="secondary" style={style.headerSubtitle}>
        {L10N.SETTINGS_SUBTITLE}
      </Text>
    </View>
  );

  return (
    <AppScreen contentContainerStyle={style.content} header={header}>
      <View style={style.group}>
        <Text semibold size="s" style={style.groupTitle}>
          {L10N.GENERAL}
        </Text>
        {GENERAL_OPTIONS().map(({ disabled, icon, id, text, ...rest }) => (
          <Setting
            activity={activity?.[rest.callback]}
            key={`option-${id}`}
            disabled={disabled}
            icon={icon}
            title={text}
            onPress={rest.callback || rest.screen ? () => handleOption(rest) : undefined}
          />
        ))}
      </View>

      <View style={style.group}>
        <Text semibold size="s" style={style.groupTitle}>
          {L10N.PREFERENCES}
        </Text>
        <Setting
          icon={ICON.LANGUAGE}
          right={<RightValueChevron value={getLanguageLabel(language)} />}
          title={L10N.LANGUAGE}
          onPress={() => navigation.navigate('language')}
        />
        <Setting
          icon={ICON.INVERT_COLORS}
          subtitle={appearanceSubtitle}
          type="toggle"
          title={L10N.APPEARANCE}
          value={theme === 'dark'}
          onValueChange={handleAppearance}
        />
        <Setting
          activity={activity?.biometricUnlock}
          disabled={biometricUnlockEnabled ? false : !biometricAvailability.ready || !biometricAvailability.available}
          icon={ICON.BIOMETRIC}
          type="toggle"
          title={L10N.BIOMETRIC_UNLOCK}
          value={biometricUnlockEnabled}
          onValueChange={handleBiometricUnlock}
        />
        <Setting
          icon={ICON.WEB}
          type="toggle"
          title={L10N.WEBSITE_FAVICONS}
          value={websiteFaviconsEnabled}
          onValueChange={handleWebsiteFavicons}
        />
        <Setting
          icon={ICON.BELL}
          subtitle={reminderSubtitle}
          type="toggle"
          title={L10N.REMINDER_BACKUP}
          value={reminderEnabled}
          onValueChange={handleChangeReminder}
        />
      </View>

      <View style={style.group}>
        <Text semibold size="s" style={style.groupTitle}>
          {L10N.ABOUT_SPLITPASS}
        </Text>
        {ABOUT_OPTIONS().map(({ disabled, icon, text, ...rest }, index) => (
          <Setting
            activity={activity && activity[rest.callback]}
            key={`about-${index}`}
            disabled={disabled}
            icon={icon}
            title={text}
            onPress={() => handleOption(rest)}
          />
        ))}
      </View>

      <View style={style.group}>
        <Text semibold size="s" style={style.groupTitle}>
          {L10N.ACCOUNT_AND_DATA}
        </Text>
        {ACCOUNT_DATA_OPTIONS().map(({ callback, disabled, icon, text, tone }, index) => (
          <Setting
            activity={activity?.[callback]}
            key={`account-data-${index}`}
            disabled={disabled}
            icon={icon}
            title={text}
            titleTone={tone}
            onPress={() => handleOption({ callback })}
          />
        ))}
      </View>

      {__DEV__ ? (
        <View style={style.group}>
          <Text semibold size="s" style={style.groupTitle}>
            {L10N.DEVELOPMENT}
          </Text>
          {DEVELOPMENT_OPTIONS().map(({ disabled, icon, id, text, ...rest }) => (
            <Setting
              activity={activity?.[rest.callback]}
              key={`development-${id}`}
              disabled={disabled}
              icon={icon}
              title={text}
              onPress={() => handleOption(rest)}
            />
          ))}
        </View>
      ) : null}
    </AppScreen>
  );
};

Settings.displayName = 'Settings';

Settings.propTypes = {
  navigation: PropTypes.any,
};

export { Settings };
