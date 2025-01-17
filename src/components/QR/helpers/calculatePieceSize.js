const MAX_PIECE_SIZE = 11;
const MIN_PIECE_SIZE = 8;

export const calculatePieceSize = (value) => {
  const { length } = value;

  if (length > 72) return MIN_PIECE_SIZE;
  if (length < 36) return MAX_PIECE_SIZE;

  return Math.floor(((100 - length) / 70) * (MAX_PIECE_SIZE - MIN_PIECE_SIZE) + MIN_PIECE_SIZE) - 1;
};
