import { APP_FONT_FAMILY } from "@/common/common-constants/FontConstants";

export const typography = {
  fontSize: {
    small: 12,
    medium: 16,
    large: 20,
    xlarge: 24,
  },
  fontWeight: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeight: {
    small: 16,
    medium: 20,
    large: 24,
    xlarge: 28,
  },
  fontFamily: {
    regular: APP_FONT_FAMILY,
    bold: APP_FONT_FAMILY,
  },
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
  },
};
