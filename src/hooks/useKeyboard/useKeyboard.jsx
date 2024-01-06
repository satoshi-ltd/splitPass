import { useEffect, useState } from "react";
import { Platform, Keyboard } from "react-native";

export const useKeyboard = () => {
  const [isKeyboardOpen, setKeyboardOpen] = useState(false);

  useEffect(() => {
    const IOS = Platform.OS === "ios";

    const showEvent = IOS ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = IOS ? "keyboardWillHide" : "keyboardDidHide";

    Keyboard.addListener(showEvent, handleShow);
    Keyboard.addListener(hideEvent, handleHide);

    return () => {
      Keyboard.removeListener(showEvent, handleShow);
      Keyboard.removeListener(hideEvent, handleHide);
    };
  }, []);

  const handleShow = () => setKeyboardOpen(true);

  const handleHide = () => setKeyboardOpen(false);

  return { isKeyboardOpen, closeKeyboard: Keyboard.dismiss };
};
