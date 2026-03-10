/**
 * @file useShiftsRealtime.ts
 * @description シフトデータのリアルタイム監視フック。
 *              Supabaseのリアルタイムサブスクリプションを使い、
 *              DBの変更を即座にUIに反映する。
 *
 * 【このファイルの位置づけ】
 * - useShiftQueries.ts の「ポーリング版」に対して、こちらは「リアルタイム版」
 * - Supabaseの Realtime 機能（WebSocket）を利用して、DB変更を即座に受信する
 * - 関連ファイル: ServiceProvider.ts, ModelIndex.ts
 *
 * 【リアルタイムサブスクリプションとは】
 * 通常のAPI呼び出し（ポーリング）は「定期的にサーバーに問い合わせる」方式だが、
 * リアルタイムサブスクリプションは「サーバー側でデータが変わったら即座に通知を受ける」方式。
 * WebSocketという常時接続の通信技術を使用する。
 *
 * 【サブスクリプションのクリーンアップ】
 * コンポーネントがアンマウント（画面から消える）されたとき、
 * サブスクリプションを解除（unsubscribe）しないとメモリリークが発生する。
 * useEffectの戻り値（クリーンアップ関数）でこれを行う。
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { ServiceProvider } from "@/services/ServiceProvider";
import { ShiftItem } from "@/common/common-models/ModelIndex";

/**
 * useShiftsRealtime - 全シフトのリアルタイム監視フック
 *
 * 指定された店舗の全シフトをリアルタイムで監視する。
 * DB側でシフトが追加・編集・削除されると、自動的にstateが更新される。
 *
 * 【内部動作】
 * 1. useEffect内で onShiftsChanged() を呼び出し、リアルタイム監視を開始
 * 2. DBでデータが変更されるたびにコールバック関数が呼ばれ、stateが更新
 * 3. コンポーネントのアンマウント時に unsubscribe() で監視を解除
 *
 * @param storeId - 監視対象の店舗ID
 * @returns { shifts, loading, error, fetchShiftsByMonth, refetch }
 */
export const useShiftsRealtime = (storeId?: string) => {
  const [shifts, setShifts] = useState<ShiftItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * fetchShiftsByMonth - 月指定でのシフト取得（リアルタイム監視付き）
   *
   * 呼び出すと指定月のシフトのリアルタイム監視を開始する。
   * 戻り値はクリーンアップ関数（監視解除用）。
   *
   * 【戻り値の型: (() => void) | null】
   * - () => void → 監視解除用の関数（アンマウント時に呼ぶ）
   * - null → storeIDが未定義で監視を開始できなかった場合
   *
   * @param year - 年
   * @param month - 月（0始まり）
   * @returns クリーンアップ関数、または null
   */
  const fetchShiftsByMonth = useCallback(
    (year: number, month: number): (() => void) | null => {
      if (!storeId) {
        setShifts([]);
        setLoading(false);
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        // onShiftsByMonth → 月別シフトのリアルタイム監視を開始
        // 第4引数: データ受信時のコールバック
        // 第5引数: エラー発生時のコールバック
        // 戻り値: unsubscribe関数（監視解除用）
        const unsubscribe = ServiceProvider.shifts.onShiftsByMonth(
          storeId,
          year,
          month,
          (shiftsData) => {
            setShifts(shiftsData);  // 受信したデータでstateを更新
            setLoading(false);
          },
          (err) => {
            if (__DEV__) {
              console.error("Realtime shift error:", err);
            }
            setError(err);
            setLoading(false);
          }
        );

        return unsubscribe; // 監視解除関数を返す
      } catch (err) {
        setError(err as Error);
        setLoading(false);
        return null;
      }
    },
    [storeId]
  );

  // 全シフトのリアルタイム監視を開始
  useEffect(() => {
    if (!storeId) {
      setShifts([]);
      setLoading(false);
      return; // クリーンアップ不要
    }

    // onShiftsChanged → 全シフトのリアルタイム監視を開始
    const unsubscribe = ServiceProvider.shifts.onShiftsChanged(
      storeId,
      (shiftsData) => {
        setShifts(shiftsData);
        setLoading(false);
      },
      (err) => {
        if (__DEV__) {
          console.error("Realtime shift error:", err);
        }
        setError(err);
        setLoading(false);
      }
    );

    // クリーンアップ関数: コンポーネントのアンマウント時に監視を解除
    // これを忘れるとメモリリークが発生する
    return () => unsubscribe();
  }, [storeId]);

  /**
   * refetch - 全シフトを手動で再取得する（リアルタイムチャネルの再作成なし）
   *
   * リアルタイム監視とは別に、手動で最新データを取得したい場合に使用する。
   * 例: 画面のプルダウンリフレッシュ操作時
   */
  const refetch = useCallback(async () => {
    if (!storeId) return;
    try {
      const data = await ServiceProvider.shifts.getShiftItems(storeId);
      setShifts(data);
    } catch (err) {
      setError(err as Error);
    }
  }, [storeId]);

  return {
    shifts,              // シフトデータ配列（リアルタイム更新）
    loading,             // ローディング状態
    error,               // エラーオブジェクト
    fetchShiftsByMonth,  // 月別シフト監視開始関数
    refetch,             // 手動再取得関数
  };
};

