import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility for merging tailwind classes with clsx and tailwind-merge.
 * Highly recommended for clean component abstractions as per skill_frontend.md
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
