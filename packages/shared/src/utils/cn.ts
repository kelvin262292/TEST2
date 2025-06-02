import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge class names with proper Tailwind CSS specificity handling
 * 
 * @param inputs - Any number of class names, objects, or arrays to merge
 * @returns Merged class names string with Tailwind CSS specificity conflicts resolved
 * 
 * @example
 * // Basic usage
 * cn('text-red-500', 'bg-blue-500')
 * 
 * @example
 * // Conditional classes
 * cn('text-lg', isLarge && 'font-bold', { 'opacity-50': isDisabled })
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
