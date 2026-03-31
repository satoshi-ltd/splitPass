const lightColors = {
  text: '#181310',
  textSecondary: '#6F635A',
  accent: '#F46A3A',
  onAccent: '#FFFFFF',
  background: '#FFFBF7',
  surface: '#F3ECE5',
  qrBackground: '#FFFCF8',
  qrForeground: '#181310',
  border: '#E8DDD3',
  danger: '#C62828',
  warning: '#C27C00',
  overlay: 'rgba(0, 0, 0, 0.45)',
  inverse: '#181310',
  onInverse: '#FFFCF8',
};

const darkColors = {
  text: '#F7EFE8',
  textSecondary: '#C2B6AC',
  accent: '#F46A3A',
  onAccent: '#FFFFFF',
  background: '#13100E',
  surface: '#1D1815',
  qrBackground: '#FBF4ED',
  qrForeground: '#181310',
  border: '#40352F',
  danger: '#FF7262',
  warning: '#E2A53B',
  overlay: 'rgba(0, 0, 0, 0.6)',
  inverse: '#FBF4ED',
  onInverse: '#181310',
};

export const theme = {
  colors: {
    dark: darkColors,
    light: lightColors,
  },
  typography: {
    fontFaces: {
      primary: {
        regular: 'font-default',
        bold: 'font-bold',
      },
      secondary: {
        regular: 'font-default-secondary',
        bold: 'font-bold-secondary',
      },
    },
    sizes: {
      tiny: 11,
      caption: 13,
      body: 15,
      subtitle: 20,
      title: 28,
    },
    lineHeights: {
      tiny: 14,
      caption: 16,
      body: 20,
      subtitle: 24,
      title: 32,
    },
    iconSizes: {
      tiny: 12,
      caption: 16,
      body: 20,
      subtitle: 24,
      title: 30,
    },
  },
  spacing: {
    xxs: 4,
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 4,
    md: 6,
    lg: 8,
    xl: 12,
    full: 9999,
  },
  animations: {
    duration: {
      quick: 220,
      standard: 320,
    },
  },
};

export const getAppColors = (mode = 'light') => theme.colors[mode] || theme.colors.light;
