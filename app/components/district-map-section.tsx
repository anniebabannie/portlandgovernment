import { useState, type ReactNode } from "react";
import {
  districts,
  districtsViewBox,
  projectToMap,
} from "../content/portland-districts";
import type { DistrictLookup } from "../lib/district-lookup";
import { DistrictSearch } from "./district-search";
import {
  StoryCaptions,
  StoryIntros,
  useScrollStory,
  type StoryCaption,
} from "./scroll-story";

// Neighbors differ in lightness as well as hue: 1 and 4 never touch.
const districtFill: Record<number, string> = {
  1: "var(--color-flag-blue)",
  2: "var(--color-flag-green)",
  3: "var(--color-flag-gold)",
  4: "var(--color-flag-blue-dark)",
};

export type MapBeat = {
  caption: ReactNode;
  /** Smaller, muted line under the caption, e.g. a hint to click. */
  sub?: ReactNode;
  /** District number to spotlight; the others dim. */
  highlight?: number;
  /** Show three councilor seats on each district. */
  seats?: boolean;
  /** Show an address search under the caption; a match spotlights its district. */
  search?: boolean;
};

type Props = {
  id?: string;
  intros: ReactNode[];
  beats: MapBeat[];
  label: string;
};

/**
 * Pinned, scroll-driven map of Portland's four council districts. The
 * districts fade in one by one on the first beat; later beats can spotlight
 * one district or add councilor seats.
 */
export function DistrictMapSection({ id, intros, beats, label }: Props) {
  const beatStep = (b: number) => intros.length + b;
  const story = useScrollStory(beatStep(beats.length));
  const { ref, between, drift } = story;
  const first = beatStep(0);
  const [lookup, setLookup] = useState<DistrictLookup | null>(null);

  const captions: StoryCaption[] = beats.map((b, i) => ({
    node: b.search ? (
      <>
        {b.caption}
        <DistrictSearch onResult={setLookup} />
      </>
    ) : (
      b.caption
    ),
    sub: b.sub,
    step: beatStep(i),
    start: 0.15,
  }));

  // How present each beat is right now; neighbors cross-fade.
  const beatWeight = beats.map((_, i) => {
    const s = beatStep(i);
    const fadeIn = between(s, 0, s, 0.2);
    const fadeOut = i < beats.length - 1 ? between(s + 1, 0, s + 1, 0.2) : 0;
    return fadeIn * (1 - fadeOut);
  });
  const sumWeights = (match: (b: MapBeat) => boolean) =>
    Math.min(1, beats.reduce((sum, b, i) => sum + (match(b) ? beatWeight[i] : 0), 0));

  // Seats arrive after the districts have filled in on their first beat.
  const seatsStep = beatStep(Math.max(0, beats.findIndex((b) => b.seats)));
  const seatsIn = between(seatsStep, 0.45, seatsStep, 0.7) * sumWeights((b) => !!b.seats);

  // A search result only shows while the search beat is on screen.
  const searchWeight = sumWeights((b) => !!b.search);
  const found = lookup?.status === "found" ? lookup.district : null;
  const pin =
    lookup && lookup.status !== "not-found"
      ? projectToMap(lookup.lon, lookup.lat)
      : null;

  return (
    <section id={id} ref={ref} className="relative" style={{ height: story.height }}>
      <div className="sticky top-0 h-svh overflow-hidden">
        <StoryIntros story={story} intros={intros} />

        <div className="flex h-full flex-col items-center justify-center gap-6 px-6 sm:gap-10">
          <StoryCaptions story={story} captions={captions} />

          <svg
            viewBox={districtsViewBox}
            role="img"
            aria-label={label}
            className="w-full max-w-160 max-h-[55svh]"
            style={{ transform: drift((1 - between(first, 0, first, 0.6)) * 32) }}
          >
            {districts.map((d, i) => {
              const t = between(first, 0.05 + i * 0.08, first, 0.25 + i * 0.08);
              const dimmed = Math.max(
                sumWeights((b) => b.highlight !== undefined && b.highlight !== d.number),
                found !== null && found !== d.number ? searchWeight : 0,
              );
              return (
                <path
                  key={d.number}
                  d={d.d}
                  fill={districtFill[d.number]}
                  fillRule="evenodd"
                  stroke="var(--color-cream)"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                  className="transition-opacity duration-500"
                  style={{ opacity: t * (1 - 0.75 * dimmed) }}
                />
              );
            })}

            {districts.map((d, i) => {
              const t = between(first, 0.25 + i * 0.08, first, 0.4 + i * 0.08);
              const [x, y] = d.label;
              return (
                <g key={d.number} style={{ opacity: t }}>
                  <circle cx={x} cy={y} r="22" fill="var(--color-cream)" />
                  <text x={x} y={y + 8} textAnchor="middle" fontSize="24" fontWeight="800" fill="var(--color-ink)">
                    {d.number}
                  </text>
                  <g style={{ opacity: seatsIn * 0.6, transform: drift((1 - seatsIn) * 8) }}>
                    {[-18, 0, 18].map((dx) => (
                      <rect key={dx} x={x + dx - 6} y={y + 30} width="12" height="22" rx="6" fill="var(--color-cream)" />
                    ))}
                  </g>
                </g>
              );
            })}

            {pin && (
              // Map-pin shape with its point on the address.
              <g
                transform={`translate(${pin.x} ${pin.y})`}
                style={{ opacity: searchWeight }}
              >
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
        </div>
      </div>
    </section>
  );
}
