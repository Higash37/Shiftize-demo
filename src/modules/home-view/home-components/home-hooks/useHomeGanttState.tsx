/**
 * @file useHomeGanttState.tsx
 * @description ホーム画面のガントチャートに必要なデータとUI状態を管理するカスタムフック。
 *   カスタムフックとは「use」で始まる関数で、React のフック（useState等）をまとめて再利用可能にしたもの。
 *   このファイルは「ホーム画面のビジネスロジック」の中心。
 *
 *   データの流れ:
 *     useAuth() → ユーザー情報取得
 *     useShiftsRealtime() → Supabaseからリアルタイムでシフトデータ取得
 *     useUsers() → ユーザー一覧取得
 *     useTimeSegmentTypesContext() → 時間セグメント種別（授業種別の色・アイコン）取得
 *     → buildScheduleColumns() でガントチャート用データに変換
 *     → 各画面コンポーネント（Wide/Tablet/Mobile）に渡す
 *
 *   使われる場所: HomeCommonScreen.tsx
 */

import { useState, useEffect } from "react";
import { format } from "date-fns";
// ↑ date-fns はJavaScriptの日付操作ライブラリ。format() で日付をフォーマットする。
import { useShiftsRealtime } from "@/common/common-utils/util-shift/useShiftsRealtime";
// ↑ Supabaseのリアルタイムリスナー経由でシフトデータを取得するフック
import { useUsers } from "@/modules/reusable-widgets/user-management/user-hooks/useUserList";
import { useAuth } from "@/services/auth/useAuth";
// ↑ ログインユーザーの情報（uid, role, storeId等）を取得するフック
import { colors } from "@/common/common-constants/ThemeConstants";
import { useTimeSegmentTypesContext } from "@/common/common-context/TimeSegmentTypesContext";
// ↑ Contextからデータを取得するフック。Context = コンポーネントツリー全体でデータを共有する仕組み

// --- 時間配列の生成 ---

// 0:00～24:00の30分刻みの時間ラベル（ゼロパディング付き）
const allTimes: string[] = [];
const pad = (n: number) => n.toString().padStart(2, "0");
for (let h = 0; h < 24; h++) {
  allTimes.push(`${pad(h)}:00`);
  allTimes.push(`${pad(h)}:30`);
}
allTimes.push("24:00"); // 終了時刻として24:00を追加

// --- カスタムフック本体 ---

/**
 * ホーム画面のガントチャート表示に必要な全データとUI状態を提供するカスタムフック。
 * 戻り値のオブジェクトに、選択日付・スケジュールデータ・画面判定フラグなどが含まれる。
 *
 * カスタムフックは必ず「use」で始める命名規則がある（Reactのルール）。
 * 関数コンポーネントの中でしか呼び出せない。
 */
