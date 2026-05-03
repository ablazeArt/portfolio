export type PortfolioProject = {
  slug: string;
  name: string;
  codename: string;
  category: string;
  year: string;
  status: string;
  summary: string;
  description: string;
  stack: string[];
  highlights: string[];
  orbit: {
    width: string;
    height: string;
    tilt: number;
    x: string;
    y: string;
    duration: string;
    delay: string;
    labelSide: "left" | "right" | "top" | "bottom";
  };
  visual: {
    size: number;
    color: string;
    glow: string;
    orbitColor: string;
    ring?: boolean;
  };
};

export const portfolioProjects: PortfolioProject[] = [
  {
    slug: "aurora-ops",
    name: "Aurora Ops",
    codename: "Mercury",
    category: "Dashboard",
    year: "2026",
    status: "Prototype",
    summary:
      "An operations dashboard concept for surfacing live system signals, incidents, and launch readiness.",
    description:
      "Aurora Ops is the smallest inner planet in the system: fast, dense, and built around immediate signal clarity. Replace this placeholder with a real project once the core visual system is locked.",
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "Realtime UI"],
    highlights: [
      "Command-center layout for noisy operational data.",
      "Compact cards designed for quick scanning.",
      "Clear escalation states for issues and ownership.",
    ],
    orbit: {
      width: "22%",
      height: "12%",
      tilt: -9,
      x: "58%",
      y: "47%",
      duration: "28s",
      delay: "-8s",
      labelSide: "right",
    },
    visual: {
      size: 28,
      color: "#ffb36b",
      glow: "rgba(255, 179, 107, 0.72)",
      orbitColor: "rgba(255, 179, 107, 0.42)",
    },
  },
  {
    slug: "helio-shop",
    name: "Helio Shop",
    codename: "Venus",
    category: "Commerce",
    year: "2025",
    status: "Case study",
    summary:
      "A high-conversion storefront experiment focused on product storytelling and checkout confidence.",
    description:
      "Helio Shop represents commerce work: warm, visual, and close to the sun because it depends on strong product gravity. Swap in your production storefront, marketplace, or checkout project here.",
    stack: ["React", "Design Systems", "Checkout UX", "Analytics"],
    highlights: [
      "Product pages with sharper visual hierarchy.",
      "Trust-building checkout and comparison sections.",
      "Reusable component patterns for catalog growth.",
    ],
    orbit: {
      width: "34%",
      height: "20%",
      tilt: -11,
      x: "46%",
      y: "39%",
      duration: "34s",
      delay: "-15s",
      labelSide: "left",
    },
    visual: {
      size: 38,
      color: "#f7785f",
      glow: "rgba(247, 120, 95, 0.76)",
      orbitColor: "rgba(247, 120, 95, 0.38)",
    },
  },
  {
    slug: "comet-cms",
    name: "Comet CMS",
    codename: "Earth",
    category: "Content",
    year: "2025",
    status: "Live build",
    summary:
      "A content-management workflow for publishing rich project pages without touching page code.",
    description:
      "Comet CMS is the habitable planet: where writing, editing, and publishing live. It can become the place for your strongest real portfolio case study.",
    stack: ["Next.js App Router", "MDX", "Content Modeling", "SEO"],
    highlights: [
      "Structured project content with reusable fields.",
      "SEO-friendly pages generated from project data.",
      "Editorial workflow that keeps visual polish consistent.",
    ],
    orbit: {
      width: "46%",
      height: "28%",
      tilt: -7,
      x: "63%",
      y: "57%",
      duration: "42s",
      delay: "-21s",
      labelSide: "right",
    },
    visual: {
      size: 42,
      color: "#5dd7ff",
      glow: "rgba(93, 215, 255, 0.72)",
      orbitColor: "rgba(93, 215, 255, 0.42)",
    },
  },
  {
    slug: "titan-api",
    name: "Titan API",
    codename: "Mars",
    category: "Backend",
    year: "2024",
    status: "Production",
    summary:
      "A typed API layer concept for secure data access, predictable contracts, and reliable integrations.",
    description:
      "Titan API carries the engineering-heavy work: contracts, validation, observability, and integration points. Use this slot for a backend or platform project.",
    stack: ["TypeScript", "API Design", "Auth", "Observability"],
    highlights: [
      "Typed request and response contracts.",
      "Explicit auth boundaries and error states.",
      "Instrumentation hooks for debugging production issues.",
    ],
    orbit: {
      width: "58%",
      height: "34%",
      tilt: -10,
      x: "42%",
      y: "62%",
      duration: "51s",
      delay: "-5s",
      labelSide: "left",
    },
    visual: {
      size: 34,
      color: "#ef6a4a",
      glow: "rgba(239, 106, 74, 0.75)",
      orbitColor: "rgba(239, 106, 74, 0.36)",
    },
  },
  {
    slug: "orion-ai",
    name: "Orion AI",
    codename: "Jupiter",
    category: "AI Tooling",
    year: "2026",
    status: "Research",
    summary:
      "An AI-assisted workspace concept for turning loose notes into scoped tasks and shipped changes.",
    description:
      "Orion AI is the large outer planet: high gravity, broader surface area, and a good home for your AI, automation, or internal tooling work.",
    stack: ["AI Workflows", "Prompt Systems", "React", "Evaluation"],
    highlights: [
      "Transforms rough intent into inspectable work plans.",
      "Keeps generated output tied to source context.",
      "Designed around reviewability instead of magic.",
    ],
    orbit: {
      width: "72%",
      height: "44%",
      tilt: -6,
      x: "57%",
      y: "31%",
      duration: "68s",
      delay: "-32s",
      labelSide: "right",
    },
    visual: {
      size: 62,
      color: "#d8b46a",
      glow: "rgba(216, 180, 106, 0.82)",
      orbitColor: "rgba(216, 180, 106, 0.38)",
    },
  },
  {
    slug: "saturn-labs",
    name: "Saturn Labs",
    codename: "Saturn",
    category: "Experiments",
    year: "2024",
    status: "Collection",
    summary:
      "A ringed archive of smaller prototypes, interaction studies, and interface experiments.",
    description:
      "Saturn Labs is for experiments that deserve visibility but not a full case-study orbit. Its rings make it visually distinct in the portfolio map.",
    stack: ["Motion Design", "CSS", "Prototyping", "UX Research"],
    highlights: [
      "Small experiments grouped into one memorable destination.",
      "Fast visual tests before committing to larger builds.",
      "Interaction ideas that can graduate into full projects.",
    ],
    orbit: {
      width: "86%",
      height: "52%",
      tilt: -5,
      x: "72%",
      y: "49%",
      duration: "84s",
      delay: "-44s",
      labelSide: "right",
    },
    visual: {
      size: 54,
      color: "#e8d989",
      glow: "rgba(232, 217, 137, 0.78)",
      orbitColor: "rgba(232, 217, 137, 0.36)",
      ring: true,
    },
  },
  {
    slug: "vega-field",
    name: "Vega Field",
    codename: "Neptune",
    category: "Systems",
    year: "2023",
    status: "Archive",
    summary:
      "A systems-design archive for infrastructure diagrams, technical writing, and deep-dive documentation.",
    description:
      "Vega Field is the far-orbit archive: slower, colder, and useful for showing depth. Use it for infrastructure, architecture, or technical writing.",
    stack: ["Architecture", "Documentation", "Diagrams", "Systems Thinking"],
    highlights: [
      "Long-form technical decisions with clear tradeoffs.",
      "Architecture diagrams that explain how systems behave.",
      "A home for work that is valuable but less visual.",
    ],
    orbit: {
      width: "108%",
      height: "66%",
      tilt: -4,
      x: "83%",
      y: "66%",
      duration: "102s",
      delay: "-62s",
      labelSide: "left",
    },
    visual: {
      size: 46,
      color: "#6b8dff",
      glow: "rgba(107, 141, 255, 0.82)",
      orbitColor: "rgba(107, 141, 255, 0.36)",
    },
  },
];

export function getProjectBySlug(slug: string) {
  return portfolioProjects.find((project) => project.slug === slug);
}
