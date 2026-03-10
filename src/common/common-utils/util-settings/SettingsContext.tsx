/**
 * @file SettingsContext.tsx
 * @description アプリ設定をReact Context経由で全コンポーネントに共有するためのProvider。useSettings() フックで設定値にアクセスできる。
 *
 * ============================================================
 * 【なぜ設定を Context で管理するのか — グローバル設定の設計パターン】
 * ============================================================
 *
 * ■ 設定データの特徴
 *   アプリ設定（シフトルール、外観、祝日など）は以下の性質を持つ:
 *   - アプリ全体のあちこちで参照される（シフト画面、設定画面、バリデーションなど）
 *   - 変更される頻度は低い（ユーザーが設定画面で変更したときだけ）
 *   → この「広く読まれるが、めったに書き換えない」データに Context は最適。
 *
 * ■ Context が適切な場合
 *   - 設定（このファイル）: 読み取りが多く、更新は設定画面からのみ
 *   - テーマ（ダーク/ライトモード）: 全コンポーネントが参照、切り替えは稀
 *   - 認証状態（ログイン中のユーザー情報）: 多くの画面が参照、変更はログイン/ログアウト時だけ
 *
 * ■ Context が不適切な場合（ケースバイケース）
 *   - フォーム入力値: キー入力のたびに更新 → Context で管理すると全子コンポーネントが
 *     再レンダリングされてパフォーマンスが悪化。useState や useReducer で局所管理すべき。
 *   - アニメーション値: 毎フレーム更新される → Animated.Value や Reanimated を使うべき。
 *   - 大量のリストデータ: 頻繁にフィルタ/ソートされる → 状態管理ライブラリ（Zustand 等）
 *     の方が細かいパフォーマンス制御が可能。
 *
 * ■ この設定 Context の設計ポイント
 *   useAppSettings() フックで実際のロジック（読み込み、保存、バリデーション）を実装し、
 *   SettingsProvider はそれを Context 経由で配信するだけの薄いラッパー。
 *   → ロジックとデータ配信を分離することで、テストやメンテナンスがしやすくなる。
 * ============================================================
 */

// ── React の createContext / useContext について ──
// createContext: アプリ全体で共有したいデータの「入れ物」を作る
// useContext: その「入れ物」からデータを取り出すフック
// ReactNode: JSX要素や文字列など、React が描画できるものすべてを表す型
import React, { createContext, useContext, ReactNode } from "react";
import { useAppSettings, AppSettings } from "./useAppSettings";

/**
 * SettingsContext が提供する値の型定義
 *
 * ── interface について ──
 * interface はオブジェクトの「形」を定義する。
 * 中に書いたプロパティ名と型が、そのオブジェクトに必要なフィールドを表す。
 */
interface SettingsContextType {
  settings: AppSettings;
  loading: boolean;
  // `string | null` → 文字列か null のどちらか（ユニオン型）
  error: string | null;

  // 基本操作
  loadSettings: () => Promise<void>;
  // `Partial<AppSettings>` → AppSettings の全プロパティがオプショナルになった型
  // 例: { shiftRule: { maxWorkHours: 10 } } のように一部だけ渡せる
  saveSettings: (settings: Partial<AppSettings>) => Promise<void>;

  // 個別設定更新
  // `Partial<AppSettings["shiftRule"]>` → AppSettings の shiftRule プロパティの型を取り出し、さらに Partial で全フィールドをオプショナルにする
  updateShiftRuleSettings: (
    settings: Partial<AppSettings["shiftRule"]>
  ) => Promise<void>;
  updateAppearanceSettings: (
    settings: Partial<AppSettings["appearance"]>
  ) => Promise<void>;
  updateHolidaySettings: (
    settings: Partial<AppSettings["holidays"]>
  ) => Promise<void>;

  // 祝日・特別日操作
  // `Omit<型, "id">` → 指定した型から "id" プロパティを除いた新しい型を作る
  // 新規追加時は id を自動生成するので、呼び出し側は id を渡さなくてよい
  addHoliday: (
    holiday: Omit<AppSettings["holidays"]["holidays"][0], "id">
  ) => Promise<void>;
  removeHoliday: (holidayId: string) => Promise<void>;
  addSpecialDay: (
    specialDay: Omit<AppSettings["holidays"]["specialDays"][0], "id">
  ) => Promise<void>;
  removeSpecialDay: (specialDayId: string) => Promise<void>;

  // 日付チェック関数
  isHoliday: (date: string) => boolean;
  isSpecialDay: (date: string) => boolean;
  getHolidayInfo: (date: string) => {
    isHoliday: boolean;
    isSpecialDay: boolean;
    holidayName: string | undefined;
    specialDayName: string | undefined;
    isWorkingDay: boolean | undefined;
  };

  // 設定管理機能
  resetSettings: () => Promise<void>;
  exportSettings: () => string;
  importSettings: (settingsJson: string) => Promise<void>;
}

// ── createContext の初期値に undefined を渡す理由 ──
// Provider の外で useSettings() を使ったときにエラーを投げるため。
// `<SettingsContextType | undefined>` は「値が入っているか、まだ未定義か」を表す。
const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

/**
 * SettingsProvider の Props 型
 * children: この Provider で囲まれた子コンポーネント
 */
interface SettingsProviderProps {
  children: ReactNode;
}

/**
 * 設定データを子コンポーネントに提供する Provider コンポーネント
 *
 * ── React.FC<Props> について ──
 * React.FC は React の関数コンポーネントの型。
 * <SettingsProviderProps> でこのコンポーネントが受け取る Props の型を指定する。
 *
 * 使い方: アプリのルート付近で <SettingsProvider> を配置する
 */
export const SettingsProvider: React.FC<SettingsProviderProps> = ({
  children,
}) => {
  // useAppSettings() フックから設定に関する全機能を取得
  const settingsHook = useAppSettings();

  // Context.Provider の value に渡したオブジェクトが、
  // 子コンポーネントから useSettings() で取り出せるようになる
  return (
    <SettingsContext.Provider value={settingsHook}>
      {children}
    </SettingsContext.Provider>
  );
};

/**
 * 設定データにアクセスするためのカスタムフック
 *
 * @returns SettingsContextType - 設定値と操作関数一式
 * @throws Error - SettingsProvider の外で呼び出した場合
 *
 * 呼び出し元: 設定画面、シフトルール確認が必要なコンポーネント全般
 */
export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  // Provider の外で使うと undefined になるので、開発者にわかりやすいエラーを投げる
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
