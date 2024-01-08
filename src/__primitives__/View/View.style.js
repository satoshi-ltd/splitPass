import StyleSheet from 'react-native-extended-stylesheet';

export const style = StyleSheet.create({
  view: {
    display: 'flex',
  },

  gap: {
    gap: '$spaceM',
  },

  left: {
    alignContent: 'flex-start',
    alignItems: 'flex-start',
    alignSelf: 'flex-start',
    justifyContent: 'flex-start',
  },

  center: {
    alignContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
  },

  right: {
    alignContent: 'flex-end',
    alignItems: 'flex-end',
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
  },

  row: {
    flexDirection: 'row',
  },

  spaceBetween: {
    justifyContent: 'space-between',
  },

  wide: {
    flex: 1,
  },
});
