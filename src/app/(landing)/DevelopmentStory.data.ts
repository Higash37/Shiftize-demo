import { colors } from "@/common/common-constants/ThemeConstants";
import type { DevelopmentPhase, Insight, SkillGrowth } from "./DevelopmentStory.types";

export const developmentPhases: DevelopmentPhase[] = [
  {
    phase: "1",
    title: "Discovery & Planning",
    duration: "2 months",
    icon: "target",
    color: colors.primary,
    backgroundColor: "rgba(10, 132, 255, 0.08)",
    description:
      "Interviewed cram school managers and staff to document daily scheduling pain points and expectations.",
    achievements: [
      "Mapped core scheduling challenges",
      "Documented priority user journeys",
      "Captured the release criteria for v1",
      "Outlined analytics objectives",
    ],
    challenges:
      "Balancing realtime shift needs with privacy constraints while keeping the scope achievable.",
    status: "completed",
  },
  {
    phase: "2",
    title: "Technical Spike",
    duration: "3 months",
    icon: "lightbulb-outline",
    color: colors.success,
    backgroundColor: "rgba(52, 199, 89, 0.12)",
    description:
      "Evaluated architecture options and confirmed the React Native + Firebase stack for rapid delivery.",
    achievements: [
      "Finalised React Native + Firebase architecture",
      "Designed reusable component strategy",
      "Drafted data retention roadmap",
      "Forecasted security and compliance tasks",
    ],
    challenges:
      "Aligning performance guarantees and offline behaviour with constrained budgets.",
    status: "completed",
  },
  {
    phase: "3",
    title: "Core Feature Build",
    duration: "8 months",
    icon: "code",
    color: colors.secondary,
    backgroundColor: "rgba(94, 92, 230, 0.12)",
    description:
      "Delivered the Gantt scheduling suite, attendance tooling, and payroll integrations.",
    achievements: [
      "Launched drag-and-drop Gantt board",
      "Integrated Firebase Authentication",
      "Shipped payroll-ready analytics",
      "Automated staff onboarding flows",
    ],
    challenges:
      "Maintaining performance on large datasets while iterating on UX feedback weekly.",
    status: "completed",
  },
  {
    phase: "4",
    title: "Testing & Hardening",
    duration: "3 months",
    icon: "science",
    color: colors.warning,
    backgroundColor: "rgba(255, 159, 10, 0.12)",
    description:
      "Focused on QA automation, accessibility sweeps, and performance tuning.",
    achievements: [
      "Built full regression test suites",
      "Optimised performance across devices",
      "Passed security audits",
      "Ran user acceptance pilots",
    ],
    challenges:
      "Coordinating device fragmentation and legacy OS constraints across pilot schools.",
    status: "completed",
  },
  {
    phase: "5",
    title: "Deployment & Adoption",
    duration: "2 months",
    icon: "rocket",
    color: colors.secondary,
    backgroundColor: "rgba(99, 102, 241, 0.12)",
    description:
      "Rolled out the app, onboarded early customers, and monitored real-world metrics.",
    achievements: [
      "Implemented PWA support",
      "Set up automated CI/CD",
      "Deployed cross-region infrastructure",
      "Established customer success playbooks",
    ],
    challenges:
      "Scaling support and analytics visibility while onboarding large organisations.",
    status: "completed",
  },
];

export const learningCurve: SkillGrowth[] = [
  {
    skill: "React Native",
    before: 20,
    after: 95,
    description: "Mastered cross-platform delivery and performance tuning.",
  },
  {
    skill: "TypeScript",
    before: 30,
    after: 90,
    description: "Adopted strict typing and advanced generics across the codebase.",
  },
  {
    skill: "Firebase",
    before: 10,
    after: 88,
    description: "Gained production experience with security rules and scalable models.",
  },
  {
    skill: "UI/UX Design",
    before: 25,
    after: 85,
    description: "Built reusable design systems and responsive layouts for tutors.",
  },
  {
    skill: "System Design",
    before: 15,
    after: 80,
    description: "Documented modular architecture and observability practices.",
  },
];

export const insights: Insight[] = [
  {
    icon: "book",
    title: "Continuous Learning",
    description: "Embraced deliberate practice and design critiques every sprint.",
  },
  {
    icon: "target",
    title: "Customer Focus",
    description: "Validated every milestone with real academy workflows.",
  },
  {
    icon: "trending-up",
    title: "Iterative Mindset",
    description: "Shipped small improvements weekly to maintain momentum.",
  },
];
