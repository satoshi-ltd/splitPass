import PropTypes from 'prop-types';
import React from 'react';
import { View as NativeView } from 'react-native';

import { style } from './View.style';

const View = React.forwardRef(
  (
    { align, children, flex, gap = false, offset = false, row = false, spaceBetween = false, wide = false, ...others },
    ref,
  ) => (
    <NativeView
      {...others}
      ref={ref}
      style={[
        style.view,
        style[align],
        flex && style.flex,
        gap && style.gap,
        offset && style.offset,
        row && style.row,
        spaceBetween && style.spaceBetween,
        wide && style.wide,
        others.style,
      ]}
    >
      {children}
    </NativeView>
  ),
);

View.displayName = 'View';

View.propTypes = {
  align: PropTypes.oneOf(['left', 'center', 'right']),
  children: PropTypes.node,
  displayName: PropTypes.string,
  flex: PropTypes.bool,
  gap: PropTypes.bool,
  offset: PropTypes.bool,
  row: PropTypes.bool,
  spaceBetween: PropTypes.bool,
  wide: PropTypes.bool,
};

export { View };
