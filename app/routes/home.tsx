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
import { RankedChoiceSection } from "../components/ranked-choice-section";
import { PamphletSection } from "../components/pamphlet-section";
import { ActionSection } from "../components/action-section";
import { PortlandFlag } from "../components/portland-flag";
import { VotingSection, type Jurisdiction } from "../components/voting-section";

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
    name: "County Commissioners",
    summary:
      "Four commissioners, each elected from a district. Together with the Chair, they make up the Board of County Commissioners.",
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
    name: "District Attorney",
    summary:
      "Prosecutes crimes in Multnomah County. Though elected by county voters, the District Attorney is a state office.",
    url: "https://www.mcda.us",
  },
];

// What sits under each county office. Department summaries are condensed
// from multco.us/departments; the Sheriff's divisions from its FY 2027
// budget; the DA's divisions from mcda.us.
const countyDepartmentsPage = "https://multco.us/departments";
const countyDepartments: Office[] = [
  {
    name: "Health",
    summary: "Works with communities to promote and protect the health of everyone in the county.",
    url: countyDepartmentsPage,
  },
  {
    name: "Human Services",
    summary:
      "Supports the county's most vulnerable residents, including older adults, people with disabilities, and veterans.",
    url: countyDepartmentsPage,
  },
  {
    name: "Homeless Services",
    summary: "Coordinates funding to address homelessness in Portland and Multnomah County.",
    url: countyDepartmentsPage,
  },
  {
    name: "Community Justice",
    summary:
      "Works with people at risk of crime, accused of crimes, detained, or on parole and probation, including young people.",
    url: countyDepartmentsPage,
  },
  {
    name: "Community Services",
    summary:
      "Runs Animal Services, Elections, Land Use Planning, and county Transportation, including the Willamette River bridges.",
    url: countyDepartmentsPage,
  },
  {
    name: "County Assets",
    summary: "Manages the county's technology, buildings, vehicles, and records.",
    url: countyDepartmentsPage,
  },
  {
    name: "County Management",
    summary:
      "Runs the county's administrative backbone: budget, finance, human resources, and property assessment and taxation.",
    url: countyDepartmentsPage,
  },
  {
    name: "Library",
    summary: "Runs Multnomah County Library and its 19 neighborhood libraries.",
    url: countyDepartmentsPage,
  },
];

const sheriffPage = "https://www.mcso.us/about-mcso";
const sheriffDivisions: Office[] = [
  {
    name: "Corrections",
    summary:
      "Runs the county's two jails, the Multnomah County Detention Center and Inverness Jail, plus a pretrial services program.",
    url: sheriffPage,
  },
  {
    name: "Law Enforcement",
    summary:
      "Patrols unincorporated areas, the cities of Troutdale, Fairview, Wood Village, and Maywood Park, and more than 100 miles of waterways.",
    url: sheriffPage,
  },
  {
    name: "Agency Services",
    summary:
      "Provides security for the jails and courthouses, serves the courts, transports people in custody, and keeps records.",
    url: sheriffPage,
  },
  {
    name: "Business Services",
    summary: "Handles the office's budget, technology, planning and research, and training.",
    url: sheriffPage,
  },
];

const countyAuditorPage = "https://multco.us/elected/auditors-office";
const countyAuditorUnits: Office[] = [
  {
    name: "Performance Audits",
    summary: "Independently examines county programs and recommends ways to improve them.",
    url: countyAuditorPage,
  },
  {
    name: "Good Government Hotline",
    summary:
      "A place for county employees and residents to report suspected fraud, abuse of position, and misuse of county resources.",
    url: countyAuditorPage,
  },
  {
    name: "Ombudsperson",
    summary: "Helps people resolve issues with a county program or department.",
    url: countyAuditorPage,
  },
];

