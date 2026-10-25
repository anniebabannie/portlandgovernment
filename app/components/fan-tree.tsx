import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ramp } from "../lib/use-scroll-progress";
import type { Branch } from "./branch-tree-section";
import type { Office } from "./office-dialog";
import { cn } from "../lib/cn";
import { drawIn, type ScrollStory } from "./scroll-story";

/** A row of offices one level down, under one office or several side by side. */
export type FanGroupSpec = {
  id: string;
  /** Name(s) of the office(s) it hangs from. */
  under: string | string[];
  offices: Office[];
};

export type FanGroup = FanGroupSpec & {
  /** 0→1: how present the group is. */
  t: number;
  /** Fade-in for each office, so they can arrive staggered. */
  officeIn: (i: number) => number;
};

type Props = {
  id: string;
  root: Branch;
  offices: Office[];
  /** 0→1: the root appears, then the arrows draw, then the offices fade in. */
  t: number;
  onSelect: (office: Office) => void;
  label: string;
  /** CSS width of the root drawing. */
  width: string;
  /** How spotlit an office is; the rest dim while any one is. */
  focus?: (name: string) => { spotlit: number; dimmed: number };
  groups?: FanGroup[];
  /** Dashed, labeled boxes drawn around neighboring offices. */
  brackets?: FanBracket[];
  /** Drawings shown in the groups' place, like a map. */
  figures?: FanFigure[];
  /**
   * Something that takes the tree's place (root, arrows, and offices) as
   * t goes 0→1, like a search box. Figures below stay put.
   */
  swap?: { node: ReactNode; t: number };
};

export type FanFigure = {
  id: string;
  node: ReactNode;
  /** 0→1: how present it is. */
  t: number;
};

export type FanBracket = {
  /** Names of the offices it surrounds; they should sit side by side. */
  names: string[];
  label: string;
  /** 0→1: how present it is. */
  t: number;
};

const W = 680;
const rootW = 260;
const rootH = 64;
// Room under the root for the arrows to curve out to the row of offices.
const fanH = 112;
const H = rootH + fanH;
// A group wider than this wraps to more rows.
const maxGroupCols = 4;

type Point = { x: number; y: number };
const noFocus = () => ({ spotlit: 0, dimmed: 0 });
const underNames = (g: FanGroupSpec) => (Array.isArray(g.under) ? g.under : [g.under]);
// How far below the offices a bracket's label ends.
const bracketClear = 46;

/**
 * One root box with curved arrows fanning out to a single row of clickable
 * offices. The offices are HTML buttons, so the arrows are drawn in an
 * overlay sized from measuring where each one landed.
 */
