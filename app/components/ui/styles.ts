/**
 * Shared style fragments for the design system.
 * Components compose these so edges, heights, and focus rings never drift.
 */

/** Keyboard focus ring drawn outside the control. Used by buttons. */
export const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";

/** Focus ring drawn just inside the border. Used by bordered form fields. */
export const focusRingInset =
  "focus:outline-2 focus:-outline-offset-[3px] focus:outline-ink";

/** Border, background, and text treatment common to every form field. */
export const fieldBase = cls(
  "w-full rounded-control border border-ink bg-paper text-ink",
  "text-sm placeholder:text-ink/40",
  focusRingInset,
  "disabled:cursor-not-allowed disabled:bg-ink/5 disabled:text-ink/40",
);

/** Uniform control height for buttons, inputs, and selects. */
export const controlHeight = "h-10";

function cls(...parts: string[]) {
  return parts.join(" ");
}
