import PropTypes from "prop-types";
import React from "react";

import { style } from "./Card.style";
import { View } from "../../__primitives__/View";

const Card = ({ outlined = false, ...others }) => (
  <View
    {...others}
    pointerEvents={others.pointerEvents || others.pointer}
    style={[style.card, outlined && style.outlined, others.style]}
  />
);

Card.displayName = "Card";

Card.propTypes = {
  outlined: PropTypes.bool,
};

export { Card };
