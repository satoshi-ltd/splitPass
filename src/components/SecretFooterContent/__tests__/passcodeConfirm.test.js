jest.mock('react-native', () => ({ Appearance: { getColorScheme: () => 'light' } }));

import { getAppColors } from '../../../theme/theme';
import { contrastRatio, passcodeConfirm } from '../passcodeConfirm';

const TONE_COLOR = (colors) => ({ onScrim: colors.onScrim, onAccent: colors.onAccent });

describe('passcodeConfirm', () => {
  ['light', 'dark'].forEach((mode) => {
    ['accent', 'dark', 'light'].forEach((contrast) => {
      it(`keeps the confirm icon readable on ${contrast} footers in the ${mode} theme`, () => {
        const colors = getAppColors(mode);
        const { backgroundColor, tone } = passcodeConfirm(colors, contrast);

        expect(contrastRatio(TONE_COLOR(colors)[tone], backgroundColor)).toBeGreaterThanOrEqual(4.5);
      });
    });
  });
});
