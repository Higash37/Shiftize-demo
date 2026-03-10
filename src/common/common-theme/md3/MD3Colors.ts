/**
 * @file MD3Colors.ts
 * @description Material Design 3 (MD3) のカラーシステムを定義するファイル。
 *   アプリ全体で使われる「色の設計図」にあたる。
 *   MD3 では「ソースカラー」から数学的に複数の色を生成し、
 *   それらを「ロール（役割）」に割り当てるという考え方をする。
 *
 * 【このファイルの位置づけ】
 *   ■ 上位ファイル（このファイルをimportしている）:
 *     - MD3ThemeContext.tsx  … lightTheme オブジェクトの colorScheme に使用
 *     - md3/index.ts        … 再エクスポート
 *     - index.ts (common-theme) … レガシー Theme オブジェクトの色を導出
 *     - ColorConstants.ts   … レガシー colors 定数を導出
 *   ■ 下位ファイル（このファイルがimportしている）:
 *     - shiftTypes.ts       … ShiftStatus 型（シフトのステータス一覧）
 *   ■ テーマシステム全体での役割:
 *     MD3Colors ─→ MD3ThemeContext ─→ useMD3Theme() ─→ 各コンポーネント
 *     （色の定義）  （テーマ統合）     （フックで取得） （画面で使用）
 */
// ============================================================================
// 【なぜ Material Design 3 のテーマシステムを使うのか — デザインシステムの歴史】
// ============================================================================
// このファイルでは色を「パレット」と「ロール（役割）」で体系的に管理している。
// なぜ単に colors = { blue: "#1565C0" } のように書かないのか？
//
// ■ デザインシステムとは:
//   色、フォント、間隔、角丸などの見た目ルールを体系化したもの。
//   チーム開発で「この青はどの青？」「ボタンの角丸は何px？」という
//   議論をなくし、一貫したUIを保つための「設計のルールブック」。
//
// ■ Material Design の歴史:
//   - Material Design 1（2014年）: Google が発表。物理世界の「紙とインク」を
//     デジタルで再現するという思想。影（Elevation）で要素の重なりを表現。
//   - Material Design 2（2018年）: より柔軟なカスタマイズを許容。
//   - Material Design 3 / Material You（2021年〜）: ユーザーの壁紙から
//     自動で配色を生成する「Dynamic Color」を導入。カスタマイズ性を大幅強化。
//
// ■ なぜ独自テーマではなく MD3 を使うのか:
//   1. デザインの一貫性: 数十のコンポーネントが同じルールで色を使う
//   2. アクセシビリティ: MD3 のカラーロールは WCAG コントラスト比を満たすよう設計
//      （例: primary の上には必ず onPrimary を使えば読みやすさが保証される）
//   3. ベストプラクティス: Google が数年かけて研究・テストした結果の集大成
//   4. エコシステム: Material UI, React Native Paper 等のライブラリと親和性が高い
//
// ■ ケースバイケース:
//   - 企業アプリ・業務アプリ → MD3 や Ant Design 等の既存デザインシステム推奨
//     （車輪の再発明を避け、品質の高い UI を短期間で構築できる）
//   - ゲーム・エンタメ系 → 独自デザインの方が個性を出せる
//   - 小規模個人プロジェクト → 好みで選んでOK。ただしルールを決めないと
//     ページごとに見た目がバラバラになりがち
// ============================================================================

// ShiftStatus は "draft" | "pending" | "approved" | ... というユニオン型。
// シフトの状態ごとに色を割り当てるために使う。
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

// ===========================================================================
// トーナルパレット (Tonal Palettes)
// ===========================================================================
// 「トーナルパレット」とは、1つの色相（たとえば青）を明るさ0%〜100%まで
// 段階的に並べたもの。数字が小さいほど暗く、大きいほど明るい。
// MD3ではこのパレットから「ロール（役割）」に色を割り当てる。
//
// `as const` は TypeScript の構文で、オブジェクトの値を「リテラル型」として
// 固定する。例: primaryPalette[40] の型は string ではなく "#1565C0" になる。
// これにより、後から値を変更するミスを防げる。

/** Primary トーナルパレット (Blue系) - アプリのメインカラー */
const primaryPalette = {
  0: "#000000",    // 最も暗い（黒）
  10: "#001D36",   // 非常に暗い青
  20: "#003258",
  30: "#00497D",
  40: "#1565C0",   // ← ライトテーマの primary として使用される
  50: "#2979D6",
  60: "#5094E8",
  70: "#7CB0F5",
  80: "#A8CBFF",   // ← ダークテーマの primary として使われる想定
  90: "#D3E4FF",   // ← ライトテーマの primaryContainer として使用される
  95: "#EBF1FF",
  98: "#F8F9FF",
  99: "#FDFCFF",
  100: "#FFFFFF",  // 最も明るい（白）
} as const;

