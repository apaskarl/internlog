export type TimeLogEntry = {
  id: string;
  date: string;
  dayLabel: string;
  clockIn: string;
  clockOut: string;
  /** Paid / logged break (display) */
  breakTime: string;
  /** Duration minus break */
  netDuration: string;
  duration: string;
  status: "complete" | "partial";
  notes: string;
};

/** Preset clock-in times for quick actions (UI placeholder) */
export const PLACEHOLDER_QUICK_START_TIMES = [
  { id: "q1", label: "8:00 AM" },
  { id: "q2", label: "8:30 AM" },
  { id: "q3", label: "9:00 AM" },
  { id: "q4", label: "9:30 AM" },
  { id: "q5", label: "10:00 AM" },
] as const;

export const PLACEHOLDER_TIMELOG_TODAY = {
  dateLabel: "Sat, Mar 22, 2025",
  weekLabel: "Week of Mar 17–21, 2025",
  expectedHours: "8h 00m",
} as const;

export type MonthlyReport = {
  id: string;
  month: string;
  year: number;
  highlights: string;
  lessonsLearned: string[];
  tasksCompleted: string[];
  stats: {
    hoursLogged: string;
    daysPresent: number;
    mentorSessions: number;
  };
  tags: string[];
  challenges: string;
  goalsNext: string;
};

export const PLACEHOLDER_STATS = {
  weekHours: "38.5",
  todayHours: "8.2",
  streakDays: 12,
  avgDaily: "7.7",
} as const;

/** Hours logged per weekday (current week) — for overview chart */
export const PLACEHOLDER_WEEKLY_HOURS = [
  { day: "Mon", hours: 8.6 },
  { day: "Tue", hours: 7.9 },
  { day: "Wed", hours: 7.9 },
  { day: "Thu", hours: 8.0 },
  { day: "Fri", hours: 8.2 },
] as const;

export type OverviewActivity = {
  id: string;
  title: string;
  meta: string;
};

export const PLACEHOLDER_OVERVIEW_ACTIVITY: OverviewActivity[] = [
  {
    id: "a1",
    title: "Clock-out recorded",
    meta: "Fri, Mar 21 · 5:14 PM",
  },
  {
    id: "a2",
    title: "Clock-in recorded",
    meta: "Fri, Mar 21 · 8:58 AM",
  },
  {
    id: "a3",
    title: "Weekly hours target met",
    meta: "Week of Mar 17–21",
  },
  {
    id: "a4",
    title: "March reflection updated",
    meta: "Monthly reports",
  },
];

export const PLACEHOLDER_INTERNSHIP_SUMMARY = {
  organization: "Acme Labs",
  role: "Software engineering intern",
  cohort: "Spring 2025",
  currentWeek: 8,
  totalWeeks: 12,
  focusLine:
    "Ship the attendance export fix, then pair on API pagination with your mentor.",
} as const;

export const PLACEHOLDER_TIME_LOGS: TimeLogEntry[] = [
  {
    id: "1",
    date: "2025-03-21",
    dayLabel: "Fri, Mar 21",
    clockIn: "8:58 AM",
    clockOut: "5:14 PM",
    breakTime: "60m",
    netDuration: "7h 16m",
    duration: "8h 16m",
    status: "complete",
    notes: "Stand-up, sprint review",
  },
  {
    id: "2",
    date: "2025-03-20",
    dayLabel: "Thu, Mar 20",
    clockIn: "9:02 AM",
    clockOut: "5:01 PM",
    breakTime: "45m",
    netDuration: "7h 14m",
    duration: "7h 59m",
    status: "complete",
    notes: "Paired on API pagination",
  },
  {
    id: "3",
    date: "2025-03-19",
    dayLabel: "Wed, Mar 19",
    clockIn: "8:55 AM",
    clockOut: "4:48 PM",
    breakTime: "50m",
    netDuration: "7h 03m",
    duration: "7h 53m",
    status: "complete",
    notes: "Design system workshop",
  },
  {
    id: "4",
    date: "2025-03-18",
    dayLabel: "Tue, Mar 18",
    clockIn: "9:10 AM",
    clockOut: "—",
    breakTime: "—",
    netDuration: "—",
    duration: "—",
    status: "partial",
    notes: "Still clocked in (placeholder)",
  },
  {
    id: "5",
    date: "2025-03-17",
    dayLabel: "Mon, Mar 17",
    clockIn: "8:47 AM",
    clockOut: "5:22 PM",
    breakTime: "60m",
    netDuration: "7h 35m",
    duration: "8h 35m",
    status: "complete",
    notes: "Onboarding sessions",
  },
];

