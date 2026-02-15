import { ShiftStatus } from "@/common/common-models/model-shift/shiftTypes";

/**
 * Material Design 3 カラーシステム
 *
 * ソースカラー: #2196F3 (Material Blue 500)
 * トーナルパレットは MD3 アルゴリズムに基づき事前計算済み
 *
 * 命名規則: MD3 Color Roles
 * - primary / onPrimary / primaryContainer / onPrimaryContainer
 * - secondary / onSecondary / secondaryContainer / onSecondaryContainer
 * - tertiary / onTertiary / tertiaryContainer / onTertiaryContainer
 * - error / onError / errorContainer / onErrorContainer
 * - surface / onSurface / surfaceVariant / onSurfaceVariant
 * - surfaceContainer[Lowest|Low|High|Highest]
 * - outline / outlineVariant
 * - inverseSurface / inverseOnSurface / inversePrimary
 * - scrim / shadow
 */

// ---------------------------------------------------------------------------
// Tonal Palettes (pre-computed from source #2196F3)
// ---------------------------------------------------------------------------

/** Primary tonal palette (Blue) */
const primaryPalette = {
  0: "#000000",
  10: "#001D36",
  20: "#003258",
  30: "#00497D",
  40: "#1565C0", // ~ primary light
  50: "#2979D6",
  60: "#5094E8",
  70: "#7CB0F5",
  80: "#A8CBFF", // ~ primary dark
  90: "#D3E4FF",
  95: "#EBF1FF",
  98: "#F8F9FF",
  99: "#FDFCFF",
  100: "#FFFFFF",
} as const;

/** Secondary tonal palette (Blue-grey) */
const secondaryPalette = {
  0: "#000000",
  10: "#0E1D2A",
  20: "#233240",
  30: "#394857",
  40: "#515F6F",
  50: "#697888",
  60: "#8392A2",
  70: "#9DACBD",
  80: "#B8C8D9",
  90: "#D4E4F5",
  95: "#E8F1FF",
  98: "#F8F9FF",
  99: "#FDFCFF",
  100: "#FFFFFF",
} as const;

/** Tertiary tonal palette (Violet) */
const tertiaryPalette = {
  0: "#000000",
  10: "#1D1635",
  20: "#322B4B",
  30: "#494163",
  40: "#61597B",
  50: "#7A7296",
  60: "#948CB0",
  70: "#AFA6CC",
  80: "#CBC1E9",
  90: "#E7DDFF",
  95: "#F5EEFF",
  98: "#FDF7FF",
  99: "#FFFBFF",
  100: "#FFFFFF",
} as const;

/** Error tonal palette (Red) */
const errorPalette = {
  0: "#000000",
  10: "#410002",
  20: "#690005",
  30: "#93000A",
  40: "#BA1A1A",
  50: "#DE3730",
  60: "#FF5449",
  70: "#FF897D",
  80: "#FFB4AB",
  90: "#FFDAD6",
  95: "#FFEDEA",
  98: "#FFF8F7",
  99: "#FFFBFF",
  100: "#FFFFFF",
} as const;

/** Neutral tonal palette (for surfaces) */
const neutralPalette = {
  0: "#000000",
  4: "#0D0E11",
  6: "#121316",
  10: "#1A1C1E",
  12: "#1E2022",
  17: "#282A2D",
  20: "#2F3033",
  22: "#333538",
  24: "#38393C",
  30: "#46474A",
  40: "#5E5E62",
  50: "#77777A",
  60: "#919094",
  70: "#ABABAE",
  80: "#C7C6CA",
  87: "#D9D8DC",
  90: "#E3E2E6",
  92: "#E9E7EC",
  94: "#EFEDF1",
  95: "#F1F0F4",
  96: "#F4F3F7",
  98: "#FAF9FD",
  99: "#FDFCFF",
  100: "#FFFFFF",
} as const;

/** Neutral-variant tonal palette (for outlines, surface-variant) */
const neutralVariantPalette = {
  0: "#000000",
  10: "#191C20",
  20: "#2E3135",
  30: "#44474C",
  40: "#5C5F63",
  50: "#74777C",
  60: "#8E9196",
  70: "#A9ABB1",
  80: "#C4C6CC",
  90: "#E0E2E8",
  95: "#EEF0F7",
  98: "#F8F9FF",
  99: "#FDFCFF",
  100: "#FFFFFF",
} as const;