/** Secondary トーナルパレット (Blue-grey系) - 補助的なUI要素に使用 */
const secondaryPalette = {
  0: "#000000",
  10: "#0E1D2A",
  20: "#233240",
  30: "#394857",
  40: "#515F6F",   // ← ライトテーマの secondary
  50: "#697888",
  60: "#8392A2",
  70: "#9DACBD",
  80: "#B8C8D9",
  90: "#D4E4F5",   // ← ライトテーマの secondaryContainer
  95: "#E8F1FF",
  98: "#F8F9FF",
  99: "#FDFCFF",
  100: "#FFFFFF",
} as const;

/** Tertiary トーナルパレット (Violet系) - アクセントや第三の強調色 */
const tertiaryPalette = {
  0: "#000000",
  10: "#1D1635",
  20: "#322B4B",
  30: "#494163",
  40: "#61597B",   // ← ライトテーマの tertiary
  50: "#7A7296",
  60: "#948CB0",
  70: "#AFA6CC",
  80: "#CBC1E9",
  90: "#E7DDFF",   // ← ライトテーマの tertiaryContainer
  95: "#F5EEFF",
  98: "#FDF7FF",
  99: "#FFFBFF",
  100: "#FFFFFF",
} as const;

/** Error トーナルパレット (Red系) - エラー・警告表示に使用 */
const errorPalette = {
  0: "#000000",
  10: "#410002",
  20: "#690005",
  30: "#93000A",
  40: "#BA1A1A",   // ← ライトテーマの error
  50: "#DE3730",
  60: "#FF5449",
  70: "#FF897D",
  80: "#FFB4AB",
  90: "#FFDAD6",   // ← ライトテーマの errorContainer
  95: "#FFEDEA",
  98: "#FFF8F7",
  99: "#FFFBFF",
  100: "#FFFFFF",
} as const;

/** Neutral トーナルパレット (無彩色) - 背景、サーフェスに使用 */
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
  90: "#E3E2E6",   // ← surfaceContainerHighest
  92: "#E9E7EC",   // ← surfaceContainerHigh
  94: "#EFEDF1",   // ← surfaceContainer
  95: "#F1F0F4",
  96: "#F4F3F7",   // ← surfaceContainerLow
  98: "#FAF9FD",   // ← surface, surfaceBright
  99: "#FDFCFF",
  100: "#FFFFFF",  // ← surfaceContainerLowest
} as const;

/** Neutral-variant トーナルパレット - アウトライン、サーフェスバリアントに使用 */
const neutralVariantPalette = {
  0: "#000000",
  10: "#191C20",
  20: "#2E3135",
  30: "#44474C",   // ← onSurfaceVariant
  40: "#5C5F63",
  50: "#74777C",   // ← outline
  60: "#8E9196",
  70: "#A9ABB1",
  80: "#C4C6CC",   // ← outlineVariant
  90: "#E0E2E8",   // ← surfaceVariant
  95: "#EEF0F7",
  98: "#F8F9FF",
  99: "#FDFCFF",
  100: "#FFFFFF",
} as const;

// ===========================================================================
// カラースキーム型定義 (Color Scheme Type)
// ===========================================================================

/**
 * MD3ColorScheme インターフェース
 *
 * MD3 の「カラーロール」を全て定義する型。
 * 「カラーロール」とは色の「役割」のこと。
 *
 * 基本パターン:
 *   - primary     → ボタンやアイコンなどメインのUI要素の色
 *   - onPrimary   → primary の上に乗るテキストやアイコンの色（コントラスト確保）
 *   - primaryContainer → primary 系の背景色（より控えめ）
 *   - onPrimaryContainer → primaryContainer の上に乗るテキストの色
 *   ※ secondary, tertiary, error も同じパターン
 *
 * Record<ShiftStatus, string> について:
 *   Record<K, V> は「キーが K 型、値が V 型のオブジェクト」を意味するTypeScriptのユーティリティ型。
 *   Record<ShiftStatus, string> = { draft: string; pending: string; approved: string; ... }
 *   と同じ意味になる。
 */
