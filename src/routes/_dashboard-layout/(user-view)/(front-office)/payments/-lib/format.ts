/** A card shown by its last four digits only. */
export function maskCardNumber(last4: string) {
  return `•••• ${last4.slice(-4)}`;
}
