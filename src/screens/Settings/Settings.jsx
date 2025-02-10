import { Screen, Setting, Text, View } from '@satoshi-ltd/nano-design';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Linking } from 'react-native';
import StyleSheet from 'react-native-extended-stylesheet';

import { ABOUT, OPTIONS, REMINDER_BACKUP_OPTIONS } from './Settings.constants';
import { style } from './Settings.style';
import { DEFAULT_THEME, EVENT } from '../../App.constants';
import { useStore } from '../../contexts';
import { eventEmitter, ICON, L10N } from '../../modules';
import { BackupService, NotificationsService, PurchaseService } from '../../services';
import { DarkTheme, LightTheme } from '../../theme';

const Settings = ({ navigation = {} }) => {
  const { secrets, settings, importBackup = () => {}, subscription, updateSettings, updateSubscription } = useStore();

  const [activity, setActivity] = useState();

  const { reminders, theme } = settings;
  const isPremium = !!subscription?.productIdentifier;

  const handleOption = ({ callback, screen, url }) => {
    if (url) Linking.openURL(url);
    if (screen) navigation.navigate(screen);
    else if (callback === 'handleSubscription') handleSubscription();
    else if (callback === 'handleExport') handleExport();
    else if (callback === 'handleImport') handleImport();
    else if (callback === 'handleRestorePurchases') handleRestorePurchases();
  };

  const handleExport = async () => {
    if (!isPremium) return handleSubscription('export');

    setActivity({ ...activity, handleExport: true });
    const exported = await BackupService.export({ secrets, settings });
    if (exported) eventEmitter.emit(EVENT.NOTIFICATION, { text: L10N.CONFIRM_EXPORT_SUCCESS });
    setActivity({ ...activity, handleExport: false });
  };

  const handleImport = async () => {
    if (!isPremium) return handleSubscription('import');

    setActivity({ ...activity, handleImport: true });
    const backup = await BackupService.import().catch((error) =>
      eventEmitter.emit(EVENT.NOTIFICATION, { error: true, text: error }),
    );

    if (backup) {
      navigation.navigate('confirm', {
        caption: L10N.CONFIRM_IMPORT_CAPTION(backup),
        title: L10N.CONFIRM_IMPORT,
        onAccept: async () => {
          await importBackup(backup);
          if (backup?.settings?.theme) {
            StyleSheet.build(backup.settings.theme === DEFAULT_THEME ? LightTheme : DarkTheme);
          }
          navigation.navigate('home');
          eventEmitter.emit(EVENT.NOTIFICATION, { text: L10N.CONFIRM_IMPORT_SUCCESS });
          setActivity({ ...activity, handleImport: false });
        },
      });
    } else {
      setActivity({ ...activity, handleImport: false });
    }
  };

  const handleSubscription = (activityState) => {
    if (subscription?.productIdentifier) navigation.navigate('subscription');
    setActivity(activityState);
    PurchaseService.getProducts()
      .then((plans) => {
        navigation.navigate('subscription', { plans });
        setActivity();
      })
      .catch((error) => eventEmitter.emit(EVENT.NOTIFICATION, { error: true, text: error }));
  };

  const handleRestorePurchases = () => {
    setActivity('restore');
    PurchaseService.restore()
      .then((activeSubscription) => {
        if (activeSubscription) {
          updateSubscription(activeSubscription);
          eventEmitter.emit(EVENT.NOTIFICATION, { text: L10N.PURCHASE_RESTORED });
          setActivity();
        }
      })
      .catch((error) => eventEmitter.emit(EVENT.NOTIFICATION, { error: true, text: error }));
  };

  const handleTheme = () => {
    StyleSheet.build(StyleSheet.value('$theme') === DEFAULT_THEME ? DarkTheme : LightTheme);
    updateSettings({ theme: StyleSheet.value('$theme') });
  };

  const handleChangeReminder = (item = {}) => {
    NotificationsService.reminders([item.value]);
    updateSettings({ reminders: [item.value] });
  };

  const settingProps = { iconColor: theme === 'dark' ? StyleSheet.value('$colorBase') : undefined };

  return (
    <Screen gap offset style={style.screen}>
      <Text bold secondary subtitle>
        {L10N.SETTINGS}
      </Text>

      <View style={style.group}>
        <Text bold caption>
          {L10N.GENERAL}
        </Text>
        {OPTIONS(isPremium, subscription).map(({ caption, disabled, icon, id, text, ...rest }) => (
          <Setting
            {...settingProps}
            activity={activity?.[rest.callback]}
            key={`option-${id}`}
            {...{ caption, disabled, icon, text }}
            onPress={rest.callback || rest.screen ? () => handleOption(rest) : undefined}
          />
        ))}
      </View>

      <View style={style.group}>
        <Text bold caption>
          {L10N.PREFERENCES}
        </Text>
        <Setting
          {...settingProps}
          icon={ICON.INVERT_COLORS}
          text={theme === 'dark' ? L10N.APPERANCE_LIGHT : L10N.APPERANCE_DARK}
          onPress={handleTheme}
        />
        <Setting
          {...settingProps}
          caption={L10N.REMINDER_BACKUP_CAPTION}
          icon={ICON.BELL}
          onPress={() => {}}
          onChange={(value = 0) => handleChangeReminder(value)}
          options={REMINDER_BACKUP_OPTIONS}
          selected={reminders[0]}
          text={L10N.REMINDER_BACKUP}
        />
      </View>

      <View style={style.group}>
        <Text bold caption>
          {L10N.ABOUT}
        </Text>
        {ABOUT(isPremium).map(({ disabled, icon, text, ...rest }, index) => (
          <Setting
            {...settingProps}
            activity={activity && activity[rest.callback]}
            key={`about-${index}`}
            {...{ disabled, icon, text }}
            onPress={() => handleOption(rest)}
          />
        ))}
      </View>
    </Screen>
  );
};

Settings.displayName = 'Settings';

Settings.propTypes = {
  navigation: PropTypes.any,
};

export { Settings };
