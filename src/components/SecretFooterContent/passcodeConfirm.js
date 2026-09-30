const channel = (value) => {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

const luminance = (hex) => {
  const clean = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((at) => parseInt(clean.slice(at, at + 2), 16));
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};

export const contrastRatio = (a, b) => {
  const [la, lb] = [luminance(a), luminance(b)];
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
};

export const passcodeConfirm = (colors, contrast) => {
  const backgroundColor = contrast === 'accent' ? colors.onAccent : colors.onInverse;
  const tone = contrastRatio(colors.onScrim, backgroundColor) >= contrastRatio(colors.onAccent, backgroundColor) ? 'onScrim' : 'onAccent';
  return { backgroundColor, tone };
};
