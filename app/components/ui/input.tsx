import type { InputHTMLAttributes } from "react";

import { cn } from "../../lib/cn";
import { controlHeight, fieldBase } from "./styles";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className, type = "text", ...props }: InputProps) {
  return (
    <input
      type={type}
      className={cn(fieldBase, controlHeight, "px-3", className)}
      {...props}
    />
  );
}
