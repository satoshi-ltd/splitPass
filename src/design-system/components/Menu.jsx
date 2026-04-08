import React from 'react';
import { StyleSheet } from 'react-native';

import { useApp } from '../../contexts';
import { theme } from '../../theme';
import Icon from '../primitives/Icon';
import Pressable from '../primitives/Pressable';
import Text from '../primitives/Text';
import View from '../primitives/View';

const getStyles = (colors) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.background,
      borderColor: colors.border,
      borderRadius: theme.borderRadius.sm,
      borderWidth: 1,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
      elevation: 3,
    },
    item: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
    },
    separator: {
      borderTopColor: colors.border,
      borderTopWidth: 1,
    },
  });

const Menu = ({ onClose, options = [] }) => {
  const { colors } = useApp();
  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      {options.map((option, index) => (
        <Pressable
          key={`${option.text}-${index}`}
          onPress={() => {
            onClose?.();
            option.onPress?.();
          }}
          style={[styles.item, index > 0 && styles.separator]}
        >
          {option.icon ? (
            <Icon name={option.icon} tone={option.critical ? 'danger' : option.accent ? 'accent' : 'primary'} />
          ) : null}
          <Text bold tone={option.critical ? 'danger' : option.accent ? 'accent' : 'primary'}>
            {option.text}
          </Text>
        </Pressable>
      ))}
    </View>
  );
};

export default Menu;
