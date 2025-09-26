import type { ComponentProps } from "react";
import { MaterialIcons } from "@expo/vector-icons";

export type MaterialIconGlyph = ComponentProps<typeof MaterialIcons>["name"];

export type ChangelogCategoryId = "all" | "feature" | "improvement" | "bugfix" | "security";
export type ChangelogEntryCategory = Exclude<ChangelogCategoryId, "all">;
export type ChangelogStatus = "released" | "in-progress" | "planned";
export type ChangelogReleaseType = "major" | "minor" | "patch";

export type CategoryDefinition = {
  id: ChangelogCategoryId;
  label: string;
  color: string;
};

export type ChangelogEntry = {
  version: string;
  date: string;
  category: ChangelogEntryCategory;
  type: ChangelogReleaseType;
  title: string;
  description: string;
  changes: string[];
  impact: string;
  status: ChangelogStatus;
};

export type ChangelogStatusMeta = {
  icon: MaterialIconGlyph;
  color: string;
  label: string;
};

export type FuturePlan = {
  title: string;
  description: string;
  icon: MaterialIconGlyph;
};
