import type { ComponentProps } from "react";
import { MaterialIcons } from "@expo/vector-icons";

export type TabId = "architecture" | "features" | "security" | "technical";

export type MaterialIconGlyph = ComponentProps<typeof MaterialIcons>["name"];

export type TabDefinition = {
  id: TabId;
  label: string;
  icon: MaterialIconGlyph;
};

export type ArchitectureItem = {
  name: string;
  version: string;
  description: string;
};

export type ArchitectureSection = {
  title: string;
  items: ArchitectureItem[];
};

export type ArchitectureSections = Record<string, ArchitectureSection>;

export type FeatureSpecification = {
  category: string;
  description: string;
  specifications: string[];
};

export type SecurityTone = "primary" | "success" | "danger";

export type SecuritySpecification = {
  category: string;
  level: string;
  tone: SecurityTone;
  specifications: string[];
};

export type TechnicalSpecification = {
  category: string;
  description: string;
  details: string[];
};