export function useHomeGanttState() {
  // --- State ---

  // useAuth: 認証コンテキストからログインユーザー情報を取得
  // user?.storeId の「?.」はオプショナルチェイニング。user が null/undefined でもエラーにならない。
  const { user } = useAuth();

  // useShiftsRealtime: Supabaseのリアルタイムリスナーでシフトデータを購読
  // _loading の「_」は「この変数は使わない」という慣習的な命名。
  const {
    shifts,
  } = useShiftsRealtime(user?.storeId);

  useUsers();
  const { typesMap } = useTimeSegmentTypesContext();
  // ↑ typesMap は Record<string, SegmentType> 型。セグメント種別IDをキーにして種別情報を取得できる。

  // useState<型>(初期値) でステート変数を作成。
  // 配列の分割代入で [現在の値, 更新関数] を受け取る。
  const [selectedDate, setSelectedDate] = useState(new Date());
  // ↑ ユーザーが選択中の日付（初期値: 今日）
  const [showDatePicker, setShowDatePicker] = useState(false);
  // ↑ 日付ピッカーモーダルの表示/非表示
  const [modalUser, setModalUser] = useState<string | null>(null);
  // ↑ ジェネリクス <string | null>: このステートは string か null のどちらかの値を持つ
  //   ユーザーガントモーダルに表示するユーザー名（null = 非表示）
  const [currentYearMonth, setCurrentYearMonth] = useState(() => ({
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
  }));
  // ↑ useState にアロー関数を渡す「遅延初期化」。
  //   コンポーネントの初回レンダリング時だけ実行され、再レンダリング時はスキップされる。

  // --- データのフィルタリング ---

  // マスター以外の場合は自分のシフト（承認済みのみ）でフィルタリング
  // 三項演算子: 条件 ? trueの場合 : falseの場合
  const filteredShifts = user?.role === "master"
    ? shifts                // マスターは全シフトを見れる
    : shifts.filter(        // それ以外は自分の承認済みシフトのみ
        (s) => s.userId === user?.uid && s.status === "approved"
      );

  // --- Hooks ---

  // useEffect: selectedDate が変わるたびにカレンダーの年月を同期する
  // 第2引数の配列（依存配列）に指定した値が変わった時だけ実行される。
  // 空配列 [] なら初回のみ、省略すると毎レンダリング実行。
  useEffect(() => {
    setCurrentYearMonth({
      year: selectedDate.getFullYear(),
      month: selectedDate.getMonth(),
    });
  }, [selectedDate]); // ← 依存配列: selectedDate が変わった時だけこの処理を実行する

  // --- 選択された日付のシフトデータを抽出 ---

  // format() で日付を "yyyy-MM-dd" 形式の文字列に変換
  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
  // ローカル時間ベースの日付文字列（タイムゾーン対策のため2パターン用意）
  const localDateStr = `${selectedDate.getFullYear()}-${pad(
    selectedDate.getMonth() + 1   // getMonth() は 0始まり(1月=0) なので +1 する
  )}-${pad(selectedDate.getDate())}`;

  // 選択日付のシフトを抽出（承認済みまたは完了のみ）
  const shiftsForDate = shifts.filter(
    (s) =>
      (s.date === selectedDateStr || s.date === localDateStr) &&
      (s.status === "approved" || s.status === "completed") // 承認済みまたは完了のシフト
  );

  // ニックネームの重複を排除して一覧を作成
  // Set は重複を許さないコレクション。Array.from で配列に戻す。
  const allNames: string[] = Array.from(
    new Set(shiftsForDate.map((s) => s.nickname))
  );

  // --- ガントチャート用データの構築 ---

  /**
   * スタッフ名の配列から、ガントチャート用のスケジュール列データを構築する。
   * 30分刻みの全時間スロットを走査し、各スロットにシフト情報を割り当てる。
   *
   * @param names - スタッフ名の配列
   * @returns SampleScheduleColumn に近い形式の配列（position + slots）
   */
  function buildScheduleColumns(names: string[]) {
    return names.map((name) => {
      // このスタッフの全シフトを取得
      const userShifts = shiftsForDate.filter((s) => s.nickname === name);
      // スタッフシフトと授業シフトを分離
      const staffShifts = userShifts.filter(
        (s) => s.type === "user" || s.type === "staff"
      );
      const classShifts = userShifts.filter(
        (s) => s.type === "class" || (s.classes && s.classes.length > 0)
      );

      // any[] は「任意の型の配列」。厳密な型定義を省略している。
      // 本来は SampleSlot に近い型を定義すべきだが、柔軟性のため any を使用。
      const slots: any[] = [];

      // 全時間スロット（00:00〜24:00）を走査
      for (let i = 0; i < allTimes.length - 1; i++) {
        const start = allTimes[i];
        const end = allTimes[i + 1];

        // このスロットに該当するスタッフシフトを検索
        const staff = staffShifts.find(
          (s) =>
            start &&
            s.startTime &&
            s.endTime &&
            start >= s.startTime &&
            start < s.endTime
        );

        // このスロットに該当する授業シフトを検索
        let classSlot = null;
        for (const s of classShifts) {
          if (s.classes) {
            for (const c of s.classes) {
              if (
                start &&
                c.startTime &&
                c.endTime &&
                start >= c.startTime &&
                start < c.endTime
              ) {
                classSlot = { ...s, classTime: c };
                // ↑ スプレッド構文でシフト情報をコピーし、classTime プロパティを追加
                break;
              }
            }
          }
        }

        // 授業シフトが優先（授業 > スタッフ）
        if (classSlot) {
          const ct = classSlot.classTime;
          // typesMap から授業種別の情報（色・アイコン・名前）を取得
          const defaultType = Object.values(typesMap).find((t) => t.name === "授業");
          // ct?.typeId の「?.」= オプショナルチェイニング
          const segType = ct?.typeId ? typesMap[ct.typeId] : defaultType;
          const taskName = segType?.name || ct?.typeName || "授業";
          // ↑ || はフォールバック。左辺が falsy（null, undefined, "", 0, false）なら右辺を使う
          const taskIcon = segType?.icon || "";
          slots.push({
            name,
            start,
            end,
            task: `${taskIcon ? taskIcon + " " : ""}${taskName}`,
            // ↑ テンプレートリテラルと三項演算子の組み合わせ
            date: selectedDateStr,
            color: segType?.color || "#888",
            type: "class",
            textColor: "white",
          });
        } else if (staff) {
          slots.push({
            name,
            start,
            end,
            task: "スタッフ", // Textコンポーネントを文字列に変更
            date: selectedDateStr,
            color: colors.primary,
            type: staff.type || "user",
            textColor: "#fff",
          });
        }
        // どちらにも該当しなければ、そのスロットはスキップ（空きスロット）
      }
      return { position: name, slots };
    });
  }

  // 全スタッフのスケジュール列を構築し、ステータス情報を付加
  const scheduleForSelectedDate = buildScheduleColumns(allNames).map(
    (column) => {
      const userShift = shiftsForDate.find((s) => s.nickname === column.position);
      return {
        ...column,                                // スプレッド構文で既存のプロパティをコピー
        status: userShift?.status || "approved",   // ステータスを追加
      };
    }
  );

  // --- 戻り値 ---
  // カスタムフックの戻り値はオブジェクト。呼び出し元で分割代入して使う。
  return {
    selectedDate,
    setSelectedDate,
    showDatePicker,
    setShowDatePicker,
    modalUser,
    setModalUser,
    scheduleForSelectedDate,
    allTimes, // 00:00-24:00の全時間配列
    CELL_WIDTH: 100, // ガントチャートの1セルの固定幅（px）
    // typeof window !== "undefined" はSSR（サーバーサイドレンダリング）対策。
    // サーバー環境では window オブジェクトが存在しないため、アクセス前にチェックする。
    isTablet:
      typeof window !== "undefined" &&
      window.innerWidth >= 768 &&
      window.innerWidth <= 1024,
    isWide: typeof window !== "undefined" && window.innerWidth > 1024,
    shifts: filteredShifts, // フィルタリング済みシフトデータ（カレンダーのドット表示用）
    shiftsForDate, // 選択された日付のシフトデータ（時計ウィジェット用）
    currentYearMonth, // 現在の年月
    currentUserStoreId: user?.storeId, // ユーザーの店舗ID
    // loading: リアルタイムリスナーにより不要
  };
}
