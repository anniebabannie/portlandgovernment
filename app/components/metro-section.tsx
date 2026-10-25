import { useState, type ReactNode } from "react";
import { countyViewBox } from "../content/multnomah-county";
import {
  metroDistricts,
  metroDistrictsViewBox,
  metroPortlandPath,
  projectToMetroMap,
} from "../content/metro-districts";
import {
  msaBox,
  msaCounties,
  triCounties,
  triHeight,
  triMetroPath,
  triPortlandPath,
  triWidth,
} from "../content/tri-county";
import type { Branch } from "./branch-tree-section";
import { MultnomahMap } from "./county-map-section";
import { metroCouncilDistricts, type DistrictLookup } from "../lib/district-lookup";
import { DistrictSearch } from "./district-search";
import { FanTree, fanTreeBeats, type FanGroupSpec, type TreeBeat } from "./fan-tree";
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
  /**
   * One per map step. The first three are fixed: Multnomah alone with
   * Portland; zoom out to the neighboring counties as Metro's boundary draws
   * in; then Metro in the spotlight. Later steps keep that view, except the
   * one at `metroAreaAt`, which zooms out again to the whole Portland metro
   * area.
   */
  captions: ReactNode[];
  metroAreaAt?: number;
  /**
   * A run of steps, inserted before caption `at`, where the map steps aside
   * for a tree: a root (like "Voters") fanning out to clickable offices.
   */
  tree?: {
    at: number;
    root: Branch;
    offices: Office[];
    groups?: FanGroupSpec[];
    /**
     * Screen-reader label for the map of Metro's council districts, which
     * beats show with `figure: "districts"`.
     */
    districtsLabel?: string;
    beats: MetroTreeBeat[];
    label: string;
  };
  label: string;
};

