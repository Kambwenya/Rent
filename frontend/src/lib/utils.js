import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function isIframe() {
  return typeof window !== 'undefined' && window.self !== window.top;
}
