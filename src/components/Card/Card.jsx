import React from 'react';

import { style } from './Card.style';
import { View } from '../../__primitives__/View';

const Card = ({ ...others }) => <View {...others} style={[style.card, others.style]} />;

Card.displayName = 'Card';

export { Card };
