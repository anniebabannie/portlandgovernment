import type { ReactNode } from "react";
import { useMediaQuery } from "../lib/use-media-query";
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

/** A division; with a summary or url, its box opens a dialog. */
export type Division = Office & {
  /** Smaller note under the name in its box. */
  sub?: string;
};

export type DivisionBeat = {
  caption: ReactNode;
  /** Show the divisions under the root. */
  divisions?: boolean;
};

type Props = {
  id?: string;
  intros: ReactNode[];
  root: Branch;
  /** Box colors for the divisions. */
  divisionStyle: { fill: string; stroke: string };
  divisions: Division[];
  beats: DivisionBeat[];
  label: string;
};

const W = 680;
const gap = 20;
// Space between a row's crossbar and the boxes under it.
const drop = 30;
const rowGap = 60;

/**
 * Pinned, scroll-driven chart of one root over many divisions. The root shows
 * from the first beat; the divisions draw in, in rows hung off a central
 * trunk, on the first beat that asks for them. Four columns on wide screens,
 * two (with larger text) on narrow ones.
 */
export function DivisionTreeSection({
  id,
  intros,
  root,
  divisionStyle,
  divisions,
  beats,
  label,
}: Props) {
  const beatStep = (b: number) => intros.length + b;
  const story = useScrollStory(beatStep(beats.length));
  const { ref, between, drift } = story;
  const wide = useMediaQuery("(min-width: 640px)");
  const { show: showDivision, dialog } = useOfficeDialog(id ?? "divisions", "text-flag-gold-dark");

  const captions: StoryCaption[] = beats.map((b, i) => ({
    node: b.caption,
    step: beatStep(i),
    start: 0.15,
  }));

  const rootIn = between(beatStep(0), 0, beatStep(0), 0.3);
  const firstDivisionBeat = beats.findIndex((b) => b.divisions);
  const s = beatStep(Math.max(0, firstDivisionBeat));
  // Divisions stay once they arrive, through the end of the section.
  const shown = firstDivisionBeat < 0 ? 0 : 1;

  // Layout. Narrow screens get two columns and bigger type, so the text is
  // still readable once the drawing scales down.
  const cols = wide ? 4 : 2;
  const rootW = wide ? 260 : 360;
  const rootH = wide ? 64 : 92;
  const rootFont = wide ? 19 : 28;
  const rootSubFont = wide ? 13 : 19;
  const font = wide ? 16 : 26;
  const subFont = wide ? 12 : 20;
  const lineH = font * 1.2;
  const boxH = wide ? 84 : 120;
  const boxW = (W - gap * (cols - 1)) / cols;
  const rows = Math.ceil(divisions.length / cols);
  const rootBottom = rootH + 10;
  const rowTop = (r: number) => rootBottom + 60 + r * (boxH + rowGap);
  const busY = (r: number) => rowTop(r) - drop;
  const colX = (c: number) => boxW / 2 + c * (boxW + gap);
  const H = rowTop(rows - 1) + boxH;
  const aspect = W / (H + 8);

  // Trunk, then each row's crossbar, then the drops into the boxes.
  const trunk = between(s, 0, s, 0.3) * shown;
  const bar = (r: number) => between(s, 0.15 + r * 0.05, s, 0.4 + r * 0.05) * shown;
  const box = (i: number) => between(s, 0.35 + i * 0.03, s, 0.5 + i * 0.03) * shown;

  const line = (t: number, head: boolean) => ({
    fill: "none",
    stroke: "var(--color-ink)",
    strokeWidth: 4,
    strokeLinecap: "round" as const,
    ...drawIn(t),
    markerEnd: head && t > 0.95 ? `url(#${id}-arrow)` : undefined,
  });

  return (
    <section id={id} ref={ref} className="relative" style={{ height: story.height }}>
      <div className="sticky top-0 h-svh overflow-hidden">
        <StoryIntros story={story} intros={intros} />

        <div className="flex h-full flex-col items-center justify-center gap-8 px-6 sm:gap-12">
          <StoryCaptions story={story} captions={captions} />

          {/* Sized to the drawing's aspect ratio so the buttons laid over it
              line up with the boxes drawn underneath. */}
          <div
            className="relative"
            style={{
              width: `min(100%, 40rem, calc(55svh * ${aspect.toFixed(4)}))`,
              aspectRatio: `${W} / ${H + 8}`,
              transform: drift((1 - rootIn) * 32),
            }}
          >
          <svg
            viewBox={`0 -4 ${W} ${H + 8}`}
            role="img"
            aria-label={label}
            className="absolute inset-0 size-full"
          >
            <defs>
              <marker
                id={`${id}-arrow`}
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
              <text
                x={W / 2}
                y={root.sub ? rootH * 0.47 : rootH * 0.61}
                textAnchor="middle"
                fontSize={rootFont}
                fontWeight="800"
                fill={root.text}
              >
                {root.name}
              </text>
              {root.sub && (
                <text x={W / 2} y={rootH * 0.78} textAnchor="middle" fontSize={rootSubFont} fontWeight="500" fill={root.text}>
                  {root.sub}
                </text>
              )}
            </g>

            {/* The trunk runs down the gap between the middle columns. */}
            <path d={`M${W / 2} ${rootBottom} L${W / 2} ${busY(rows - 1)}`} {...line(trunk, false)} />

            {Array.from({ length: rows }, (_, r) => {
              const first = r * cols;
              const last = Math.min(divisions.length, first + cols) - 1;
              return (
                <g key={r}>
                  <path
                    d={`M${colX(0)} ${busY(r)} L${colX(last - first)} ${busY(r)}`}
                    {...line(bar(r), false)}
                  />
                  {divisions.slice(first, last + 1).map((_, c) => (
                    <path
                      key={c}
                      d={`M${colX(c)} ${busY(r)} L${colX(c)} ${rowTop(r) - 8}`}
                      {...line(ramp(bar(r), 0.6, 1), true)}
                    />
                  ))}
                </g>
              );
            })}

            {divisions.map((d, i) => {
              const r = Math.floor(i / cols);
              const x = colX(i % cols);
              const y = rowTop(r);
              const t = box(i);
              const lines = d.lines ?? [d.name];
              const lineCount = lines.length + (d.sub ? 1 : 0);
              // Center the block of lines in the box (baseline of the first).
              const firstBaseline = y + boxH / 2 - ((lineCount - 1) * lineH) / 2 + font * 0.35;
              return (
                <g key={d.name} style={{ opacity: t, transform: drift((1 - t) * 8) }}>
                  <rect
                    x={x - boxW / 2}
                    y={y}
                    width={boxW}
                    height={boxH}
                    rx="24"
                    fill={divisionStyle.fill}
                    stroke={divisionStyle.stroke}
                    strokeWidth="3"
                  />
                  <text textAnchor="middle" fill="var(--color-ink)">
                    {lines.map((l, k) => (
                      <tspan key={k} x={x} y={firstBaseline + k * lineH} fontSize={font} fontWeight="800">
                        {l}
                      </tspan>
                    ))}
                    {d.sub && (
                      <tspan x={x} y={firstBaseline + lines.length * lineH} fontSize={subFont} fontWeight="500">
                        {d.sub}
                      </tspan>
                    )}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Real buttons over the drawn boxes, for divisions with details. */}
          {divisions.map((d, i) => {
            if (!d.summary && !d.url) return null;
            const x = colX(i % cols);
            const y = rowTop(Math.floor(i / cols));
            return (
              <button
                key={d.name}
                type="button"
                aria-haspopup="dialog"
                aria-label={d.name}
                onClick={() => showDivision(d)}
                // Not clickable (or focusable) until it has drawn in.
                disabled={box(i) < 0.9}
                className="absolute cursor-pointer rounded-[10%/25%] hover:bg-flag-gold/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-flag-gold-dark disabled:pointer-events-none"
                style={{
                  left: `${((x - boxW / 2) / W) * 100}%`,
                  top: `${((y + 4) / (H + 8)) * 100}%`,
                  width: `${(boxW / W) * 100}%`,
                  height: `${(boxH / (H + 8)) * 100}%`,
                }}
              />
            );
          })}
          </div>
        </div>
      </div>

      {dialog}
    </section>
  );
}
