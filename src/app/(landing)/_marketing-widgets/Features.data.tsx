import React from "react";
import type { FeatureCard, StatusFlowStep } from "./Features.types";

const iconClassName = "w-6 h-6";

const ClipboardIcon = (
  <svg className={iconClassName} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    />
  </svg>
);

const CalculatorIcon = (
  <svg className={iconClassName} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
    />
  </svg>
);

const RocketIcon = (
  <svg className={iconClassName} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v13m0-13V6a2 2 0 112 0v1m-2 0V6a2 2 0 00-2 0v1m2 0V9.5m0 0v3m0-3h3m-3 0h-3"
    />
  </svg>
);

const LinkIcon = (
  <svg className={iconClassName} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
    />
  </svg>
);

const UserGroupIcon = (
  <svg className={iconClassName} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
    />
  </svg>
);

const ChatIcon = (
  <svg className={iconClassName} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 17h5l-5 5v-5zM4.828 4.828A4 4 0 015.656 4H20a2 2 0 012 2v12a2 2 0 01-2 2h-5L9 14H4a2 2 0 01-2-2V6a2 2 0 012-2h1.172z"
    />
  </svg>
);

const CalendarIcon = (
  <svg className={iconClassName} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 7V3m8 4V3m-9 8h10m-9 4h4m-7 6h10a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

const ShieldIcon = (
  <svg className={iconClassName} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
    />
  </svg>
);

export const managerFeatures: FeatureCard[] = [
  {
    id: "manager-visual-planning",
    icon: ClipboardIcon,
    title: "Visual Gantt Planning",
    description:
      "Drag-and-drop shifts across locations with minute-level precision and instant staffing visibility.",
    highlight: "Plan 10× faster",
  },
  {
    id: "manager-payroll-insights",
    icon: CalculatorIcon,
    title: "Payroll Insights",
    description:
      "Automated hour tracking, pay-rate rules, and scenario forecasting keep finance in lockstep with operations.",
    highlight: "Cut costs by 15%",
  },
  {
    id: "manager-recruitment",
    icon: RocketIcon,
    title: "Recruitment Shifts",
    description:
      "Open shifts to prospects, collect availability, and confirm new hires without spreadsheets or long email threads.",
    highlight: "90% fill rate",
  },
  {
    id: "manager-integrations",
    icon: LinkIcon,
    title: "Integrated Workflows",
    description:
      "Sync with Google Calendar, LINE notifications, and payroll exports to automate handoffs end-to-end.",
    highlight: "Automation ready",
  },
];

export const staffFeatures: FeatureCard[] = [
  {
    id: "staff-mobile",
    icon: UserGroupIcon,
    title: "Mobile-first Scheduling",
    description:
      "Submit availability, swap shifts, and confirm updates in seconds from any device.",
    highlight: "70% fewer gaps",
  },
  {
    id: "staff-notifications",
    icon: ChatIcon,
    title: "Smart Notifications",
    description:
      "Real-time alerts via LINE and email ensure every change, deadline, and approval is crystal clear.",
    highlight: "Always in sync",
  },
  {
    id: "staff-attendance",
    icon: CalendarIcon,
    title: "Attendance Toolkit",
    description:
      "Clock-ins, class checklists, and handover notes keep lessons running smoothly.",
    highlight: "Steady classrooms",
  },
  {
    id: "staff-safety",
    icon: ShieldIcon,
    title: "Protected Experience",
    description:
      "Role-based security and privacy-first workflows protect staff data without slowing them down.",
    highlight: "Secure by default",
  },
];

export const statusFlow: StatusFlowStep[] = [
  {
    status: "Request Submitted",
    description: "Staff shares availability or a shift request",
    color: "yellow",
  },
  {
    status: "Awaiting Approval",
    description: "Managers review conflicts and staffing coverage",
    color: "blue",
  },
  {
    status: "Declined",
    description: "Requests with conflicts are flagged for follow-up",
    color: "red",
  },
  {
    status: "Cancelled",
    description: "Withdrawn shifts are documented automatically",
    color: "orange",
  },
  {
    status: "Published",
    description: "Approved shifts sync instantly across channels",
    color: "green",
  },
];


