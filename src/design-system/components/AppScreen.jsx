import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useApp } from '../../contexts';
import { viewOffset } from '../../theme/layout';
import { theme } from '../../theme';
import ScrollView from '../primitives/ScrollView';
import View from '../primitives/View';

const getStyles = (colors) =>
  StyleSheet.create({
    root: {
      backgroundColor: colors.background,
      flex: 1,
    },
    headerSafeArea: {
      backgroundColor: colors.background,
      overflow: 'visible',
      zIndex: 20,
    },
    headerContent: {
      overflow: 'visible',
      paddingHorizontal: viewOffset,
      paddingTop: viewOffset,
      zIndex: 20,
    },
    contentWrap: {
      backgroundColor: colors.background,
      flex: 1,
      zIndex: 1,
    },
    contentContainer: {
      paddingBottom: theme.spacing.xxl * 3,
      paddingHorizontal: viewOffset,
    },
    staticContent: {
      paddingHorizontal: viewOffset,
    },
  });

const AppScreen = ({
  children,
  contentContainerStyle,
  contentStyle,
  footer,
  header,
  headerContainerStyle,
  headerSafeAreaStyle,
  scrollable = true,
  style,
}) => {
  const { colors } = useApp();
  const styles = useMemo(() => getStyles(colors), [colors]);

  return (
    <View style={[styles.root, style]}>
      <SafeAreaView edges={['top']} style={[styles.headerSafeArea, headerSafeAreaStyle]}>
        {header ? <View style={[styles.headerContent, headerContainerStyle]}>{header}</View> : null}
      </SafeAreaView>

      {scrollable ? (
        <ScrollView contentContainerStyle={[styles.contentContainer, contentContainerStyle]} style={[styles.contentWrap, contentStyle]}>
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.contentWrap, styles.staticContent, styles.contentContainer, contentStyle, contentContainerStyle]}>{children}</View>
      )}

      {footer}
    </View>
  );
};

AppScreen.propTypes = {
  children: PropTypes.node,
  contentContainerStyle: PropTypes.any,
  contentStyle: PropTypes.any,
  footer: PropTypes.node,
  header: PropTypes.node,
  headerContainerStyle: PropTypes.any,
  headerSafeAreaStyle: PropTypes.any,
  scrollable: PropTypes.bool,
  style: PropTypes.any,
};

export default AppScreen;
