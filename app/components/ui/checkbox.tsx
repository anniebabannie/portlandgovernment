import { useId, type InputHTMLAttributes } from "react";

import { cn } from "../../lib/cn";
import { focusRing } from "./styles";

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** Optional text rendered beside the box and wired up via htmlFor. */
  label?: string;
}

export function Checkbox({ label, className, id, ...props }: CheckboxProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  const control = (
    <span className="relative inline-flex shrink-0">
      <input
        id={inputId}
        type="checkbox"
        className={cn(
          "peer size-[18px] appearance-none rounded-check border border-ink bg-paper",
          "checked:bg-ink",
          focusRing,
          "disabled:cursor-not-allowed disabled:border-ink/40 disabled:checked:bg-ink/40",
          className,
        )}
        {...props}
      />
      <svg
        viewBox="0 0 18 18"
        fill="none"
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden size-[18px] text-paper peer-checked:block"
      >
        <path
          d="M4 9.2 7.2 12.4 14 5.6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="square"
        />
      </svg>
    </span>
  );

  if (!label) return control;

  return (
    <label
      htmlFor={inputId}
      className="inline-flex cursor-pointer items-center gap-2.5 text-sm text-ink has-disabled:cursor-not-allowed has-disabled:text-ink/40"
    >
      {control}
      {label}
    </label>
  );
}
