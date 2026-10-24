import { useId, type InputHTMLAttributes } from "react";

import { cn } from "../../lib/cn";
import { focusRing } from "./styles";

export interface RadioProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** Optional text rendered beside the dot and wired up via htmlFor. */
  label?: string;
}

export function Radio({ label, className, id, ...props }: RadioProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  const control = (
    <input
      id={inputId}
      type="radio"
      className={cn(
        "size-[18px] shrink-0 appearance-none rounded-full border border-ink bg-paper",
        // Checked: ink fill with an inset paper band, leaving an ink dot centered.
        "checked:bg-ink checked:shadow-[inset_0_0_0_3px_var(--color-paper)]",
        focusRing,
        "disabled:cursor-not-allowed disabled:border-ink/40 disabled:checked:bg-ink/40",
        className,
      )}
      {...props}
    />
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
