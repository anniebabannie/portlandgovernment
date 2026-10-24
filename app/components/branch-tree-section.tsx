import type { ReactNode } from "react";
import {
  drawIn,
  StoryCaptions,
  StoryIntros,
  useScrollStory,
  type StoryCaption,
} from "./scroll-story";

export type Branch = {
  name: string;
  /** Smaller second line under the name. */
  sub?: string;
  fill: string;
  text: string;
};

/** One scroll step after the tree is drawn. */
export type Beat = {
  caption: ReactNode;
  /** Index of the branch to spotlight; the others dim. */
  highlight?: number;
  /** Show arrows between branches. */
  checks?: boolean;
};

type Props = {
  id?: string;
  /** Full-screen lines shown one at a time before the diagram. */
  intros: ReactNode[];
  /** Where power comes from, drawn as a pill above the document. */
  source?: string;
  /** Text written on the founding document. */
  docTitle: string;
  /** Left, center, right. */
  branches: [Branch, Branch, Branch];
  /** Shown as the document appears. */
  docCaption: ReactNode;
  /** Shown as the branches appear. */
  treeCaption: ReactNode;
  beats?: Beat[];
  label: string;
};

const nodeX = [110, 300, 490];
const limbs = [
  "M300 230 C300 262 110 258 110 290",
  "M300 230 L300 290",
  "M300 230 C300 262 490 258 490 290",
];

// Double-headed arcs between branches, standing in for checks and balances.
const checks = [
  "M118 368 Q205 410 288 368",
  "M312 368 Q395 410 482 368",
  "M108 374 Q300 470 492 374",
];

/**
 * Pinned, scroll-driven diagram: a few setup lines, then a founding document
 * that grows into three branches, then any number of beats that spotlight a
 * branch or add arrows. Every step is tied to scroll position so readers set
 * the pace.
 */