export function FanTree({
  id,
  root,
  offices,
  t,
  onSelect,
  label,
  width,
  focus = noFocus,
  groups = [],
  brackets = [],
  figures = [],
  swap,
}: Props) {
  const boxRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const groupRefs = useRef<Record<string, HTMLUListElement | null>>({});
  const [fan, setFan] = useState<{
    w: number;
    h: number;
    scale: number;
    from: Point;
    to: Point[];
    byGroup: Record<string, { from: Point; to: Point[] }>;
    /** Each office's box, relative to the chart box. */
    boxes: { x: number; y: number; w: number; h: number }[];
  } | null>(null);
  // Keyed on ids so re-created (but identical) props don't re-measure.
  const layoutKey = [
    offices.length,
    groups.map((g) => `${g.id}:${g.under}:${g.offices.length}`).join(),
  ].join("|");

  useEffect(() => {
    const box = boxRef.current;
    const svg = svgRef.current;
    const list = listRef.current;
    if (!box || !svg || !list) return;

    const measure = () => {
      // Both rects share any transform on the chart, so their difference is
      // the true offset inside it.
      const b = box.getBoundingClientRect();
      const r = svg.getBoundingClientRect();
      const scale = r.width / W;
      const items = Array.from(list.children) as HTMLElement[];
      // offsetLeft/Top (relative to the box) ignore each item's fade-in drift.
      const top = (li: HTMLElement) => ({ x: li.offsetLeft + li.offsetWidth / 2, y: li.offsetTop - 6 });
      const byGroup: Record<string, { from: Point; to: Point[] }> = {};
      for (const g of groups) {
        const parents = items.filter((_, i) => underNames(g).includes(offices[i]?.name));
        const groupList = groupRefs.current[g.id];
        if (!parents.length || !groupList) continue;
        const kids = Array.from(groupList.children) as HTMLElement[];
        const left = Math.min(...parents.map((li) => li.offsetLeft));
        const right = Math.max(...parents.map((li) => li.offsetLeft + li.offsetWidth));
        const bottom = Math.max(...parents.map((li) => li.offsetTop + li.offsetHeight));
        // From several offices, start below the bracket label drawn there.
        const from = { x: (left + right) / 2, y: bottom + (parents.length > 1 ? bracketClear : 6) };
        // A group that wraps gets one straight arrow, since curves to its
        // second row would cross the first.
        const oneRow = new Set(kids.map((li) => li.offsetTop)).size === 1;
        byGroup[g.id] = {
          from,
          to: oneRow ? kids.map(top) : [{ x: from.x, y: (kids[0]?.offsetTop ?? groupList.offsetTop) - 6 }],
        };
      }
      setFan({
        w: b.width,
        h: b.height,
        scale,
        from: { x: r.left - b.left + (W / 2) * scale, y: r.top - b.top + (rootH + 10) * scale },
        to: items.map(top),
        byGroup,
        boxes: items.map((li) => ({ x: li.offsetLeft, y: li.offsetTop, w: li.offsetWidth, h: li.offsetHeight })),
      });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(box);
    return () => observer.disconnect();
  }, [layoutKey]);

  const rootIn = ramp(t, 0, 0.3);
  const lines = ramp(t, 0.25, 0.6);
  const officeIn = (i: number) => ramp(t, 0.5 + i * 0.05, 0.7 + i * 0.05);
  const arrowProps = (drawn: number) => ({
    fill: "none",
    stroke: "var(--color-ink)",
    strokeWidth: 4 * (fan?.scale ?? 1),
    strokeLinecap: "round" as const,
    ...drawIn(drawn),
    markerEnd: drawn > 0.95 ? `url(#${id}-fan-arrow)` : undefined,
  });

  // How much of the tree is left while something takes its place.
  const kept = 1 - (swap?.t ?? 0);
  const rowBottom = fan ? Math.max(...fan.boxes.map((b) => b.y + b.h)) : 0;

  return (
    <div ref={boxRef} className="relative flex w-full flex-col items-center">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={label}
        aria-hidden={kept < 0.5}
        style={{ width, opacity: kept }}
      >
        <defs>
          <marker
            id={`${id}-fan-arrow`}
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="4"
            markerHeight="4"
            orient="auto"
          >
            <path d="M0 0 L10 5 L0 10z" fill="var(--color-ink)" />
          </marker>
        </defs>
        <g
          style={{
            opacity: rootIn,
            transform: `scale(${0.85 + 0.15 * rootIn})`,
            transformBox: "fill-box",
            transformOrigin: "center",
          }}
        >
          <rect x={W / 2 - rootW / 2} y="0" width={rootW} height={rootH} rx={rootH / 2} fill={root.fill} />
          <text x={W / 2} y={root.sub ? 30 : 39} textAnchor="middle" fontSize="19" fontWeight="800" fill={root.text}>
            {root.name}
          </text>
          {root.sub && (
            <text x={W / 2} y="50" textAnchor="middle" fontSize="13" fontWeight="500" fill={root.text}>
              {root.sub}
            </text>
          )}
        </g>
      </svg>

      {fan && (
        <svg
          aria-hidden="true"
          width={fan.w}
          height={fan.h}
          className="pointer-events-none absolute inset-0 overflow-visible"
          style={{ opacity: kept }}
        >
          {fan.to.map((p, i) => (
            <path
              key={i}
              d={curve(fan.from, p)}
              {...arrowProps(lines)}
              style={{ opacity: 1 - 0.75 * focus(offices[i]?.name ?? "").dimmed }}
            />
          ))}
          {groups.map((g) => {
            const f = fan.byGroup[g.id];
            return f?.to.map((p, i) => (
              <path key={`${g.id}-${i}`} d={curve(f.from, p)} {...arrowProps(ramp(g.t, 0, 0.6))} />
            ));
          })}
        </svg>
      )}

      <ul
        ref={listRef}
        inert={kept < 0.5}
        style={{ "--cols": offices.length, opacity: kept } as CSSProperties}
        className="mt-2 grid w-full max-w-3xl auto-rows-fr grid-cols-[repeat(var(--cols),minmax(0,1fr))] gap-1.5 sm:gap-3"
      >
        {offices.map((office, i) => {
          const o = officeIn(i);
          const { spotlit, dimmed } = focus(office.name);
          return (
            // No scale-up for the spotlight: neighbors in a tight row would
            // eat into the gap between them.
            <li key={office.name} style={{ opacity: o * (1 - 0.75 * dimmed) }}>
              <button
                type="button"
                aria-haspopup="dialog"
                onClick={() => onSelect(office)}
                // Not clickable (or focusable) unless it's on screen.
                disabled={o < 0.9}
                className={cn(
                  "flex h-full w-full cursor-pointer items-center justify-center rounded-3xl border-2 bg-paper px-1.5 py-2 text-center text-xs leading-tight font-bold text-ink hyphens-auto hover:bg-ink/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink sm:rounded-full sm:px-4 sm:py-3 sm:text-base",
                  spotlit > 0.5 ? "border-ink" : "border-ink/25",
                )}
              >
                {office.name}
              </button>
            </li>
          );
        })}
      </ul>

      {fan &&
        brackets.map((br) => {
          const inside = fan.boxes.filter((_, i) => br.names.includes(offices[i]?.name));
          if (!inside.length || br.t <= 0) return null;
          const left = Math.min(...inside.map((b) => b.x));
          const right = Math.max(...inside.map((b) => b.x + b.w));
          const top = Math.min(...inside.map((b) => b.y));
          const bottom = Math.max(...inside.map((b) => b.y + b.h));
          const pad = 8;
          return (
            <div
              key={br.label}
              aria-hidden="true"
              className="pointer-events-none absolute rounded-4xl border-2 border-dashed border-flag-blue"
              style={{
                left: left - pad,
                top: top - pad,
                width: right - left + 2 * pad,
                height: bottom - top + 2 * pad,
                opacity: br.t * kept,
              }}
            >
              <span className="absolute inset-x-0 top-full mt-2 text-center text-sm font-bold text-flag-blue-dark sm:text-base">
                {br.label}
              </span>
            </div>
          );
        })}

      {fan && swap && (
        // Laid over the root and the row of offices, centered in that space.
        <div
          inert={swap.t < 0.5}
          className="absolute inset-x-0 top-0 flex items-center justify-center"
          style={{ height: rowBottom, opacity: swap.t }}
        >
          {swap.node}
        </div>
      )}

      {(groups.length > 0 || figures.length > 0) && (
        // Each group's grid (and each figure) stacks in one cell, pinned to
        // its top, and cross-fades with the others.
        <div className="mt-4 grid w-full max-w-3xl items-start *:col-start-1 *:row-start-1">
          {groups.map((g) => (
            <ul
              key={g.id}
              ref={(el) => {
                groupRefs.current[g.id] = el;
              }}
              inert={g.t < 0.5}
              className={cn(
                "grid auto-rows-fr grid-cols-[repeat(var(--cols),minmax(0,1fr))] gap-1.5 sm:gap-3",
                // Room above for the arrows down to it (more under a bracket,
                // whose label sits there). Figures don't need it.
                underNames(g).length > 1 ? "pt-20 sm:pt-24" : "pt-10 sm:pt-16",
              )}
              style={{ "--cols": Math.min(g.offices.length, maxGroupCols) } as CSSProperties}
            >
              {g.offices.map((office, i) => {
                const o = g.officeIn(i);
                return (
                  <li key={office.name} style={{ opacity: o }}>
                    <button
                      type="button"
                      aria-haspopup="dialog"
                      onClick={() => onSelect(office)}
                      disabled={o < 0.9}
                      className="flex h-full w-full cursor-pointer items-center justify-center rounded-3xl border-2 border-ink/25 bg-cream px-1.5 py-2 text-center text-xs leading-tight font-semibold text-ink hyphens-auto hover:bg-ink/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink sm:px-3 sm:text-sm"
                    >
                      {office.name}
                    </button>
                  </li>
                );
              })}
            </ul>
          ))}
          {figures.map((f) => (
            <div
              key={f.id}
              inert={f.t < 0.5}
              className="flex justify-center"
              style={{ opacity: f.t }}
            >
              {f.node}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** One scroll step of a fan tree, with what it puts in the spotlight. */
export type TreeBeat = {
  caption: ReactNode;
  /** Smaller, muted line under the caption, e.g. a hint to click. */
  sub?: ReactNode;
  /** Names of offices to spotlight; the others dim. */
  highlight?: string[];
  /** Id of the group to show under its office(s). */
  group?: string;
  /** A dashed, labeled box around neighboring offices. */
  bracket?: { names: string[]; label: string };
  /** Id of a figure to show in the groups' place. */
  figure?: string;
};

/**
 * Turns a run of tree beats, starting at scroll step `firstStep`, into the
 * spotlight, groups, and brackets a FanTree draws right now.
 */
export function fanTreeBeats<B extends TreeBeat>(
  beats: B[],
  groupSpecs: FanGroupSpec[],
  firstStep: number,
  between: ScrollStory["between"],
) {
  // How present each beat is. Neighbors cross-fade, so the weights sum to 1
  // during a hand-off; the tree's own fade covers the first and last.
  const beatWeight = beats.map((_, i) => {
    const s = firstStep + i;
    const fadeIn = i === 0 ? 1 : between(s, 0, s, 0.25);
    const fadeOut = i < beats.length - 1 ? between(s + 1, 0, s + 1, 0.25) : 0;
    return fadeIn * (1 - fadeOut);
  });
  const sumWeights = (match: (b: B) => boolean) =>
    Math.min(1, beats.reduce((sum, b, i) => sum + (match(b) ? beatWeight[i] : 0), 0));

  const focus = (name: string) => ({
    spotlit: sumWeights((b) => !!b.highlight?.includes(name)),
    dimmed: sumWeights((b) => !!b.highlight && !b.highlight.includes(name)),
  });
  const brackets: FanBracket[] = [
    ...new Set(beats.flatMap((b) => (b.bracket ? [b.bracket.label] : []))),
  ].map((label) => ({
    label,
    names: beats.find((b) => b.bracket?.label === label)!.bracket!.names,
    t: sumWeights((b) => b.bracket?.label === label),
  }));
  // A group's offices arrive staggered on its first beat, then follow it.
  const groups: FanGroup[] = groupSpecs.map((g) => {
    const inGroup = (b: B) => b.group === g.id;
    const t = sumWeights(inGroup);
    const first = firstStep + Math.max(0, beats.findIndex(inGroup));
    return {
      ...g,
      t,
      officeIn: (i: number) => between(first, 0.2 + i * 0.04, first, 0.35 + i * 0.04) * t,
    };
  });
  /** How present a figure is, for building the FanFigure that draws it. */
  const figureIn = (id: string) => sumWeights((b) => b.figure === id);
  return { focus, groups, brackets, figureIn, sumWeights };
}

const curve = (from: Point, to: Point) => {
  const bend = (to.y - from.y) / 2;
  return `M${from.x} ${from.y} C${from.x} ${from.y + bend} ${to.x} ${to.y - bend} ${to.x} ${to.y}`;
};
