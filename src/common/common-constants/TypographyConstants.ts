export type TypographyType = {
  fontSize: {
    small: number;
    medium: number;
    large: number;
    xlarge: number;
    xxlarge: number;
  };
  fontWeight: {
    regular: string;
    medium: string;
    bold: string;
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
    regular: "400",
    medium: "500",
    bold: "700",
  },
};
