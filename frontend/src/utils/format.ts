/**
 * Formats a number as Dominican Peso (DOP) currency.
 * Examples: 50000 → "50,000.00" | 3400.441 → "3,400.44"
 */
export const formatDOP = (value: number): string => {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};
