import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getSimilarityClasses(similarity: number) {
  // similarity is expected to be 0-100, but clamp defensively
  const s = Math.max(0, Math.min(100, similarity))

  if (s >= 67) {
    return {
      bar: 'bg-green-500',
      text: 'text-green-600 dark:text-green-400',
    }
  }
  if (s >= 34) {
    return {
      bar: 'bg-yellow-500',
      text: 'text-yellow-700 dark:text-yellow-400',
    }
  }
  return {
    bar: 'bg-red-500',
    text: 'text-red-600 dark:text-red-400',
  }
}
