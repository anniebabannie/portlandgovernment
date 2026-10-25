import type { CSSProperties, ReactNode } from "react";
import { pioneerShapes, pioneerViewBox } from "../content/oregon-pioneer";
import {
  StoryCaptions,
  StoryIntros,
  useScrollStory,
  type StoryCaption,
} from "./scroll-story";

type Props = {
  id?: string;
  intros: ReactNode[];
  /**
   * One per scroll step. A step without a caption keeps the previous one on
   * screen; one with `ballot` tilts the pamphlet aside to show the ballot
   * envelope behind it; one with `dropBox` swaps both for a ballot drop box.
   */
  steps: {
    caption?: ReactNode;
    /** Smaller, muted line under the caption. */
    sub?: ReactNode;
    ballot?: boolean;
    dropBox?: boolean;
  }[];
  label: string;
  ballotLabel: string;
  dropBoxLabel: string;
};

/**
 * Pinned, scroll-driven captions over a drawing of the voters' pamphlet,
 * which can tilt aside to reveal the ballot envelope, then give way to a
 * ballot drop box.
 */
export function PamphletSection({ id, intros, steps, label, ballotLabel, dropBoxLabel }: Props) {
  const beatStep = (b: number) => intros.length + b;
  const story = useScrollStory(beatStep(steps.length));
  const { ref, between, drift } = story;
  const captions: StoryCaption[] = steps.flatMap((st, i) =>
    st.caption === undefined ? [] : [{ node: st.caption, sub: st.sub, step: beatStep(i), start: 0.15 }],
  );
  const first = beatStep(0);
  const shown = between(first, 0, first, 0.4);
  // The ballot is revealed on its first step and stays for the rest.
  const ballotAt = steps.findIndex((st) => st.ballot);
  const reveal = ballotAt < 0 ? 0 : between(beatStep(ballotAt), 0, beatStep(ballotAt), 0.6);
  // Likewise the drop box, which replaces the pamphlet and envelope.
  const dropAt = steps.findIndex((st) => st.dropBox);
  const dropIn = dropAt < 0 ? 0 : between(beatStep(dropAt), 0, beatStep(dropAt), 0.5);

  return (
    <section id={id} ref={ref} className="relative" style={{ height: story.height }}>
      <div className="sticky top-0 h-svh overflow-hidden">
        <StoryIntros story={story} intros={intros} />

        <div className="flex h-full flex-col items-center justify-center gap-8 px-6 sm:gap-12">
          <StoryCaptions story={story} captions={captions} />

          {/* The mail and the drop box share one grid cell and cross-fade. */}
          <div className="grid w-full items-center justify-items-center *:col-start-1 *:row-start-1">
            {/* The envelope waits behind the pamphlet. On the reveal, the
                pamphlet tilts right and the envelope slides left, showing its
                purple panel; both shrink a little so the pair fits. */}
            <div
              aria-hidden={dropIn > 0.5}
              className="relative w-full max-w-xs"
              style={{
                opacity: shown * (1 - dropIn),
                transform: [drift((1 - shown) * 32), `scale(${1 - 0.22 * reveal})`]
                  .filter(Boolean)
                  .join(" "),
              }}
            >
              <Envelope
                label={ballotLabel}
                hidden={reveal < 0.5}
                style={{
                  opacity: Math.min(1, reveal * 3),
                  transform: `translate(-50%, -50%) translate(${-20 * reveal}%, ${14 * reveal}%) rotate(${-3 * reveal}deg)`,
                }}
              />
              <Pamphlet
                label={label}
                style={{
                  position: "relative",
                  transform: `translate(${30 * reveal}%, ${-4 * reveal}%) rotate(${12 * reveal}deg)`,
                }}
              />
            </div>

            <DropBox
              label={dropBoxLabel}
              hidden={dropIn < 0.5}
              style={{ opacity: dropIn, transform: drift((1 - dropIn) * 24) }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

const faint = { fill: "var(--color-ink)", fillOpacity: 0.13 };
const textLine = { fill: "var(--color-ink)", fillOpacity: 0.18 };
// The statue in two solid grays: the figure, and its shading.
const statue = "#e6e3dc";
const shade = "#d3cfc6";

/** A simplified Oregon voters' pamphlet: a stapled booklet. */
function Pamphlet({ label, style }: { label: string; style: CSSProperties }) {
  return (
    <svg
      viewBox="20 14 272 354"
      role="img"
      aria-label={label}
      className="h-auto max-h-[55svh] w-full max-w-xs"
      style={style}
    >
      {/* Page edges: the booklet's thickness along the right and bottom. */}
      <path
        d="M278 22 L285 29 L285 361 L33 361 L26 354 L278 354 Z"
        fill="var(--color-paper)"
        stroke="var(--color-ink)"
        strokeOpacity="0.2"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <g fill="none" stroke="var(--color-ink)" strokeOpacity="0.12">
        <path d="M280.5 24.5 V356.5 H28.5" />
        <path d="M282.8 26.8 V358.8 H30.8" />
      </g>

      {/* The cover. */}
      <rect
        x="26"
        y="20"
        width="252"
        height="334"
        rx="2"
        fill="var(--color-paper)"
        stroke="var(--color-ink)"
        strokeOpacity="0.25"
        strokeWidth="1.5"
      />

      {/* The spine's fold, and its staples. */}
      <line x1="33" y1="20" x2="33" y2="354" stroke="var(--color-ink)" strokeOpacity="0.12" strokeWidth="1.5" />
      {[80, 276].map((y) => (
        <rect key={y} x="31.5" y={y} width="3" height="18" rx="1" fill="var(--color-ink)" fillOpacity="0.45" />
      ))}

      {/* The Oregon Pioneer statue, fitted between the spine and the title. */}
      <svg x="38" y="56" width="108" height="279" viewBox={pioneerViewBox}>
        {pioneerShapes.map((shape, i) => (
          <path
            key={i}
            d={shape.d}
            fill={shape.tone === "light" ? statue : shade}
            transform={`translate(${shape.at[0]} ${shape.at[1]})`}
          />
        ))}
      </svg>

      {/* State seal. */}
      <circle cx="238" cy="58" r="18" fill="none" stroke="var(--color-ink)" strokeOpacity="0.35" strokeWidth="2" />
      <circle cx="238" cy="58" r="12" {...faint} />

      <g fill="var(--color-ink)">
        <text x="150" y="112" fontSize="25" fontWeight="800">
          Voters’
        </text>
        <text x="150" y="140" fontSize="25" fontWeight="800">
          Pamphlet
        </text>
        <text x="150" y="160" fontSize="9.5" fontWeight="700">
          Oregon General Election
        </text>
        <text x="150" y="173" fontSize="9.5">
          November 3, 2026
        </text>
      </g>

      {/* Body text, as lines. */}
      <g {...textLine}>
        {[
          [196, 100],
          [204, 110],
          [212, 96],
          [226, 108],
          [234, 100],
          [242, 70],
        ].map(([y, w]) => (
          <rect key={y} x="150" y={y} width={w} height="3" rx="1.5" />
        ))}
      </g>

      {/* Signature and name. */}
      <path d="M150 272 q6 -12 10 0 t10 -2 q4 -8 8 2 t12 -4" fill="none" stroke="var(--color-ink)" strokeWidth="1.5" />
      <rect x="150" y="282" width="50" height="3" rx="1.5" fill="var(--color-ink)" fillOpacity="0.3" />

      {/* Elections Division mark. */}
      <rect x="150" y="314" width="18" height="18" rx="2" fill="none" stroke="var(--color-ink)" strokeWidth="1.5" />
      <path d="M159 317 l-5 7 h3 l-4 5 h12 l-4 -5 h3 z" fill="var(--color-ink)" />
      <rect x="174" y="316" width="80" height="4" rx="2" fill="var(--color-ink)" fillOpacity="0.55" />
      <rect x="174" y="325" width="60" height="4" rx="2" fill="var(--color-ink)" fillOpacity="0.55" />
    </svg>
  );
}

const purple = "#5b3f9e";
const orange = "#e8723a";

/** A simplified Multnomah County ballot return envelope. */
function Envelope({
  label,
  hidden,
  style,
}: {
  label: string;
  hidden: boolean;
  style: CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 360 232"
      role="img"
      aria-label={label}
      aria-hidden={hidden}
      className="absolute top-1/2 left-1/2 w-[125%] max-w-md"
      style={style}
    >
      <rect
        x="2"
        y="2"
        width="356"
        height="228"
        rx="3"
        fill="var(--color-paper)"
        stroke="var(--color-ink)"
        strokeOpacity="0.2"
        strokeWidth="1.5"
      />
      <path d="M3 3 H96 V229 H3 Z" fill={purple} />

      {/* Multnomah Votes mark: an envelope and lines. */}
      <rect x="20" y="14" width="17" height="11" fill="var(--color-paper)" />
      <path d="M20 14 l8.5 6 l8.5 -6" fill="none" stroke={purple} strokeWidth="1.6" />
      <g stroke="var(--color-paper)" strokeWidth="1.6" strokeLinecap="round">
        <path d="M41 15 H80" />
        <path d="M41 19.5 H76" />
        <path d="M41 24 H72" />
      </g>
      <g fill="var(--color-paper)" fontWeight="800">
        <text x="20" y="38" fontSize="10" fontWeight="700">
          Multnomah
        </text>
        <text x="20" y="51" fontSize="13.5">
          Votes
        </text>
        {["OFFICIAL", "VOTER", "BALLOT", "INSIDE"].map((word, i) => (
          <text key={word} x="20" y={72 + i * 14} fontSize="12.5">
            {word}
          </text>
        ))}
      </g>

      {/* Address window. */}
      <rect x="26" y="126" width="160" height="72" rx="9" fill="#eceae5" stroke="var(--color-ink)" strokeOpacity="0.12" />
      <g fill="var(--color-ink)" fillOpacity="0.22">
        <rect x="40" y="146" width="80" height="4" rx="2" />
        <rect x="40" y="155" width="96" height="4" rx="2" />
        <rect x="40" y="164" width="66" height="4" rx="2" />
      </g>

      <text x="234" y="38" textAnchor="middle" fontSize="7.5" fontWeight="800" fill={purple}>
        RETURN SERVICE REQUESTED
      </text>

      {/* Election mail emblem: waving stripes and stars. */}
      <g fill="none" stroke="#8a8780" strokeWidth="5" strokeLinecap="round">
        <path d="M200 98 C220 84 240 96 258 88 S288 72 300 84" />
        <path d="M196 108 C218 94 240 106 258 98 S290 82 304 94" />
        <path d="M200 118 C222 104 242 116 260 108 S292 92 306 104" />
      </g>
      <g fill="#8a8780" fontSize="7">
        {[
          [204, 86],
          [236, 80],
          [292, 72],
          [308, 112],
          [214, 128],
          [282, 122],
        ].map(([x, y]) => (
          <text key={`${x}-${y}`} x={x} y={y}>
            ★
          </text>
        ))}
      </g>

      {/* The tax notice, as lines. */}
      <g fill={orange}>
        <rect x="208" y="150" width="56" height="4" rx="2" />
        <rect x="200" y="158" width="72" height="4" rx="2" />
        <rect x="196" y="167" width="80" height="2.5" rx="1" />
        <rect x="208" y="175" width="56" height="4" rx="2" />
        <rect x="202" y="183" width="68" height="4" rx="2" />
        <rect x="208" y="191" width="56" height="4" rx="2" />
      </g>
    </svg>
  );
}

const boxBlue = "var(--color-flag-blue-dark)";
// The voter is dark gray, apart from a dark gold backpack and green pants.
const person = "#3a3a3a";
const personFar = "#222222";

/**
 * A Multnomah County ballot drop box, with someone sliding their ballot
 * envelope into the slot on its side.
 */
function DropBox({
  label,
  hidden,
  style,
}: {
  label: string;
  hidden: boolean;
  style: CSSProperties;
}) {
  return (
    <svg
      viewBox="0 40 400 248"
      role="img"
      aria-label={label}
      aria-hidden={hidden}
      className="h-auto max-h-[50svh] w-full max-w-md"
      style={style}
    >
      <ellipse cx="210" cy="276" rx="190" ry="8" fill="var(--color-ink)" fillOpacity="0.07" />

      {/* The box: top, side, and front faces. */}
      <g stroke="var(--color-ink)" strokeOpacity="0.25" strokeWidth="1.5" strokeLinejoin="round">
        <path d="M30 80 L76 58 L246 58 L200 80 Z" fill="#f1efe9" />
        <path d="M200 80 L246 58 L246 250 L200 272 Z" fill="#e4e1da" />
        <rect x="30" y="80" width="170" height="192" fill="var(--color-paper)" />
      </g>
      <g fill="#cfcbc2">
        <rect x="44" y="272" width="30" height="6" />
        <rect x="156" y="272" width="30" height="6" />
      </g>

      {/* Front label. */}
      <rect x="40" y="90" width="150" height="172" fill="var(--color-paper)" stroke={boxBlue} strokeWidth="2" />
      <g fill={boxBlue} fontWeight="800" fontSize="16">
        <text x="48" y="112">
          Official
        </text>
        <text x="48" y="129">
          Ballot
        </text>
        <text x="48" y="146">
          Drop Box
        </text>
      </g>
      {/* Multnomah Votes mark: an envelope and lines. */}
      <rect x="146" y="98" width="12" height="8" fill={boxBlue} />
      <path d="M146 98 l6 4 l6 -4" fill="none" stroke="var(--color-paper)" strokeWidth="1.2" />
      <g stroke={boxBlue} strokeWidth="1.5">
        <path d="M161 99 H182" />
        <path d="M161 102.5 H180" />
        <path d="M161 106 H178" />
      </g>
      <rect x="40" y="168" width="150" height="94" fill={boxBlue} />
      <text x="115" y="214" fontSize="24" fontWeight="800" fill="var(--color-paper)" textAnchor="middle">
        Vote!
      </text>
      <g fill="var(--color-paper)" fillOpacity="0.55">
        <rect x="62" y="226" width="40" height="4" rx="2" />
        <rect x="110" y="226" width="56" height="4" rx="2" />
        <rect x="74" y="238" width="80" height="4" rx="2" />
      </g>

      {/* The slot, on the side face. */}
      <path d="M216 108 L238 97.5 L238 103.5 L216 114 Z" fill="#3a3a3a" />

      {/* The voter, reaching to the slot. */}
      {/* Pants. */}
      <g fill="var(--color-flag-green)">
        <path d="M282 186 L296 186 L294 256 L284 256 Z" />
        <path d="M298 186 L312 186 L314 256 L304 256 Z" />
      </g>
      <g fill={person}>
        <path d="M281 254 L296 254 L297 264 L274 264 Q276 256 281 254 Z" />
        <path d="M302 254 L316 254 L321 264 L300 264 Z" />
      </g>
      <rect x="306" y="110" width="22" height="56" rx="7" fill="var(--color-flag-gold-dark)" />
      {/* The other arm, at their back side with the elbow slightly bent:
          over the backpack, behind the jacket, and darker. */}
      <path
        d="M307 116 L321 148 L322 177"
        fill="none"
        stroke={personFar}
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M282 108 Q296 100 310 108 L316 190 L278 190 Z" fill={person} />
      <path d="M288 116 L244 108" stroke={person} strokeWidth="9" strokeLinecap="round" />
      {/* The ballot envelope, going into the slot. */}
      <g transform="rotate(-24 233 106)">
        <rect x="224" y="101" width="18" height="11" rx="1" fill="var(--color-paper)" stroke="var(--color-ink)" strokeOpacity="0.3" />
        <rect x="224" y="101" width="5" height="11" fill={purple} />
      </g>
      <circle cx="243" cy="108" r="4" fill={person} />
      {/* Hooded head. */}
      <circle cx="296" cy="90" r="13" fill={person} />
    </svg>
  );
}
