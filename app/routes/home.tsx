import type { Route } from "./+types/home";
import {
  BranchTreeSection,
  type Branch,
} from "../components/branch-tree-section";
import { OrgTreeSection, type Office } from "../components/org-tree-section";
import { CountyMapSection } from "../components/county-map-section";
import { DistrictMapSection } from "../components/district-map-section";
import { DivisionTreeSection, type Division } from "../components/division-tree-section";
import { MetroSection } from "../components/metro-section";
import { UsMapSection } from "../components/us-map-section";

// Colors per kind of branch, so the federal and city trees line up.
const executive = { fill: "var(--color-flag-blue)", text: "var(--color-ink)" };
const legislative = { fill: "var(--color-flag-green)", text: "var(--color-cream)" };
const oversight = { fill: "var(--color-flag-gold)", text: "var(--color-ink)" };
// A pale tint of the Mayor's blue for the people the Mayor appoints.
const appointee = { fill: "#d6e6f8", text: "var(--color-ink)" };

const federalBranches: [Branch, Branch, Branch] = [
  { name: "Executive", sub: "The President", ...executive },
  { name: "Legislative", sub: "Congress", ...legislative },
  { name: "Judicial", sub: "Supreme Court", ...oversight },
];

// The City Administrator's service areas, per the City of Portland
// organization chart (spring 2025).
const serviceAreas: Office[] = [
  {
    name: "City Operations",
    lines: ["City", "Operations"],
    url: "https://www.portland.gov/city-operations",
    bureaus: [
      "311",
      "Budget",
      "Business Operations",
      "Communications",
      "Community-Based Police Accountability",
      "Fleet and Facilities",
      "Fire/Police Retirement",
      "Human Resources",
      "Procurement",
      "Security",
      "Technology Services",
    ],
    programs: ["Independent Police Review", "Grants", "Small Donor Elections"],
  },
  {
    name: "Community & Economic Development",
    lines: ["Community &", "Economic", "Development"],
    url: "https://www.portland.gov/service-areas/community-and-economic-development",
    bureaus: [
      "Housing",
      "Permitting & Development",
      "Planning & Sustainability",
      "Prosper Portland",
    ],
    programs: ["Spectator Venues", "Arts & Culture", "Children's Levy"],
  },
  {
    name: "Public Safety",
    lines: ["Public", "Safety"],
    url: "https://www.portland.gov/service-areas/public-safety",
    bureaus: [
      "Emergency Communications",
      "Emergency Management",
      "Fire & Rescue",
      "Police",
    ],
  },
  {
    name: "Public Works",
    lines: ["Public", "Works"],
    url: "https://www.portland.gov/service-areas/public-works",
    bureaus: [
      "Parks & Recreation",
      "Transportation",
      "Water and Environmental Services",
    ],
  },
];

// Positions in the City Attorney's Office, per its staff page.
const attorneyStaffPage = "https://www.portland.gov/attorney/general-information-and-staff";
const attorneyPositions: Office[] = [
  {
    name: "Chief Deputies",
    summary:
      "Senior attorneys who supervise the office's deputies, with authority delegated by the City Attorney.",
    url: attorneyStaffPage,
  },
  {
    name: "Deputy City Attorneys",
    summary:
      "Lawyers the City Attorney assigns to provide legal services to the city's bureaus and operations.",
    url: attorneyStaffPage,
  },
  {
    // TODO: confirm a description with the City Attorney's Office.
    name: "Honors Attorneys",
    summary: "Newer lawyers who start their careers in the City Attorney's Office.",
    url: attorneyStaffPage,
  },
];

