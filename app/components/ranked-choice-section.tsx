import type { ReactNode } from "react";
import { districts, districtsViewBox } from "../content/portland-districts";
import { ramp } from "../lib/use-scroll-progress";
import { districtFill } from "./district-map-section";
import {
  StoryCaptions,
  StoryIntros,
  useScrollStory,
  type ScrollStory,
  type StoryCaption,
} from "./scroll-story";

export type RcvCandidate = {
  name: string;
  color: string;
  /** For the name as text, where `color` is too light to read. */
  textColor?: string;
};

export type RcvStep = {
  caption: ReactNode;
  /** Smaller, muted line under the caption, e.g. a hint to click. */
  sub?: ReactNode;
  show: "list" | "ballot" | "count" | "districts" | "council" | "councilCount";
  /** With `show: "ballot"`: how many of the sample voter's ranks are marked. */
  ranks?: number;
  /** With `show: "ballot"`: a candidate whose row gets a dashed outline. */
  outline?: string;
  /** With `show: "count"` or `"councilCount"`: which round is on screen (0-based). */
  round?: number;
};

type Props = {
  id?: string;
  intros: ReactNode[];
  candidates: RcvCandidate[];
  /** The sample voter's ranking: candidate indexes, first choice first. */
  ballot: number[];
  /** Columns on the sample ballot. */
  rankColumns: number;
  /** Candidate indexes in the order the ballot lists them, top to bottom. */
  ballotRows?: number[];
  /** Votes per candidate in each round, out of 100; 0 once eliminated. */
  rounds: number[][];
  steps: RcvStep[];
  ballotLabel: string;
  countLabel: string;
  districtsLabel: string;
  councilLabel: string;
  /**
   * A council race's count, out of 100 votes per round (0 once eliminated),
   * against the 25% + 1 line.
   */
  councilCount?: {
    candidates: RcvCandidate[];
    rounds: number[][];
    /** Per candidate, the round (0-based) they win a seat in, or -1. */
    wonAt: number[];
    label: string;
  };
};

const ordinal = (n: number) => `${n}${["st", "nd", "rd"][n - 1] ?? "th"}`;

/** Each candidate's votes at a (possibly in-between) round of a count. */
const roundVotes = (rounds: number[][], round: number) => {
  const from = Math.floor(round);
  const to = Math.min(rounds.length - 1, from + 1);
  return rounds[from].map((v, c) => v + (rounds[to][c] - v) * (round - from));
};

/**
 * Pinned, scroll-driven explainer for ranked-choice voting. A sample ballot
 * fills in a voter's rankings; then a round-by-round count shows the
 * last-place candidate dropping out and their votes moving on, until
 * someone has more than half; then a note on the council's three seats.
 */
