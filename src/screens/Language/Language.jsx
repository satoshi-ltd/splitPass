import PropTypes from 'prop-types';
import React from 'react';

import { style } from './Language.style';
import { useStore } from '../../contexts';
import { AppScreen, Card, HeaderBackButton, Icon, Pressable, Text, View } from '../../design-system';
import { getLanguageLabel, ICON, L10N, setLanguage } from '../../modules';
import { NotificationsService } from '../../services';

const LANGUAGES = [
  { id: 'en', flag: 'EN' },
  { id: 'es', flag: 'ES' },
  { id: 'pt', flag: 'PT' },
  { id: 'fr', flag: 'FR' },
  { id: 'de', flag: 'DE' },
];

const Language = ({ navigation: { goBack } = {} }) => {
  const { settings: { language, reminders } = {}, updateSettings } = useStore();
  const selected = language || 'en';

  const handleSelect = async (next) => {
    if (!next || next === selected) return goBack();

    await updateSettings({ language: next });
    await setLanguage(next);
    await NotificationsService.reminders(reminders);
    goBack();
  };

  const header = (
    <View row align="center" style={style.header}>
      <HeaderBackButton onPress={goBack} />

      <View style={style.headerText}>
        <Text bold size="xl" tone="accent">
          {L10N.LANGUAGE}
        </Text>
        <Text bold size="l" tone="secondary">
          {L10N.LANGUAGE_SUBTITLE}
        </Text>
      </View>
    </View>
  );

  return (
    <AppScreen
      contentContainerStyle={style.content}
      header={header}
      headerContainerStyle={style.headerContainer}
      headerSafeAreaStyle={style.headerSafeArea}
      style={style.screen}
    >
      <View style={style.list}>
        {LANGUAGES.map((item) => (
          <Pressable key={item.id} onPress={() => handleSelect(item.id)}>
            <View row style={style.item}>
              <Card small style={style.iconCard}>
                <Text semibold size="s">
                  {item.flag}
                </Text>
              </Card>

              <View flex>
                <Text semibold={selected === item.id} numberOfLines={1}>
                  {getLanguageLabel(item.id)}
                </Text>
              </View>

              {selected === item.id ? (
                <Icon name={ICON.CHECK} tone="accent" />
              ) : (
                <View style={style.rightPlaceholder} />
              )}
            </View>
          </Pressable>
        ))}
      </View>
    </AppScreen>
  );
};

Language.propTypes = {
  navigation: PropTypes.any,
};

export { Language };
