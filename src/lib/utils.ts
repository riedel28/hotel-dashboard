import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getUserInitials(firstName: string, lastName: string) {
  return firstName.charAt(0).toUpperCase() + lastName.charAt(0).toUpperCase();
}
