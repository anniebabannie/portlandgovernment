import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ramp } from "../lib/use-scroll-progress";
import type { Branch } from "./branch-tree-section";
import { useOfficeDialog, type Office } from "./office-dialog";
import {
  drawIn,
  StoryCaptions,
  StoryIntros,
  useScrollStory,
  type StoryCaption,
} from "./scroll-story";

export type { Office } from "./office-dialog";

/** A set of offices under one report. */
export type OrgGroup = { id: string; under: string; offices: Office[] };

export type OrgChild = Branch & { id: string };

/** A node one row down from a report, e.g. a bureau under its chief. */
export type OrgSub = Branch & { id: string; under: string };

export type OrgBeat = {
  caption: ReactNode;
  /** Ids of the reports on screen during this beat. */
  show: string[];
  /**
   * Ids of the subs on screen during this beat. Any beat with subs switches
   * to the detailed chart, which has room for them.
   */
  subs?: string[];
  /** Id of the group of offices to show under its parent report. */
  group?: string;
  /** Id of a report to spotlight; the other reports dim. */
  highlight?: string;
  /** Name of an office to spotlight; the other offices dim (detailed chart). */
  groupHighlight?: string;
  /** Draw an arrow from a sub to an office (detailed chart). */
  link?: { from: string; to: string };
};

type Props = {
  id?: string;
  intros: ReactNode[];
  root: Branch;
  /** Up to three, left to right. */
  reports: OrgChild[];
  subs?: OrgSub[];
  /** Offices under reports. Each office opens a dialog with more detail. */
  groups?: OrgGroup[];
  beats: OrgBeat[];
  label: string;
};

// Shared sizes, in SVG units.
const W = 680;
const rootW = 260;
const childW = 210;
const nodeH = 64;
const childX = (i: number, n: number) =>
  n === 1 ? W / 2 : 10 + childW / 2 + (i * (W - 20 - childW)) / (n - 1);

// Simple chart: root and reports in the SVG, offices as a grid below it.
const simpleRowGap = 120;
const simpleChildY = nodeH + simpleRowGap;
// Room below the reports for the arrows into the grid; sized so they match
// the arrows above, with the grid's top margin supplying the gap at the tips.
const simpleGroupArrow = simpleRowGap - 8;

// Detailed chart: everything in one SVG. Rows: root, reports, subs, offices.
const detailRowGap = 90;
// Rows 0 and 1 match the simple chart, so the two cross-fade without moving.
const detailRowY = (row: number) =>
  row === 0 ? 0 : simpleChildY + (row - 1) * (nodeH + detailRowGap);
const officeY = detailRowY(3);
const officeH = 84;
const officeGap = 20;
// The line from the offices' parent meets a bus this far above them.
const busY = officeY - 34;
const detailH = officeY + officeH;

type Point = { x: number; y: number };

/**
 * Pinned, scroll-driven org chart: one root with a row of reports, and groups
 * of offices under some reports. Each beat says what's on screen and what's
 * in the spotlight. Beats that bring in subs (like a bureau under its chief)
 * cross-fade to a detailed chart that draws everything together, so arrows
 * can run between any two pieces.
 */
