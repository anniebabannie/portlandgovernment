import type { ReactNode } from "react";
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
import {
  StoryCaptions,
  StoryIntros,
  useScrollStory,
  type StoryCaption,
} from "./scroll-story";

type Props = {
  id?: string;
  intros: ReactNode[];
  /** One per scroll step after the intros; the map arrives with the first. */
  captions: ReactNode[];
  label: string;
  /**
   * Steps after the map, which fades out. Each step can bring in a visual; a
   * step without a caption keeps the previous one on screen.
   */
  then?: {
    steps: { caption?: ReactNode; show?: "documents" | "jurisdictions" }[];
    documents?: MeasureDocument[];
    jurisdictions?: Jurisdiction[];
  };
};

/** A government whose outline appears in the row of jurisdictions. */
export type Jurisdiction = {
  label: string;
  shape: "us" | "oregon" | "metro" | "county" | "portland";
};

export type MeasureDocument = {
  label: string;
  /** A glyph printed on the page, like "§" or "$". */
  symbol: string;
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
 * Pinned, scroll-driven US map with Oregon highlighted and starred callouts
 * at Washington, DC and Salem, each with a capitol icon and a label.
 */
export function UsMapSection({ id, intros, captions, label, then }: Props) {
  const beatStep = (b: number) => intros.length + b;
  const steps = then?.steps ?? [];
  const story = useScrollStory(beatStep(captions.length + steps.length));
  const { ref, between, drift } = story;
  const s = beatStep(0);
  const thenStep = (i: number) => beatStep(captions.length + i);

  const storyCaptions: StoryCaption[] = [
    ...captions.map((node, i) => ({ node, step: beatStep(i), start: 0.15 })),
    ...steps.flatMap((st, i) =>
      st.caption === undefined ? [] : [{ node: st.caption, step: thenStep(i), start: 0.15 }],
    ),
  ];

  const mapIn = between(s, 0, s, 0.35);
  const oregonIn = between(s, 0.3, s, 0.5);
  const calloutIn = (i: number) => between(s, 0.45 + i * 0.15, s, 0.65 + i * 0.15);
  const mapOut = then ? between(thenStep(0), 0, thenStep(0), 0.25) : 0;

  // How present each later step's visual is. Neighbors cross-fade, so a
  // visual shared by consecutive steps stays put.
  const stepWeight = steps.map((_, i) => {
    const fadeIn = between(thenStep(i), 0, thenStep(i), 0.25);
    const fadeOut = i < steps.length - 1 ? between(thenStep(i + 1), 0, thenStep(i + 1), 0.25) : 0;
    return fadeIn * (1 - fadeOut);
  });
  const visual = (kind: "documents" | "jurisdictions") => {
    const present = Math.min(
      1,
      steps.reduce((sum, st, i) => sum + (st.show === kind ? stepWeight[i] : 0), 0),
    );
    const first = thenStep(Math.max(0, steps.findIndex((st) => st.show === kind)));
    // Items arrive staggered on the visual's first step, then follow it as a whole.
    return (i: number) => between(first, 0.15 + i * 0.08, first, 0.4 + i * 0.08) * present;
  };
  const docIn = visual("documents");
  const placeIn = visual("jurisdictions");

  return (
    <section id={id} ref={ref} className="relative" style={{ height: story.height }}>
      <div className="sticky top-0 h-svh overflow-hidden">
        <StoryIntros story={story} intros={intros} />

        <div className="flex h-full flex-col items-center justify-center gap-8 px-6 sm:gap-12">
          <StoryCaptions story={story} captions={storyCaptions} />

          {/* The map and the documents share one grid cell and cross-fade. */}
          <div className="grid w-full items-center justify-items-center *:col-start-1 *:row-start-1">
          <svg
            viewBox={`${left} ${top} ${right - left} ${usHeight - top + 10}`}
            role="img"
            aria-label={label}
            aria-hidden={mapOut > 0.5}
            className="w-full max-w-4xl max-h-[55svh]"
            style={{ opacity: 1 - mapOut, transform: drift((1 - mapIn) * 32) }}
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

          {then?.documents && (
            <ul className="grid w-full max-w-4xl grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4 sm:gap-6">
              {then.documents.map((doc, i) => {
                const t = docIn(i);
                return (
                  <li
                    key={doc.label}
                    className="flex flex-col items-center gap-3 text-center"
                    style={{ opacity: t, transform: drift((1 - t) * 24) }}
                  >
                    <Paper symbol={doc.symbol} />
                    <span className="text-base leading-tight font-bold text-balance text-ink sm:text-lg">
                      {doc.label}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}

          {then?.jurisdictions && (
            <ul className="grid w-full max-w-5xl grid-cols-5 gap-2 sm:gap-6">
              {then.jurisdictions.map((j, i) => {
                const t = placeIn(i);
                return (
                  <li
                    key={j.label}
                    className="flex flex-col items-center gap-3 text-center"
                    style={{ opacity: t, transform: drift((1 - t) * 24) }}
                  >
                    <Outline shape={j.shape} />
                    <span className="text-xs leading-tight font-bold text-balance text-ink sm:text-lg">
                      {j.label}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
          </div>
        </div>
      </div>
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

/** A sheet of paper with a folded corner, ruled lines, and a symbol. */
function Paper({ symbol }: { symbol: string }) {
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
      <text x="49" y="60" textAnchor="middle" fontFamily="Georgia, serif" fontSize="28" fontWeight="700" fill="var(--color-flag-green)">
        {symbol}
      </text>
      <path d="M18 76h64M18 87h64M18 98h40" stroke="#cdbf9b" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

/** A government's outline, drawn in flag green and sized to fit its box. */
function Outline({ shape }: { shape: Jurisdiction["shape"] }) {
  const common = {
    fill: "var(--color-flag-green)",
    stroke: "var(--color-flag-green)",
    strokeLinejoin: "round" as const,
  };
  const views: Record<Jurisdiction["shape"], [string, ReactNode]> = {
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
    <svg aria-hidden="true" viewBox={viewBox} className="h-14 w-full sm:h-28">
      {body}
    </svg>
  );
}
