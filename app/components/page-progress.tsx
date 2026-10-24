import { useEffect, useRef } from "react";

/**
 * Thin bar fixed to the top of the viewport that fills as the page scrolls.
 * Writes the transform directly so scrolling doesn't re-render the app.
 */
export function PageProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
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
  }, []);

  return (
    // Purely visual; the browser's own scroll position covers assistive tech.
    // The padding is transparent, so the bar floats over the page content.
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-50 p-1.5">
      <div className="h-1 overflow-hidden rounded-full bg-ink/10">
        <div
          ref={barRef}
          className="h-full origin-left rounded-full bg-flag-green"
          style={{ transform: "scaleX(0)" }}
        />
      </div>
    </div>
  );
}
