import PropTypes from 'prop-types';
import React from 'react';

import { style } from './Pagination.style';
import { View } from '../../primitives';

const Pagination = ({ currentIndex, length = 0, ...others }) =>
  length > 0 ? (
    <View row style={[style.pagination, others.style]}>
      {Array.from({ length }).map((_, index) => (
        <View key={index} wide style={[style.dot, index === currentIndex && style.dotActive]} />
      ))}
    </View>
  ) : null;

Pagination.displayName = 'Pagination';

Pagination.propTypes = {
  currentIndex: PropTypes.number,
  length: PropTypes.number,
};

export { Pagination };
