import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ramp } from "../lib/use-scroll-progress";
import type { Branch } from "./branch-tree-section";
import type { Office } from "./office-dialog";
import { drawIn } from "./scroll-story";

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
};

const W = 680;
const rootW = 260;
const rootH = 64;
// Room under the root for the arrows to curve out to the row of offices.
const fanH = 112;
const H = rootH + fanH;

type Point = { x: number; y: number };

/**
 * One root box with curved arrows fanning out to a single row of clickable
 * offices. The offices are HTML buttons, so the arrows are drawn in an
 * overlay sized from measuring where each one landed.
 */
export function FanTree({ id, root, offices, t, onSelect, label, width }: Props) {
  const boxRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [fan, setFan] = useState<{ w: number; h: number; scale: number; from: Point; to: Point[] } | null>(null);

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
      setFan({
        w: b.width,
        h: b.height,
        scale,
        from: { x: r.left - b.left + (W / 2) * scale, y: r.top - b.top + (rootH + 10) * scale },
        // offsetLeft/Top (relative to the box) ignore each item's fade-in drift.
        to: items.map((li) => ({ x: li.offsetLeft + li.offsetWidth / 2, y: li.offsetTop - 6 })),
      });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(box);
    return () => observer.disconnect();
  }, [offices.length]);

  const rootIn = ramp(t, 0, 0.3);
  const lines = ramp(t, 0.25, 0.6);
  const officeIn = (i: number) => ramp(t, 0.5 + i * 0.05, 0.7 + i * 0.05);

  return (
    <div ref={boxRef} className="relative flex w-full flex-col items-center">
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} style={{ width }}>
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
        >
          {fan.to.map((p, i) => {
            const bend = (p.y - fan.from.y) / 2;
            return (
              <path
                key={i}
                d={`M${fan.from.x} ${fan.from.y} C${fan.from.x} ${fan.from.y + bend} ${p.x} ${p.y - bend} ${p.x} ${p.y}`}
                fill="none"
                stroke="var(--color-ink)"
                strokeWidth={4 * fan.scale}
                strokeLinecap="round"
                {...drawIn(lines)}
                markerEnd={lines > 0.95 ? `url(#${id}-fan-arrow)` : undefined}
              />
            );
          })}
        </svg>
      )}

      <ul
        ref={listRef}
        className="mt-2 grid w-full max-w-3xl auto-rows-fr grid-cols-[repeat(var(--cols),minmax(0,1fr))] gap-1.5 sm:gap-3"
        style={{ "--cols": offices.length } as CSSProperties}
      >
        {offices.map((office, i) => {
          const o = officeIn(i);
          return (
            <li key={office.name} style={{ opacity: o }}>
              <button
                type="button"
                aria-haspopup="dialog"
                onClick={() => onSelect(office)}
                // Not clickable (or focusable) unless it's on screen.
                disabled={o < 0.9}
                className="flex h-full w-full cursor-pointer items-center justify-center rounded-3xl border-2 border-ink/25 bg-paper px-1.5 py-2 text-center text-xs leading-tight font-bold text-ink hyphens-auto hover:bg-ink/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink sm:rounded-full sm:px-4 sm:py-3 sm:text-base"
              >
                {office.name}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
