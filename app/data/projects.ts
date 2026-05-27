export type PortfolioProject = {
  slug: string;
  name: string;
  codename: string;
  category: string;
  year: string;
  status: string;
  liveUrl?: string;
  liveLabel?: string;
  summary: string;
  description: string;
  characteristics: string[];
  highlights: string[];
  caseStudy?: {
    heading: string;
    overview: string;
    useCases: string[];
    privateNote?: string;
  };
  screenshots?: {
    src: string;
    alt: string;
    caption: string;
    width: number;
    height: number;
  }[];
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
    slug: "whallet",
    name: "Whallet",
    codename: "Mercury",
    category: "Fintech Wallet",
    year: "2023",
    status: "Live site",
    liveUrl: "https://www.whallet.co/",
    summary:
      "A digital-asset wallet website for deposits, transfers, and utility-token onboarding.",
    description:
      "Whallet is a digital-asset wallet product site focused on making token deposits and transfers feel approachable. The experience explains wallet actions, favorite wallet addresses, and account-safety rules in a customer-facing flow.",
    characteristics: [
      "Fintech Onboarding",
      "Digital Wallet",
      "Web3 Utility",
      "Trust-focused UX",
    ],
    highlights: [
      "Clear onboarding path for wallet registration and login.",
      "Explains deposit and transfer flows around QR codes and wallet addresses.",
      "Communicates account safety with a simple one-person, one-wallet rule.",
    ],
    screenshots: [
      {
        src: "/project-screens/whallet.png",
        alt: "Whallet product website screen",
        caption:
          "Whallet product website preview showing digital wallet positioning and onboarding content.",
        width: 2994,
        height: 1728,
      },
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
  // Archived temporarily while the Venus project slot is used for Conver DPU.
  // {
  //   slug: "ticktopia",
  //   name: "Ticktopia",
  //   codename: "Venus",
  //   category: "Event Ticketing",
  //   year: "2026",
  //   status: "Live site",
  //   liveUrl: "https://www.ticktopia.co/",
  //   summary:
  //     "An event-ticketing product site for discovering events and moving users toward ticket purchase flows.",
  //   description:
  //     "Ticktopia is an event and ticketing experience focused on helping users discover events and continue into a ticket-purchase journey. This slot highlights product storytelling, responsive event surfaces, and the conversion path from browsing to action.",
  //   characteristics: [
  //     "Event Discovery",
  //     "Ticketing Journey",
  //     "Conversion-focused",
  //     "Responsive Landing",
  //   ],
  //   highlights: [
  //     "Event-focused landing flow for discovery and conversion.",
  //     "Clear product positioning around ticket access and event browsing.",
  //     "Responsive interface structure for users browsing across devices.",
  //   ],
  //   screenshots: [
  //     {
  //       src: "/project-screens/ticktopia.png",
  //       alt: "Ticktopia event ticketing website screen",
  //       caption:
  //         "Ticktopia preview showing the event-ticketing website experience and user path toward ticket discovery.",
  //       width: 2826,
  //       height: 1572,
  //     },
  //   ],
  //   orbit: {
  //     width: "34%",
  //     height: "20%",
  //     tilt: -11,
  //     x: "46%",
  //     y: "39%",
  //     duration: "34s",
  //     delay: "-15s",
  //     labelSide: "left",
  //   },
  //   visual: {
  //     size: 38,
  //     color: "#f7785f",
  //     glow: "rgba(247, 120, 95, 0.76)",
  //     orbitColor: "rgba(247, 120, 95, 0.38)",
  //   },
  // },
  {
    slug: "conver-dpu",
    name: "Conver DPU",
    codename: "Venus",
    category: "Interactive Reflection Campaign",
    year: "2025",
    status: "Live site",
    liveUrl: "https://conver.dpu.ac.th/",
    summary:
      "A DPU interactive web experience that gives users seven minutes to answer reflective questions they may have forgotten to ask themselves.",
    description:
      "Conver DPU is an immersive campaign site built around a slow, guided conversation with yourself. The experience combines cinematic scenes, sound, branching questions, and personalized result cards to help users reflect on past and future versions of themselves before continuing into DPU guidance and assessment flows.",
    characteristics: [
      "Interactive Campaign",
      "Guided Reflection",
      "Cinematic Web",
      "DPU Admissions Flow",
    ],
    highlights: [
      "Seven-minute self-reflection journey with Thai and English interface support.",
      "Uses branching questions, ambient sound, and video scenes to frame the conversation.",
      "Generates shareable result cards and routes users toward DPU assessment and contact flows.",
    ],
    screenshots: [
      {
        src: "/project-screens/conver-dpu.jpg",
        alt: "Conver DPU interactive reflection campaign screen",
        caption:
          "Conver DPU campaign preview showing the guided seven-minute reflection experience.",
        width: 2400,
        height: 1260,
      },
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
      color: "#8f72ff",
      glow: "rgba(143, 114, 255, 0.76)",
      orbitColor: "rgba(143, 114, 255, 0.38)",
    },
  },
  {
    slug: "emmind",
    name: "EMMIND",
    codename: "Earth",
    category: "Mental Health LIFF",
    year: "2025",
    status: "Live LIFF app",
    liveUrl: "https://aimet.tech/en/all-projects/emmind/",
    liveLabel: "View LIFF project",
    summary:
      "A LINE LIFF mental-health web app for CBT-based mood tracking, emotional reflection, and safety support.",
    description:
      "EMMIND is a LINE LIFF web application built around Cognitive Behavioral Therapy principles. It helps users record daily emotions, learn about depression, work through guided exercises, plan supportive routines, and access a Safety Plan when they need quick help.",
    characteristics: [
      "Mental Health Support",
      "CBT-guided Flow",
      "Safety Planning",
      "LINE Experience",
    ],
    highlights: [
      "Built as a LIFF experience that opens inside LINE.",
      "Guided CBT-style flows for tracking thoughts, emotions, and behavior.",
      "Safety Plan support for users who need fast access to help resources.",
    ],
    screenshots: [
      {
        src: "/project-screens/emmind.png",
        alt: "EMMIND mental health LIFF app screen",
        caption:
          "EMMIND preview showing the mental-health LIFF experience and user-facing support flow.",
        width: 2996,
        height: 1434,
      },
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
    slug: "cloudviu",
    name: "Cloudviu",
    codename: "Mars",
    category: "Field Workforce CMS",
    year: "2024 – Present",
    status: "Private internal system",
    summary:
      "A private CMS for companies that outsource nationwide field jobs such as stock checks, product audits, and outlet visits.",
    description:
      "Cloudviu helps companies manage outsourced field employees who work across many locations. The system supports assigning teams to jobs, organizing outlets, tracking product and inventory checks, collecting job records, and reviewing reports for work spread across the country. Public access is unavailable because this is an authenticated internal system.",
    characteristics: [
      "Field Workforce CMS",
      "Nationwide Operations",
      "Inventory Checks",
      "Private Back Office",
    ],
    highlights: [
      "Team-group and team management for outsourced field workers.",
      "Job workflows for stock checks, product checks, outlet visits, and audits.",
      "Centralized reporting for distributed field work; public demo access is intentionally disabled.",
    ],
    caseStudy: {
      heading: "How Cloudviu Is Used",
      overview:
        "A company creates field jobs for outsourced employees, groups workers by region or responsibility, assigns outlet visits, and reviews job records after workers check stock, product visibility, or campaign execution across the country.",
      useCases: [
        "Assign regional field teams to stock-check jobs across multiple outlets.",
        "Track product and inventory checks submitted by outsourced employees.",
        "Review job records, issues, and reports from distributed locations.",
      ],
      privateNote:
        "This is a private internal system. The preview below is sanitized and uses mock data instead of real employee or company records.",
    },
    screenshots: [
      {
        src: "/project-screens/cloudviu.png",
        alt: "Cloudviu field workforce CMS screen",
        caption:
          "Cloudviu CMS preview showing field-workforce operations, team management, and nationwide job workflow structure.",
        width: 3022,
        height: 1724,
      },
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
    slug: "ctrl-g",
    name: "CTRL G",
    codename: "Jupiter",
    category: "Gaming Community",
    year: "2024",
    status: "Production",
    liveUrl: "https://ctrlg.gg/",
    summary:
      "A gaming community platform for player discovery, party matching, esports tournaments, and quizzes.",
    description:
      "CTRL G brings community features, esports tournament participation, game quizzes, and party matching into one gamer-focused platform. This project highlights community UX, matchmaking flows, and responsive product surfaces for players who want to connect and compete.",
    characteristics: [
      "Gaming Community",
      "Party Matching",
      "Esports Engagement",
      "Player Discovery",
    ],
    highlights: [
      "Community-driven space for gamers to post updates and follow games.",
      "Party matching flow for finding teammates by preference and play mode.",
      "Tournament and quiz surfaces designed for competitive gaming engagement.",
    ],
    screenshots: [
      {
        src: "/project-screens/ctrlg.png",
        alt: "CTRL G gaming community platform screen",
        caption:
          "CTRL G preview showing the gaming community product surface for players, events, and engagement.",
        width: 2992,
        height: 1722,
      },
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
    slug: "thvote69",
    name: "THVote69",
    codename: "Saturn",
    category: "Election Dashboard",
    year: "2026",
    status: "Live tracker",
    liveUrl: "https://vote69.thematter.co/",
    summary:
      "A real-time Thai election results dashboard for The MATTER with live seat, vote, and turnout reporting.",
    description:
      "THVote69 is a public election-results tracker built for The MATTER. It presents unofficial election outcomes, party rankings, constituency and party-list seats, turnout metrics, and regional views in a fast dashboard experience designed for heavy public traffic.",
    characteristics: [
      "Real-time Results",
      "Public Dashboard",
      "Data Visualization",
      "High Traffic",
    ],
    highlights: [
      "Live election-result interface with seat counts and party rankings.",
      "Regional and party-based views for scanning national results.",
      "Optimized dashboard experience for election-day public traffic.",
    ],
    screenshots: [
      {
        src: "/project-screens/vote69.png",
        alt: "THVote69 election dashboard screen",
        caption:
          "Election dashboard preview showing real-time result cards, party rankings, and national vote-tracking views.",
        width: 3016,
        height: 1712,
      },
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
    slug: "samitivej-benefits",
    name: "Samitivej Benefits",
    codename: "Neptune",
    category: "Hospital Benefits CMS",
    year: "2025",
    status: "Private production system",
    summary:
      "A production CMS and LIFF-connected system for managing Samitivej member benefits, cards, coupons, packages, redemptions, and data exports.",
    description:
      "Samitivej Benefits is a private production system for hospital member-benefit operations. The CMS supports member records, member cards, coupon codes, benefit redemption requests, benefit usage documents, packages, users, branches, and report exports, while the related LIFF app gives members access to their benefits flow.",
    characteristics: [
      "Hospital Benefits CMS",
      "Member Cards",
      "Redemption Workflow",
      "Operational Export",
    ],
    highlights: [
      "Member-card and user management for hospital benefit operations.",
      "Coupon, package, benefit redemption, and redemption-request workflows.",
      "Export tools for operational reporting and benefit usage data.",
    ],
    caseStudy: {
      heading: "How Samitivej Benefits Is Used",
      overview:
        "Hospital staff can manage members and benefit packages in the CMS, while members interact with the related LIFF flow. The operation covers card setup, coupon configuration, redemption requests, benefit usage records, and data export for reporting.",
      useCases: [
        "Manage member profiles, member cards, and benefit packages.",
        "Review coupon usage, redemption requests, and redeemed transactions.",
        "Export member and benefit-operation data for reporting workflows.",
      ],
      privateNote:
        "This is a private production healthcare system. Public access is intentionally unavailable; screenshots are limited to non-member-data screens such as package and card management.",
    },
    screenshots: [
      {
        src: "/project-screens/samitivej-commux.png",
        alt: "Samitivej member benefits CMS screen",
        caption:
          "Samitivej benefits CMS preview showing member-card, coupon, redemption, package, and export-management modules.",
        width: 3014,
        height: 1724,
      },
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
