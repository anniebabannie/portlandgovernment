import { useState, type ReactNode } from "react";
import { metroPath, metroViewBox, oregonViewBox } from "../content/metro-boundary";
import { countyPath, countyViewBox } from "../content/multnomah-county";
import { districts, districtsViewBox } from "../content/portland-districts";
import {
  oregonPath,
  salem,
  statesPath,
  usHeight,
  usWidth,
  washingtonDC,
} from "../content/us-states";
import { useOfficeDialog } from "./office-dialog";
import {
  StoryCaptions,
  StoryIntros,
  useScrollStory,
  type StoryCaption,
} from "./scroll-story";

type Visual = "map" | "documents" | "jurisdictions" | "choices";

type Props = {
  id?: string;
  intros: ReactNode[];
  /**
   * One per scroll step after the intros. Each can bring in a visual; a step
   * without a caption keeps the previous one on screen.
   */
  steps: {
    caption?: ReactNode;
    /** Smaller, muted line under the caption, e.g. a hint to click. */
    sub?: ReactNode;
    show?: Visual;
    /** With `show: "choices"`: the label of the choice to spotlight; the others dim. */
    focus?: string;
  }[];
  documents?: MeasureDocument[];
  /** Big labeled icons for the kinds of things on a ballot. */
  choices?: { label: string; icon: "person" | "measure" }[];
  jurisdictions?: Jurisdiction[];
  /** A footnote under the jurisdictions, e.g. for an asterisk in a list. */
  jurisdictionsNote?: string;
  /** Describes the US map. */
  label: string;
};

/** A level of government, its outline, and what voters elect at that level. */
export type Jurisdiction = {
  level: string;
  label: string;
  /** "special" draws an icon instead, for districts with no single outline. */
  shape: "us" | "oregon" | "metro" | "county" | "portland" | "special";
  positions: string[];
};

export type MeasureDocument = {
  label: string;
  /** A glyph printed on the page, like "§" or "$". */
  symbol: string;
  /** Shown in a dialog when the document is clicked. */
  summary?: string;
  url?: string;
};

// Room around the map: callout cards sit above it.
const top = -170;
const left = -140;
const right = usWidth + 20;
const cardH = 64;
const cardY = -150;

type Callout = {
  at: readonly [number, number];
  label: string;
  width: number;
  icon: "us-capitol" | "or-capitol";
};

const callouts: Callout[] = [
  { at: washingtonDC, label: "US House", width: 210, icon: "us-capitol" },
  { at: salem, label: "Oregon House & Senate", width: 340, icon: "or-capitol" },
];

/**
 * Pinned, scroll-driven run of election visuals: a US map with starred
 * callouts at Washington, DC and Salem; a row of measure documents; and the
 * levels of government with what voters elect at each. Steps cross-fade
 * between them.
 */
