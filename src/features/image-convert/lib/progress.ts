export const CONVERSION_STATUS_MESSAGES = [
  'Presser ut siste piksel...',
  'Skviser ut HEIC-saften...',
  'Snakker pent til pikslene...',
  'Rydder opp i fargekaoset...',
  'Nesten pixel-perfekt...',
  'Overtaler canvas til å samarbeide...',
  'Krymper uten å klage...',
] as const;

export const getConversionStatusMessage = (completed: number, total: number): string => {
  const percent = total > 0 ? (completed / total) * 100 : 0;
  const messageIndex = percent >= 90 ? 2 : percent >= 50 ? 1 : 0;

  return CONVERSION_STATUS_MESSAGES[messageIndex];
};
