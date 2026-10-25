import { useEffect, useRef, useState } from "react";
import { cn } from "../lib/cn";

export type Chapter = { title: string; id: string };

/**
 * Footer fixed to the bottom of the viewport once the reader is past the
 * hero: arrows that jump to the previous and next chapters, with the current
 * chapter's name between them. The name opens a menu of every chapter.
 * A chapter runs from its section (by `id`) until the next chapter's.
 */
export function ChapterNav({ chapters }: { chapters: Chapter[] }) {
  // -1 until the first chapter reaches the middle of the screen.
  const [current, setCurrent] = useState(-1);
  // Where each chapter starts along the top progress bar (0–1), and how many
  // of those starts the bar has reached.
  const [marks, setMarks] = useState<number[]>([]);
  const [reached, setReached] = useState(0);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuId = "chapter-menu";

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const line = window.innerHeight / 2;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? window.scrollY / max : 0;
      let index = -1;
      const starts: number[] = [];
      chapters.forEach((ch, i) => {
        const el = document.getElementById(ch.id);
        if (!el) return;
        const top = el.getBoundingClientRect().top;
        if (top <= line) index = i;
        // The bar's fill when this chapter's top reaches the top of the screen.
        starts.push(max > 0 ? Math.min(1, Math.max(0, (top + window.scrollY) / max)) : 0);
      });
      setCurrent(index);
      // Only re-render when the marks actually move (on resize, mostly).
      setMarks((prev) =>
        prev.length === starts.length && prev.every((m, i) => Math.abs(m - starts[i]) < 0.0005) ? prev : starts,
      );
      setReached(starts.filter((m) => m <= progress + 0.0005).length);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [chapters]);

  // The menu closes on Escape or a click outside it, and opens with focus on
  // the current chapter.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    const onPointer = (e: PointerEvent) => {
      const target = e.target as Node;
      if (!menuRef.current?.contains(target) && !toggleRef.current?.contains(target)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    menuRef.current?.querySelector<HTMLButtonElement>("[aria-current='true'], button")?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  const shown = current >= 0;
  useEffect(() => {
    if (!shown) setOpen(false);
  }, [shown]);

  const jumpTo = (i: number) => {
    const el = document.getElementById(chapters[i].id);
    if (!el) return;
    setOpen(false);
    // An instant jump, not a scroll through every section in between.
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY, behavior: "instant" });
  };

  const title = chapters[Math.max(0, current)].title;
  const arrow =
    "flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-flag-green hover:bg-flag-green/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-flag-green disabled:cursor-default disabled:text-ink/25 disabled:hover:bg-transparent";

  return (
    <>
      {/* Chapter dots on the top progress bar (PageProgress), matching its
          inset and height so they sit on the line. */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-50 p-1.5">
        <div className="relative h-1">
          {marks.map((m, i) => (
            <span
              key={i}
              className={cn(
                "absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-cream",
                i < reached ? "bg-flag-green" : "bg-ink/25",
              )}
              style={{ left: `${m * 100}%` }}
            />
          ))}
        </div>
      </div>

      <nav
        aria-label="Chapters"
        inert={!shown}
        className={cn(
          "fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-4 transition duration-300 sm:pb-6",
          shown ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0",
        )}
      >
        <div className="relative">
          {open && (
            <div
              ref={menuRef}
              id={menuId}
              className="absolute bottom-full left-1/2 mb-3 w-64 -translate-x-1/2 rounded-3xl border border-ink/10 bg-paper p-2 shadow-lg"
            >
              <p className="px-4 pt-2 pb-1 text-xs font-bold tracking-wide text-ink/65 uppercase">Jump to</p>
              <ul>
                {chapters.map((ch, i) => (
                  <li key={ch.id}>
                    <button
                      type="button"
                      aria-current={i === current ? "true" : undefined}
                      onClick={() => jumpTo(i)}
                      className={cn(
                        "flex w-full cursor-pointer items-center justify-between rounded-2xl px-4 py-2.5 text-left font-semibold hover:bg-ink/5 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-flag-green",
                        i === current ? "text-flag-green" : "text-ink",
                      )}
                    >
                      {ch.title}
                      {i === current && (
                        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12l5 5 9-10" />
                        </svg>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-center gap-1 rounded-full border border-ink/10 bg-paper/95 p-1.5 shadow-md backdrop-blur">
            <button
              type="button"
              aria-label={current > 0 ? `Previous chapter: ${chapters[current - 1].title}` : "Previous chapter"}
              disabled={current <= 0}
              onClick={() => jumpTo(current - 1)}
              className={arrow}
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 5l-7 7 7 7" />
              </svg>
            </button>

            <button
              ref={toggleRef}
              type="button"
              aria-expanded={open}
              aria-controls={menuId}
              onClick={() => setOpen((o) => !o)}
              className="flex min-w-40 cursor-pointer items-center justify-center gap-1.5 rounded-full px-4 py-2 font-bold text-ink hover:bg-ink/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-flag-green sm:min-w-52"
            >
              <span className="sr-only">Chapter: </span>
              {title}
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className={cn("size-4 text-ink/65 transition-transform", open && "rotate-180")}
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 15l6-6 6 6" />
              </svg>
            </button>

            <button
              type="button"
              aria-label={
                current < chapters.length - 1 ? `Next chapter: ${chapters[current + 1].title}` : "Next chapter"
              }
              disabled={current >= chapters.length - 1}
              onClick={() => jumpTo(current + 1)}
              className={arrow}
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}