// ---------------------------------------------------------------------------
// Color Scheme Type
// ---------------------------------------------------------------------------

export interface MD3ColorScheme {
  // Primary
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;

  // Secondary
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;

  // Tertiary
  tertiary: string;
  onTertiary: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;

  // Error
  error: string;
  onError: string;
  errorContainer: string;
  onErrorContainer: string;

  // Surface
  surface: string;
  onSurface: string;
  surfaceVariant: string;
  onSurfaceVariant: string;
  surfaceDim: string;
  surfaceBright: string;
  surfaceContainerLowest: string;
  surfaceContainerLow: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;
  surfaceContainerHighest: string;

  // Outline
  outline: string;
  outlineVariant: string;

  // Inverse
  inverseSurface: string;
  inverseOnSurface: string;
  inversePrimary: string;

  // Utility
  scrim: string;
  shadow: string;

  // Semantic (app-specific extensions)
  success: string;
  onSuccess: string;
  successContainer: string;
  warning: string;
  onWarning: string;
  warningContainer: string;

  // Shift status colors (fixed per theme, not derived from palette)
  shift: Record<ShiftStatus, string>;
}

// ---------------------------------------------------------------------------
// Light Scheme
// ---------------------------------------------------------------------------

export const lightColorScheme: MD3ColorScheme = {
  // Primary
  primary: primaryPalette[40],
  onPrimary: primaryPalette[100],
  primaryContainer: primaryPalette[90],
  onPrimaryContainer: primaryPalette[10],

  // Secondary
  secondary: secondaryPalette[40],
  onSecondary: secondaryPalette[100],
  secondaryContainer: secondaryPalette[90],
  onSecondaryContainer: secondaryPalette[10],

  // Tertiary
  tertiary: tertiaryPalette[40],
  onTertiary: tertiaryPalette[100],
  tertiaryContainer: tertiaryPalette[90],
  onTertiaryContainer: tertiaryPalette[10],

  // Error
  error: errorPalette[40],
  onError: errorPalette[100],
  errorContainer: errorPalette[90],
  onErrorContainer: errorPalette[10],

  // Surface
  surface: neutralPalette[98],
  onSurface: neutralPalette[10],
  surfaceVariant: neutralVariantPalette[90],
  onSurfaceVariant: neutralVariantPalette[30],
  surfaceDim: neutralPalette[87],
  surfaceBright: neutralPalette[98],
  surfaceContainerLowest: neutralPalette[100],
  surfaceContainerLow: neutralPalette[96],
  surfaceContainer: neutralPalette[94],
  surfaceContainerHigh: neutralPalette[92],
  surfaceContainerHighest: neutralPalette[90],

  // Outline
  outline: neutralVariantPalette[50],
  outlineVariant: neutralVariantPalette[80],

  // Inverse
  inverseSurface: neutralPalette[20],
  inverseOnSurface: neutralPalette[95],
  inversePrimary: primaryPalette[80],

  // Utility
  scrim: neutralPalette[0],
  shadow: neutralPalette[0],

  // Semantic
  success: "#2E7D32",
  onSuccess: "#FFFFFF",
  successContainer: "#C8E6C9",
  warning: "#F57C00",
  onWarning: "#FFFFFF",
  warningContainer: "#FFE0B2",

  // Shift status (established colors users are familiar with)
  shift: {
    draft: "#FFFFFF",
    pending: "#FF9F0A",
    approved: "#0A84FF",
    rejected: "#FF3B30",
    deleted: "#1C1C1E",
    completed: "#34C759",
    deletion_requested: "#FF9F0A",
    purged: "#FFFFFF",
    recruitment: "#9E9E9E",
  },
};

// ---------------------------------------------------------------------------
// Palette export (for advanced usage like tinted surfaces)
// ---------------------------------------------------------------------------

export const md3Palettes = {
  primary: primaryPalette,
  secondary: secondaryPalette,
  tertiary: tertiaryPalette,
  error: errorPalette,
  neutral: neutralPalette,
  neutralVariant: neutralVariantPalette,
} as const;