export function OrgTreeSection({
  id,
  intros,
  root,
  reports,
  subs = [],
  groups = [],
  beats,
  label,
}: Props) {
  const beatStep = (b: number) => intros.length + b;
  const story = useScrollStory(beatStep(beats.length));
  const { ref, between, drift } = story;
  const { show: showOffice, dialog } = useOfficeDialog(id ?? "org");

  // In the simple chart each group's offices are an HTML grid under the SVG,
  // so the curved arrows fanning out to them are drawn in an overlay sized
  // from measurements. (If a grid ever wraps to two rows, a straight arrow
  // into it stands in, since curves to the second row would cross the first.)
  const simpleRef = useRef<HTMLDivElement>(null);
  const simpleSvgRef = useRef<SVGSVGElement>(null);
  const listRefs = useRef<Record<string, HTMLUListElement | null>>({});
  const [fan, setFan] = useState<{
    w: number;
    h: number;
    scale: number;
    byGroup: Record<string, { from: Point; to: Point[] }>;
  } | null>(null);
  // Keyed on ids so re-created (but identical) props don't re-measure.
  const layoutKey = [
    reports.map((c) => c.id).join(),
    groups.map((g) => `${g.id}:${g.under}:${g.offices.length}`).join(),
  ].join("|");

  useEffect(() => {
    const box = simpleRef.current;
    const svg = simpleSvgRef.current;
    if (!box || !svg || !groups.length) return;

    const measure = () => {
      // Both rects share any transform on the chart, so their difference is
      // the true offset inside it.
      const b = box.getBoundingClientRect();
      const r = svg.getBoundingClientRect();
      const vbH = simpleChildY + nodeH + simpleGroupArrow + 8;
      const scale = Math.min(r.width / W, r.height / vbH);
      const ox = r.left - b.left + (r.width - W * scale) / 2;
      const oy = r.top - b.top + (r.height - vbH * scale) / 2;
      const byGroup: Record<string, { from: Point; to: Point[] }> = {};
      for (const g of groups) {
        const list = listRefs.current[g.id];
        if (!list) continue;
        const parent = reports.findIndex((c) => c.id === g.under);
        const items = Array.from(list.children) as HTMLElement[];
        // offsetLeft/Top ignore each item's own fade-in drift.
        const rows = new Set(items.map((li) => li.offsetTop));
        byGroup[g.id] = {
          from: {
            x: ox + childX(parent, reports.length) * scale,
            y: oy + (simpleChildY + nodeH + 10 + 4) * scale,
          },
          to:
            rows.size === 1
              ? items.map((li) => ({
                  x: li.offsetLeft + li.offsetWidth / 2,
                  // Relative to the chart box, the items' offset parent.
                  y: li.offsetTop - 6,
                }))
              : [],
        };
      }
      setFan({ w: b.width, h: b.height, scale, byGroup });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(box);
    return () => observer.disconnect();
  }, [layoutKey]);

  const captions: StoryCaption[] = beats.map((b, i) => ({
    node: b.caption,
    step: beatStep(i),
    start: 0.15,
  }));

  // How present each beat is right now. Neighbors cross-fade, so the
  // weights sum to 1 during a hand-off.
  const beatWeight = beats.map((_, i) => {
    const s = beatStep(i);
    const fadeIn = between(s, 0, s, 0.25);
    const fadeOut = i < beats.length - 1 ? between(s + 1, 0, s + 1, 0.25) : 0;
    return fadeIn * (1 - fadeOut);
  });
  const sumWeights = (match: (b: OrgBeat) => boolean) =>
    Math.min(1, beats.reduce((sum, b, i) => sum + (match(b) ? beatWeight[i] : 0), 0));

  const isDetail = (b: OrgBeat) => !!b.subs?.length;
  const detail = sumWeights(isDetail);
  const rootIn = between(beatStep(0), 0, beatStep(0), 0.3);

  // Office boxes appear staggered on their group's first arrival in each
  // chart, then follow the group as a whole.
  const officeFade = (groupId: string, match: (b: OrgBeat) => boolean) => {
    const inGroup = (b: OrgBeat) => b.group === groupId && match(b);
    const groupIn = sumWeights(inGroup);
    const first = beatStep(Math.max(0, beats.findIndex(inGroup)));
    return {
      groupIn,
      officeIn: (i: number) =>
        between(first, 0.2 + i * 0.05, first, 0.35 + i * 0.05) * groupIn,
    };
  };

  const ink = "var(--color-ink)";
  const accent = "var(--color-flag-blue-dark)";
  const arrowProps = (t: number, color = ink, head = true) => ({
    fill: "none",
    stroke: color,
    strokeWidth: 4,
    strokeLinecap: "round" as const,
    ...drawIn(t),
    markerEnd:
      head && t > 0.95 ? `url(#${id}-arrow${color === ink ? "" : "-accent"})` : undefined,
  });

  const markers = (
    <defs>
      {[
        ["", ink],
        ["-accent", accent],
      ].map(([suffix, color]) => (
        <marker
          key={suffix}
          id={`${id}-arrow${suffix}`}
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="4"
          markerHeight="4"
          orient="auto"
        >
          <path d="M0 0 L10 5 L0 10z" fill={color} />
        </marker>
      ))}
    </defs>
  );

  const node = (b: Branch, x: number, y: number, w: number, t: number, scale = 1) => (
    <g
      style={{
        opacity: t,
        transform: `scale(${(0.85 + 0.15 * t) * scale})`,
        transformBox: "fill-box",
        transformOrigin: "center",
      }}
    >
      <rect x={x - w / 2} y={y} width={w} height={nodeH} rx={nodeH / 2} fill={b.fill} />
      {/* Without a second line, the name centers in the pill. */}
      <text x={x} y={y + (b.sub ? 30 : 39)} textAnchor="middle" fontSize="19" fontWeight="800" fill={b.text}>
        {b.name}
      </text>
      {b.sub && (
        <text x={x} y={y + 50} textAnchor="middle" fontSize="13" fontWeight="500" fill={b.text}>
          {b.sub}
        </text>
      )}
    </g>
  );

  // The root and its curved arrows out to each report, at a given row gap.
  const rootAndReports = (childY: number, curve: number) => (
    <>
      {node(root, W / 2, 0, rootW, rootIn)}
      {reports.map((c, i) => {
        const present = sumWeights((b) => b.show.includes(c.id));
        // The arrow draws first, then the node fades in under it.
        const line = ramp(present, 0, 0.6);
        const t = ramp(present, 0.4, 1);
        const spotlit = sumWeights((b) => b.highlight === c.id);
        const dimmed = sumWeights((b) => !!b.highlight && b.highlight !== c.id);
        const x = childX(i, reports.length);
        const top = nodeH + 10;
        const end = childY - 10;
        const d =
          x === W / 2
            ? `M${x} ${top} L${x} ${end}`
            : `M${W / 2} ${top} C${W / 2} ${top + curve} ${x} ${end - curve} ${x} ${end}`;
        return (
          <g key={c.id} style={{ opacity: 1 - 0.75 * dimmed }}>
            <path d={d} {...arrowProps(line)} />
            {node(c, x, childY, childW, t, 1 + 0.08 * spotlit)}
          </g>
        );
      })}
    </>
  );

  const reportX = (reportId: string) =>
    childX(reports.findIndex((r) => r.id === reportId), reports.length);

  // Both charts draw at one width, set so the taller (detailed) one fits.
  const chartWidth = `min(100%, 40rem, calc(52svh * ${(W / (detailH + 8)).toFixed(4)}))`;

  // ── Simple chart ────────────────────────────────────────────────────────
  const simpleH = simpleChildY + nodeH + (groups.length ? simpleGroupArrow : 0);
  const simpleFades = Object.fromEntries(
    groups.map((g) => [g.id, officeFade(g.id, (b) => !isDetail(b))]),
  );
  const fanFor = (groupId: string) => {
    const f = fan?.byGroup[groupId];
    return f && f.to.length > 0 ? f : null;
  };

  const simpleChart = (
    <div
      ref={simpleRef}
      inert={detail > 0.5}
      className="relative flex w-full flex-col items-center"
      style={{ opacity: 1 - detail }}
    >
      <svg
        ref={simpleSvgRef}
        viewBox={`0 -4 ${W} ${simpleH + 8}`}
        role="img"
        aria-label={label}
        // Same width as the detailed chart, so the shared top rows line up.
        style={{ width: chartWidth }}
      >
        {markers}
        {rootAndReports(simpleChildY, 60)}
        {groups.map(
          (g) =>
            !fanFor(g.id) && (
              <path
                key={g.id}
                d={`M${reportX(g.under)} ${simpleChildY + nodeH + 10} L${reportX(g.under)} ${simpleH - 2}`}
                {...arrowProps(ramp(simpleFades[g.id].groupIn, 0, 0.6))}
              />
            ),
        )}
      </svg>

      {fan && (
        <svg
          aria-hidden="true"
          width={fan.w}
          height={fan.h}
          className="pointer-events-none absolute inset-0 overflow-visible"
        >
          {groups.map((g) => {
            const f = fanFor(g.id);
            if (!f) return null;
            return f.to.map((t, i) => {
              const bend = (t.y - f.from.y) / 2;
              return (
                <path
                  key={`${g.id}-${i}`}
                  d={`M${f.from.x} ${f.from.y} C${f.from.x} ${f.from.y + bend} ${t.x} ${t.y - bend} ${t.x} ${t.y}`}
                  {...arrowProps(ramp(simpleFades[g.id].groupIn, 0, 0.6))}
                  // Match the stroke weight of the scaled SVG above.
                  strokeWidth={4 * fan.scale}
                />
              );
            });
          })}
        </svg>
      )}

      {groups.length > 0 && (
        // Each group's grid stacks in one cell and cross-fades with the others.
        <div className="mt-2 grid w-full max-w-3xl *:col-start-1 *:row-start-1">
          {groups.map((g) => {
            const fade = simpleFades[g.id];
            return (
              <ul
                key={g.id}
                ref={(el) => {
                  listRefs.current[g.id] = el;
                }}
                inert={fade.groupIn < 0.5}
                // One row at every width, so each office gets its own curved arrow.
                className="grid auto-rows-fr grid-cols-[repeat(var(--cols),minmax(0,1fr))] gap-1.5 sm:gap-3"
                style={{ "--cols": g.offices.length } as CSSProperties}
              >
                {g.offices.map((office, i) => {
                  const t = fade.officeIn(i);
                  return (
                    <li key={office.name} style={{ opacity: t, transform: drift((1 - t) * 12) }}>
                      <button
                        type="button"
                        aria-haspopup="dialog"
                        onClick={() => showOffice(office)}
                        // Not clickable (or focusable) unless it's on screen.
                        disabled={t < 0.9}
                        className="flex h-full w-full cursor-pointer items-center justify-center rounded-3xl border-2 border-flag-blue bg-paper px-1.5 py-2 text-center text-xs leading-tight font-bold text-ink hyphens-auto sm:rounded-full hover:bg-flag-blue/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-flag-blue-dark sm:px-4 sm:py-3 sm:text-base"
                      >
                        {office.name}
                      </button>
                    </li>
                  );
                })}
              </ul>
            );
          })}
        </div>
      )}
    </div>
  );

  // ── Detailed chart ──────────────────────────────────────────────────────
  const detailGroups = groups.map((g) => {
    const n = g.offices.length;
    const w = (W - officeGap * (n - 1)) / Math.max(1, n);
    return {
      ...g,
      officeW: w,
      officeX: (i: number) => w / 2 + i * (w + officeGap),
      fade: officeFade(g.id, isDetail),
    };
  });

  const detailChart = (
    // Sized to the drawing's aspect ratio so the office buttons laid over it
    // line up with the boxes drawn underneath.
    <div
      inert={detail < 0.5}
      className="relative"
      style={{
        opacity: detail,
        width: chartWidth,
        aspectRatio: `${W} / ${detailH + 8}`,
      }}
    >
      <svg
        viewBox={`0 -4 ${W} ${detailH + 8}`}
        role="img"
        aria-label={label}
        className="absolute inset-0 size-full"
      >
        {markers}
        {rootAndReports(detailRowY(1), 60)}

        {subs.map((s) => {
          const present = sumWeights((b) => !!b.subs?.includes(s.id));
          const x = reportX(s.under);
          return (
            <g key={s.id}>
              <path
                d={`M${x} ${detailRowY(1) + nodeH + 10} L${x} ${detailRowY(2) - 10}`}
                {...arrowProps(ramp(present, 0, 0.6))}
              />
              {node(s, x, detailRowY(2), childW, ramp(present, 0.4, 1))}
            </g>
          );
        })}

        {detailGroups.map((g) => (
          <g key={g.id}>
            {/* Parent → bus → a short arrow into each office. */}
            <path
              d={`M${reportX(g.under)} ${detailRowY(1) + nodeH + 10} L${reportX(g.under)} ${busY}`}
              {...arrowProps(ramp(g.fade.groupIn, 0, 0.4), ink, false)}
            />
            <path
              d={`M${g.officeX(0)} ${busY} L${g.officeX(g.offices.length - 1)} ${busY}`}
              {...arrowProps(ramp(g.fade.groupIn, 0.3, 0.6), ink, false)}
            />
            {g.offices.map((o, i) => (
              <path
                key={o.name}
                d={`M${g.officeX(i)} ${busY} L${g.officeX(i)} ${officeY - 8}`}
                {...arrowProps(ramp(g.fade.groupIn, 0.5, 0.8))}
              />
            ))}

            {g.offices.map((o, i) => {
              const spotlit = sumWeights((b) => b.groupHighlight === o.name) > 0.5;
              const dimmed = sumWeights(
                (b) => !!b.groupHighlight && b.groupHighlight !== o.name,
              );
              const lines = o.lines ?? [o.name];
              const x = g.officeX(i);
              const firstLine = officeY + officeH / 2 - ((lines.length - 1) * 19) / 2 + 6;
              return (
                <g key={o.name} style={{ opacity: g.fade.officeIn(i) * (1 - 0.75 * dimmed) }}>
                  <rect
                    x={x - g.officeW / 2}
                    y={officeY}
                    width={g.officeW}
                    height={officeH}
                    rx="24"
                    fill={spotlit ? "#d6e6f8" : "var(--color-paper)"}
                    stroke={spotlit ? accent : "var(--color-flag-blue)"}
                    strokeWidth={spotlit ? 4 : 3}
                  />
                  <text textAnchor="middle" fontSize="16" fontWeight="800" fill={ink}>
                    {lines.map((line, k) => (
                      <tspan key={k} x={x} y={firstLine + k * 19}>
                        {line}
                      </tspan>
                    ))}
                  </text>
                </g>
              );
            })}
          </g>
        ))}

        {/* One arrow per distinct link, so consecutive beats that share a
            link keep it drawn instead of re-drawing it. */}
        {[...new Set(beats.flatMap((b) => (b.link ? [`${b.link.from}→${b.link.to}`] : [])))].map((key) => {
          const [from, to] = key.split("→");
          const present = sumWeights((b) => b.link?.from === from && b.link?.to === to);
          const sub = subs.find((s) => s.id === from);
          const g = detailGroups.find((dg) => dg.offices.some((o) => o.name === to));
          if (!sub || !g) return null;
          const target = g.offices.findIndex((o) => o.name === to);
          const x1 = reportX(sub.under);
          const tx = g.officeX(target);
          // Aim at the near half of the office's top edge, clear of its bus arrow.
          const x2 = tx + (x1 < tx ? -g.officeW / 4 : g.officeW / 4);
          const y1 = detailRowY(2) + nodeH + 10;
          const y2 = officeY - 10;
          return (
            <path
              key={key}
              d={`M${x1} ${y1} C${x1} ${y1 + 40} ${x2} ${y2 - 40} ${x2} ${y2}`}
              {...arrowProps(ramp(present, 0.3, 1), accent)}
            />
          );
        })}
      </svg>

      {/* Real buttons over the drawn office boxes. */}
      {detailGroups.map((g) =>
        g.offices.map((o, i) => (
          <button
            key={`${g.id}-${o.name}`}
            type="button"
            aria-haspopup="dialog"
            aria-label={o.name}
            onClick={() => showOffice(o)}
            disabled={g.fade.officeIn(i) < 0.9}
            className="absolute cursor-pointer rounded-[11%/30%] hover:bg-flag-blue/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-flag-blue-dark disabled:pointer-events-none"
            style={{
              left: `${((g.officeX(i) - g.officeW / 2) / W) * 100}%`,
              top: `${((officeY + 4) / (detailH + 8)) * 100}%`,
              width: `${(g.officeW / W) * 100}%`,
              height: `${(officeH / (detailH + 8)) * 100}%`,
            }}
          />
        )),
      )}
    </div>
  );

  return (
    <section id={id} ref={ref} className="relative" style={{ height: story.height }}>
      <div className="sticky top-0 h-svh overflow-hidden">
        <StoryIntros story={story} intros={intros} />

        <div className="flex h-full flex-col items-center justify-center gap-8 px-6 sm:gap-12">
          <StoryCaptions story={story} captions={captions} />

          {/* The two charts share one grid cell, pinned to its top, and
              cross-fade. The cell keeps the taller chart's height on every
              step, so the layout never shifts. */}
          <div
            className="grid w-full items-start justify-items-center *:col-start-1 *:row-start-1"
            style={{ transform: drift((1 - rootIn) * 32) }}
          >
            {simpleChart}
            {subs.length > 0 && detailChart}
          </div>
        </div>
      </div>

      {groups.length > 0 && dialog}
    </section>
  );
}