export function RankedChoiceSection({
  id,
  intros,
  candidates,
  ballot,
  rankColumns,
  ballotRows,
  rounds,
  steps,
  ballotLabel,
  countLabel,
  districtsLabel,
  councilLabel,
  councilCount,
}: Props) {
  const beatStep = (b: number) => intros.length + b;
  const story = useScrollStory(beatStep(steps.length));
  const { ref, between, drift } = story;

  const captions: StoryCaption[] = steps.map((st, i) => ({
    node: st.caption,
    sub: st.sub,
    step: beatStep(i),
    start: 0.15,
  }));

  // How present each step is right now. Neighbors cross-fade, so the
  // weights sum to 1 during a hand-off.
  const stepWeight = steps.map((_, i) => {
    const s = beatStep(i);
    const fadeIn = between(s, 0, s, 0.25);
    const fadeOut = i < steps.length - 1 ? between(s + 1, 0, s + 1, 0.25) : 0;
    return fadeIn * (1 - fadeOut);
  });
  const presence = (kind: RcvStep["show"]) =>
    Math.min(1, steps.reduce((sum, st, i) => sum + (st.show === kind ? stepWeight[i] : 0), 0));
  // A weighted blend of a number across the steps that set it, so marks
  // and rounds glide between steps instead of jumping.
  const blend = (kind: RcvStep["show"], value: (st: RcvStep) => number) => {
    const w = presence(kind);
    if (w === 0) return 0;
    return steps.reduce((sum, st, i) => sum + (st.show === kind ? stepWeight[i] * value(st) : 0), 0) / w;
  };

  const listIn = presence("list");
  const ballotIn = presence("ballot");
  const countIn = presence("count");
  const districtsIn = presence("districts");
  const councilIn = presence("council");
  const councilCountIn = presence("councilCount");
  const councilRound = blend("councilCount", (st) => st.round ?? 0);
  const councilVotes = councilCount ? roundVotes(councilCount.rounds, councilRound) : [];
  const councilLast = councilCount ? councilCount.rounds.length - 1 : 0;
  const marks = blend("ballot", (st) => st.ranks ?? 0);
  const outlined = (name: string) =>
    Math.min(1, steps.reduce((sum, st, i) => sum + (st.outline === name ? stepWeight[i] : 0), 0));
  const round = blend("count", (st) => st.round ?? 0);

  const votes = roundVotes(rounds, round);
  const last = rounds.length - 1;
  const winner = rounds[last].findIndex((v) => v > 50);
  // Round after which a candidate is out, or -1 if never.
  const outAfter = candidates.map((_, c) => rounds.findIndex((r) => r[c] === 0) - 1);

  return (
    <section id={id} ref={ref} className="relative" style={{ height: story.height }}>
      <div className="sticky top-0 h-svh overflow-hidden">
        <StoryIntros story={story} intros={intros} />

        <div className="flex h-full flex-col items-center justify-center gap-8 px-6 sm:gap-12">
          <StoryCaptions story={story} captions={captions} />

          {/* The visuals share one grid cell and cross-fade. */}
          <div className="grid w-full max-w-2xl items-center justify-items-center *:col-start-1 *:row-start-1">
            {/* The sample voter's ranking, as a numbered list. */}
            <ol
              aria-hidden={listIn < 0.5}
              className="flex flex-col gap-4 text-2xl font-extrabold tracking-tight sm:gap-5 sm:text-4xl"
              style={{ opacity: listIn, transform: drift((1 - listIn) * 24) }}
            >
              {ballot.map((c, r) => (
                <li key={candidates[c].name} className="flex items-center gap-4">
                  <span className="w-8 text-right tabular-nums sm:w-10">{r + 1}.</span>
                  <span style={{ color: candidates[c].textColor ?? candidates[c].color }}>
                    {candidates[c].name}
                  </span>
                </li>
              ))}
            </ol>

            {/* Sample ballot. */}
            <div
              role="img"
              aria-label={ballotLabel}
              aria-hidden={ballotIn < 0.5}
              className="w-full max-w-lg rounded-3xl border-2 border-ink/15 bg-paper p-4 sm:p-6"
              style={{ opacity: ballotIn, transform: drift((1 - ballotIn) * 24) }}
            >
              <div
                className="grid items-center text-sm sm:text-base"
                style={{ gridTemplateColumns: `2fr repeat(${rankColumns}, 1fr)` }}
              >
                <span />
                {Array.from({ length: rankColumns }, (_, r) => (
                  <span key={r} className="pb-2 text-center text-xs font-bold text-ink/65 sm:text-sm">
                    {ordinal(r + 1)}
                  </span>
                ))}
              </div>
              {(ballotRows ?? candidates.map((_, c) => c)).map((c) => {
                const cand = candidates[c];
                const rank = ballot.indexOf(c);
                return (
                  <div
                    key={cand.name}
                    className="relative grid items-center border-t border-ink/10 text-sm sm:text-base"
                    style={{ gridTemplateColumns: `2fr repeat(${rankColumns}, 1fr)` }}
                  >
                    <span className="py-2.5 pr-2 text-left font-bold sm:py-3">{cand.name}</span>
                    {Array.from({ length: rankColumns }, (_, r) => {
                      const filled = rank === r ? ramp(marks, r, r + 0.6) : 0;
                      return (
                        <span key={r} className="flex justify-center">
                          <span className="relative inline-block size-5 rounded-full border-2 border-ink/40 sm:size-6">
                            <span
                              className="absolute inset-0.5 rounded-full"
                              style={{
                                background: cand.color,
                                opacity: filled,
                                transform: `scale(${0.4 + 0.6 * filled})`,
                              }}
                            />
                          </span>
                        </span>
                      );
                    })}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -inset-x-2 inset-y-1 rounded-xl border-2 border-dashed border-flag-blue"
                      style={{ opacity: outlined(cand.name) }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Round-by-round count. */}
            <TallyChart
              label={countLabel}
              shown={countIn}
              drift={drift}
              round={Math.min(last, Math.round(round)) + 1}
              candidates={candidates}
              votes={votes}
              out={(c) => (outAfter[c] >= 0 ? ramp(round, outAfter[c] + 0.2, outAfter[c] + 0.8) : 0)}
              won={(c) => (c === winner ? ramp(round, last - 0.3, last) : 0)}
              line={{ at: 50, label: "More than half" }}
            />

            {/* A council race's count, against the 25% line. */}
            {councilCount && (
              <TallyChart
                label={councilCount.label}
                shown={councilCountIn}
                drift={drift}
                round={Math.min(councilLast, Math.round(councilRound)) + 1}
                candidates={councilCount.candidates}
                votes={councilVotes}
                out={(c) => {
                  const after = councilCount.rounds.findIndex((r) => r[c] === 0) - 1;
                  return after >= 0 ? ramp(councilRound, after + 0.2, after + 0.8) : 0;
                }}
                won={(c) => {
                  const at = councilCount.wonAt[c];
                  return at >= 0 ? ramp(councilRound, at - 0.7, at) : 0;
                }}
                line={{ at: 25, label: "25% + 1" }}
              />
            )}

            {/* Portland's council districts, as on the council map. */}
            <svg
              viewBox={districtsViewBox}
              role="img"
              aria-label={districtsLabel}
              aria-hidden={districtsIn < 0.5}
              className="w-full max-w-xl max-h-[50svh]"
              style={{ opacity: districtsIn, transform: drift((1 - districtsIn) * 24) }}
            >
              {districts.map((d) => (
                <path
                  key={d.number}
                  d={d.d}
                  fill={districtFill[d.number]}
                  fillRule="evenodd"
                  stroke="var(--color-cream)"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />
              ))}
              {districts.map((d) => {
                const [x, y] = d.label;
                return (
                  <g key={d.number}>
                    <circle cx={x} cy={y} r="22" fill="var(--color-cream)" />
                    <text x={x} y={y + 8} textAnchor="middle" fontSize="24" fontWeight="800" fill="var(--color-ink)">
                      {d.number}
                    </text>
                    {/* Three seats, drawn as on the council map. */}
                    <g style={{ opacity: 0.6 }}>
                      {[-18, 0, 18].map((dx) => (
                        <rect key={dx} x={x + dx - 6} y={y + 30} width="12" height="22" rx="6" fill="var(--color-cream)" />
                      ))}
                    </g>
                  </g>
                );
              })}
              {/* Hand-placed: from inside District 1 up to the empty space
                  at the top right. */}
              <line x1="520" y1="240" x2="520" y2="74" stroke="var(--color-ink)" strokeWidth="2.5" />
              <circle cx="520" cy="240" r="5" fill="var(--color-ink)" />
              <text x="596" y="60" textAnchor="end" fontSize="26" fontWeight="800" fill="var(--color-ink)">
                3 seats per district
              </text>
            </svg>

            {/* Council: three seats, and the share it takes to win one. */}
            <div
              role="img"
              aria-label={councilLabel}
              aria-hidden={councilIn < 0.5}
              className="flex flex-col items-center gap-6"
              style={{ opacity: councilIn, transform: drift((1 - councilIn) * 24) }}
            >
              <div className="flex gap-3 sm:gap-4">
                {[0, 1, 2].map((s) => (
                  <span
                    key={s}
                    className="flex h-16 w-12 items-end justify-center rounded-t-full rounded-b-lg bg-flag-green pb-2 text-lg font-extrabold text-cream sm:h-20 sm:w-16"
                  >
                    {s + 1}
                  </span>
                ))}
              </div>
              <p className="text-5xl font-extrabold tracking-tight text-flag-green sm:text-7xl">
                25% + 1
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Horizontal bars, one per candidate, out of 100%, with a dashed line at the
 * share it takes to win.
 */
function TallyChart({
  label,
  shown,
  drift,
  round,
  candidates,
  votes,
  out = () => 0,
  won = () => 0,
  line,
}: {
  label: string;
  /** 0→1: how present the chart is. */
  shown: number;
  drift: ScrollStory["drift"];
  round: number;
  candidates: RcvCandidate[];
  votes: number[];
  /** 0→1 per candidate: how eliminated they are. */
  out?: (c: number) => number;
  /** 0→1 per candidate: how much their "Wins" badge shows. */
  won?: (c: number) => number;
  line: { at: number; label: string };
}) {
  return (
    <div
      role="img"
      aria-label={label}
      aria-hidden={shown < 0.5}
      className="w-full"
      style={{ opacity: shown, transform: drift((1 - shown) * 24) }}
    >
      <p className="mb-4 text-center text-sm font-bold tracking-wide text-ink/65 uppercase">
        Round {round}
      </p>
      <div className="relative flex flex-col gap-3 sm:gap-4">
        {candidates.map((cand, c) => {
          const o = out(c);
          return (
            <div key={cand.name} className="flex items-center gap-3" style={{ opacity: 1 - 0.7 * o }}>
              <span className="w-14 shrink-0 text-right text-sm font-bold sm:w-20 sm:text-base">
                {cand.name}
              </span>
              <div className="relative h-8 flex-1 sm:h-10">
                <div
                  className="absolute inset-y-0 left-0 rounded-r-lg"
                  style={{ width: `${votes[c]}%`, background: cand.color }}
                />
                {/* Above the dashed line, with a backing so it stays readable
                    where the line runs through it. */}
                <span
                  className="absolute inset-y-0 z-20 flex items-center pl-2 text-sm font-bold tabular-nums sm:text-base"
                  style={{ left: `${votes[c]}%` }}
                >
                  <span className="rounded bg-cream px-1">
                    {o > 0.5 ? (
                      <span className="font-semibold text-ink/65">Eliminated</span>
                    ) : (
                      `${Math.round(votes[c])}%`
                    )}
                  </span>
                  <span
                    className="ml-2 rounded-full bg-ink px-2 py-0.5 text-xs text-cream"
                    style={{ opacity: won(c) }}
                  >
                    Wins
                  </span>
                </span>
              </div>
            </div>
          );
        })}

        {/* The line it takes to win, across the bars. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-y-2 z-10 flex"
          style={{ left: "calc(3.5rem + 0.75rem)", right: 0 }}
        >
          <div className="relative h-full w-full sm:ml-6">
            <div
              className="absolute inset-y-0 border-l-2 border-dashed border-ink"
              style={{ left: `${line.at}%` }}
            />
            <span
              className="absolute top-full mt-1 -translate-x-1/2 text-xs font-bold whitespace-nowrap sm:text-sm"
              style={{ left: `${line.at}%` }}
            >
              {line.label}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