export type MetroTreeBeat = TreeBeat & {
  /** Swap the tree for an address search; the districts map stays. */
  search?: boolean;
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
export function MetroSection({ id, intros, captions, metroAreaAt, tree, label }: Props) {
  const beatStep = (b: number) => intros.length + b;
  const treeBeats = tree?.beats ?? [];
  const at = tree?.at ?? captions.length;
  // Captions after the tree move down by its length.
  const captionStep = (i: number) => beatStep(i < at ? i : i + treeBeats.length);
  const story = useScrollStory(beatStep(captions.length + treeBeats.length));
  const { ref, between, drift } = story;
  const [s0, s1, s2] = [beatStep(0), beatStep(1), beatStep(2)];

  const storyCaptions: StoryCaption[] = [
    ...captions.map((node, i) => ({ node, step: captionStep(i), start: 0.15 })),
    ...treeBeats.map((b, i) => ({ node: b.caption, sub: b.sub, step: beatStep(at + i), start: 0.15 })),
  ].sort((a, b) => a.step - b.step);

  const multnomahIn = between(s0, 0, s0, 0.35);
  // The county section's map hands off to this one, framed identically,
  // just before the zoom starts.
  const handoff = between(s1, 0, s1, 0.2);
  const zoom = between(s1, 0.2, s1, 0.7);
  const neighborsIn = between(s1, 0.3, s1, 0.6);
  const metroLine = between(s1, 0.5, s1, 0.95);
  const metroFill = between(s2, 0, s2, 0.4);
  const sArea = metroAreaAt === undefined ? null : captionStep(metroAreaAt);
  // The tree cross-fades with the map for its run of steps.
  const sTree = tree ? beatStep(at) : null;
  const sAfter = beatStep(at + treeBeats.length);
  const treeShown =
    sTree === null
      ? 0
      : between(sTree, 0, sTree, 0.25) * (1 - between(sAfter, 0, sAfter, 0.25));
  const treeDraw = sTree === null ? 0 : between(sTree, 0.1, sTree, 0.9);
  // A search result only shows while the search beat is on screen.
  const [lookup, setLookup] = useState<DistrictLookup | null>(null);
  const found = lookup?.status === "found" ? lookup.district : null;
  const pin =
    lookup && lookup.status !== "not-found" ? projectToMetroMap(lookup.lon, lookup.lat) : null;
  const { focus, groups, brackets, figureIn, sumWeights } = fanTreeBeats(
    treeBeats,
    tree?.groups ?? [],
    beatStep(at),
    between,
  );
  const searchWeight = sumWeights((b) => !!b.search);
  const figures = tree?.districtsLabel
    ? [
        {
          id: "districts",
          t: figureIn("districts"),
          node: (
            <MetroDistrictsMap
              label={tree.districtsLabel}
              found={found}
              pin={pin}
              resultShown={searchWeight}
            />
          ),
        },
      ]
    : [];
  const { show: showOffice, dialog } = useOfficeDialog(id ?? "metro", "text-flag-blue-dark");
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
            className="relative w-full max-w-4xl"
            style={{
              aspectRatio: `${frame[2]} / ${frame[3]}`,
              maxHeight: sArea === null ? "55svh" : "66svh",
              opacity: multnomahIn,
              transform: drift((1 - multnomahIn) * 32),
            }}
          >
          <div
            role="img"
            aria-label={label}
            aria-hidden={treeShown > 0.5}
            className="absolute inset-0"
            style={{ opacity: 1 - treeShown }}
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

          {tree && (
            <div
              inert={treeShown < 0.5}
              className="absolute inset-0 flex items-center"
              style={{ opacity: treeShown }}
            >
              <FanTree
                id={id ?? "metro"}
                root={tree.root}
                offices={tree.offices}
                t={treeDraw}
                onSelect={showOffice}
                label={tree.label}
                width="min(100%, 32rem)"
                focus={focus}
                groups={groups}
                brackets={brackets}
                figures={figures}
                swap={{
                  t: searchWeight,
                  node: (
                    <DistrictSearch
                      id="metro-district-address"
                      layer={metroCouncilDistricts}
                      inputLabel="Your address"
                      outside="outside Metro's boundary"
                      learnMore={{
                        href: "https://www.oregonmetro.gov/about-metro/metro-council",
                        text: "oregonmetro.gov",
                      }}
                      onResult={setLookup}
                    />
                  ),
                }}
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

/**
 * Metro's six council districts, numbered, with Portland shaded and labeled
 * on top so readers can find themselves. The districts are all one color, so they
 * don't read as matching the city's color-coded council districts.
 */
export function MetroDistrictsMap({
  label,
  found = null,
  pin = null,
  resultShown = 0,
}: {
  label: string;
  /** District an address search landed in; the others dim. */
  found?: number | null;
  /** Where that address is, in map coordinates. */
  pin?: { x: number; y: number } | null;
  /** 0→1: how much of the search result to show. */
  resultShown?: number;
}) {
  return (
    <svg
      viewBox={metroDistrictsViewBox}
      role="img"
      aria-label={label}
      className="h-auto max-h-[40svh] w-full max-w-3xl"
    >
      {metroDistricts.map((d) => (
        <path
          key={d.number}
          d={d.d}
          fill="var(--color-flag-blue)"
          fillRule="evenodd"
          stroke="var(--color-cream)"
          strokeWidth="2.5"
          strokeLinejoin="round"
          className="transition-opacity duration-500"
          style={{ opacity: 1 - 0.75 * (found !== null && found !== d.number ? resultShown : 0) }}
        />
      ))}
      <path
        d={metroPortlandPath}
        fill="var(--color-ink)"
        fillOpacity="0.15"
        fillRule="evenodd"
        stroke="var(--color-ink)"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {metroDistricts.map((d) => {
        const [x, y] = d.label;
        return (
          <g key={d.number}>
            <circle cx={x} cy={y} r="16" fill="var(--color-cream)" />
            <text x={x} y={y + 6} textAnchor="middle" fontSize="18" fontWeight="800" fill="var(--color-ink)">
              {d.number}
            </text>
          </g>
        );
      })}
      {/* Hand-placed: from inside Portland's northwest corner out to the
          empty space above District 4. */}
      <line x1="268" y1="62" x2="172" y2="34" stroke="var(--color-ink)" strokeWidth="2" />
      <circle cx="268" cy="62" r="4.5" fill="var(--color-ink)" />
      <text x="164" y="38" textAnchor="end" fontSize="22" fontWeight="800" fill="var(--color-ink)">
        Portland
      </text>
      {pin && (
        // Map-pin shape with its point on the address, as on the city map.
        <g transform={`translate(${pin.x} ${pin.y})`} style={{ opacity: resultShown }}>
          <path
            d="M0 0 C-4 -10 -14 -16 -14 -27 A14 14 0 1 1 14 -27 C14 -16 4 -10 0 0Z"
            fill="var(--color-ink)"
            stroke="var(--color-cream)"
            strokeWidth="2.5"
          />
          <circle cy="-27" r="5" fill="var(--color-cream)" />
        </g>
      )}
    </svg>
  );
}
