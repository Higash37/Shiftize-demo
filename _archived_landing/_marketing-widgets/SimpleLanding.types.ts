export type UpdateType = "feature" | "improvement" | "fix" | "security";

export type UpdateHistoryItem = {
  id: string;
  date: string;
  version: string;
  title: string;
  type: UpdateType;
  description: string;
};

export type NavigationIconName =
  | "person"
  | "home"
  | "calendar-today"
  | "assignment"
  | "account-circle"
  | "admin-panel-settings"
  | "view-kanban"
  | "groups"
  | "attach-money"
  | "business"
  | "security"
  | "code"
  | "help"
  | "update";

export type NavigationMenuItem = {
  icon: NavigationIconName;
  title: string;
  route: string;
  description: string;
};

export type NavigationMenuCategory = {
  category: string;
  items: NavigationMenuItem[];
};

export type FinalCtaFeature = string;

export type UpdateTypeMeta = {
  icon: string;
  color: string;
};
