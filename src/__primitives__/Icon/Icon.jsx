import PropTypes from 'prop-types';
import React from 'react';
import StyleSheet from 'react-native-extended-stylesheet';
import Svg, { Path } from 'react-native-svg';

const ICON_PATHS = {
  alert:
    'M19,19H5V5H19M19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3M11,15H13V17H11V15M11,7H13V13H11V7',
  guardians:
    'M12,5.5A3.5,3.5 0 0,1 15.5,9A3.5,3.5 0 0,1 12,12.5A3.5,3.5 0 0,1 8.5,9A3.5,3.5 0 0,1 12,5.5M5,8C5.56,8 6.08,8.15 6.53,8.42C6.38,9.85 6.8,11.27 7.66,12.38C7.16,13.34 6.16,14 5,14A3,3 0 0,1 2,11A3,3 0 0,1 5,8M19,8A3,3 0 0,1 22,11A3,3 0 0,1 19,14C17.84,14 16.84,13.34 16.34,12.38C17.2,11.27 17.62,9.85 17.47,8.42C17.92,8.15 18.44,8 19,8M5.5,18.25C5.5,16.18 8.41,14.5 12,14.5C15.59,14.5 18.5,16.18 18.5,18.25V20H5.5V18.25M0,20V18.5C0,17.11 1.89,15.94 4.45,15.6C3.86,16.28 3.5,17.22 3.5,18.25V20H0M24,20H20.5V18.25C20.5,17.22 20.14,16.28 19.55,15.6C22.11,15.94 24,17.11 24,18.5V20Z',
  info: 'M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z',
  qr: 'M3,11H5V13H3V11M11,5H13V9H11V5M9,11H13V15H11V13H9V11M15,11H17V13H19V11H21V13H19V15H21V19H19V21H17V19H13V21H11V17H15V15H17V13H15V11M19,19V15H17V19H19M15,3H21V9H15V3M17,5V7H19V5H17M3,3H9V9H3V3M5,5V7H7V5H5M3,15H9V21H3V15M5,17V19H7V17H5Z',
  scan: 'M17 22V20H20V17H22V20.5C22 20.9 21.8 21.2 21.5 21.5C21.2 21.8 20.8 22 20.5 22H17M7 22H3.5C3.1 22 2.8 21.8 2.5 21.5C2.2 21.2 2 20.8 2 20.5V17H4V20H7V22M17 2H20.5C20.9 2 21.2 2.2 21.5 2.5C21.8 2.8 22 3.1 22 3.5V7H20V4H17V2M7 2V4H4V7H2V3.5C2 3.1 2.2 2.8 2.5 2.5S3.1 2 3.5 2H7M19 11H5V13H19V11Z',
  settings:
    'M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8M12,10A2,2 0 0,0 10,12A2,2 0 0,0 12,14A2,2 0 0,0 14,12A2,2 0 0,0 12,10M10,22C9.75,22 9.54,21.82 9.5,21.58L9.13,18.93C8.5,18.68 7.96,18.34 7.44,17.94L4.95,18.95C4.73,19.03 4.46,18.95 4.34,18.73L2.34,15.27C2.21,15.05 2.27,14.78 2.46,14.63L4.57,12.97L4.5,12L4.57,11L2.46,9.37C2.27,9.22 2.21,8.95 2.34,8.73L4.34,5.27C4.46,5.05 4.73,4.96 4.95,5.05L7.44,6.05C7.96,5.66 8.5,5.32 9.13,5.07L9.5,2.42C9.54,2.18 9.75,2 10,2H14C14.25,2 14.46,2.18 14.5,2.42L14.87,5.07C15.5,5.32 16.04,5.66 16.56,6.05L19.05,5.05C19.27,4.96 19.54,5.05 19.66,5.27L21.66,8.73C21.79,8.95 21.73,9.22 21.54,9.37L19.43,11L19.5,12L19.43,13L21.54,14.63C21.73,14.78 21.79,15.05 21.66,15.27L19.66,18.73C19.54,18.95 19.27,19.04 19.05,18.95L16.56,17.95C16.04,18.34 15.5,18.68 14.87,18.93L14.5,21.58C14.46,21.82 14.25,22 14,22H10M11.25,4L10.88,6.61C9.68,6.86 8.62,7.5 7.85,8.39L5.44,7.35L4.69,8.65L6.8,10.2C6.4,11.37 6.4,12.64 6.8,13.8L4.68,15.36L5.43,16.66L7.86,15.62C8.63,16.5 9.68,17.14 10.87,17.38L11.24,20H12.76L13.13,17.39C14.32,17.14 15.37,16.5 16.14,15.62L18.57,16.66L19.32,15.36L17.2,13.81C17.6,12.64 17.6,11.37 17.2,10.2L19.31,8.65L18.56,7.35L16.15,8.39C15.38,7.5 14.32,6.86 13.12,6.62L12.75,4H11.25Z',
  vault:
    'M10 12C10 10.9 10.9 10 12 10C13.1 10 14 10.9 14 12C14 13.1 13.1 14 12 14C10.9 14 10 13.1 10 12M7.8 17.7L6.3 16.3L7.8 14.8C7.3 14 7 13 7 12C7 11 7.3 10 7.8 9.3L6.3 7.8L7.8 6.3L9.2 7.8C10 7.3 11 7 12 7C13 7 14 7.3 14.8 7.8L16.3 6.3L17.7 7.7L16.2 9.2C16.7 10 17 11 17 12C17 13 16.7 14 16.2 14.8L17.7 16.3L16.3 17.7L14.8 16.2C14 16.7 13 17 12 17C11 17 10 16.7 9.3 16.2L7.8 17.7M12 9C10.3 9 9 10.3 9 12C9 13.7 10.3 15 12 15C13.7 15 15 13.7 15 12C15 10.3 13.7 9 12 9M20 2C21.1 2 22 2.9 22 4V20C22 21.1 21.1 22 20 22H19V23H15V22H9V23H5V22H4C2.9 22 2 21.1 2 20V4C2 2.9 2.9 2 4 2H20M20 20V4H4V20H20Z',
};

const Icon = ({ color = '$colorContent', name = 'alert', size = 24 }) => {
  const themeColor = StyleSheet.value(color);

  return (
    <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size}>
      <Path fill={themeColor} d={ICON_PATHS[name]} />
    </Svg>
  );
};

Icon.displayName = 'Icon';

Icon.propTypes = {
  color: PropTypes.string,
  name: PropTypes.oneOf(Object.keys(ICON_PATHS)),
  size: PropTypes.number,
};

export { Icon };
