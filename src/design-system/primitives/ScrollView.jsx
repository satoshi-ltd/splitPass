import React from 'react';
import { ScrollView as RNScrollView } from 'react-native';

const ScrollView = React.forwardRef(({ snapTo, style, decelerationRate, ...props }, ref) => {
  const resolvedSnapTo = typeof snapTo === 'number' ? snapTo : undefined;

  return (
    <RNScrollView
      ref={ref}
      automaticallyAdjustKeyboardInsets
      decelerationRate={resolvedSnapTo ? 'fast' : decelerationRate}
      keyboardShouldPersistTaps="handled"
      snapToInterval={resolvedSnapTo || undefined}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      {...props}
      style={style}
    />
  );
});

ScrollView.displayName = 'ScrollView';

export default ScrollView;
