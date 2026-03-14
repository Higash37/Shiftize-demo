/**
 * @file constants.ts
 * @description カレンダーモジュール全体で使う定数・フックを定義するファイル。
 *              画面サイズに応じたカレンダーの寸法計算、祝日データ、曜日名、
 *              プラットフォーム判定などを提供する。
 */

// --- 【このファイルの位置づけ】 ---
// インポート元: react-native（Dimensions, Platform）, react（useMemo）,
//              japaneseHolidays（祝日データ取得関数）
// インポート先: DayComponent.tsx, ShiftCalendar.tsx, calendar.utils.ts, DayComponent.styles.ts など
//              カレンダーモジュールのほぼ全ファイルが参照する中心的な定数ファイル。

import { Dimensions, Platform } from "react-native";
import { useMemo } from "react";

// --- 画面サイズ定数 ---

// Dimensions.get("window") で現在の画面サイズを取得する。
// 分割代入（destructuring）で width と height を取り出し、
// SCREEN_WIDTH, SCREEN_HEIGHT という別名に束縛している。
const { width: SCREEN_WIDTH } = Dimensions.get("window");

// カレンダーの横幅を画面幅の30%に設定する基本比率
export const BASE_CALENDAR_WIDTH_RATIO = 0.3; // 画面幅の30%をデフォルトに

// Math.min() で「画面幅の30%」と「500px」の小さい方を選ぶ。
// これにより大画面でもカレンダーが巨大になりすぎないよう制限する。
export const CALENDAR_WIDTH = Math.min(
  SCREEN_WIDTH * BASE_CALENDAR_WIDTH_RATIO,
  500 // 最大幅を500pxに制限
);

// 7列（日〜土）で割って1日分の幅を計算。Math.floor() で小数点以下を切り捨て。
export const DAY_WIDTH = Math.floor(CALENDAR_WIDTH / 7);

// 日付セルの高さ。幅の60%にすることで少し横長のセルになる。
export const DAY_HEIGHT = Math.floor(DAY_WIDTH * 0.6); // 少し高さを調整

/**
 * useResponsiveCalendarSize フック
 *
 * 画面サイズに基づいてカレンダーの最適なサイズを計算するカスタムフック。
 * useMemo で計算結果をキャッシュし、不要な再計算を防ぐ。
 *
 * useMemo の第2引数 [] が空配列 = 初回レンダリング時のみ計算する。
 * ※ 画面回転を検知するには別途 Dimensions のイベントリスナーが必要。
 *
 * 戻り値:
 *   - calendarWidth: カレンダー全体の横幅（px）
 *   - dayWidth:      1日分のセルの横幅（px）
 *   - dayHeight:     1日分のセルの高さ（px）
 *   - isSmallScreen: 画面幅が768px未満かどうか（スマホ判定）
 */
export const useResponsiveCalendarSize = () => {
  return useMemo(() => {
    // 画面サイズを再取得（画面回転などに対応）
    const { width } = Dimensions.get("window"); // 画面サイズに基づいて適切な値を計算

    // 768px はタブレットとスマホの境界としてよく使われるブレークポイント
    const isSmallScreen = width < 768;

    // 全体的なサイズ縮小率（小さな画面ではさらに縮小）
    // 現在はどちらも 0.95 だが、将来的に分けることを想定した設計
    const scaleFactor = isSmallScreen ? 0.95 : 0.95;

    // 三項演算子: 条件 ? 真の場合 : 偽の場合
    const calendarWidth = isSmallScreen
      ? width * 0.95 * scaleFactor // 小さい画面では95%幅×縮小率
      : Math.min(width * BASE_CALENDAR_WIDTH_RATIO * scaleFactor, 430); // 最大幅も縮小

    // 7列で割って1日分の幅を計算
    const dayWidth = Math.floor(calendarWidth / 7);

    // 小さい画面では高さの比率を大きめにして、タップしやすくする
    const dayHeight = Math.floor(dayWidth * (isSmallScreen ? 0.9 : 0.75)); // 高さをさらに調整

    return {
      calendarWidth,
      dayWidth,
      dayHeight,
      isSmallScreen,
    };
  }, []); // 依存配列が空 → コンポーネントの初回マウント時のみ計算
};

// --- 祝日データ ---

// 日本の祝日（APIから自動取得、キャッシュ済みデータを同期的に参照）
import { getHolidaysSync } from "@/common/common-utils/util-settings/japaneseHolidays";

/**
 * HOLIDAYS オブジェクト
 *
 * Proxy（プロキシ）を使って、祝日データへのアクセスを動的に処理している。
 *
 * Proxy とは:
 *   - オブジェクトへのアクセス（読み取り、書き込み等）を横取り（インターセプト）できる仕組み。
 *   - ここでは空オブジェクト {} への読み取りアクセスを横取りして、
 *     代わりに getHolidaysSync() の結果を返している。
 *
 * なぜ Proxy を使うか:
 *   - 祝日データはAPIから非同期で取得されるが、このオブジェクトは同期的にアクセスされる。
 *   - Proxy を介することで、常に最新のキャッシュデータを返せる。
 *
 * 各トラップ（ハンドラ）の役割:
 *   - get:   HOLIDAYS["2026-01-01"] のようなアクセスで呼ばれる
 *   - has:   "2026-01-01" in HOLIDAYS のようなチェックで呼ばれる
 *   - ownKeys:   Object.keys(HOLIDAYS) で呼ばれる
 *   - getOwnPropertyDescriptor:   Object.keys 等で各キーの情報を取得するために呼ばれる
 */
export const HOLIDAYS: { [key: string]: string } = new Proxy(
  {} as Record<string, string>, // ターゲット: 空のオブジェクト。Record<string, string> は「キーも値もstring型のオブジェクト」
  {
    // プロパティ読み取り時のトラップ。_target はターゲット（空オブジェクト）、prop はアクセスされたキー
    get(_target, prop: string) {
      return getHolidaysSync()[prop];
    },
    // `in` 演算子でチェックされた時のトラップ
    has(_target, prop: string) {
      return prop in getHolidaysSync();
    },
    // Object.keys() で呼ばれるトラップ
    ownKeys() {
      return Object.keys(getHolidaysSync());
    },
    // Object.keys が内部的に呼ぶトラップ。configurable: true がないと列挙できない
    getOwnPropertyDescriptor(_target, prop: string) {
      const holidays = getHolidaysSync();
      if (prop in holidays) {
        return { configurable: true, enumerable: true, value: holidays[prop] };
      }
      return undefined;
    },
  }
);

// --- 曜日名 ---

// 日本語の曜日を配列で定義。インデックス0が日曜、6が土曜。
// new Date().getDay() の戻り値（0=日曜〜6=土曜）と対応している。
export const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

// --- プラットフォーム判定 ---

/**
 * PLATFORM_SPECIFIC
 *
 * 実行中のプラットフォーム（Web / iOS / Android）を判定するフラグ。
 * Platform.OS は react-native が提供する定数で、実行環境を返す。
 * 条件分岐でプラットフォーム固有の処理を書く際に使う。
 */
export const PLATFORM_SPECIFIC = {
  isWeb: Platform.OS === "web",       // Webブラウザで動作中か
  isIOS: Platform.OS === "ios",       // iOSで動作中か
  isAndroid: Platform.OS === "android", // Androidで動作中か
};