// ============================================================================
// 月別シフト専用フック
// ============================================================================

/**
 * useShiftsByMonth - 月別シフト専用のリアルタイム監視フック
 *
 * 全件取得を回避し、指定月のシフトのみをリアルタイムで監視する。
 * this-month / next-month ページ向けに最適化されている。
 *
 * 【useRef の使い方】
 * - unsubRef: 現在のサブスクリプション解除関数を保持
 *   → 月切り替え時に前の監視を解除してから新しい監視を開始するため
 * - currentPeriodRef: 現在監視中の年月を保持
 *   → refetch時にどの年月のデータを取得すべきかを知るため
 *
 * 【useRef vs useState の違い】
 * - useState: 値の変更がコンポーネントの再レンダリングを引き起こす
 * - useRef:   値の変更が再レンダリングを引き起こさない（UIに関係ない内部状態向き）
 *
 * @param storeId - 監視対象の店舗ID
 * @param initialYear - 初期表示の年
 * @param initialMonth - 初期表示の月（0始まり）
 * @returns { shifts, loading, error, changeMonth, refetch }
 */
export const useShiftsByMonth = (
  storeId: string | undefined,
  initialYear: number,
  initialMonth: number
) => {
  const [shifts, setShifts] = useState<ShiftItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // useRef → 再レンダリングを引き起こさない可変の値を保持
  const unsubRef = useRef<(() => void) | null>(null);                         // サブスクリプション解除関数
  const currentPeriodRef = useRef({ year: initialYear, month: initialMonth }); // 現在の年月

  /**
   * subscribe - 指定月のシフトのリアルタイム監視を開始する
   *
   * 前のサブスクリプションがあれば解除してから、新しい監視を開始する。
   */
  const subscribe = useCallback(
    (year: number, month: number) => {
      // 前のサブスクリプションをクリーンアップ
      if (unsubRef.current) {
        unsubRef.current();     // 監視解除関数を呼び出し
        unsubRef.current = null;
      }

      // 現在の年月を記録
      currentPeriodRef.current = { year, month };

      if (!storeId) {
        setShifts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // 指定月のリアルタイム監視を開始
        const unsub = ServiceProvider.shifts.onShiftsByMonth(
          storeId,
          year,
          month,
          (data) => {
            setShifts(data);
            setLoading(false);
          },
          (err) => {
            setError(err);
            setLoading(false);
          }
        );
        unsubRef.current = unsub; // 解除関数を保存
      } catch (err) {
        setError(err as Error);
        setLoading(false);
      }
    },
    [storeId]
  );

  // 初回マウント時に指定月の監視を開始
  useEffect(() => {
    subscribe(initialYear, initialMonth);
    // クリーンアップ: アンマウント時にサブスクリプションを解除
    return () => {
      if (unsubRef.current) {
        unsubRef.current();
        unsubRef.current = null;
      }
    };
  }, [storeId, initialYear, initialMonth, subscribe]);

  /**
   * changeMonth - 監視する月を切り替える
   *
   * 前の月のサブスクリプションを解除し、新しい月の監視を開始する。
   *
   * @param year - 新しい年
   * @param month - 新しい月（0始まり）
   */
  const changeMonth = useCallback(
    (year: number, month: number) => {
      subscribe(year, month);
    },
    [subscribe]
  );

  /**
   * refetch - 現在の月のシフトを手動で再取得する（チャネル再作成なし）
   */
  const refetch = useCallback(async () => {
    if (!storeId) return;
    const { year, month } = currentPeriodRef.current;
    try {
      const data = await ServiceProvider.shifts.getShiftsByMonth(storeId, year, month);
      setShifts(data);
    } catch (err) {
      setError(err as Error);
    }
  }, [storeId]);

  return {
    shifts,       // シフトデータ配列（リアルタイム更新）
    loading,      // ローディング状態
    error,        // エラーオブジェクト
    changeMonth,  // 月切り替え関数
    refetch,      // 手動再取得関数
  };
};
