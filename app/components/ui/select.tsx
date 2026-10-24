import type { SelectHTMLAttributes } from "react";

import { cn } from "../../lib/cn";
import { controlHeight, fieldBase } from "./styles";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {}

/**
 * Styles the closed bar only — the open menu stays the native OS dropdown,
 * so there is no custom listbox to keep accessible.
 */
export function Select({ className, children, ...props }: SelectProps) {
  return (
    <span className="relative block w-full">
      <select
        className={cn(
          fieldBase,
          controlHeight,
          "appearance-none pl-3 pr-10",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <svg
        viewBox="0 0 12 8"
        fill="none"
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 h-2 w-3 -translate-y-1/2 text-ink"
      >
        <path
          d="M1 1.5 6 6.5 11 1.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="square"
        />
      </svg>
    </span>
  );
}
