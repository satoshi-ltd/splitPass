import StyleSheet from 'react-native-extended-stylesheet';

const style = StyleSheet.create({
  title: {
    // backgroundColor: 'blue',
    fontSize: '$fontSizeTitle',
    lineHeight: '$fontSizeTitle * 1.2',
  },

  subtitle: {
    // backgroundColor: 'green',
    fontSize: '$fontSizeSubtitle',
    lineHeight: '$fontSizeSubtitle * 1.3',
  },

  body: {
    // backgroundColor: 'magenta',
    fontSize: '$fontSizeBody',
    lineHeight: '$fontSizeBody * 1.5',
  },

  caption: {
    // backgroundColor: 'orange',
    fontSize: '$fontSizeCaption',
    lineHeight: '$fontSizeCaption * 1.4',
  },

  tiny: {
    // backgroundColor: 'red',
    fontSize: '$fontSizeTiny',
    lineHeight: '$fontSizeTiny * 1.2',
  },
});

export const getFontSize = ({ title, subtitle, caption, tiny }) =>
  title ? style.title : subtitle ? style.subtitle : caption ? style.caption : tiny ? style.tiny : style.body;
