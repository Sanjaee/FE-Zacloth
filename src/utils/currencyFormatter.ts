/**
 * Format number to Indonesian Rupiah currency
 * @param value - The number to format
 * @returns Formatted string in Rupiah format (e.g., "2.099.000")
 */
export const formatRupiah = (value: number | string): string => {
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    value === 0 ||
    value === "0"
  )
    return "";

  const numValue = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(numValue) || numValue <= 0) return "";

  return numValue.toLocaleString("id-ID");
};

/**
 * Parse Rupiah formatted string to number
 * @param value - The formatted string (e.g., "2.099.000")
 * @returns The number value
 */
export const parseRupiah = (value: string): number => {
  if (!value) return 0;

  // Remove all non-digit characters except decimal point
  const cleanValue = value.replace(/[^\d]/g, "");

  return cleanValue ? parseInt(cleanValue, 10) : 0;
};

/**
 * Format number to Rupiah with currency symbol
 * @param value - The number to format
 * @returns Formatted string with Rp prefix (e.g., "Rp 2.099.000")
 */
export const formatRupiahWithSymbol = (value: number | string): string => {
  const formatted = formatRupiah(value);
  return formatted ? `Rp ${formatted}` : "";
};

/**
 * Handle input change for currency fields
 * @param value - The input value
 * @param onChange - The onChange callback function
 */
export const handleCurrencyInputChange = (
  value: string,
  onChange: (value: number) => void
) => {
  // Remove all non-digit characters
  const cleanValue = value.replace(/[^\d]/g, "");

  // Convert to number and call onChange
  const numValue = cleanValue ? parseInt(cleanValue, 10) : 0;
  onChange(numValue);
};

/**
 * Get display value for currency input
 * @param value - The number value
 * @returns Formatted string for display
 */
export const getCurrencyDisplayValue = (value: number): string => {
  return formatRupiah(value);
};

/**
 * Format input value as user types
 * @param value - The input value
 * @returns Formatted string for display
 */
export const formatInputValue = (value: string): string => {
  // Remove all non-digit characters
  const cleanValue = value.replace(/[^\d]/g, "");

  if (!cleanValue) return "";

  // Convert to number and format
  const numValue = parseInt(cleanValue, 10);
  return formatRupiah(numValue);
};
