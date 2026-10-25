import { useId } from "react";
import {
  flagBlue,
  flagGold,
  flagGreen,
  flagOutline,
  flagShading,
} from "../content/portland-flag";
import { cn } from "../lib/cn";

/** Portland's city flag on a pole, caught mid-wave (a still image). */
export function PortlandFlag({ className }: { className?: string }) {
  const shading = useId();
  return (
    <svg viewBox="-22 -36 630 456" role="img" aria-label="Portland's city flag, waving" className={cn("block", className)}>
      <defs>
        <linearGradient id={shading} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="582" y2="0">
          {flagShading.map(([offset, amount]) => (
            <stop
              key={offset}
              offset={offset}
              stopColor={amount < 0 ? "white" : "black"}
              stopOpacity={Math.abs(amount) * 0.16}
            />
          ))}
        </linearGradient>
      </defs>

      {/* Pole. */}
      <rect x="-9" y="-24" width="9" height="440" rx="4.5" fill="#8a8780" />
      <circle cx="-4.5" cy="-26" r="8" fill="#8a8780" />

      <path d={flagOutline} fill="var(--color-paper)" />
      <path d={flagGreen} fill="var(--color-flag-green)" />
      <path d={flagGold} fill="var(--color-flag-gold)" />
      <path d={flagBlue} fill="var(--color-flag-blue)" />
      <path d={flagOutline} fill={`url(#${shading})`} />
      <path d={flagOutline} fill="none" stroke="var(--color-ink)" strokeOpacity="0.12" strokeWidth="1.5" />
    </svg>
  );
}
