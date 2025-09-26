import type { ReactNode } from "react";

export type FeatureAudience = "manager" | "staff";

export type FeatureCard = {
  id: string;
  title: string;
  description: string;
  highlight: string;
  icon: ReactNode;
};

export type StatusFlowColor = "yellow" | "blue" | "red" | "orange" | "green";

export type StatusFlowStep = {
  status: string;
  description: string;
  color: StatusFlowColor;
};
