export type ClassValue = string | false | null | undefined;

/** Joins conditional class names. Keeps component call sites tidy. */
export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}
