export type TypographyType = {
  fontSize: {
    small: number;
    medium: number;
    large: number;
    xlarge: number;
    xxlarge: number;
  };
  fontWeight: {
    light: string;
    regular: string;
    medium: string;
    semibold: string;
    bold: string;
  };
  fontFamily: string;
  letterSpacing: {
    tight: number;
    normal: number;
    wide: number;
  };
};

export const typography: TypographyType = {
  fontSize: {
    small: 12,
    medium: 14,
    large: 16,
    xlarge: 18,
    xxlarge: 24,
  },
  fontWeight: {
    light: "300",
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
  },
};
