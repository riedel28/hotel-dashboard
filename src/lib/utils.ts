import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Generates user initials from first and last name (e.g., "JD" for "John Doe")
export function getUserInitials(firstName?: string, lastName?: string): string {
  const firstInitial = firstName?.charAt(0)?.toUpperCase() || '';
  const lastInitial = lastName?.charAt(0)?.toUpperCase() || '';

  return firstInitial + lastInitial;
}
