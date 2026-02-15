import { colors } from "@/common/common-constants/ThemeConstants";
import type {
  CategoryDefinition,
  ChangelogEntry,
  ChangelogStatus,
  ChangelogStatusMeta,
  FuturePlan,
} from "./Changelog.types";

export const categories: CategoryDefinition[] = [
  { id: "all", label: "All", color: colors.text.secondary },
  { id: "feature", label: "Features", color: colors.success },
  { id: "improvement", label: "Improvements", color: colors.primary },
  { id: "bugfix", label: "Bug Fixes", color: colors.warning },
  { id: "security", label: "Security", color: colors.error },
];

export const statusMeta: Record<ChangelogStatus, ChangelogStatusMeta> = {
  released: {
    icon: "check-circle",
    color: colors.success,
    label: "Released",
  },
  "in-progress": {
    icon: "hourglass-empty",
    color: colors.warning,
    label: "In progress",
  },
  planned: {
    icon: "schedule",
    color: colors.text.secondary,
    label: "Planned",
  },
};

export const changelogEntries: ChangelogEntry[] = [
  {
    version: "v1.3.0",
    date: "2025-08-01",
    category: "feature",
    type: "major",
    title: "Split calendar and daily Gantt workspace",
    description:
      "Introduced a tablet-ready split layout that combines the monthly calendar with a one-day Gantt board.",
    changes: [
      "Added quick jump anchors for each store and team",
      "Support switching business hours between 09:00-22:00 and 13:00-22:00",
      "Improved drag interactions on the daily timeline",
      "Added inline shift preview cards",
      "Refreshed the summary tab with extra staffing metrics",
    ],
    impact: "Managers can review availability and staffing gaps far faster.",
    status: "released",
  },
  {
    version: "v1.2.5",
    date: "2025-01-30",
    category: "improvement",
    type: "minor",
    title: "Database query and cost tuning",
    description:
      "Rebalanced indexes and caching to cut cold-start latency and daily quota usage.",
    changes: [
      "Optimised compound indexes for roster documents",
      "Reduced redundant server-side aggregations",
      "Improved deployment scripts and smoke checks",
      "Trimmed overall read/write costs",
    ],
    impact: "Schedules load faster and monthly database spend decreased noticeably.",
    status: "released",
  },
  {
    version: "v1.2.0",
    date: "2025-01-27",
    category: "security",
    type: "major",
    title: "Security hardening pass",
    description:
      "Delivered AES-256 encryption, refreshed Security Rules, and GDPR-compliant data workflows.",
    changes: [
      "Encrypted all personal shift payloads at rest",
      "Tightened Firestore Security Rules by role",
      "Automated GDPR export and deletion flows",
      "Hardened against XSS and CSRF vectors",
      "Extended audit logs with seven-year retention",
    ],
    impact: "Enterprise customers now meet their compliance checklist out of the box.",
    status: "released",
  },
  {
    version: "v1.1.8",
    date: "2024-12-15",
    category: "bugfix",
    type: "patch",
    title: "TypeScript and React Native maintenance",
    description:
      "Resolved strict-mode TypeScript errors after the React Native upgrade and stabilised the build pipeline.",
    changes: [
      "Fixed stray any types in attendance screens",
      "Patched breaking changes from the RN 0.74 migration",
      "Cleaned legacy utility typings",
      "Aligned performance budgets in CI",
    ],
    impact: "Daily builds are stable again and developer ergonomics improved.",
    status: "released",
  },
  {
    version: "v1.1.5",
    date: "2024-11-20",
    category: "feature",
    type: "minor",
    title: "Recruitment shift workflow",
    description:
      "Launched the recruitment board to capture shift availability from potential hires.",
    changes: [
      "Added recruitment shift creation and approval",
      "Exposed applicant status tracking",
      "Published onboarding-ready export reports",
      "Linked alerts to email and LINE notifications",
    ],
    impact: "Hiring teams can coordinate candidate shifts without external spreadsheets.",
    status: "released",
  },
  {
    version: "v1.1.0",
    date: "2024-10-30",
    category: "feature",
    type: "major",
    title: "Manager Gantt dashboard on web",
    description:
      "Released the manager facing Gantt board for desktop browsers.",
    changes: [
      "Desktop-ready Gantt board with zooming",
      "Improved tablet breakpoint layout",
      "Refined shift overlap warnings",
      "Polished testimonial carousel on the landing page",
    ],
    impact: "Device parity landed for head office users with richer analytics.",
    status: "released",
  },
  {
    version: "v1.4.0",
    date: "2025-08-15",
    category: "feature",
    type: "major",
    title: "Planned: AI-assisted shift generation",
    description:
      "Upcoming AI companion that drafts rosters based on demand, availability, and historic coverage.",
    changes: [
      "Prototype AI suggestions for empty slots",
      "Machine assisted demand forecast",
      "Conflict detection before publishing",
      "Smart reminders for unconfirmed shifts",
    ],
    impact: "Will dramatically shorten weekly shift creation cycles.",
    status: "planned",
  },
  {
    version: "v1.3.5",
    date: "2025-08-10",
    category: "improvement",
    type: "minor",
    title: "Performance tuning sprint",
    description:
      "Ongoing effort to streamline large datasets and strengthen offline behaviour.",
    changes: [
      "Optimised data-fetch batching",
      "Reduced memory usage on web",
      "Tightened background synchronisation",
      "Aligned caching with new CDN rules",
    ],
    impact: "Large academies can manage peak season rosters without slowdowns.",
    status: "in-progress",
  },
];

export const futurePlan: FuturePlan = {
  title: "Roadmap highlights",
  description:
    "Upcoming releases focus on collaborative scheduling, deeper analytics, and richer automation across stores.",
  icon: "rocket-launch",
};
