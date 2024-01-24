import StyleSheet from 'react-native-extended-stylesheet';

const style = StyleSheet.create({
  title: {
    fontSize: '$fontSizeTitle',
    height: '$fontSizeTitle',
    lineHeight: '$fontSizeTitle',
    width: '$fontSizeTitle',
  },

  subtitle: {
    fontSize: '$fontSizeSubtitle',
    height: '$fontSizeSubtitle',
    lineHeight: '$fontSizeSubtitle',
    width: '$fontSizeSubtitle',
  },

  body: {
    fontSize: '$fontSizeBody',
    height: '$fontSizeBody',
    lineHeight: '$fontSizeBody',
    width: '$fontSizeBody',
  },

  caption: {
    fontSize: '$fontSizeCaption',
    height: '$fontSizeCaption',
    lineHeight: '$fontSizeCaption',
    width: '$fontSizeCaption',
  },

  tiny: {
    fontSize: '$fontSizeTiny',
    height: '$fontSizeTiny',
    lineHeight: '$fontSizeTiny',
    width: '$fontSizeTiny',
  },
});

export const getSize = ({ title, subtitle, caption, tiny }) =>
  title ? style.title : subtitle ? style.subtitle : caption ? style.caption : tiny ? style.tiny : style.body;
