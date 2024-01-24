import PropTypes from 'prop-types';
import React from 'react';
import { ScrollView as NativeScrollView } from 'react-native';

const ScrollView = React.forwardRef(({ height, horizontal = false, snap = 0, width, onScroll, ...others }, ref) => (
  <NativeScrollView
    {...others}
    {...{ height, horizontal, ref, width }}
    showsHorizontalScrollIndicator={false}
    showsVerticalScrollIndicator={false}
    {...(snap > 0
      ? {
          decelerationRate: 'fast',
          pagingEnabled: true,
          scrollEventThrottle: 10,
          snapToInterval: snap,
        }
      : {})}
    onScroll={onScroll}
    style={others.style}
  />
));

ScrollView.displayName = 'ScrollView';

ScrollView.propTypes = {
  height: PropTypes.number,
  horizontal: PropTypes.bool,
  snap: PropTypes.number,
  width: PropTypes.number,
  onScroll: PropTypes.func,
};

export { ScrollView };
