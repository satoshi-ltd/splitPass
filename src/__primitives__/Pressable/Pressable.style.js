import StyleSheet from "react-native-extended-stylesheet";

export const style = StyleSheet.create({
  container: {
    overflow: "hidden",
  },

  overflow: {
    backgroundColor: "$pressableColor",
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 1,
  },
});
