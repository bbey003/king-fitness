export function formatCents(cents: number, currency = 'usd'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

export function centsToDecimal(cents: number): string {
  return (cents / 100).toFixed(2);
}
