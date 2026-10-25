import type { ReactNode } from "react";
import {
  ramp,
  usePrefersReducedMotion,
  useScrollProgress,
} from "../lib/use-scroll-progress";

/**
 * Timeline for a pinned, scroll-driven section split into equal steps.
 * `between(s0, f0, s1, f1)` ramps 0→1 from fraction f0 of step s0 to
 * fraction f1 of step s1. A short hold at the end keeps the final state on
 * screen before the section scrolls away.
 */
export function useScrollStory(stepCount: number) {
  const [ref, p] = useScrollProgress<HTMLElement>();
  const reducedMotion = usePrefersReducedMotion();
  const steps = stepCount + 0.6;
  const at = (step: number, fraction: number) => (step + fraction) / steps;
  const between = (s0: number, f0: number, s1: number, f1: number) =>
    ramp(p, at(s0, f0), at(s1, f1));
  // Small vertical drift for the "almost parallax" feel; off for reduced motion.
  const drift = (amount: number) =>
    reducedMotion ? undefined : `translateY(${amount}px)`;

  return { ref, between, drift, height: `${steps * 90 + 100}svh` };
}

export type ScrollStory = ReturnType<typeof useScrollStory>;

/**
 * Props that make an SVG path draw itself in as t goes 0→1. A zero-length
 * dash still paints its round end cap, so the path is hidden until it starts.
 */
export function drawIn(t: number) {
  return {
    pathLength: 1,
    strokeDasharray: "1",
    strokeDashoffset: 1 - t,
    strokeOpacity: t > 0.001 ? 1 : 0,
  };
}

/** Full-screen lines, one per step starting at step 0. */
export function StoryIntros({
  story: { between, drift },
  intros,
}: {
  story: ScrollStory;
  intros: ReactNode[];
}) {
  return intros.map((line, k) => {
    const leaving = between(k, 0.65, k, 0.95);
    const o = (k === 0 ? 1 : between(k, 0, k, 0.3)) * (1 - leaving);
    return (
      <p
        key={k}
        className="absolute inset-0 mx-auto flex max-w-5xl items-center justify-center px-6 text-center text-4xl font-extrabold tracking-tight text-flag-green text-balance sm:text-6xl"
        style={{
          opacity: o,
          transform: drift(leaving ? leaving * -48 : (1 - o) * 24),
        }}
      >
        {/* One inline wrapper, so the flex centering doesn't split mixed
            text and markup into separate items (and drop the spaces). */}
        <span>{line}</span>
      </p>
    );
  });
}

export type StoryCaption = {
  node: ReactNode;
  /** Smaller, muted line under the caption, e.g. a hint to click. */
  sub?: ReactNode;
  step: number;
  /** Fraction of the step at which the caption starts fading in. */
  start: number;
};

/**
 * Captions stacked in one grid cell. Each fades in partway through its step
 * and fades out as the next one arrives.
 */
export function StoryCaptions({
  story: { between, drift },
  captions,
}: {
  story: ScrollStory;
  captions: StoryCaption[];
}) {
  return (
    <div className="grid max-w-3xl items-center text-center text-2xl font-bold tracking-tight text-ink sm:text-4xl text-balance *:col-start-1 *:row-start-1">
      {captions.map((c, j) => {
        const next = captions[j + 1];
        const fadeIn = between(c.step, c.start, c.step, c.start + 0.2);
        const fadeOut = next
          ? between(next.step, next.start - 0.15, next.step, next.start)
          : 0;
        const o = fadeIn * (1 - fadeOut);
        return (
          // A div, not a p, so a caption can hold a form. Faded-out captions
          // are inert so they can't catch clicks or focus.
          <div
            key={j}
            inert={o < 0.5}
            style={{ opacity: o, transform: drift((1 - o) * 16) }}
          >
            {c.node}
            {c.sub && (
              <p className="mt-3 text-base font-medium tracking-normal text-ink/65 sm:mt-4 sm:text-xl">
                {c.sub}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
