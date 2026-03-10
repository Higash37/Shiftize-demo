/**
 * @file BoundaryConstants.ts
 * @description 境界値の一元管理。名前にInclusive/Exclusiveを付与し比較演算子との対応を明確にする
 */

/**
 * シフト時間帯の境界値
 * 時間ループでは startHourInclusive <= hour <= endHourInclusive として使用
 */
export const SHIFT_HOURS = {
  /** 通常モードの開始時刻（この時刻を含む） */
  START_HOUR_INCLUSIVE: 9,
  /** 午後モードの開始時刻（この時刻を含む） */
  AFTERNOON_START_HOUR_INCLUSIVE: 13,
  /** シフト終了時刻（この時刻を含む） */
  END_HOUR_INCLUSIVE: 22,
  /** 時間選択の間隔（分） */
  TIME_INTERVAL_MINUTES: 30,
};

/** 1シフト内の最大途中時間数（この数を含む: classes.length > この値 で拒否） */
export const MAX_CLASSES_PER_SHIFT_INCLUSIVE = 6;

/**
 * レスポンシブブレイクポイント
 *
 * 各定数名に Inclusive / Exclusive を付与し、比較演算子を明示。
 * 例: width < SMALL_DEVICE_MAX_WIDTH_EXCLUSIVE → スモールデバイス
 */
export const BREAKPOINTS = {
  /** スモールデバイス上限（この値を含まない: width < 375 → small） */
  SMALL_DEVICE_MAX_WIDTH_EXCLUSIVE: 375,
  /** モバイル上限（この値を含む: width <= 600 → mobile） */
  MOBILE_MAX_WIDTH_INCLUSIVE: 600,
  /** コンパクトビュー下限（この値を含む: width >= 500） */
  COMPACT_VIEW_MIN_WIDTH_INCLUSIVE: 500,
  /** タブレット下限（この値を含む: width >= 768 → tablet） */
  TABLET_MIN_WIDTH_INCLUSIVE: 768,
  /** タブレット上限（この値を含まない: width < 1024） */
  TABLET_MAX_WIDTH_EXCLUSIVE: 1024,
  /** デスクトップ下限（この値を含む: width >= 1280） */
  DESKTOP_MIN_WIDTH_INCLUSIVE: 1280,
};

/**
 * 日付バリデーションの範囲
 * 比較は inclusive: pastLimit <= date <= futureLimit
 */
export const DATE_VALIDATION = {
  /** 未来の許容年数（この年数を含む: today + N年まで有効） */
  MAX_FUTURE_YEARS_INCLUSIVE: 2,
  /** 過去の許容年数（この年数を含む: today - N年まで有効） */
  MAX_PAST_YEARS_INCLUSIVE: 5,
};

/**
 * セキュリティ関連のタイムアウト値
 */
export const SECURITY_TIMEOUTS = {
  /** CSRFトークン有効期限（ミリ秒） - この時間を過ぎたら無効 */
  CSRF_TOKEN_LIFETIME_MS: 30 * 60 * 1000,
  /** レート制限バケットの最大保持期間（ミリ秒） - この時間を超えたら削除 */
  RATE_LIMIT_BUCKET_MAX_AGE_MS: 60 * 60 * 1000,
};
