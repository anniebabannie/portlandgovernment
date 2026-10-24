import type { ReactNode } from "react";
import { countyViewBox } from "../content/multnomah-county";
import {
  msaBox,
  msaCounties,
  triCounties,
  triHeight,
  triMetroPath,
  triPortlandPath,
  triWidth,
} from "../content/tri-county";
import { MultnomahMap } from "./county-map-section";
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
  /**
   * One per step. The first three are fixed: Multnomah alone with Portland;
   * zoom out to the neighboring counties as Metro's boundary draws in; then
   * Metro in the spotlight. Later steps keep that view, except the one at
   * `metroAreaAt`, which zooms out again to the whole Portland metro area.
   */
  captions: ReactNode[];
  metroAreaAt?: number;
  label: string;
};

// Label spots, placed clear of Metro's shape.
const countyLabelAt: Record<string, readonly [number, number]> = {
  Washington: [140, 110],
  Multnomah: [770, 215],
  Clackamas: [690, 480],
};
const countyFill: Record<string, string> = {
  Washington: "#e6dfcc",
  Multnomah: "#ece5d4",
  Clackamas: "#e2dac6",
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Pinned, scroll-driven map that starts on Multnomah County and zooms out to
 * Washington, Multnomah, and Clackamas counties to show Metro's boundary
 * spanning all three.
 */
export function MetroSection({ id, intros, captions, metroAreaAt, label }: Props) {
  const beatStep = (b: number) => intros.length + b;
  const story = useScrollStory(beatStep(captions.length));
  const { ref, between, drift } = story;
  const [s0, s1, s2] = [beatStep(0), beatStep(1), beatStep(2)];

  const storyCaptions: StoryCaption[] = captions.map((node, i) => ({
    node,
    step: beatStep(i),
    start: 0.15,
  }));

  const multnomahIn = between(s0, 0, s0, 0.35);
  // The county section's map hands off to this one, framed identically,
  // just before the zoom starts.
  const handoff = between(s1, 0, s1, 0.2);
  const zoom = between(s1, 0.2, s1, 0.7);
  const neighborsIn = between(s1, 0.3, s1, 0.6);
  const metroLine = between(s1, 0.5, s1, 0.95);
  const metroFill = between(s2, 0, s2, 0.4);
  const sArea = metroAreaAt === undefined ? null : beatStep(metroAreaAt);
  const areaZoom = sArea === null ? 0 : between(sArea, 0, sArea, 0.5);
  const areaIn = sArea === null ? 0 : between(sArea, 0.2, sArea, 0.6);

  // Zoom from Multnomah's bounds out to all three counties, then (later) out
  // to the whole metro area.
  const m = triCounties.find((c) => c.name === "Multnomah")!.box;
  const from = [m[0], m[1], m[2] - m[0], m[3] - m[1]];
  const tri = [0, 0, triWidth, triHeight];
  const pad = 8;
  const area = [msaBox[0] - pad, msaBox[1] - pad, msaBox[2] - msaBox[0] + 2 * pad, msaBox[3] - msaBox[1] + 2 * pad];
  // The frame takes the taller metro area's shape (or the three-county
  // shape if there's no metro-area step), so the last zoom fills it.
  const frame = sArea === null ? tri : area;
  const view = from.map((v, i) => lerp(lerp(v, tri[i], zoom), area[i], areaZoom));
  const viewBox = view.map((v) => v.toFixed(1)).join(" ");
  // Keep strokes and labels a steady on-screen size while zooming.
  const scale = view[2] / triWidth;

  return (
    <section id={id} ref={ref} className="relative" style={{ height: story.height }}>
      <div className="sticky top-0 h-svh overflow-hidden">
        <StoryIntros story={story} intros={intros} />

        <div className="flex h-full flex-col items-center justify-center gap-8 px-6 sm:gap-12">
          <StoryCaptions story={story} captions={storyCaptions} />

          {/* Both maps fill the same box and are centered in it, so the
              Multnomah map lines up with the start of the zoom. */}
          <div
            role="img"
            aria-label={label}
            className="relative w-full max-w-4xl"
            style={{
              aspectRatio: `${frame[2]} / ${frame[3]}`,
              maxHeight: sArea === null ? "55svh" : "66svh",
              opacity: multnomahIn,
              transform: drift((1 - multnomahIn) * 32),
            }}
          >
          <svg
            aria-hidden="true"
            viewBox={countyViewBox}
            className="absolute inset-0 size-full"
            style={{ opacity: 1 - handoff }}
          >
            <MultnomahMap clipId={`${id}-county`} highlight="Portland" highlightLabelOnly />
          </svg>
          <svg
            aria-hidden="true"
            viewBox={viewBox}
            className="absolute inset-0 size-full"
            style={{ opacity: handoff }}
          >
            {/* The metro area's outer edge: every county stroked with a wide
                dashed line, then filled over, so only the outside half of
                the outer edges shows. */}
            <g style={{ opacity: areaIn }}>
              {[...triCounties, ...msaCounties].map((c) => (
                <path
                  key={c.name}
                  d={c.d}
                  fill="none"
                  stroke="var(--color-ink)"
                  strokeWidth={5 * scale}
                  strokeDasharray={`${14 * scale} ${10 * scale}`}
                />
              ))}
              {msaCounties.map((c) => (
                <path key={c.name} d={c.d} fill="#efe9da" stroke="var(--color-cream)" strokeWidth={3 * scale} />
              ))}
            </g>

            {triCounties.map((c) => (
              <path
                key={c.name}
                d={c.d}
                fill={countyFill[c.name]}
                stroke="var(--color-cream)"
                strokeWidth={3 * scale}
                style={{ opacity: c.name === "Multnomah" ? 1 : neighborsIn }}
              />
            ))}

            <path d={triPortlandPath} fill="var(--color-flag-green)" fillRule="evenodd" />

            <path
              d={triMetroPath}
              fill="var(--color-flag-blue)"
              fillRule="evenodd"
              style={{ fillOpacity: 0.12 + 0.18 * metroFill, opacity: metroLine > 0 ? 1 : 0 }}
            />
            <path
              d={triMetroPath}
              fill="none"
              stroke="var(--color-flag-blue-dark)"
              strokeWidth={3.5 * scale}
              strokeLinejoin="round"
              {...drawIn(metroLine)}
            />

            <g fontWeight="700" textAnchor="middle">
              {triCounties.map((c) => {
                const [x, y] = countyLabelAt[c.name];
                return (
                  <text
                    key={c.name}
                    x={x}
                    y={y}
                    fontSize={22 * scale}
                    fill="var(--color-ink)"
                    style={{ opacity: c.name === "Multnomah" ? 1 : neighborsIn }}
                  >
                    {c.name} County
                  </text>
                );
              })}
              <text x="470" y="195" fontSize={22 * scale} fontWeight="800" fill="var(--color-cream)">
                Portland
              </text>
              <text
                x="290"
                y="262"
                fontSize={30 * scale}
                fontWeight="800"
                fill="var(--color-flag-blue-dark)"
                style={{ opacity: metroFill }}
              >
                Metro
              </text>

              <g style={{ opacity: areaIn }}>
                {msaCounties.map((c) => (
                  <text key={c.name} x={c.label[0]} y={c.label[1]} fontSize={18 * scale} fontWeight="600" fill="#55554f">
                    {c.name} County
                  </text>
                ))}
                <text x="540" y="-110" fontSize={30 * scale} fontWeight="800" fill="var(--color-ink)">
                  Portland metro area
                </text>
              </g>
            </g>
          </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
