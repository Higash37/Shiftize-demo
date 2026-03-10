/**
 * @file useShiftQueries.ts
 * @description シフトデータの取得（クエリ）専用カスタムフック。
 *              全シフト取得と月別シフト取得の2つの機能を提供する。
 *
 * 【このファイルの位置づけ】
 * - ServiceProvider.shifts を使ってシフトデータを取得する
 * - Shift型（DB寄りの型）→ ShiftItem型（UI寄りの型）への変換を行う
 * - 関連ファイル: ServiceProvider.ts（サービス層）, ModelIndex.ts（型定義）,
 *                useShiftActions.ts（シフトの作成・編集・削除）
 *
 * 【Shift vs ShiftItem の違い】
 * - Shift: Supabase DBの構造に近い型。サービス層が使用
 * - ShiftItem: UI表示に適した型。コンポーネントが使用
 * この変換処理（mapShiftToShiftItem）がその橋渡しをする
 *
 * 【カスタムフックとは】
 * "use" で始まる関数で、ReactのフックAPIを利用する。
 * 状態管理や副作用を1つの関数にまとめて、複数のコンポーネントで再利用可能にする。
 */

import { useState, useEffect, useCallback } from "react";
import { ServiceProvider } from "@/services/ServiceProvider";
import { Shift, ShiftItem, ShiftStatus } from "@/common/common-models/ModelIndex";

/**
 * mapShiftToShiftItem - Shift型をShiftItem型に変換するヘルパー関数
 *
 * ServiceProvider.shifts.getShifts() は Shift[] を返すが、
 * UIコンポーネントは ShiftItem[] を必要とするため、この変換が必要。
 *
 * 【処理の詳細】
 * 1. 必須フィールドをコピー（id, date, startTime, endTime等）
 * 2. null/undefinedの可能性があるフィールドにデフォルト値を設定
 *    - `||` → 左辺がfalsy（null, undefined, "", 0, false）なら右辺を使用
 * 3. オプショナルフィールド（subject, requestedChanges）は存在する場合のみコピー
 *
 * 【TypeScript構文の解説】
 * - `as ShiftStatus` → 型アサーション。shift.statusの値がShiftStatus型であることを明示
 * - `?.` → オプショナルチェーニング。前のプロパティがnull/undefinedの場合はundefinedを返す
 * - `?.[0]` → 配列のオプショナルチェーニング。配列がnull/undefinedでも安全にアクセス
 *
 * @param shift - 変換元のShiftオブジェクト
 * @returns 変換後のShiftItemオブジェクト
 */
const mapShiftToShiftItem = (shift: Shift): ShiftItem => {
  const item: ShiftItem = {
    id: shift.id,
    userId: shift.userId || "",              // null/undefinedの場合は空文字
    storeId: shift.storeId || "",
    nickname: shift.nickname || "",
    date: shift.date,
    startTime: shift.startTime,
    endTime: shift.endTime,
    type: shift.type || "user",              // デフォルトは "user"（一般講師のシフト）
    isCompleted: shift.isCompleted || false,  // デフォルトは未完了
    status: shift.status as ShiftStatus,     // 型アサーション
    duration: shift.duration?.toString() || "0", // 数値→文字列に変換
    createdAt: shift.createdAt || new Date(),
    updatedAt: shift.updatedAt || new Date(),
    classes: Array.isArray(shift.classes) ? shift.classes : [], // 配列でなければ空配列
  };

  // subject（科目）が存在する場合のみコピー
  // `!= null` → null と undefined の両方をチェック（== でなく !=）
  if (shift.subject != null) {
    item.subject = shift.subject;
  }

  // requestedChanges（変更リクエスト）の最初の要素を変換
  // 配列の[0]にアクセスする前に、オプショナルチェーニングで安全性を確保
  if (shift.requestedChanges?.[0]) {
    const rc: ShiftItem["requestedChanges"] = {
      startTime: shift.requestedChanges[0].startTime,
      endTime: shift.requestedChanges[0].endTime,
      date: shift.date,
    };
    if (shift.type != null) rc.type = shift.type;
    if (shift.subject != null) rc.subject = shift.subject;
    item.requestedChanges = rc;
  }

  return item;
};