export function BranchTreeSection({
  id,
  intros,
  source,
  docTitle,
  branches,
  docCaption,
  treeCaption,
  beats = [],
  label,
}: Props) {
  // One step per intro line, then the document, the branches and each beat.
  const docStep = intros.length;
  const treeStep = docStep + 1;
  const beatStep = (b: number) => treeStep + 1 + b;
  const story = useScrollStory(beatStep(beats.length));
  const { ref, between, drift } = story;

  const sourceIn = between(docStep, 0, docStep, 0.3);
  const sourceLine = between(docStep, 0.2, docStep, 0.4);
  const doc = between(docStep, source ? 0.3 : 0, docStep, source ? 0.6 : 0.4);
  const trunk = between(treeStep, 0, treeStep, 0.25);
  const limb = between(treeStep, 0.2, treeStep, 0.5);

  // The tree caption waits for the branches to draw.
  const captions: StoryCaption[] = [
    { node: docCaption, step: docStep, start: 0.15 },
    { node: treeCaption, step: treeStep, start: 0.65 },
    ...beats.map((b, i) => ({ node: b.caption, step: beatStep(i), start: 0.15 })),
  ];

  // How present each beat is right now. Neighbors cross-fade, so the
  // weights sum to about 1 during a hand-off.
  const beatWeight = beats.map((_, i) => {
    const s = beatStep(i);
    const fadeIn = between(s, 0, s, 0.2);
    const fadeOut = i < beats.length - 1 ? between(s + 1, 0, s + 1, 0.2) : 0;
    return fadeIn * (1 - fadeOut);
  });
  const sumWeights = (match: (b: Beat) => boolean) =>
    Math.min(1, beats.reduce((sum, b, i) => sum + (match(b) ? beatWeight[i] : 0), 0));
  const arcs = sumWeights((b) => !!b.checks);

  return (
    <section
      id={id}
      ref={ref}
      className="relative"
      style={{ height: story.height }}
    >
      <div className="sticky top-0 h-svh overflow-hidden">
        <StoryIntros story={story} intros={intros} />

        <div className="flex h-full flex-col items-center justify-center gap-6 px-6 sm:gap-10">
          <StoryCaptions story={story} captions={captions} />

          <svg
            // Shift the view up to make room for the source pill.
            viewBox={source ? "0 -70 600 540" : "0 0 600 470"}
            role="img"
            aria-label={label}
            className="w-full max-w-140 max-h-[55svh]"
            style={{ transform: drift((1 - between(docStep, 0, treeStep, 0.6)) * 32) }}
          >
            <defs>
              <marker
                id={`${id}-arrow`}
                viewBox="0 0 10 10"
                refX="5"
                refY="5"
                markerWidth="5"
                markerHeight="5"
                orient="auto-start-reverse"
              >
                <path d="M0 0 L10 5 L0 10z" fill="#3d3d3a" />
              </marker>
            </defs>

            {source && (
              <>
                <g style={{ opacity: sourceIn }}>
                  <rect x="210" y="-64" width="180" height="40" rx="20" fill="var(--color-paper)" stroke="var(--color-ink)" strokeWidth="2" />
                  <text x="300" y="-38" textAnchor="middle" fontSize="16" fontWeight="700" fill="var(--color-ink)">
                    {source}
                  </text>
                </g>
                <path d="M300 -24 L300 6" fill="none" stroke="var(--color-ink)" strokeWidth="4" strokeLinecap="round" {...drawIn(sourceLine)} />
              </>
            )}

            <g style={{ opacity: doc }}>
              <rect x="238" y="20" width="124" height="136" fill="#fffaf0" stroke="var(--color-flag-green)" strokeWidth="2" />
              <rect x="228" y="8" width="144" height="18" rx="9" fill="#ebdfbf" stroke="var(--color-flag-green)" strokeWidth="2" />
              <rect x="228" y="150" width="144" height="18" rx="9" fill="#ebdfbf" stroke="var(--color-flag-green)" strokeWidth="2" />
              <text x="300" y="54" textAnchor="middle" fontFamily="Georgia, serif" fontStyle="italic" fontSize="17" fill="var(--color-ink)">
                {docTitle}
              </text>
              {[70, 84, 98, 112, 126].map((y, i) => (
                <rect key={y} x="256" y={y} width={i % 2 ? 76 : 88} height="4" rx="2" fill="#cdbf9b" />
              ))}
            </g>

            <g fill="none" stroke="var(--color-ink)" strokeWidth="4" strokeLinecap="round">
              <path d="M300 170 L300 230" {...drawIn(trunk)} />
              {limbs.map((d) => (
                <path key={d} d={d} {...drawIn(limb)} />
              ))}
            </g>

            {branches.map((b, i) => {
              const t = between(treeStep, 0.45 + i * 0.08, treeStep, 0.6 + i * 0.08);
              const spotlit = sumWeights((beat) => beat.highlight === i);
              const dimmed = sumWeights(
                (beat) => beat.highlight !== undefined && beat.highlight !== i,
              );
              const x = nodeX[i];
              return (
                <g
                  key={b.name}
                  style={{
                    opacity: t * (1 - 0.75 * dimmed),
                    transform: `scale(${(0.85 + 0.15 * t) * (1 + 0.1 * spotlit)})`,
                    transformBox: "fill-box",
                    transformOrigin: "center",
                  }}
                >
                  <rect x={x - 85} y="290" width="170" height="64" rx="32" fill={b.fill} />
                  <text x={x} y="320" textAnchor="middle" fontSize="20" fontWeight="800" fill={b.text}>
                    {b.name}
                  </text>
                  <text x={x} y="340" textAnchor="middle" fontSize="13" fontWeight="500" fill={b.text}>
                    {b.sub}
                  </text>
                </g>
              );
            })}

            {arcs > 0 && (
              <g
                fill="none"
                stroke="#3d3d3a"
                strokeWidth="2.5"
                strokeLinecap="round"
                style={{ opacity: arcs, transform: drift((1 - arcs) * -12) }}
              >
                {checks.map((d) => (
                  <path key={d} d={d} markerStart={`url(#${id}-arrow)`} markerEnd={`url(#${id}-arrow)`} />
                ))}
              </g>
            )}
          </svg>
        </div>
      </div>
    </section>
  );
}
