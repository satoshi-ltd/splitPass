import StyleSheet from "react-native-extended-stylesheet";

export const style = StyleSheet.create({
  card: {
    backgroundColor: "$colorCard",
    borderRadius: "$borderRadius",
    gap: "$spaceM",
    padding: "$spaceM",
  },

  outlined: {
    backgroundColor: "transparent",
    borderColor: "$colorContent",
    borderStyle: "$borderStyle",
    borderWidth: "$borderWidth",
  },
});
