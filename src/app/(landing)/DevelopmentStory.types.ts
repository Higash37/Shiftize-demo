import type { ComponentProps } from "react";
import { MaterialIcons } from "@expo/vector-icons";

export type MaterialIconGlyph = ComponentProps<typeof MaterialIcons>["name"];

export type DevelopmentPhaseStatus = "completed" | "in-progress" | "planned";

export type DevelopmentPhase = {
  phase: string;
  title: string;
  duration: string;
  icon: MaterialIconGlyph;
  color: string;
  backgroundColor: string;
  description: string;
  achievements: string[];
  challenges: string;
  status: DevelopmentPhaseStatus;
};

export type SkillGrowth = {
  skill: string;
  before: number;
  after: number;
  description: string;
};

export type Insight = {
  icon: MaterialIconGlyph;
  title: string;
  description: string;
};
