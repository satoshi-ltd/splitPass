/* eslint-disable react-hooks/rules-of-hooks */
import PropTypes from 'prop-types';
import React from 'react';
import { Text as BaseText } from 'react-native';

import { getColor, getFontSize } from './modules';
import { style } from './Text.style';

const Text = ({
  align,
  bold,
  children,
  color = 'content',
  ellipsizeMode,
  // -- size
  title,
  subtitle,
  caption,
  tiny,
  ...others
}) => (
  <BaseText
    {...others}
    allowFontScaling={false}
    numberOfLines={ellipsizeMode ? 1 : undefined}
    selectable={false}
    style={[
      style.text,
      getColor(color),
      getFontSize({ title, subtitle, caption, tiny }),
      bold && style.bold,
      align && style[align],
      others.style,
    ]}
  >
    {children}
  </BaseText>
);

Text.displayName = 'Text';

Text.propTypes = {
  align: PropTypes.oneOf(['left', 'center', 'right']),
  bold: PropTypes.bool,
  children: PropTypes.any,
  color: PropTypes.string,
  ellipsizeMode: PropTypes.bool,
  // -- size
  title: PropTypes.bool,
  subtitle: PropTypes.bool,
  caption: PropTypes.bool,
  tiny: PropTypes.bool,
};

export { Text };