export const PLACEHOLDER_MONTHLY_REPORTS: MonthlyReport[] = [
  {
    id: "m1",
    month: "March",
    year: 2025,
    highlights:
      "Focused on onboarding workflows and shadowing the senior dev during sprint planning. Started contributing small fixes to the internal dashboard.",
    lessonsLearned: [
      "How our team structures stand-ups and tracks blockers in Jira.",
      "Basics of the design system and when to reach for existing components.",
      "Git flow for feature branches and code review expectations.",
    ],
    tasksCompleted: [
      "Documented two user flows for the reporting module.",
      "Fixed a timezone bug on the attendance export (placeholder).",
      "Paired on writing unit tests for a form validation hook.",
    ],
    stats: {
      hoursLogged: "162",
      daysPresent: 20,
      mentorSessions: 6,
    },
    tags: ["Feature work", "Code review", "Design system"],
    challenges:
      "Balancing shadowing with ticket ownership — learned to time-box observation blocks so I still shipped small fixes each week.",
    goalsNext:
      "Own a small feature end-to-end in April: spec with mentor, implementation, tests, and demo in sprint review.",
  },
  {
    id: "m2",
    month: "February",
    year: 2025,
    highlights:
      "Orientation month: met mentors, set learning goals, and got familiar with the codebase and tooling.",
    lessonsLearned: [
      "Company values and security practices for handling customer data.",
      "Local dev setup, environment variables, and staging vs. production.",
      "How to ask for help effectively without blocking others for too long.",
    ],
    tasksCompleted: [
      "Completed security and compliance training modules.",
      "Set up IDE, linters, and pre-commit hooks matching team standards.",
      "Shadowed three code reviews and took notes on feedback patterns.",
    ],
    stats: {
      hoursLogged: "152",
      daysPresent: 19,
      mentorSessions: 8,
    },
    tags: ["Onboarding", "Compliance", "Tooling"],
    challenges:
      "Information overload in week one — kept a daily “top 3 questions” note so mentor syncs stayed focused.",
    goalsNext:
      "March: contribute a real PR to the internal dashboard and present learnings in the intern sync.",
  },
  {
    id: "m3",
    month: "January",
    year: 2025,
    highlights:
      "First weeks on the team: paperwork, access requests, and high-level product tour. Built a personal learning roadmap with my manager.",
    lessonsLearned: [
      "How the product is organized into squads and how interns plug into rituals.",
      "Expectations for communication, async updates, and escalation paths.",
      "Using the wiki and runbooks to unblock myself before pinging seniors.",
    ],
    tasksCompleted: [
      "Finished HR and IT onboarding checklists.",
      "Joined stand-ups and retro as observer; captured vocabulary and acronyms.",
      "Drafted 30/60/90-day learning goals with my mentor.",
    ],
    stats: {
      hoursLogged: "120",
      daysPresent: 15,
      mentorSessions: 5,
    },
    tags: ["Ramp-up", "Goals", "Culture"],
    challenges:
      "Cold-starting in a new codebase — used the team’s “good first issues” list to build confidence before touching prod paths.",
    goalsNext:
      "February: complete security training and ship a docs-only PR (README or internal guide).",
  },
];

/** Sample uploads for the Documents page (not real files). */
export type UploadedDocument = {
  id: string;
  title: string;
  category: "monthly_report" | "legal" | "onboarding" | "hr";
  categoryLabel: string;
  fileName: string;
  fileExt: "pdf" | "docx";
  sizeLabel: string;
  uploadedAt: string;
  description: string;
  status: "signed" | "pending_review" | "archived";
};

export const PLACEHOLDER_DOCUMENTS: UploadedDocument[] = [
  {
    id: "d1",
    title: "Monthly report — March 2026",
    category: "monthly_report",
    categoryLabel: "Monthly report",
    fileName: "Monthly_Report_2026-03.pdf",
    fileExt: "pdf",
    sizeLabel: "842 KB",
    uploadedAt: "Mar 28, 2026",
    description: "Reflection, hours summary, and mentor notes for March.",
    status: "signed",
  },
  {
    id: "d2",
    title: "Monthly report — February 2026",
    category: "monthly_report",
    categoryLabel: "Monthly report",
    fileName: "Monthly_Report_2026-02.pdf",
    fileExt: "pdf",
    sizeLabel: "756 KB",
    uploadedAt: "Feb 26, 2026",
    description: "Mid-internship checkpoint and goals for Q2.",
    status: "signed",
  },
  {
    id: "d3",
    title: "Monthly report — January 2026",
    category: "monthly_report",
    categoryLabel: "Monthly report",
    fileName: "Monthly_Report_2026-01.pdf",
    fileExt: "pdf",
    sizeLabel: "690 KB",
    uploadedAt: "Jan 29, 2026",
    description: "First month summary and onboarding wrap-up.",
    status: "archived",
  },
  {
    id: "d4",
    title: "Memorandum of Agreement (MOA)",
    category: "legal",
    categoryLabel: "Legal",
    fileName: "MOA_Internship_2026_Signed.pdf",
    fileExt: "pdf",
    sizeLabel: "1.2 MB",
    uploadedAt: "Jan 6, 2026",
    description: "Signed MOA between your school, the host company, and you.",
    status: "signed",
  },
  {
    id: "d5",
    title: "Non-Disclosure Agreement (NDA)",
    category: "legal",
    categoryLabel: "Legal",
    fileName: "NDA_Standard_2026.pdf",
    fileExt: "pdf",
    sizeLabel: "428 KB",
    uploadedAt: "Jan 6, 2026",
    description: "Confidentiality obligations for systems, code, and customer data.",
    status: "signed",
  },
  {
    id: "d6",
    title: "Internship offer & acceptance",
    category: "hr",
    categoryLabel: "HR",
    fileName: "Offer_Letter_Acceptance.pdf",
    fileExt: "pdf",
    sizeLabel: "312 KB",
    uploadedAt: "Jan 4, 2026",
    description: "Signed offer letter and start date confirmation.",
    status: "signed",
  },
  {
    id: "d7",
    title: "Company handbook acknowledgment",
    category: "onboarding",
    categoryLabel: "Onboarding",
    fileName: "Handbook_Acknowledgment_2026.docx",
    fileExt: "docx",
    sizeLabel: "88 KB",
    uploadedAt: "Jan 8, 2026",
    description: "Acknowledgment of policies; keep a copy for your records.",
    status: "pending_review",
  },
];
