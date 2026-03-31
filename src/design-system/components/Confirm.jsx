import React from 'react';
import { StyleSheet } from 'react-native';

import { useApp } from '../../contexts';
import { theme } from '../../theme';
import Button from '../primitives/Button';
import Text from '../primitives/Text';
import View from '../primitives/View';

const getStyles = (colors) =>
  StyleSheet.create({
    container: {
      alignSelf: 'center',
      backgroundColor: colors.background,
      gap: theme.spacing.lg,
      maxWidth: 420,
      paddingHorizontal: theme.spacing.xl,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.md,
      width: '100%',
    },
    caption: {
      maxWidth: '94%',
    },
    actions: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.xs,
      width: '100%',
    },
  });

const Confirm = ({ accept, cancel, caption, onAccept, onCancel, title }) => {
  const { colors } = useApp();
  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      <Text semibold size="l">{title}</Text>
      {caption ? (
        <Text size="s" tone="primary" style={styles.caption}>
          {caption}
        </Text>
      ) : null}
      <View style={styles.actions}>
        <Button grow variant="outlined" onPress={onCancel}>{cancel}</Button>
        <Button grow variant="primary" onPress={onAccept}>{accept}</Button>
      </View>
    </View>
  );
};

export default Confirm;