/**
 * useShifts - シフトデータの取得フック
 *
 * 指定された店舗IDのシフトデータを取得する。
 * 全シフト取得と月別シフト取得の両方をサポート。
 *
 * 【useCallback の役割】
 * 関数をメモ化し、依存配列の値が変わらない限り同じ関数参照を保持する。
 * これにより、useEffectの不要な再実行を防ぐ。
 *
 * 【storeId の安全チェック】
 * getShifts() で取得したデータを .filter(shift => shift.storeId === storeId) で
 * 追加フィルタリングしている。これはセキュリティ対策で、
 * サーバー側のフィルタリングが不完全な場合の防御層として機能する。
 *
 * @param storeId - 取得対象の店舗ID（undefined の場合は空配列を返す）
 * @returns { shifts, loading, error, fetchShifts, fetchShiftsByMonth }
 */
export const useShifts = (storeId?: string) => {
  // useState → Reactの状態管理フック。値と更新関数のペアを返す
  const [shifts, setShifts] = useState<ShiftItem[]>([]);     // シフトデータ
  const [loading, setLoading] = useState(true);               // ローディング状態
  const [error, setError] = useState<Error | null>(null);     // エラー状態

  /**
   * fetchShifts - 全シフトデータを取得する
   *
   * useCallback でメモ化。storeId が変わった時だけ関数が再生成される。
   */
  const fetchShifts = useCallback(async () => {
    // storeIdが未定義の場合は処理を停止（空配列をセット）
    if (!storeId) {
      setShifts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // ServiceProvider経由でSupabaseからシフトデータを取得
      const rawShifts = await ServiceProvider.shifts.getShifts(storeId);

      // Shift[] → ShiftItem[] に変換し、storeIdでフィルタリング（二重チェック）
      const shiftsData = rawShifts
        .map(mapShiftToShiftItem)                           // 型変換
        .filter((shift) => shift.storeId === storeId);      // セキュリティフィルタ

      setShifts(shiftsData);
    } catch (err) {
      // as Error → TypeScriptにエラーの型を明示
      setError(err as Error);
    } finally {
      // finally → try/catchの成功・失敗に関わらず必ず実行される
      setLoading(false);
    }
  }, [storeId]); // storeIdが変わった時だけ関数を再生成

  /**
   * fetchShiftsByMonth - 特定の月のシフトデータを取得する
   *
   * @param year - 年（例: 2026）
   * @param month - 月（0-11。JavaScriptの月は0始まり。0=1月, 11=12月）
   */
  const fetchShiftsByMonth = useCallback(
    async (year: number, month: number) => {
      if (!storeId) {
        setShifts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // 指定した月の最初の日（1日）と最後の日を計算
        const startDate = new Date(year, month, 1);      // 月初
        const endDate = new Date(year, month + 1, 0);    // 月末（翌月の0日 = 当月の最終日）

        // ISO文字列形式に変換 (YYYY-MM-DD)
        // split("T")[0] → "2026-03-01T00:00:00.000Z" から "2026-03-01" を取得
        // ?? "" → nullish合体演算子。null/undefinedの場合に空文字を返す
        const startDateStr = startDate.toISOString().split("T")[0] ?? "";
        const endDateStr = endDate.toISOString().split("T")[0] ?? "";

        // 全シフトを取得してクライアント側でフィルタリング
        const rawShifts = await ServiceProvider.shifts.getShifts(storeId);

        const shiftsData = rawShifts
          .map(mapShiftToShiftItem)
          // storeIDチェック + 日付範囲フィルタリング
          .filter(
            (shift) =>
              shift.storeId === storeId &&
              shift.date >= startDateStr &&   // 文字列比較（YYYY-MM-DD形式なので正しく動作）
              shift.date <= endDateStr
          )
          // 日付→開始時間の順でソート
          .sort((a, b) => {
            // localeCompare → 文字列を辞書順で比較（-1, 0, 1 を返す）
            const dateCompare = a.date.localeCompare(b.date);
            if (dateCompare === 0) {
              // 日付が同じ場合は開始時間でソート
              return a.startTime.localeCompare(b.startTime);
            }
            return dateCompare;
          });

        setShifts(shiftsData);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    },
    [storeId]
  );

  // useEffect → コンポーネントのマウント時やstoreId変更時にデータを取得
  useEffect(() => {
    if (storeId) {
      fetchShifts(); // storeIdが定義されている場合のみ取得実行
    } else {
      setShifts([]);
      setLoading(false);
    }
  }, [fetchShifts, storeId]);

  return {
    shifts,            // シフトデータ配列
    loading,           // ローディング状態（true: 取得中）
    error,             // エラーオブジェクト（null: エラーなし）
    fetchShifts,       // 全シフト再取得関数
    fetchShiftsByMonth, // 月別シフト取得関数
  };
};
