import StyleSheet from "react-native-extended-stylesheet";

export const style = StyleSheet.create({
  option: {
    alignItems: "center",
    borderRadius: "$borderRadius",
    flex: 1,
    gap: "$spaceS",
    padding: "$spaceS",
  },

  checked: {
    borderColor: "$colorContent",
    borderStyle: "$borderStyle",
    borderWidth: "$borderWidth",
  },

  disabled: {
    borderColor: "$colorContentLight",
  },
});
