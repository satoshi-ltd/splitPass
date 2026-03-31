import React from 'react';
import { Pressable as RNPressable } from 'react-native';

const Pressable = React.forwardRef(({ disabled, pressedOpacity = 0.92, pressedStyle, style, ...props }, ref) => {
  const shouldApplyDefaultOpacity = typeof style !== 'function' && pressedStyle === undefined;

  const resolveStyle = (state) => {
    const base = typeof style === 'function' ? style(state) : style;
    const pressed =
      state.pressed && !disabled
        ? pressedStyle || (shouldApplyDefaultOpacity ? { opacity: pressedOpacity } : null)
        : null;
    return [base, pressed];
  };

  return (
    <RNPressable
      ref={ref}
      {...props}
      disabled={disabled}
      style={typeof style === 'function' || pressedStyle || shouldApplyDefaultOpacity ? resolveStyle : style}
    />
  );
});

Pressable.displayName = 'Pressable';

export default Pressable;