// The Auditor's Office divisions. Summaries are condensed from each
// division's page on portland.gov.
const auditorDivisions: Division[] = [
  {
    name: "Audit Services",
    sub: "Runs the Fraud Hotline",
    summary:
      "The auditing arm of the Auditor's Office. It conducts performance audits of city operations and recommends ways to improve efficiency, effectiveness, and equity. It also runs the Fraud Hotline, a confidential way to report fraud, waste, or abuse involving the city.",
    url: "https://www.portland.gov/auditor/audit-services",
  },
  {
    name: "Ombudsman",
    summary:
      "Makes sure city government treats Portland residents and businesses fairly, by investigating complaints and finding ways to resolve them.",
    url: "https://www.portland.gov/auditor/ombudsman",
  },
  {
    name: "Hearings Office",
    summary:
      "Holds impartial hearings and makes decisions on land use, code violations, towing, appeals of city decisions, and other administrative matters.",
    url: "https://www.portland.gov/auditor/hearings",
  },
  {
    name: "Elections",
    summary:
      "Works with the state and counties to oversee city elections, certify candidates and measures for the ballot, and certify election results.",
    url: "https://www.portland.gov/auditor/elections",
  },
  {
    name: "Campaign Finance & Lobbying",
    lines: ["Campaign Finance", "& Lobbying"],
    summary:
      "Enforces the city's campaign contribution limits and disclosure rules, and requires lobbyists and political consultants to report their efforts to influence the city.",
    url: "https://www.portland.gov/auditor/elections/city-campaign-finance",
  },
  {
    name: "Council Clerk",
    summary:
      "Runs City Council business, keeps the city's official policy documents, and maintains the City Charter and Code.",
    url: "https://www.portland.gov/auditor/council-clerk",
  },
  {
    name: "Archives & Records",
    lines: ["Archives &", "Records"],
    summary:
      "Operates the Portland Archives & Records Center, making the city's administrative and historical records available for research.",
    url: "https://www.portland.gov/auditor/archives",
  },
  {
    name: "Operations Management",
    lines: ["Operations", "Management"],
    summary:
      "The Auditor's executive office, providing leadership and support for everything the Auditor's Office does.",
    url: "https://www.portland.gov/auditor/operations-management",
  },
];

// Offices Multnomah County voters elect.
const countyBoard = "https://multco.us/elected/board-county-commissioners";
const countyOffices: Office[] = [
  {
    name: "County Chair",
    summary:
      "Elected countywide. Leads the five-member Board of County Commissioners and serves as the county's chief executive.",
    url: countyBoard,
  },
  {
    name: "Sheriff",
    summary:
      "Runs the Multnomah County Sheriff's Office, which provides corrections (including the county jails), civil, and public safety services.",
    url: "https://www.mcso.us",
  },
  {
    name: "County Auditor",
    summary:
      "Independently examines county programs, investigates reports of fraud, waste, and abuse, and helps people resolve issues with county programs.",
    url: "https://multco.us/elected/auditors-office",
  },
  {
    name: "County Commissioners",
    summary:
      "Four commissioners, each elected from a district. Together with the Chair, they make up the Board of County Commissioners.",
    url: countyBoard,
  },
  {
    name: "District Attorney",
    summary:
      "Prosecutes crimes in Multnomah County. Though elected by county voters, the District Attorney is a state office.",
    url: "https://www.mcda.us",
  },
];

const cityBranches: [Branch, Branch, Branch] = [
  { name: "Mayor", sub: "Executive", ...executive },
  { name: "City Council", sub: "Legislative", ...legislative },
  { name: "Auditor", sub: "Independent oversight", ...oversight },
];

export function meta({}: Route.MetaArgs) {
  return [
    { title: "A Guide to Portland Government" },
    {
      name: "description",
      content: "A walkthrough of how Portland, Oregon's city government works.",
    },
  ];
}

