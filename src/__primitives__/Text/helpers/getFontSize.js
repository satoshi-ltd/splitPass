import StyleSheet from 'react-native-extended-stylesheet';

const style = StyleSheet.create({
  title: {
    fontSize: '$fontSizeTitle',
    lineHeight: '$fontSizeTitle * 1.2',
  },

  subtitle: {
    fontSize: '$fontSizeSubtitle',
    lineHeight: '$fontSizeSubtitle * 1.3',
  },

  body: {
    fontSize: '$fontSizeBody',
    lineHeight: '$fontSizeBody * 1.6',
  },

  caption: {
    fontSize: '$fontSizeCaption',
    lineHeight: '$fontSizeCaption * 1.4',
  },

  tiny: {
    fontSize: '$fontSizeTiny',
    lineHeight: '$fontSizeTiny * 1.2',
  },
});

const FONT_SIZES = ['title', 'subtitle', 'body', 'caption', 'tiny'];

const getFontSize = ({ title, subtitle, caption, tiny }) =>
  title ? style.title : subtitle ? style.subtitle : caption ? style.caption : tiny ? style.tiny : style.body;

export { FONT_SIZES, getFontSize };