const daDivisionsPage = "https://www.mcda.us/index.php/about-the-da/departments";
const daDivisions: Office[] = [
  {
    name: "Violent Crimes",
    summary:
      "Prosecutes homicide, assault, sex crimes, robbery, burglary, gun crimes, and vehicular homicide.",
    url: daDivisionsPage,
  },
  {
    name: "Family Justice & Community Impact",
    summary: "Handles domestic violence, child abuse, juvenile, and misdemeanor cases.",
    url: daDivisionsPage,
  },
  {
    name: "Diversion & Strategic Prosecution",
    summary:
      "Handles diversion programs, pretrial matters, property and drug crimes, and child support enforcement.",
    url: daDivisionsPage,
  },
  {
    name: "Investigations",
    summary:
      "District Attorney investigators who follow up on cases police submit and get them ready for trial.",
    url: daDivisionsPage,
  },
];

// A made-up ranked-choice race, for showing how the count works. Out of 100
// votes; a candidate's count is 0 once they're eliminated.
const rcvCandidates = [
  { name: "Avery", color: "var(--color-flag-blue)" },
  { name: "Maria", color: "var(--color-flag-green)" },
  // Gold is too light for text on cream, so the name uses the dark gold.
  { name: "Casey", color: "var(--color-flag-gold)", textColor: "var(--color-flag-gold-dark)" },
  { name: "Drew", color: "#b8b3a7" },
];
const rcvRounds = [
  [38, 30, 20, 12],
  // Drew's 12 votes: 8 to Maria, 4 to Casey.
  [38, 38, 24, 0],
  // Casey's 24 votes: 9 to Avery, 15 to Maria.
  [47, 53, 0, 0],
];

// Offices voters elect in Metro's region.
const metroCouncil = "https://www.oregonmetro.gov/about-metro/metro-council";
const metroOffices: Office[] = [
  {
    name: "Metro Council President",
    summary: "Elected regionwide. Leads the seven-member Metro Council.",
    url: metroCouncil,
  },
  {
    name: "Metro Councilors",
    summary:
      "Six councilors, each elected from a district every four years in nonpartisan races. With the president, they make up the Metro Council.",
    url: metroCouncil,
  },
  {
    name: "Metro Auditor",
    summary: "Elected regionwide. Audits Metro's programs and reports on its finances.",
    url: "https://www.oregonmetro.gov/about-metro/metro-auditor",
  },
];

// Metro's work, per oregonmetro.gov's "How Metro works." The Council
// appoints a Chief Operating Officer to run it.
const howMetroWorks = "https://www.oregonmetro.gov/how-metro-works";
const metroWork: Office[] = [
  {
    name: "Housing & Homeless Services",
    summary:
      "Funds affordable housing and supportive services for people experiencing homelessness across the region, through voter-approved measures.",
    url: howMetroWorks,
  },
  {
    name: "Parks & Nature",
    summary: "Manages regional parks, natural areas, and trails.",
    url: howMetroWorks,
  },
  {
    name: "Garbage & Recycling",
    summary:
      "Plans the region's garbage and recycling system and runs its transfer stations and hazardous waste facilities.",
    url: howMetroWorks,
  },
  {
    name: "Land Use & Transportation",
    summary:
      "Manages the region's urban growth boundary and plans regional transportation.",
    url: howMetroWorks,
  },
  {
    name: "Venues",
    summary:
      "Runs the Oregon Convention Center, the Oregon Zoo, Portland'5 Centers for the Arts, and the Portland Expo Center.",
    url: howMetroWorks,
  },
];

const metroAuditorPage = "https://www.oregonmetro.gov/about-metro/metro-auditor";
const metroAuditorWork: Office[] = [
  {
    name: "Performance Audits",
    summary:
      "Reviews Metro's operations to improve their efficiency, effectiveness, and equity.",
    url: metroAuditorPage,
  },
  {
    name: "Financial Statements",
    summary: "Oversees Metro's annual financial statements.",
    url: metroAuditorPage,
  },
  {
    name: "Accountability Hotline",
    summary:
      "Gives employees and the public a way to report fraud, waste, or abuse of resources or position at Metro.",
    url: metroAuditorPage,
  },
];