export function VotingSection({
  id,
  intros,
  steps,
  documents,
  choices,
  jurisdictions,
  jurisdictionsNote,
  label,
}: Props) {
  const beatStep = (b: number) => intros.length + b;
  const story = useScrollStory(beatStep(steps.length));
  const { ref, between, drift } = story;
  const { show: showPositions, dialog } = useOfficeDialog(id ?? "elections", "text-flag-green");

  const storyCaptions: StoryCaption[] = steps.flatMap((st, i) =>
    st.caption === undefined ? [] : [{ node: st.caption, sub: st.sub, step: beatStep(i), start: 0.15 }],
  );

  // How present each step is. Neighbors cross-fade, so a visual shared by
  // consecutive steps stays put.
  const stepWeight = steps.map((_, i) => {
    const s = beatStep(i);
    const fadeIn = between(s, 0, s, 0.25);
    const fadeOut = i < steps.length - 1 ? between(s + 1, 0, s + 1, 0.25) : 0;
    return fadeIn * (1 - fadeOut);
  });
  const presence = (kind: Visual) =>
    Math.min(1, steps.reduce((sum, st, i) => sum + (st.show === kind ? stepWeight[i] : 0), 0));
  const firstStep = (kind: Visual) => beatStep(Math.max(0, steps.findIndex((st) => st.show === kind)));
  // Items arrive staggered on their visual's first step, then follow it as a whole.
  const stagger = (kind: Visual) => {
    const present = presence(kind);
    const first = firstStep(kind);
    return (i: number) => between(first, 0.15 + i * 0.08, first, 0.4 + i * 0.08) * present;
  };

  const m = firstStep("map");
  const mapShown = presence("map");
  const mapIn = between(m, 0, m, 0.35);
  const oregonIn = between(m, 0.3, m, 0.5);
  const calloutIn = (i: number) => between(m, 0.45 + i * 0.15, m, 0.65 + i * 0.15);
  const docIn = stagger("documents");
  const placeIn = stagger("jurisdictions");
  const choiceIn = stagger("choices");
  const stepsWeighted = (match: (st: Props["steps"][number]) => boolean) =>
    Math.min(1, steps.reduce((sum, st, i) => sum + (match(st) ? stepWeight[i] : 0), 0));

  return (
    <section id={id} ref={ref} className="relative" style={{ height: story.height }}>
      <div className="sticky top-0 h-svh overflow-hidden">
        <StoryIntros story={story} intros={intros} />

        <div className="flex h-full flex-col items-center justify-center gap-8 px-6 sm:gap-12">
          <StoryCaptions story={story} captions={storyCaptions} />

          {/* The visuals share one grid cell and cross-fade. */}
          <div className="grid w-full items-center justify-items-center *:col-start-1 *:row-start-1">
          <svg
            viewBox={`${left} ${top} ${right - left} ${usHeight - top + 10}`}
            role="img"
            aria-label={label}
            aria-hidden={mapShown < 0.5}
            className="w-full max-w-4xl max-h-[55svh]"
            style={{ opacity: mapShown, transform: drift((1 - mapIn) * 32) }}
          >
            <path
              d={statesPath}
              fill="#ece5d4"
              stroke="var(--color-cream)"
              strokeWidth="1.5"
              strokeLinejoin="round"
              style={{ opacity: mapIn }}
            />
            <path
              d={oregonPath}
              fill="var(--color-flag-green)"
              stroke="var(--color-cream)"
              strokeWidth="1.5"
              style={{ opacity: Math.min(mapIn, 0.35 + 0.65 * oregonIn) }}
            />

            {callouts.map((c, i) => {
              const t = calloutIn(i);
              const [x, y] = c.at;
              return (
                <g key={c.label} style={{ opacity: t, transform: drift((1 - t) * -10) }}>
                  <line x1={x} y1={y} x2={x} y2={cardY + cardH} stroke="var(--color-ink)" strokeWidth="2.5" />
                  <Star x={x} y={y} />
                  <g transform={`translate(${x - c.width / 2} ${cardY})`}>
                    <rect width={c.width} height={cardH} rx="16" fill="var(--color-paper)" stroke="var(--color-ink)" strokeWidth="2.5" />
                    <g transform="translate(14 10)">
                      {c.icon === "us-capitol" ? <UsCapitol /> : <OregonCapitol />}
                    </g>
                    <text x="66" y={cardH / 2 + 8} fontSize="23" fontWeight="800" fill="var(--color-ink)">
                      {c.label}
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>

          {documents && (
            <ul
              inert={presence("documents") < 0.5}
              className="grid w-full max-w-4xl grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4 sm:gap-6"
            >
              {documents.map((doc, i) => {
                const t = docIn(i);
                return (
                  <li
                    key={doc.label}
                    className="flex justify-center"
                    style={{ opacity: t, transform: drift((1 - t) * 24) }}
                  >
                    <button
                      type="button"
                      aria-haspopup="dialog"
                      onClick={() => showPositions({ name: doc.label, summary: doc.summary, url: doc.url })}
                      // Not clickable (or focusable) unless it's on screen.
                      disabled={!doc.summary || t < 0.9}
                      className="flex cursor-pointer flex-col items-center gap-3 rounded-3xl p-3 text-center hover:bg-ink/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-flag-green disabled:cursor-default disabled:hover:bg-transparent"
                    >
                      <Paper symbol={doc.symbol} />
                      <span className="text-base leading-tight font-bold text-balance text-ink sm:text-lg">
                        {doc.label}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {choices && (
            <ul className="flex w-full items-end justify-center gap-12 sm:gap-24">
              {choices.map((c, i) => {
                const t = choiceIn(i);
                const spotlit = stepsWeighted((st) => st.show === "choices" && st.focus === c.label);
                const dimmed = stepsWeighted(
                  (st) => st.show === "choices" && !!st.focus && st.focus !== c.label,
                );
                return (
                  <li
                    key={c.label}
                    className="flex flex-col items-center gap-3"
                    style={{
                      opacity: t * (1 - 0.75 * dimmed),
                      transform: `${drift((1 - t) * 24) ?? ""} scale(${1 + 0.15 * spotlit})`,
                      transformOrigin: "bottom center",
                    }}
                  >
                    {c.icon === "person" ? <Person /> : <Paper check />}
                    <span className="text-xl font-extrabold text-ink sm:text-3xl">{c.label}</span>
                  </li>
                );
              })}
            </ul>
          )}

          {jurisdictions && (
            <div inert={presence("jurisdictions") < 0.5} className="w-full max-w-4xl">
            <ul className="grid w-full grid-cols-3 items-start gap-x-2 gap-y-4 sm:gap-x-5 sm:gap-y-6">
              {jurisdictions.map((j, i) => {
                const t = placeIn(i);
                const heading = (
                  <>
                    <Outline shape={j.shape} />
                    <span className="mt-1.5 block text-[0.65rem] font-bold tracking-wide text-ink/60 uppercase sm:text-xs">
                      {j.level}
                    </span>
                    <span className="block text-xs leading-tight font-extrabold text-balance text-ink sm:text-base">
                      {j.label}
                    </span>
                  </>
                );
                return (
                  <li
                    key={j.label}
                    className="flex flex-col items-center text-center"
                    style={{ opacity: t, transform: drift((1 - t) * 24) }}
                  >
                    {/* Phones: tap for the list. Wider screens: the list sits in a
                        scrollable box below. */}
                    <button
                      type="button"
                      aria-haspopup="dialog"
                      onClick={() => showPositions({ name: j.label, positions: j.positions })}
                      className="w-full cursor-pointer rounded-2xl p-1 hover:bg-ink/5 focus-visible:outline-2 focus-visible:outline-flag-green sm:hidden"
                    >
                      {heading}
                    </button>
                    <div className="hidden w-full sm:block">{heading}</div>
                    <PositionsBox label={`On the ballot: ${j.label}`} positions={j.positions} />
                  </li>
                );
              })}
            </ul>
            {jurisdictionsNote && (
              <p
                className="mt-4 text-center text-xs text-ink/70 sm:mt-6 sm:text-sm"
                style={{ opacity: placeIn(jurisdictions.length - 1) }}
              >
                {jurisdictionsNote}
              </p>
            )}
            </div>
          )}
          </div>
        </div>
      </div>

      {(jurisdictions || documents) && dialog}
    </section>
  );
}

function Star({ x, y }: { x: number; y: number }) {
  // Five-pointed star, outer radius 16.
  const points = Array.from({ length: 10 }, (_, k) => {
    const r = k % 2 ? 7 : 16;
    const a = (Math.PI / 5) * k - Math.PI / 2;
    return `${(x + r * Math.cos(a)).toFixed(1)},${(y + r * Math.sin(a)).toFixed(1)}`;
  }).join(" ");
  return (
    <polygon
      points={points}
      fill="var(--color-flag-gold)"
      stroke="var(--color-ink)"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  );
}

/** The US Capitol: wide wings, columns, and a tall dome. 44×44. */
function UsCapitol() {
  return (
    <g fill="none" stroke="var(--color-ink)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round">
      <path d="M2 42h40M4 42V30h36v12M4 30h36" />
      <path d="M10 42v-9M16 42v-9M22 42v-9M28 42v-9M34 42v-9" />
      <path d="M12 30v-4h20v4M12 26c0-8 4.5-12 10-12s10 4 10 12" />
      <path d="M22 14V6M19 6h6" />
    </g>
  );
}

/** The Oregon State Capitol: a low base, a fluted drum, and the gold pioneer on top. 44×44. */
function OregonCapitol() {
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <g fill="none" stroke="var(--color-ink)" strokeWidth="2.5">
        <path d="M2 42h40M4 42V32h36v10" />
        <path d="M13 32V14h18v18" />
        <path d="M18 32V16M22 32V16M26 32V16" />
        <path d="M13 14h18" />
      </g>
      <path d="M22 2.5a2.5 2.5 0 1 1 0 5a2.5 2.5 0 1 1 0-5zM19 14l1.5-6h3l1.5 6z" fill="var(--color-flag-gold)" stroke="var(--color-ink)" strokeWidth="1.5" />
    </g>
  );
}

/** A person: head and shoulders, in flag green. Same footprint as Paper. */
function Person() {
  return (
    <svg aria-hidden="true" viewBox="0 0 100 128" className="w-20 sm:w-28">
      <circle cx="50" cy="40" r="24" fill="var(--color-flag-green)" />
      <path d="M8 124c0-28 18-46 42-46s42 18 42 46z" fill="var(--color-flag-green)" />
    </svg>
  );
}

/**
 * A sheet of paper with a folded corner and ruled lines, marked with a
 * symbol or (with `check`) a ticked checkbox.
 */
function Paper({ symbol, check = false }: { symbol?: string; check?: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 100 128" className="w-20 sm:w-28">
      <path
        d="M6 4h62l26 26v92a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"
        fill="var(--color-paper)"
        stroke="var(--color-ink)"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M68 4v24a2 2 0 0 0 2 2h24" fill="#ece5d4" stroke="var(--color-ink)" strokeWidth="3" strokeLinejoin="round" />
      {check ? (
        <g fill="none" stroke="var(--color-flag-green)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
          <rect x="36" y="38" width="26" height="26" rx="5" />
          <path d="M41 51l6 6 11-13" />
        </g>
      ) : (
        <text x="49" y="60" textAnchor="middle" fontFamily="Georgia, serif" fontSize="28" fontWeight="700" fill="var(--color-flag-green)">
          {symbol}
        </text>
      )}
      <path d="M18 76h64M18 87h64M18 98h40" stroke="#cdbf9b" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

/** A government's outline, drawn in flag green and sized to fit its box. */
function Outline({ shape }: { shape: Jurisdiction["shape"] }) {
  if (shape === "special") {
    // Overlapping districts that don't line up with any one map.
    return (
      <svg aria-hidden="true" viewBox="0 0 120 100" className="h-12 w-full sm:h-16">
        <g fill="var(--color-flag-green)" fillOpacity="0.18" stroke="var(--color-flag-green)" strokeWidth="4" strokeDasharray="9 6">
          <circle cx="45" cy="40" r="30" />
          <circle cx="75" cy="40" r="30" />
          <circle cx="60" cy="66" r="30" />
        </g>
      </svg>
    );
  }
  const common = {
    fill: "var(--color-flag-green)",
    stroke: "var(--color-flag-green)",
    strokeLinejoin: "round" as const,
  };
  const views: Record<Exclude<Jurisdiction["shape"], "special">, [string, ReactNode]> = {
    us: [
      `0 0 ${usWidth} ${usHeight}`,
      <>
        <path d={statesPath} {...common} strokeWidth="2" />
        <path d={oregonPath} {...common} strokeWidth="2" />
      </>,
    ],
    oregon: [oregonViewBox, <path d={oregonPath} {...common} strokeWidth="0.5" />],
    metro: [metroViewBox, <path d={metroPath} {...common} fillRule="evenodd" strokeWidth="2" />],
    county: [countyViewBox, <path d={countyPath} {...common} strokeWidth="2" />],
    // The four council districts, filled alike so they read as one city.
    portland: [
      districtsViewBox,
      <>
        {districts.map((d) => (
          <path key={d.number} d={d.d} {...common} fillRule="evenodd" strokeWidth="2" />
        ))}
      </>,
    ],
  };
  const [viewBox, body] = views[shape];
  return (
    <svg aria-hidden="true" viewBox={viewBox} className="h-12 w-full sm:h-16">
      {body}
    </svg>
  );
}

/**
 * A fixed-height, scrollable list of positions. A fade along the bottom
 * shows there's more below, and goes away once you reach the end.
 */
function PositionsBox({ label, positions }: { label: string; positions: string[] }) {
  const [more, setMore] = useState(false);
  const check = (el: HTMLElement | null) => {
    if (el) setMore(el.scrollTop + el.clientHeight < el.scrollHeight - 2);
  };

  return (
    <div className="relative mt-2 hidden w-full sm:block">
      <ul
        ref={check}
        onScroll={(e) => check(e.currentTarget)}
        // Focusable so keyboard users can scroll a long list.
        tabIndex={0}
        aria-label={label}
        className="flex h-[min(8rem,16svh)] w-full flex-col gap-1.5 overflow-y-auto rounded-2xl border border-ink/15 bg-paper px-4 py-3.5 text-left text-sm leading-snug text-ink/85 focus-visible:outline-2 focus-visible:outline-flag-green"
      >
        {positions.map((p) => (
          <li key={p} className="flex gap-2">
            <span aria-hidden="true" className="mt-[0.45em] size-1.5 shrink-0 rounded-full bg-flag-green" />
            {p}
          </li>
        ))}
      </ul>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-px bottom-px h-10 rounded-b-2xl bg-linear-to-t from-paper to-transparent transition-opacity duration-200"
        style={{ opacity: more ? 1 : 0 }}
      />
    </div>
  );
}
