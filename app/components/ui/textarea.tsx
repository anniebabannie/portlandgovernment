import type { TextareaHTMLAttributes } from "react";

import { cn } from "../../lib/cn";
import { fieldBase } from "./styles";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export function Textarea({ className, rows = 4, ...props }: TextareaProps) {
  return (
    <textarea
      rows={rows}
      className={cn(fieldBase, "resize-y px-3 py-2", className)}
      {...props}
    />
  );
}
