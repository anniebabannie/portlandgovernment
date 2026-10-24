import { useRef, useState } from "react";
import { cn } from "../lib/cn";

export type Office = {
  name: string;
  /** How the name breaks across lines in a drawn box; defaults to one line. */
  lines?: string[];
  /** A sentence or two shown at the top of its dialog. */
  summary?: string;
  bureaus?: string[];
  /** Smaller programs that sit outside a bureau. */
  programs?: string[];
  /** Its official page. */
  url?: string;
};

/**
 * A modal dialog with details about one office. Returns `show(office)` to
 * open it and the `dialog` element to render once, anywhere in the section.
 */
export function useOfficeDialog(id: string, titleClass = "text-flag-blue-dark") {
  const ref = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState<Office | null>(null);
  const titleId = `${id}-dialog-title`;

  const show = (office: Office) => {
    setOpen(office);
    ref.current?.showModal();
  };

  const dialog = (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={() => setOpen(null)}
      // A click on the backdrop lands on the dialog element itself.
      onClick={(e) => {
        if (e.target === e.currentTarget) e.currentTarget.close();
      }}
      className="m-auto max-h-[85svh] w-[calc(100%-2rem)] max-w-lg rounded-3xl bg-cream p-0 text-ink backdrop:bg-ink/50"
    >
      {open && (
        <div className="p-8">
          <div className="flex items-start justify-between gap-4">
            <h3 id={titleId} className={cn("text-3xl font-extrabold tracking-tight", titleClass)}>
              {open.name}
            </h3>
            <button
              type="button"
              aria-label="Close"
              onClick={() => ref.current?.close()}
              className="-m-2 flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full hover:bg-ink/10 focus-visible:outline-2 focus-visible:outline-flag-blue-dark"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
          {open.summary && <p className="mt-4 text-lg">{open.summary}</p>}
          {open.bureaus && <OfficeList title="Bureaus" items={open.bureaus} />}
          {open.programs && <OfficeList title="Programs" items={open.programs} />}
          {open.url && (
            // Opens in a new tab so readers keep their place in the walkthrough.
            <a
              href={open.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 rounded-control bg-flag-green px-5 py-3 font-bold text-cream hover:bg-flag-green/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-flag-green"
            >
              Visit the official page
              <span className="sr-only"> (opens in a new tab)</span>
              <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17L17 7M9 7h8v8" />
              </svg>
            </a>
          )}
        </div>
      )}
    </dialog>
  );

  return { show, dialog };
}

function OfficeList({ title, items }: { title: string; items: string[] }) {
  return (
    <>
      <h4 className="mt-6 text-sm font-bold tracking-wide text-ink/70 uppercase">
        {title}
      </h4>
      <ul className="mt-2 flex flex-col gap-1.5 text-lg">
        {items.map((item) => (
          <li key={item} className="flex items-baseline gap-3">
            <span aria-hidden="true" className="size-2 shrink-0 translate-y-[-2px] rounded-full bg-flag-blue" />
            {item}
          </li>
        ))}
      </ul>
    </>
  );
}
