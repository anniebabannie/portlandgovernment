import type { ReactNode } from "react";
import {
  countyCities,
  countyDrawHeight,
  countyLabels,
  countyPath,
} from "../content/multnomah-county";
import type { Branch } from "./branch-tree-section";
import { FanTree, fanTreeBeats, type FanGroupSpec, type TreeBeat } from "./fan-tree";

export type { TreeBeat } from "./fan-tree";
import { useOfficeDialog, type Office } from "./office-dialog";
import {
  drawIn,
  StoryCaptions,
  StoryIntros,
  useScrollStory,
  type StoryCaption,
} from "./scroll-story";

type Props = {
  id?: string;
  intros: ReactNode[];
  /** The city drawn in the spotlight color. */
  highlight: string;
  /** One per scroll step after the intros; the map arrives with the first. */
  captions: ReactNode[];
  label: string;
  /**
   * A tree that replaces the map after its captions: a root fanning out to
   * clickable offices, with one beat per further scroll step.
   */
  tree?: {
    root: Branch;
    offices: Office[];
    /** Offices under offices, each shown by the beats that name it. */
    groups?: FanGroupSpec[];
    beats: TreeBeat[];
    label: string;
  };
};

const W = 1000;

/**
 * Pinned, scroll-driven map of Multnomah County: its outline draws in, then
 * the cities inside it fill in, with one city in the spotlight.
 */
export function CountyMapSection({ id, intros, highlight, captions, label, tree }: Props) {
  const beatStep = (b: number) => intros.length + b;
  const beats = tree?.beats ?? [];
  const allCaptions = [...captions, ...beats.map((b) => b.caption)];
  const story = useScrollStory(beatStep(allCaptions.length));
  const { ref, between, drift } = story;
  const s = beatStep(0);
  const treeStep = beatStep(captions.length);
  const { show: showOffice, dialog } = useOfficeDialog(id ?? "county", "text-ink");

  const storyCaptions: StoryCaption[] = allCaptions.map((node, i) => ({
    node,
    sub: beats[i - captions.length]?.sub,
    step: beatStep(i),
    start: 0.15,
  }));

  // The map gives way to the tree at the first tree step.
  const mapOut = tree ? between(treeStep, 0, treeStep, 0.25) : 0;
  const treeIn = tree ? between(treeStep, 0.15, treeStep, 0.95) : 0;

  const { focus, groups, brackets } = fanTreeBeats(beats, tree?.groups ?? [], treeStep, between);

  // Outline draws, then the county fills, then the cities and their labels.
  const outline = between(s, 0, s, 0.35);
  const fill = between(s, 0.25, s, 0.45);
  const city = (i: number) => between(s, 0.35 + i * 0.04, s, 0.55 + i * 0.04);
  const labels = between(s, 0.6, s, 0.8);
  const clipId = `${id}-county`;

  return (
    <section id={id} ref={ref} className="relative" style={{ height: story.height }}>
      <div className="sticky top-0 h-svh overflow-hidden">
        <StoryIntros story={story} intros={intros} />

        <div className="flex h-full flex-col items-center justify-center gap-8 px-6 sm:gap-12">
          <StoryCaptions story={story} captions={storyCaptions} />

          {/* The map and the tree share one grid cell and cross-fade. */}
          <div className="grid w-full items-center justify-items-center *:col-start-1 *:row-start-1">
          <svg
            viewBox={`0 0 ${W} ${countyDrawHeight}`}
            role="img"
            aria-label={label}
            aria-hidden={mapOut > 0.5}
            className="w-full max-w-5xl"
            style={{ opacity: 1 - mapOut, transform: drift((1 - between(s, 0, s, 0.6)) * 32) }}
          >
            <MultnomahMap
              clipId={clipId}
              highlight={highlight}
              outline={outline}
              fill={fill}
              cityIn={city}
              labels={labels}
            />
          </svg>

          {tree && (
            <div inert={treeIn < 0.5} className="w-full" style={{ opacity: Math.min(1, treeIn * 3) }}>
              <FanTree
                id={id ?? "county"}
                root={tree.root}
                offices={tree.offices}
                t={treeIn}
                onSelect={showOffice}
                label={tree.label}
                width="min(100%, 32rem)"
                focus={focus}
                groups={groups}
                brackets={brackets}
              />
            </div>
          )}
          </div>
        </div>
      </div>

      {tree && dialog}
    </section>
  );
}

type MultnomahMapProps = {
  clipId: string;
  /** The city drawn in the spotlight color, with a large label. */
  highlight: string;
  /** Draw-in progress (0→1) for each layer; all default to fully drawn. */
  outline?: number;
  fill?: number;
  cityIn?: (i: number) => number;
  labels?: number;
  /** Label only the highlighted city. */
  highlightLabelOnly?: boolean;
};

/**
 * Multnomah County with its cities, for use inside an SVG whose viewBox is
 * `0 0 1000 countyDrawHeight` (or the county's own bounds).
 */
export function MultnomahMap({
  clipId,
  highlight,
  outline = 1,
  fill = 1,
  cityIn = () => 1,
  labels = 1,
  highlightLabelOnly = false,
}: MultnomahMapProps) {
  const shownLabels = highlightLabelOnly
    ? countyLabels.filter((l) => l.name === highlight)
    : countyLabels;
  return (
    <>
      <defs>
        <clipPath id={clipId}>
          <path d={countyPath} />
        </clipPath>
      </defs>

      {/* Unincorporated county shows wherever no city covers it. */}
      <path d={countyPath} fill="#ece5d4" style={{ opacity: fill }} />

      {/* Cities, cut to the county line (Portland and Lake Oswego both
          spill into neighboring counties). */}
      <g clipPath={`url(#${clipId})`}>
        {countyCities.map((c, i) => (
          <path
            key={c.name}
            d={c.d}
            fillRule="evenodd"
            fill={c.name === highlight ? "var(--color-flag-green)" : "#cbd6c9"}
            stroke="var(--color-cream)"
            strokeWidth="1.5"
            style={{ opacity: cityIn(i) }}
          />
        ))}
      </g>

      <path
        d={countyPath}
        fill="none"
        stroke="var(--color-ink)"
        strokeWidth="2.5"
        strokeLinejoin="round"
        {...drawIn(outline)}
      />

      <g style={{ opacity: labels }} fontWeight="700">
        {shownLabels.map((l) => {
          const big = l.name === highlight;
          return (
            <g key={l.name}>
              {l.from && (
                <>
                  <line
                    x1={l.from[0]}
                    y1={l.from[1]}
                    x2={l.at[0]}
                    y2={l.at[1] + (l.at[1] < l.from[1] ? 6 : -16)}
                    stroke="var(--color-ink)"
                    strokeWidth="1.5"
                  />
                  <circle cx={l.from[0]} cy={l.from[1]} r="3.5" fill="var(--color-ink)" />
                </>
              )}
              <text
                x={l.at[0]}
                y={l.at[1]}
                textAnchor={l.anchor ?? "middle"}
                fontSize={big ? 30 : 18}
                fontWeight={big ? 800 : 700}
                fill={big ? "var(--color-cream)" : "var(--color-ink)"}
              >
                {l.name}
              </text>
            </g>
          );
        })}
        <text x="790" y="300" textAnchor="middle" fontSize="18" fontStyle="italic" fontWeight="500" fill="#55554f">
          Unincorporated county
        </text>
      </g>
    </>
  );
}
