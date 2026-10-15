/** A card shown by its last four digits only. */
export function maskCardNumber(last4: string) {
  return `•••• ${last4.slice(-4)}`;
}

/**
 * Cuts the middle out of a long value, keeping both ends: references are told
 * apart by their start and their end.
 */
export function truncateMiddle(value: string, head = 8, tail = 6) {
  // Cutting out a single character saves nothing over the ellipsis
  if (value.length <= head + tail + 1) {
    return value;
  }
  return `${value.slice(0, head)}…${value.slice(-tail)}`;
}
