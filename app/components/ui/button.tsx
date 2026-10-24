import type { ButtonHTMLAttributes } from "react";

import { cn } from "../../lib/cn";
import { controlHeight, focusRing } from "./styles";

export type ButtonVariant = "primary" | "secondary";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variants: Record<ButtonVariant, string> = {
  /** Solid ink. One per view — the single most important action. */
  primary: "border-ink bg-ink text-paper hover:bg-ink/85",
  /** Outlined. Inverts to solid ink on hover. */
  secondary: "border-ink bg-paper text-ink hover:bg-ink hover:text-paper",
};

export function Button({
  variant = "primary",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-control border px-5",
        controlHeight,
        "text-sm font-medium transition-colors",
        focusRing,
        "disabled:cursor-not-allowed disabled:opacity-40",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