export default function Home() {
  return (
    <main className="bg-cream">
      <section className="relative flex min-h-svh flex-col items-center justify-center px-6 py-24 text-center">
        <h1 className="flex flex-col items-center font-extrabold tracking-tight text-flag-green">
          <span className="text-2xl sm:text-4xl">A Guide to</span>
          <span className="text-6xl leading-none sm:text-8xl lg:text-9xl">
            Portland
          </span>
          <span className="text-5xl leading-none text-flag-blue sm:text-7xl lg:text-8xl">
            Government
          </span>
        </h1>

        {/* Gold and blue bars echo the stripes on the city flag. */}
        <div aria-hidden="true" className="mt-10 flex w-48 flex-col gap-2 sm:w-64">
          <span className="h-2.5 rounded-r-full bg-flag-gold" />
          <span className="h-2.5 rounded-l-full bg-flag-blue" />
        </div>

        <a
          href="#start"
          aria-label="Start the guide"
          className="absolute bottom-10 rounded-full p-2 text-flag-green focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-flag-green motion-safe:animate-bounce"
        >
          <svg
            viewBox="0 0 24 24"
            className="size-10"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 4v16M5 13l7 7 7-7" />
          </svg>
        </a>
      </section>

      <BranchTreeSection
        id="start"
        intros={["Let's start with what you already know."]}
        docTitle="We the People"
        branches={federalBranches}
        label="The Constitution, branching into the Executive branch (the President), the Legislative branch (Congress), and the Judicial branch (the Supreme Court), with arrows between each pair showing checks and balances."
        docCaption={
          <>
            The federal government derives its powers from (and is limited by)
            the <span className="text-flag-green">Constitution</span>.
          </>
        }
        treeCaption={
          <>
            It defines three branches of government:{" "}
            <span className="text-flag-blue-dark">Executive</span>,{" "}
            <span className="text-flag-green">Legislative</span>, and{" "}
            <span className="text-flag-gold-dark">Judicial</span>.
          </>
        }
        beats={[
          {
            checks: true,
            caption: (
              <>
                Each branch provides checks and balances, so none get too big
                for their britches (hopefully).
              </>
            ),
          },
        ]}
      />

      <BranchTreeSection
        id="city"
        intros={[
          "How does Portland's municipal government compare?",
          "Portland, too, has three main branches, but they operate a little differently.",
        ]}
        source="State of Oregon"
        docTitle="City Charter"
        branches={cityBranches}
        label="The State of Oregon grants power to the City Charter, which branches into the Mayor, the City Council, and the Auditor."
        docCaption={
          <>
            The city derives its power from the state of Oregon, and is limited
            by the <span className="text-flag-green">City Charter</span>.
          </>
        }
        treeCaption={
          <>
            There are three offices we vote for: the{" "}
            <span className="text-flag-blue-dark">Mayor</span>,{" "}
            <span className="text-flag-green">City Councilors</span>, and the{" "}
            <span className="text-flag-gold-dark">Auditor</span>.
          </>
        }
        beats={[
          {
            highlight: 0,
            caption: (
              <>
                The <span className="text-flag-blue-dark">Mayor</span> handles
                the executive tasks of government.
              </>
            ),
          },
          {
            highlight: 1,
            caption: (
              <>
                <span className="text-flag-green">City Council</span> passes
                laws.
              </>
            ),
          },
          {
            highlight: 2,
            caption: (
              <>
                The <span className="text-flag-gold-dark">Auditor</span> checks
                to see that the government is doing its job well and by its own
                rules.
              </>
            ),
          },
          {
            highlight: 2,
            caption: (
              <>
                Note: The <span className="text-flag-gold-dark">Auditor</span>{" "}
                might sound like it's checking the city the way the Supreme
                Court does, but it's not.
              </>
            ),
          },
          {
            highlight: 2,
            caption: (
              <>
                It's an independent watchdog, with no power to shoot down laws.
              </>
            ),
          },
          {
            caption: (
              <>
                In fact, Portland does <em>not</em> have a judicial branch of
                its own. Legal challenges to city laws go to the state courts.
              </>
            ),
          },
        ]}
      />

      <OrgTreeSection
        id="mayor"
        intros={["Let's look at each branch more closely."]}
        root={{ name: "Mayor", sub: "Elected citywide", ...executive }}
        reports={[
          { id: "admin", name: "City Administrator", ...appointee },
          { id: "chief", name: "Police Chief", ...appointee },
          { id: "attorney", name: "City Attorney", ...appointee },
        ]}
        subs={[{ id: "bureau", under: "chief", name: "Police Bureau", ...appointee }]}
        groups={[
          { id: "service-areas", under: "admin", offices: serviceAreas },
          { id: "attorney-staff", under: "attorney", offices: attorneyPositions },
        ]}
        label="The Mayor appoints three positions: the City Administrator, the Police Chief, and the City Attorney. The City Administrator oversees four service areas: City Operations, Community & Economic Development, Public Safety, and Public Works."
        beats={[
          {
            show: [],
            caption: (
              <>
                The <span className="text-flag-blue-dark">Mayor</span> is the
                office that runs the day-to-day stuff.
              </>
            ),
          },
          {
            show: [],
            caption: (
              <>
                They're responsible for directing the budget, carrying out the
                laws City Council passes, and overseeing city bureaus like
                Police, Water, and Parks.
              </>
            ),
          },
          {
            show: ["admin", "chief", "attorney"],
            caption: (
              <>
                The <span className="text-flag-blue-dark">Mayor</span> appoints
                three key positions: the City Administrator, the Police Chief,
                and the City Attorney.
              </>
            ),
          },
          {
            show: ["admin", "chief", "attorney"],
            highlight: "admin",
            caption: (
              <>
                The City Administrator manages the day-to-day operations across
                city bureaus.
              </>
            ),
          },
          {
            show: ["admin", "chief", "attorney"],
            highlight: "admin",
            group: "service-areas",
            caption: <>The City Administrator oversees four service areas.</>,
          },
          {
            show: ["admin", "chief", "attorney"],
            highlight: "admin",
            group: "service-areas",
            caption: <>Click a service area to learn more, or keep scrolling.</>,
          },
          {
            show: ["admin", "chief", "attorney"],
            subs: ["bureau"],
            highlight: "chief",
            caption: <>The Police Chief leads the Portland Police Bureau.</>,
          },
          {
            show: ["admin", "chief", "attorney"],
            subs: ["bureau"],
            highlight: "chief",
            caption: <>Here's where it gets confusing:</>,
          },
          {
            show: ["admin", "chief", "attorney"],
            subs: ["bureau"],
            group: "service-areas",
            groupHighlight: "Public Safety",
            link: { from: "bureau", to: "Public Safety" },
            caption: (
              <>
                The Police Bureau operates under the Public Safety service area.
              </>
            ),
          },
          {
            show: ["admin", "chief", "attorney"],
            subs: ["bureau"],
            group: "service-areas",
            groupHighlight: "Public Safety",
            link: { from: "bureau", to: "Public Safety" },
            caption: (
              <>
                Yeah, city government is weird like that.
                <span className="block">¯\_(ツ)_/¯</span>
              </>
            ),
          },
          {
            show: ["admin", "chief", "attorney"],
            highlight: "attorney",
            caption: (
              <>
                The City Attorney provides legal services to the City of
                Portland.
              </>
            ),
          },
          {
            show: ["admin", "chief", "attorney"],
            highlight: "attorney",
            caption: (
              <>
                Note: this position serves the city itself, not the public
                (individual residents).
              </>
            ),
          },
          {
            show: ["admin", "chief", "attorney"],
            highlight: "attorney",
            group: "attorney-staff",
            caption: <>There are three main positions under the City Attorney:</>,
          },
          {
            show: ["admin", "chief", "attorney"],
            highlight: "attorney",
            group: "attorney-staff",
            caption: <>Click a position to learn more, or keep scrolling.</>,
          },
        ]}
      />

      <DistrictMapSection
        id="council"
        intros={["Next up: City Council"]}
        label="Map of Portland divided into four council districts, each with three council seats."
        beats={[
          {
            seats: true,
            caption: (
              <>
                Each district in Portland gets three{" "}
                <span className="text-flag-green">city councilors</span>.
              </>
            ),
          },
          {
            seats: true,
            caption: (
              <>
                <span className="text-flag-green">City councilors</span> make the
                laws and have <span className="underline decoration-flag-gold decoration-[3px] underline-offset-[6px]">quasi-judicial</span> powers.
              </>
            ),
          },
          {
            seats: true,
            caption: (
              <>
                <span className="underline decoration-flag-gold decoration-[3px] underline-offset-[6px]">Quasi-judicial</span> means acting like a judge: applying existing
                rules to a specific case, with a fair hearing.
              </>
            ),
          },
          {
            seats: true,
            search: true,
            caption: <>Search for your district, or keep scrolling.</>,
          },
        ]}
      />

      <DivisionTreeSection
        id="auditor"
        intros={["Lastly: the Auditor"]}
        root={{ name: "Auditor", sub: "Elected citywide", ...oversight }}
        divisionStyle={{ fill: "var(--color-paper)", stroke: "var(--color-flag-gold)" }}
        divisions={auditorDivisions}
        label="The Auditor oversees eight divisions: Audit Services (which runs the Fraud Hotline), the Ombudsman, the Hearings Office, Elections, Campaign Finance & Lobbying, the Council Clerk, Archives & Records, and Operations Management."
        beats={[
          {
            caption: (
              <>
                The <span className="text-flag-gold-dark">Auditor</span>'s job is
                to investigate how well the city government is doing its job.
              </>
            ),
          },
          {
            caption: (
              <>
                The <span className="text-flag-gold-dark">Auditor</span> is
                independent from other city offices.
              </>
            ),
          },
          {
            caption: (
              <>
                No one else in city government is the{" "}
                <span className="text-flag-gold-dark">Auditor</span>'s boss.
              </>
            ),
          },
          {
            caption: (
              <>
                Or rather, the <em>voters</em> are the boss.
              </>
            ),
          },
          {
            divisions: true,
            caption: (
              <>
                The <span className="text-flag-gold-dark">Auditor</span>'s
                office is made up of eight divisions:
              </>
            ),
          },
          {
            divisions: true,
            caption: (
              <>
                Each division supports the{" "}
                <span className="text-flag-gold-dark">Auditor</span>’s role as an
                independent check on city government.
              </>
            ),
          },
          {
            divisions: true,
            caption: <>Click a division to learn more, or keep scrolling.</>,
          },
        ]}
      />

      <CountyMapSection
        id="county"
        intros={["Now, let's zoom out."]}
        highlight="Portland"
        label="Map of Multnomah County. Portland covers most of the western half. Gresham, Troutdale, Fairview, Wood Village, Maywood Park, and part of Lake Oswego are the other cities in the county; the rest is unincorporated."
        captions={[
          <>
            <span className="text-flag-green">Portland</span> belongs to
            Multnomah County.
          </>,
        ]}
        tree={{
          root: { name: "Voters", fill: "#cfccc4", text: "var(--color-ink)" },
          offices: countyOffices,
          label:
            "Voters elect five county offices: the County Chair, the Sheriff, the County Auditor, the County Commissioners, and the District Attorney.",
          captions: [
            <>Residents vote on these five main offices:</>,
            <>Click each to learn more, or keep scrolling.</>,
          ],
        }}
      />

      <MetroSection
        id="metro"
        intros={["Now, here's where things get a little confusing."]}
        label="Map that starts on Multnomah County, with Portland inside it, then zooms out to Washington, Multnomah, and Clackamas counties. Metro's boundary covers the urban parts of all three. Zoomed out further, the Portland metro area is much larger, spanning seven counties in Oregon and Washington."
        captions={[
          <>
            <span className="text-flag-green">Portland</span> lives in
            Multnomah. Cool.
          </>,
          <>
            But there's{" "}
            <span className="underline decoration-flag-gold decoration-[3px] underline-offset-[6px]">
              another region
            </span>{" "}
            that overlaps with several nearby counties.
          </>,
          <>
            It's called <span className="text-flag-blue-dark">Metro</span>. Yes,
            just “Metro.” It's the only one in Oregon.
          </>,
          <>
            <span className="text-flag-blue-dark">Metro</span>'s boundaries were
            drawn based on the primary urban areas in this region.
          </>,
          <>
            It's a government that oversees problems that don't stop at city
            limits, across the three counties it overlaps.
          </>,
          <>
            Note: <span className="text-flag-blue-dark">Metro</span> is{" "}
            <strong className="font-extrabold">not</strong> the same as the
            “Portland metro area.”
          </>,
          <>
            <span className="text-flag-blue-dark">Metro</span> is a government.
            The Portland metro area is a <em>statistical</em> boundary. It has
            no elected or appointed officials.
          </>,
        ]}
        metroAreaAt={5}
      />

      <UsMapSection
        id="voting"
        intros={[
          <>
            Finally, let's talk about{" "}
            <span className="underline decoration-flag-gold decoration-[5px] underline-offset-[10px]">
              voting
            </span>
            .
          </>,
          <>
          Your ballot likely lists <span className="underline decoration-flag-gold decoration-[5px] underline-offset-[10px]">way more</span> more positions than what we've covered.
          </>,
          "Yikes, am I right?",
          "Let's simplify things.",
        ]}
        label="Map of the United States with Oregon highlighted. A star marks Washington, DC, labeled US House. A star marks Salem, Oregon, labeled Oregon House and Senate."
        captions={[
          <>
            Every November, in{" "}
            <span className="underline decoration-flag-gold decoration-[3px] underline-offset-[6px]">
              even
            </span>{" "}
            years, we vote on: US House Reps, Oregon House Reps, Oregon Senate.
          </>,
        ]}
        then={{
          steps: [
            {
              show: "documents",
              caption: (
                <>
                  This is also when we vote on{" "}
                  <span className="underline decoration-flag-gold decoration-[3px] underline-offset-[6px]">
                    measures
                  </span>
                  : rules that voters decide directly. If passed, these can become
                  any of the following:
                </>
              ),
            },
            {
              caption: (
                <>
                  Elections happen on two-year and staggered four-year cycles.
                </>
              ),
            },
            { show: "jurisdictions" },
          ],
          documents: [
            { label: "Laws", symbol: "§" },
            { label: "Charter or constitutional amendments", symbol: "+" },
            { label: "Tax levies", symbol: "%" },
            { label: "Bonds", symbol: "$" },
          ],
          jurisdictions: [
            { label: "United States", shape: "us" },
            { label: "Oregon", shape: "oregon" },
            { label: "Metro", shape: "metro" },
            { label: "Multnomah County", shape: "county" },
            { label: "City of Portland", shape: "portland" },
          ],
        }}
      />
    </main>
  );
}
