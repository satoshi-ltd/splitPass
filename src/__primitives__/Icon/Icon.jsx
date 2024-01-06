import PropTypes from "prop-types";
import React from "react";

import { style } from "./Icon.style";
import { View } from "../View";

const Icon = ({ ...others }) => (
  <View {...others} style={[style.icon, others.style]} />
);

Icon.displayName = "Icon";

Icon.propTypes = {
  value: PropTypes.oneOf(["left", "center", "right"]),
};

export { Icon };
