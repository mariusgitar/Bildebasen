export const CONVERSION_STATUS_MESSAGES = [
  'Presser ut siste piksel...',
  'Skviser ut HEIC-saften...',
  'Snakker pent til pikslene...',
  'Rydder opp i fargekaoset...',
  'Nesten pixel-perfekt...',
  'Overtaler canvas til å samarbeide...',
  'Krymper uten å klage...',
] as const;

export const getConversionStatusMessage = (fileIndex: number): string =>
  CONVERSION_STATUS_MESSAGES[fileIndex % CONVERSION_STATUS_MESSAGES.length];
