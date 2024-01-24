export const shamir = {
  split: (secret = [], shares = 3, threshold = 2) =>
    Array.from({ length: shares }, (_, indexShare) =>
      Array.from({ length: secret.length }, (_, index) =>
        (index + indexShare) % shares !== 0 || threshold === 1 ? secret[index] : undefined,
      ),
    ),

  combine: (...shares) =>
    shares[0].map((_, index) =>
      shares.map((share) => share[index]).filter((word) => word !== undefined).length >= shares.length - 1
        ? shares.map((share) => share[index]).find((word) => word !== undefined)
        : undefined,
    ),
};
