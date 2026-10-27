/**
 * Formats a number into Indian Rupee currency format (e.g., ₹70,533 or ₹1,50,000)
 */
export function formatCurrency(value) {
  if (value === null || value === undefined || isNaN(value)) return '₹0';
  const numValue = Math.round(Number(value));
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(numValue);
}

/**
 * Formats difference between predicted and current credit limit with + / - sign
 */
export function formatDifference(diffValue) {
  if (diffValue === null || diffValue === undefined || isNaN(diffValue)) return '₹0';
  const rounded = Math.round(Number(diffValue));
  const absFormatted = formatCurrency(Math.abs(rounded));
  if (rounded > 0) return `+${absFormatted}`;
  if (rounded < 0) return `-${absFormatted}`;
  return absFormatted;
}

/**
 * Map demographic codes to human readable text
 */
export function formatSex(value) {
  const code = Number(value);
  if (code === 1) return 'Male';
  if (code === 2) return 'Female';
  return 'Unknown';
}

export function formatEducation(value) {
  const code = Number(value);
  if (code === 1) return 'Graduate School';
  if (code === 2) return 'University';
  if (code === 3) return 'High School';
  if (code === 4) return 'Other';
  return 'Unknown';
}

export function formatMarriage(value) {
  const code = Number(value);
  if (code === 1) return 'Married';
  if (code === 2) return 'Single';
  if (code === 3) return 'Other';
  return 'Unknown';
}

export function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return 'Invalid date';
  return d.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}