export interface MD3ColorScheme {
  // --- Primary (メインカラー) ---
  // ボタン、FAB（フローティングアクションボタン）、選択状態などに使用
  primary: string;              // メインの強調色（例: ボタンの背景）
  onPrimary: string;            // primary の上に乗る色（例: ボタンのテキスト）
  primaryContainer: string;     // primary 系の控えめな背景色（例: 選択されたカードの背景）
  onPrimaryContainer: string;   // primaryContainer の上に乗る色

  // --- Secondary (補助カラー) ---
  // チップ、フィルター、補助的なボタンなどに使用
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;

  // --- Tertiary (第三のカラー) ---
  // アクセントやバランスを取るための第三の色。primary/secondary と区別したい時に使用
  tertiary: string;
  onTertiary: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;

  // --- Error (エラーカラー) ---
  // バリデーションエラー、削除確認、警告表示などに使用
  error: string;
  onError: string;
  errorContainer: string;
  onErrorContainer: string;

  // --- Surface (サーフェス / 背景) ---
  // 画面の背景、カードの背景、リストの背景などに使用。
  // MD3 では「サーフェスコンテナ」を5段階の明るさで定義し、
  // 要素の重要度や階層に応じて使い分ける。
  surface: string;                    // 標準の背景色
  onSurface: string;                  // surface 上のテキスト色
  surfaceVariant: string;             // 少し色味のある背景（入力フィールドなど）
  onSurfaceVariant: string;           // surfaceVariant 上のテキスト色
  surfaceDim: string;                 // やや暗いサーフェス
  surfaceBright: string;              // やや明るいサーフェス
  surfaceContainerLowest: string;     // 最も明るいコンテナ（背景の最下層）
  surfaceContainerLow: string;        // 明るいコンテナ
  surfaceContainer: string;           // 標準コンテナ
  surfaceContainerHigh: string;       // やや濃いコンテナ
  surfaceContainerHighest: string;    // 最も濃いコンテナ（最前面の要素）

  // --- Outline (輪郭線 / 区切り線) ---
  outline: string;                    // はっきりした輪郭線（入力フィールドのボーダー等）
  outlineVariant: string;             // 控えめな輪郭線（区切り線、ディバイダー等）

  // --- Inverse (反転カラー) ---
  // スナックバーやトーストなど、背景色と逆のコントラストが必要な場面で使用
  inverseSurface: string;
  inverseOnSurface: string;
  inversePrimary: string;

  // --- Utility (ユーティリティ) ---
  scrim: string;   // モーダルの背景オーバーレイ（半透明の黒）
  shadow: string;  // 影の色

  // --- Semantic (アプリ固有の拡張カラー) ---
  // MD3 標準にはないが、アプリの要件で追加した色
  success: string;              // 成功（例: 保存完了の通知）
  onSuccess: string;            // success の上のテキスト色
  successContainer: string;     // 成功系の控えめな背景
  warning: string;              // 警告（例: 注意が必要な状態）
  onWarning: string;
  warningContainer: string;

  // --- Shift status (シフトステータスカラー) ---
  // シフトの状態ごとに固定の色を割り当てる。
  // Record<ShiftStatus, string> は全ての ShiftStatus キーに対して string 値を持つオブジェクト型。
  shift: Record<ShiftStatus, string>;
}

// ===========================================================================
// ライトカラースキーム (Light Color Scheme)
// ===========================================================================

/**
 * ライトテーマ用のカラースキーム
 *
 * MD3 のライトテーマでは:
 *   - primary にはパレットの 40 番（やや暗い色）を使う
 *   - onPrimary には 100 番（白）を使う → コントラスト確保
 *   - primaryContainer には 90 番（非常に明るい色）を使う
 *   - onPrimaryContainer には 10 番（非常に暗い色）を使う → コントラスト確保
 *
 * この「暗い色の上に白、明るい色の上に暗い色」というパターンが
 * MD3 のアクセシビリティ（視認性）設計の基本。
 */
