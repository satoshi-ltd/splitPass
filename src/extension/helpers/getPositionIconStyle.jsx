import StyleSheet from 'react-native-extended-stylesheet';

export const getPositionIconStyle = (passwordField) => {
  let iconStyle = {};

  if (passwordField) {
    const rect = passwordField.getBoundingClientRect();
    const padding = StyleSheet.value('$spaceS');
    const iconSize = rect.height - padding;
    iconStyle = StyleSheet.create({
      position: 'absolute',
      top: `${rect.top + window.scrollY + (rect.height - iconSize) / 2}px`,
      left: `${rect.right - iconSize - padding}px`,
      width: `${iconSize}px`,
      height: `${iconSize}px`,
    });
  }

  return iconStyle;
};
