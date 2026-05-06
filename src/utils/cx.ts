import { twMerge } from 'tailwind-merge'

type ClassValue = string | false | null | undefined

export function cx(...values: ClassValue[]) {
  return twMerge(values.filter(Boolean).join(' '))
}

export function sortCx<T>(styles: T) {
  return styles
}