export const lightColorScheme: MD3ColorScheme = {
  // --- Primary ---
  // パレット[40] = "#1565C0"（やや暗い青）→ ボタン等のメイン色
  // パレット[100] = "#FFFFFF"（白）→ ボタン上のテキスト
  primary: primaryPalette[40],
  onPrimary: primaryPalette[100],
  primaryContainer: primaryPalette[90],      // 明るい青 → 選択状態の背景
  onPrimaryContainer: primaryPalette[10],    // 非常に暗い青 → コンテナ上のテキスト

  // --- Secondary ---
  // 同じパターン: [40]=メイン色, [100]=上のテキスト, [90]=コンテナ, [10]=コンテナ上テキスト
  secondary: secondaryPalette[40],
  onSecondary: secondaryPalette[100],
  secondaryContainer: secondaryPalette[90],
  onSecondaryContainer: secondaryPalette[10],

  // --- Tertiary ---
  tertiary: tertiaryPalette[40],
  onTertiary: tertiaryPalette[100],
  tertiaryContainer: tertiaryPalette[90],
  onTertiaryContainer: tertiaryPalette[10],

  // --- Error ---
  error: errorPalette[40],
  onError: errorPalette[100],
  errorContainer: errorPalette[90],
  onErrorContainer: errorPalette[10],

  // --- Surface ---
  // neutralPalette を使用。数字が大きいほど明るい。
  // ライトテーマでは明るい色（90〜100番台）をサーフェスに使う。
  surface: neutralPalette[98],                    // ほぼ白の背景
  onSurface: neutralPalette[10],                  // ほぼ黒のテキスト
  surfaceVariant: neutralVariantPalette[90],       // 少しグレーがかった背景
  onSurfaceVariant: neutralVariantPalette[30],     // やや暗いテキスト
  surfaceDim: neutralPalette[87],                  // 少し暗めの背景
  surfaceBright: neutralPalette[98],               // 明るい背景
  surfaceContainerLowest: neutralPalette[100],     // 真っ白（最下層）
  surfaceContainerLow: neutralPalette[96],         // ごくわずかにグレー
  surfaceContainer: neutralPalette[94],            // 標準のコンテナ
  surfaceContainerHigh: neutralPalette[92],        // やや濃いグレー
  surfaceContainerHighest: neutralPalette[90],     // 最も濃いコンテナ

  // --- Outline ---
  outline: neutralVariantPalette[50],              // 中間のグレー（はっきりした線）
  outlineVariant: neutralVariantPalette[80],       // 薄いグレー（控えめな線）

  // --- Inverse ---
  inverseSurface: neutralPalette[20],              // 暗い背景（スナックバー等）
  inverseOnSurface: neutralPalette[95],            // 暗い背景上の明るいテキスト
  inversePrimary: primaryPalette[80],              // 暗い背景上のprimary色

  // --- Utility ---
  scrim: neutralPalette[0],   // 黒（モーダル背景のオーバーレイ）
  shadow: neutralPalette[0],  // 黒（影の色）

  // --- Semantic（アプリ固有） ---
  // これらは MD3 のパレットからではなく、直接色コードを指定している。
  // Material Design のカラーガイドに基づいた緑・オレンジ系。
  success: "#2E7D32",            // 緑（成功）
  onSuccess: "#FFFFFF",          // 白（成功色の上のテキスト）
  successContainer: "#C8E6C9",   // 薄い緑（成功系の背景）
  warning: "#F57C00",            // オレンジ（警告）
  onWarning: "#FFFFFF",
  warningContainer: "#FFE0B2",   // 薄いオレンジ（警告系の背景）

  // --- Shift status ---
  // シフトの各状態に対応する色。ユーザーが見慣れた色を維持するため、
  // MD3 パレットではなく固定の色コードを使用している。
  shift: {
    draft: "#FFFFFF",              // 下書き: 白
    pending: "#FF9F0A",            // 申請中: オレンジ
    approved: "#0A84FF",           // 承認済み: 青
    rejected: "#FF3B30",           // 却下: 赤
    deleted: "#1C1C1E",            // 削除済み: ほぼ黒
    completed: "#34C759",          // 完了: 緑
    deletion_requested: "#FF9F0A", // 削除申請中: オレンジ（pending と同色）
    purged: "#FFFFFF",             // 完全非表示: 白
    recruitment: "#9E9E9E",        // 募集中: グレー
  },
};

// ===========================================================================
// パレットエクスポート (Palette export)
// ===========================================================================

/**
 * 全トーナルパレットをまとめてエクスポート
 *
 * 通常のコンポーネント開発では lightColorScheme を使えば十分だが、
 * 「パレットの特定のトーンを直接使いたい」という上級者向けのケースで使用する。
 * 例: ティンテッドサーフェス（primary色を薄く被せた背景）の実装など。
 *
 * `as const` により、このオブジェクトのネストされた全ての値が読み取り専用になる。
 */
export const md3Palettes = {
  primary: primaryPalette,
  secondary: secondaryPalette,
  tertiary: tertiaryPalette,
  error: errorPalette,
  neutral: neutralPalette,
  neutralVariant: neutralVariantPalette,
} as const;
