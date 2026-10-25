import type { ReactNode } from "react";
import {
  StoryCaptions,
  StoryIntros,
  useScrollStory,
  type StoryCaption,
} from "./scroll-story";

export type ActionStep = {
  caption: ReactNode;
  /** Smaller, muted line under the caption, above any button. */
  sub?: ReactNode;
  /** A button under the caption, linking out (opens in a new tab). */
  action?: { href: string; label: string };
};

type Props = {
  id?: string;
  intros: ReactNode[];
  /** Optional: with none, the last intro line stays on screen. */
  steps?: ActionStep[];
};

/** Pinned, scroll-driven captions, each with an optional link button. */
export function ActionSection({ id, intros, steps = [] }: Props) {
  const story = useScrollStory(intros.length + steps.length);
  const captions: StoryCaption[] = steps.map((st, i) => ({
    node: (
      <>
        {st.caption}
        {/* Styled like other captions' subtext, but kept above the button. */}
        {st.sub && (
          <p className="mt-3 text-base font-medium tracking-normal text-ink/65 sm:mt-4 sm:text-xl">
            {st.sub}
          </p>
        )}
        {st.action && (
          <div className="mt-8 sm:mt-10">
            <a
              href={st.action.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-control bg-flag-green px-6 py-3.5 text-lg font-bold tracking-normal text-cream hover:bg-flag-green/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-flag-green sm:text-xl"
            >
              {st.action.label}
              <span className="sr-only"> (opens in a new tab)</span>
              <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17L17 7M9 7h8v8" />
              </svg>
            </a>
          </div>
        )}
      </>
    ),
    step: intros.length + i,
    start: 0.15,
  }));

  return (
    <section id={id} ref={story.ref} className="relative" style={{ height: story.height }}>
      <div className="sticky top-0 h-svh overflow-hidden">
        <StoryIntros story={story} intros={intros} holdLast={steps.length === 0} />
        <div className="flex h-full flex-col items-center justify-center px-6">
          <StoryCaptions story={story} captions={captions} />
        </div>
      </div>
    </section>
  );
}
