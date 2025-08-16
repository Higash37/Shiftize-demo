export interface MenuItemType {
  id: string;
  title: string;
  icon: keyof typeof import("@expo/vector-icons").MaterialIcons.glyphMap;
}

export interface SectionRefs {
  home: React.RefObject<any>;
  features: React.RefObject<any>;
  demo: React.RefObject<any>;
  benefits: React.RefObject<any>;
  pricing: React.RefObject<any>;
  testimonials: React.RefObject<any>;
  faq: React.RefObject<any>;
}

export interface NavigationProps {
  menuItems: MenuItemType[];
  activeSection: string;
  isMobile: boolean;
  onScrollToSection: (sectionId: string) => void;
  onGetStarted: () => void;
}