// What voters elect at each level of government.
const electionLevels: Jurisdiction[] = [
  {
    level: "Federal",
    label: "United States",
    shape: "us",
    positions: ["President and Vice President", "U.S. Senator", "U.S. Representative"],
  },
  {
    level: "State",
    label: "Oregon",
    shape: "oregon",
    positions: [
      "Governor",
      "Secretary of State",
      "State Treasurer",
      "Attorney General",
      "Labor Commissioner",
      "State Senator",
      "State Representative",
      "Oregon Supreme Court judges",
      "Oregon Court of Appeals judges",
      "Oregon Tax Court judge",
    ],
  },
  {
    level: "Regional",
    label: "Metro",
    shape: "metro",
    positions: ["Metro Council President", "Metro Councilor", "Metro Auditor"],
  },
  {
    level: "County",
    label: "Multnomah",
    shape: "county",
    positions: [
      "County Chair",
      "County Commissioner",
      "Sheriff",
      "District Attorney",
      "County Auditor",
      "Circuit Court judges*",
    ],
  },
  {
    level: "City",
    label: "Portland",
    shape: "portland",
    positions: ["Mayor", "City Councilors", "City Auditor"],
  },
  {
    level: "Special",
    label: "Districts",
    shape: "special",
    positions: [
      "School board",
      "Community college board",
      "Soil and water conservation district directors",
      "Water or utility district directors",
    ],
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
        <p className="mt-6 inline-flex items-center gap-2 rounded-full border-2 border-flag-gold px-4 py-1.5 text-xs font-bold tracking-[0.2em] text-flag-green uppercase sm:mt-8 sm:gap-2.5 sm:px-5 sm:py-2 sm:text-sm">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="size-4 sm:size-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
          In 10 minutes or less
        </p>

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
            The federal government derives its powers from, and is limited by,
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
          "How does Portland's government compare?",
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
                The <span className="text-flag-blue-dark">Mayor</span> leads the
                city's executive branch.
              </>
            ),
          },
          {
            show: [],
            caption: (
              <>
                They propose the budget, carry out Council's laws, and oversee
                bureaus like Police, Water, and Parks.
              </>
            ),
          },
          {
            show: ["admin", "chief", "attorney"],
            caption: (
              <>
                The <span className="text-flag-blue-dark">Mayor</span> appoints
                3 key positions:
              </>
            ),
          },
          {
            show: ["admin", "chief", "attorney"],
            highlight: "admin",
            caption: (
              <>
                The City Administrator runs the day-to-day operations of city
                bureaus on the Mayor's behalf.
              </>
            ),
          },
          {
            show: ["admin", "chief", "attorney"],
            highlight: "admin",
            group: "service-areas",
            caption: <>The City Administrator oversees 4 service areas.</>,
          },
          {
            show: ["admin", "chief", "attorney"],
            highlight: "admin",
            group: "service-areas",
            caption: (
              <>
                Each service area is a group of{" "}
                <span className="underline decoration-flag-gold decoration-[3px] underline-offset-[6px]">
                  bureaus
                </span>
                : the departments that do the actual work, like Water, Housing,
                or Fire & Rescue.
              </>
            ),
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
            caption: <>But here's a little quirk:</>,
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
          groups: [
            { id: "departments", under: "County Chair", offices: countyDepartments },
            { id: "sheriff", under: "Sheriff", offices: sheriffDivisions },
            { id: "county-auditor", under: "County Auditor", offices: countyAuditorUnits },
            { id: "da", under: "District Attorney", offices: daDivisions },
          ],
          label:
            "Voters elect five county offices: the County Chair, the County Commissioners, the Sheriff, the County Auditor, and the District Attorney. The Chair runs eight county departments: Health, Human Services, Homeless Services, Community Justice, Community Services, County Assets, County Management, and the Library. The Sheriff's Office has four divisions: Corrections, Law Enforcement, Agency Services, and Business Services. The County Auditor's Office runs Performance Audits, the Good Government Hotline, and the Ombudsperson. The District Attorney's Office has four divisions: Violent Crimes, Family Justice & Community Impact, Diversion & Strategic Prosecution, and Investigations.",
          beats: [
            { caption: <>Residents vote on these five main offices:</> },
            {
              highlight: ["County Chair"],
              caption: (
                <>
                  The County Chair is the county's chief executive.
                </>
              ),
            },
            {
              highlight: ["County Commissioners"],
              caption: (
                <>
                  The four County Commissioners each represent a district of
                  the county.
                </>
              ),
            },
            {
              highlight: ["County Commissioners", "County Chair"],
              bracket: {
                names: ["County Chair", "County Commissioners"],
                label: "Board of County Commissioners",
              },
              caption: (
                <>
                  Together with the Chair, they make up the <span className="underline decoration-flag-gold decoration-[3px] underline-offset-[6px]">Board of County Commissioners</span>
                  , which passes county laws and adopts the budget.
                </>
              ),
            },
            {
              highlight: ["County Chair"],
              group: "departments",
              caption: (
                <>
                  The Chair runs the county's departments and picks who leads
                  each one, with the Board's approval.
                </>
              ),
            },
            {
              highlight: ["Sheriff"],
              caption: (
                <>
                  The Sheriff runs the county jails and patrols the parts of
                  the county without their own police.
                </>
              ),
            },
            {
              highlight: ["Sheriff"],
              group: "sheriff",
              caption: <>The Sheriff's Office has four divisions:</>,
              sub: <>Click a department to learn more, or keep scrolling.</>,
            },
            {
              highlight: ["County Auditor"],
              caption: (
                <>
                  The County Auditor checks how well county programs work, much
                  like Portland's city Auditor.
                </>
              ),
            },
            {
              highlight: ["County Auditor"],
              group: "county-auditor",
              caption: <>The Auditor's Office has three main parts:</>,
              sub: <>Click a department to learn more, or keep scrolling.</>,
            },
            {
              highlight: ["District Attorney"],
              caption: (
                <>
                  The District Attorney (DA) prosecutes crimes committed in the
                  county.
                </>
              ),
            },
            {
              highlight: ["District Attorney"],
              group: "da",
              caption: <>The DA's Office has four divisions:</>,
              sub: <>Click any office to learn more, or keep scrolling.</>
            },
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
        tree={{
          at: 5,
          root: { name: "Voters", fill: "#cfccc4", text: "var(--color-ink)" },
          offices: metroOffices,
          groups: [
            {
              id: "metro-work",
              under: ["Metro Council President", "Metro Councilors"],
              offices: metroWork,
            },
            { id: "metro-auditor", under: "Metro Auditor", offices: metroAuditorWork },
          ],
          districtsLabel:
            "Map of Metro's six council districts, which span parts of Washington, Multnomah, and Clackamas counties. Portland, outlined, falls mostly in Districts 5 and 6, with East Portland in District 1 and a sliver of the south in District 2.",
          label:
            "Voters elect three kinds of Metro positions: the Metro Council President, Metro Councilors, and the Metro Auditor. Together, the President and Councilors make up the Metro Council, which appoints a Chief Operating Officer to run Metro's work in five areas: Housing & Homeless Services, Parks & Nature, Garbage & Recycling, Land Use & Transportation, and Venues. The Metro Auditor runs Performance Audits, oversees Metro's Financial Statements, and runs the Accountability Hotline.",
          beats: [
            {
              caption: (
                <>
                  Every four years, voters elect the following{" "}
                  <span className="text-flag-blue-dark">Metro</span> positions:
                </>
              ),
            },
            {
              highlight: ["Metro Council President"],
              caption: (
                <>
                  The Council President is elected by voters across the whole
                  region, and leads the Council.
                </>
              ),
            },
            {
              highlight: ["Metro Councilors"],
              figure: "districts",
              caption: <>The six Metro Councilors each represent a district.</>,
            },
            {
              highlight: ["Metro Councilors"],
              figure: "districts",
              caption: (
                <>
                  These are <em>not</em> the same districts as Portland's City
                  Council.
                </>
              ),
            },
            {
              highlight: ["Metro Councilors"],
              figure: "districts",
              search: true,
              caption: <>Search for your Metro district, or keep scrolling.</>,
            },
            {
              highlight: ["Metro Council President", "Metro Councilors"],
              bracket: {
                names: ["Metro Council President", "Metro Councilors"],
                label: "Metro Council",
              },
              caption: (
                <>
                  Together, these offices make up the <span className="underline decoration-flag-gold decoration-[3px] underline-offset-[6px]">Metro Council</span>, which sets{" "}
                  <span className="text-flag-blue-dark">Metro</span>'s policies
                  and budget.
                </>
              ),
            },
            {
              highlight: ["Metro Council President", "Metro Councilors"],
              bracket: {
                names: ["Metro Council President", "Metro Councilors"],
                label: "Metro Council",
              },
              group: "metro-work",
              caption: (
                <>
                  The Council appoints a Chief Operating Officer to run{" "}
                  <span className="text-flag-blue-dark">Metro</span>'s work in
                  five areas:
                </>
              ),
              sub: <>Click an area to learn more, or keep scrolling.</>,
            },
            {
              highlight: ["Metro Auditor"],
              group: "metro-auditor",
              caption: <>The Metro Auditor's office checks how well <span className="text-flag-blue-dark">Metro</span> is doing its job:</>,
            },
            {
              highlight: ["Metro Auditor"],
              group: "metro-auditor",
              caption: <>It's basically the <span className="text-flag-blue-dark">Metro</span>'s version of Portland's city Auditor.</>,
            },
          ],
        }}
      />

      <VotingSection
        id="voting"
        intros={[
          "Now, why does any of this matter?",
          <>
            Because{" "}
            <span className="underline decoration-flag-gold decoration-[5px] underline-offset-[10px]">
              voting
            </span>{" "}
            matters.
          </>,
          "But let's face it: local elections can feel complicated.",
          <>
          Your ballot likely lists <span className="underline decoration-flag-gold decoration-[5px] underline-offset-[10px]">way more</span> positions than what we've covered.
          </>,
          "Let's simplify things.",
          <>
            Elections happen <span className="underline decoration-flag-gold decoration-[5px] underline-offset-[10px]">every year</span>.
          </>
        ]}
        label="Map of the United States with Oregon highlighted. A star marks Washington, DC, labeled US House. A star marks Salem, Oregon, labeled Oregon House and Senate."
        steps={[
          {
            show: "jurisdictions",
            caption: (
              <>
                Your ballot will have candidates for <span className="underline decoration-flag-gold decoration-[3px] underline-offset-[6px]">positions</span> whose terms are ending or have vacant seats.
              </>
            ),
          },
          {
            show: "documents",
            caption: (
              <>
                Your ballot will also have {" "}
                <span className="underline decoration-flag-gold decoration-[3px] underline-offset-[6px]">
                  measures
                </span>
                : rules that voters decide directly.
              </>
            ),
          },
          {
            show: "documents",
            caption: <>If passed, these can become any of the following:</>,
            sub: <>Click each to learn more, or keep scrolling.</>,
          },
        ]}
        documents={[
          {
            label: "Laws",
            symbol: "§",
            summary:
              "A new law, or a change to an existing one, decided directly by voters. Depending on the measure, it could be a state law or a local one for a city, a county, or a regional government like Metro.",
          },
          {
            label: "Charter or constitutional amendments",
            symbol: "+",
            summary:
              "Changes to a government's founding document: the Oregon Constitution, or a local charter like Portland's, Multnomah County's, or Metro's. Portland's current form of government came from a 2022 charter amendment.",
          },
          {
            label: "Tax levies",
            symbol: "%",
            summary:
              "Lets a local government collect extra property taxes for a specific purpose, like parks or libraries. A levy for day-to-day costs can last up to five years; one for building projects, up to ten.",
          },
          {
            label: "Bonds",
            symbol: "$",
            summary:
              "Lets a government borrow money for big projects, like buildings, parks, or affordable housing, and pay it back over time, usually through property taxes.",
          },
        ]}
        jurisdictions={electionLevels}
        jurisdictionsNote="* State judges, elected by county voters."
      />

      <RankedChoiceSection
        id="ranked-choice"
        intros={[
          <>
            Lastly, let's talk about{" "}
            <span className="underline decoration-flag-gold decoration-[5px] underline-offset-[10px]">
              ranked-choice voting
            </span>
            .
          </>,
        ]}
        candidates={rcvCandidates}
        ballot={[0, 1, 2]}
        rankColumns={4}
        // Not in ranked order, so the marks don't step down in a tidy diagonal.
        ballotRows={[1, 3, 0, 2]}
        rounds={rcvRounds}
        ballotLabel="A sample ballot with four candidates and four ranking columns. This voter ranks Avery first, Maria second, and Casey third, and leaves Drew unranked."
        countLabel="A sample count of 100 votes. Round 1: Avery 38, Maria 30, Casey 20, Drew 12. Drew is eliminated and those votes move to their next choices. Round 2: Avery 38, Maria 38, Casey 24. Casey is eliminated. Round 3: Maria 53, Avery 47, so Maria wins with more than half."
        districtsLabel="Map of Portland's four City Council districts. Each district elects three councilors."
        councilCount={{
          candidates: [
            { name: "Harper", color: "var(--color-flag-blue)" },
            { name: "Jesse", color: "var(--color-flag-green)" },
            { name: "Kai", color: "var(--color-flag-gold)" },
            { name: "Morgan", color: "var(--color-flag-blue-dark)" },
            { name: "Rowan", color: "#b8b3a7" },
          ],
          rounds: [
            [31, 27, 18, 14, 10],
            // Out of 100 votes, 25% + 1 is 26. Harper's 5 extra votes go
            // 3 to Kai, 1 to Morgan, 1 to Rowan; Jesse's 1 extra goes to Kai.
            [26, 26, 22, 15, 11],
            // No one else reached 26, so Rowan (last) is eliminated: 5 to
            // Kai, 6 to Morgan. Kai reaches 26, filling the third seat.
            [26, 26, 27, 21, 0],
          ],
          wonAt: [1, 1, 2, -1, -1],
          label:
            "A sample council race, out of 100 votes. Round 1: Harper 31, Jesse 27, Kai 18, Morgan 14, Rowan 10. Harper and Jesse are over the 25% + 1 line of 26 votes. Round 2: both win a seat and keep 26 votes each; their extra votes move to their voters' next choices, bringing Kai to 22, Morgan to 15, and Rowan to 11. Round 3: no one else has 26, so Rowan is eliminated and those votes move on, bringing Kai to 27 and Morgan to 21. Kai wins the third seat.",
        }}
        councilLabel="Three council seats per district. Winning a seat takes 25% of the votes, plus one."
        steps={[
          {
            show: "ballot",
            caption: (
              <>
                Portland elects its{" "}
                <span className="text-flag-blue-dark">Mayor</span>,{" "}
                <span className="text-flag-green">City Council</span>, and{" "}
                <span className="text-flag-gold-dark">Auditor</span> with{" "}
                <span className="underline decoration-flag-gold decoration-[3px] underline-offset-[6px]">
                  ranked-choice voting
                </span>
                .
              </>
            ),
          },
          {
            show: "list",
            caption: <>Instead of picking just one candidate, you rank them in order of preference.</>,
          },
          {
            show: "ballot",
            ranks: 1,
            caption: <>Start with your top pick, fill out 1.</>,
          },
          {
            show: "ballot",
            ranks: 2,
            caption: <>Then your 2nd pick, fill out 2.</>,
          },
          {
            show: "ballot",
            ranks: 3,
            caption: <>Then your 3rd pick, fill out 3, etc.</>,
          },
          {
            show: "ballot",
            ranks: 3,
            outline: "Drew",
            caption: <>You can rank up to six. You don't have to rank them all.</>,
          },
          {
            show: "count",
            round: 0,
            caption: <>First, everyone's 1st choices are counted. Anyone with more than half wins.</>,
          },
          {
            show: "count",
            round: 1,
            caption: (
              <>
                If no one has more than half, the last-place candidate is
                eliminated. Their voters' next choices are counted instead.
              </>
            ),
          },
          {
            show: "count",
            round: 2,
            caption: <>This repeats until someone has more than half.</>,
          },
          {
            show: "count",
            round: 2,
            caption: <>Ranked-choice voting means there's no "throw away" votes.</>,
          },
          {
            show: "count",
            round: 2,
            caption: <>Even if your 1st pick doesn't win, your 2nd pick still has a chance. (Or 3rd, etc)</>,
          },
          {
            show: "districts",
            caption: (
              <>
                City Council works the same way, but there are three winners instead of just one.
              </>
            ),
          },
          {
            show: "councilCount",
            round: 0,
            caption: (
              <>
                Each candidate must win 25% of votes + 1 to win a seat.
              </>
            ),
          },
          {
            show: "councilCount",
            round: 1,
            caption: (
              <>
                A winner's extra votes beyond that move on to their voters'
                next choices.
              </>
            ),
          },
          {
            show: "councilCount",
            round: 2,
            caption: (
              <>
                If no one else reaches 25% + 1, the last-place candidate is eliminated, and their votes go to each voter's next choice.
              </>
            ),
          },
        ]}
      />

      <PamphletSection
        id="pamphlet"
        intros={[]}
        dropBoxLabel="A person slides their ballot envelope into the slot of an Official Ballot Drop Box."
        ballotLabel="A Multnomah County ballot return envelope, marked Official Voter Ballot Inside, with an address window and the Official Election Mail emblem."
        label="An Oregon Voters' Pamphlet for the November 3, 2026 general election, with the Oregon Pioneer statue on its cover."
        steps={[
          {
            caption: (
              <>
                You can learn all about the candidates and measures in the{" "}
                <span className="underline decoration-flag-gold decoration-[3px] underline-offset-[6px]">
                  Voter Pamphlet
                </span>{" "}
                that you receive in the mail.
              </>
            ),
          },
          {
            // Tilts the pamphlet aside to show the ballot envelope.
            ballot: true,
            caption: (
              <>
                You'll also receive your <span className="underline decoration-flag-gold decoration-[3px] underline-offset-[6px]">official ballot</span> in the mail, as
                Oregon primarily conducts elections by mail.
              </>
            ),
          },
          {
            dropBox: true,
            caption: (
              <>
                You can find your nearest ballot drop box{" "}
                <a
                  href="https://multco.us/info/official-ballot-drop-sites"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-flag-green hover:text-flag-green/80 focus-visible:rounded-control focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-flag-green"
                >
                  here
                  <span className="sr-only">: Multnomah County's official ballot drop sites (opens in a new tab)</span>
                </a>.
              </>
            ),
          },
          {
            caption: (
              <>
                Lastly, make sure you're registered to vote!
              </>
            ),
            sub: <>Registration must be completed by the 21st day before Election Day.</>,
          },
        ]}
      />

      <ActionSection
        id="get-involved"
        intros={[
          "Wow. You've learned a lot today.",
          "How are you feeling?",
          "Motivated? A little overwhelmed?",
          "That's normal. What matters is that you're learning.",
          "Learning is the first step to getting involved in local politics.",
          "So, from one Portlander to another: thank you.",
          <>
            <PortlandFlag className="mx-auto mb-8 w-44 sm:mb-10 sm:w-64" />
            Let's make this city the best it can be.
          </>,
        ]}
      />
    </main>
  );
}
