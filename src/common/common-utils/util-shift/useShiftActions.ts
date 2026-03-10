/**
 * @file useShiftActions.ts
 * @description シフトの作成・編集・削除・承認・ステータス変更を行うカスタムフック。
 *
 * 【このファイルの位置づけ】
 * - useShiftQueries.ts が「取得」担当、このファイルが「操作」担当
 * - ServiceProvider.shifts を通じてSupabaseのシフトデータを操作する
 * - useAuth() フックでログインユーザー情報を取得し、操作者情報として記録する
 * - 関連ファイル: ServiceProvider.ts, useAuth.ts, useShiftQueries.ts, ModelIndex.ts
 *
 * 【shiftActor とは】
 * シフト操作を「誰が行ったか」を記録するためのオブジェクト。
 * 監査ログや変更履歴の追跡に使用される。
 *
 * 【データフローの全体像】
 * 1. ユーザーがUI上でシフト操作（作成/編集/削除等）
 * 2. このフックの関数が呼ばれる
 * 3. ServiceProvider.shifts の対応メソッドが呼ばれる
 * 4. SupabaseShiftAdapter が実際のDB操作を行う
 * 5. fetchShifts() で最新データを再取得してUIに反映
 */

import { useState, useEffect, useCallback } from "react";
import { ServiceProvider } from "@/services/ServiceProvider";
import { useAuth } from "@/services/auth/useAuth";
import { Shift, ShiftStatus } from "@/common/common-models/ModelIndex";

/**
 * useShift - シフトの取得と操作を統合したカスタムフック
 *
 * 【ロールによる動作の違い】
 * - master（教室長）: 指定された店舗の全シフトを取得できる
 * - teacher（講師）:  自分のシフトのみ取得できる（連携店舗を含む）
 *
 * 【useCallback の依存配列】
 * [user?.uid, user?.storeId, role, storeId] →
 * これらの値が変わった時だけ fetchShifts 関数が再生成される。
 * オブジェクト全体（user）を依存に入れると、user内の無関係なプロパティの変更でも
 * 再生成されてしまうため、必要なプロパティだけを依存に入れる。
 *
 * @param storeId - 取得対象の店舗ID（オプション。未指定時はユーザーの所属店舗）
 * @returns シフトデータと操作関数群
 */
export const useShift = (storeId?: string) => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // useAuth() → ログインユーザーの情報とロール（master/teacher）を取得
  const { user, role } = useAuth();

  /**
   * shiftActor - シフト操作の実行者情報
   *
   * user と role が両方存在する場合のみ生成する。
   * `as const` → リテラル型として扱う。"master" を string 型ではなく
   *              "master" というリテラル型として固定する
   */
  const shiftActor =
    user && role
      ? {
          userId: user.uid,
          nickname: user.nickname || "未設定",
          role: role === "master" ? ("master" as const) : ("teacher" as const),
        }
      : null;

  /**
   * fetchShifts - シフトデータを取得する
   *
   * 【ロール別の取得ロジック】
   * - master: 指定されたstoreIdの全シフトを取得
   * - teacher: getUserFullProfile() で連携店舗情報を取得し、
   *            getUserAccessibleShifts() で全アクセス可能シフトを取得。
   *            さらに自分のユーザーIDでフィルタリング
   */
  const fetchShifts = useCallback(async () => {
    if (!user) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let allShifts: Shift[] = [];

      if (role === "master") {
        // 教室長: 指定された店舗 or 自分の店舗のシフトを全件取得
        const targetStoreId = storeId || user?.storeId;
        if (!targetStoreId) {
          throw new Error("Store ID is required");
        }
        allShifts = await ServiceProvider.shifts.getShifts(targetStoreId);
      } else {
        // 講師: 連携店舗も含む全てのアクセス可能なシフトを取得
        const userProfile = await ServiceProvider.users.getUserFullProfile(user.uid);

        if (userProfile) {
          const accessParams: { storeId?: string; connectedStores?: string[] } = {
            connectedStores: userProfile.connectedStores || [],
          };
          if (userProfile.storeId) {
            accessParams.storeId = userProfile.storeId;
          }
          allShifts = await ServiceProvider.shifts.getUserAccessibleShifts(accessParams);
        } else {
          // ユーザープロファイルが見つからない場合は従来の方法で取得
          const targetStoreId = storeId || user?.storeId;
          if (!targetStoreId) {
            throw new Error("Store ID is required for shift access");
          }
          allShifts = await ServiceProvider.shifts.getShifts(targetStoreId);
        }
      }

      // 講師の場合は自分のシフトのみにフィルタリング
      const filteredShifts =
        role === "master"
          ? allShifts  // 教室長は全件表示
          : allShifts.filter((shift: Shift) => shift.userId === user?.uid); // 講師は自分のみ

      setShifts(filteredShifts);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "シフトの取得に失敗しました";
      setError(errorMessage);
      setShifts([]);
    } finally {
      setLoading(false);
    }
  }, [user?.uid, user?.storeId, role, storeId]);

  // ユーザー情報やロールが変更された時にデータを再取得
  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);

  /**
   * createShift - 新しいシフトを作成する
   *
   * 【Omit<Shift, "id"> とは】
   * Shift型から "id" プロパティを除外した型。
   * 新規作成時はIDはサーバー側で自動生成されるため、クライアントから送る必要がない。
   *
   * @param shiftData - 作成するシフトデータ（IDを除く）
   */
  const createShift = async (shiftData: Omit<Shift, "id">) => {
    try {
      // storeIdが未指定の場合はユーザーの所属店舗IDを使用
      const shiftWithStoreId = {
        ...shiftData,
        storeId: shiftData.storeId || user?.storeId || "",
      };

      // shiftActor || undefined → null の場合は undefined に変換（省略可能引数対応）
      await ServiceProvider.shifts.addShift(
        shiftWithStoreId,
        shiftActor || undefined
      );
      await fetchShifts(); // 作成後にデータを即時再取得（UI更新）
    } catch (err) {
      if (__DEV__) {
        console.error("シフト作成エラー:", err);
      }
      throw err; // 呼び出し元にエラーを伝播
    }
  };

  /**
   * editShift - 既存のシフトを編集する
   *
   * 編集時はステータスを "draft"（下書き）に戻し、
   * requestedChanges（変更リクエスト）として記録する。
   * これにより、教室長が変更を承認するワークフローが実現される。
   *
   * 【Partial<Shift> とは】
   * Shift型の全プロパティをオプショナル（省略可能）にした型。
   * 一部のフィールドだけを更新する場合に使用する。
   *
   * @param shiftId - 編集するシフトのID
   * @param shiftData - 更新するフィールド（部分的でOK）
   */
  const editShift = async (shiftId: string, shiftData: Partial<Shift>) => {
    try {
      const updatedData: Partial<Shift> = {
        ...shiftData,
        status: "draft", // ステータスを下書きに戻す
        requestedChanges: [
          {
            startTime: shiftData.startTime || "",
            endTime: shiftData.endTime || "",
            status: "draft",
            requestedAt: new Date(), // 変更リクエスト日時を記録
          },
        ],
      };
      await ServiceProvider.shifts.updateShift(
        shiftId,
        updatedData,
        shiftActor || undefined
      );
      await fetchShifts(); // 編集後にデータを即時再取得
    } catch (err) {
      if (__DEV__) {
        console.error("シフト編集エラー:", err);
      }
      throw err;
    }
  };

  /**
   * markShiftAsDeleted - シフトを削除（論理削除）する
   *
   * 物理削除ではなく論理削除を行う（deletedフラグを立てる）。
   * 監査目的で削除理由も記録可能。
   *
   * @param shiftId - 削除するシフトのID
   * @param reason - 削除理由（オプション）
   */
  const markShiftAsDeleted = async (shiftId: string, reason?: string) => {
    try {
      await ServiceProvider.shifts.markShiftAsDeleted(
        shiftId,
        shiftActor || undefined,
        reason
      );
      await fetchShifts(); // 削除後にデータを即時再取得
    } catch (err) {
      if (__DEV__) {
        console.error("シフト削除エラー:", err);
      }
      throw err;
    }
  };

  /**
   * approveShift - シフトの変更リクエストを承認する
   *
   * 教室長が講師の変更リクエストを承認する際に使用する。
   * 承認後、requestedChanges の内容が本体に反映される。
   *
   * @param shiftId - 承認するシフトのID
   */
  const approveShift = async (shiftId: string) => {
    try {
      await ServiceProvider.shifts.approveShiftChanges(
        shiftId,
        shiftActor || undefined
      );
      await fetchShifts(); // 承認後にデータを即時再取得
    } catch (err) {
      if (__DEV__) {
        console.error("シフト承認エラー:", err);
      }
      throw err;
    }
  };

  /**
   * updateShiftStatus - シフトのステータスを更新する
   *
   * 【ShiftStatus の値】
   * - "draft":     下書き（講師が提出前）
   * - "pending":   承認待ち（教室長の確認待ち）
   * - "approved":  承認済み（確定シフト）
   * - "rejected":  却下（教室長が却下）
   *
   * @param shiftId - 更新するシフトのID
   * @param status - 新しいステータス
   */
  const updateShiftStatus = async (shiftId: string, status: ShiftStatus) => {
    try {
      await ServiceProvider.shifts.updateShift(
        shiftId,
        { status },
        shiftActor || undefined
      );
      await fetchShifts(); // ステータス更新後にデータを即時再取得
    } catch (err) {
      if (__DEV__) {
        console.error("シフトステータス更新エラー:", err);
      }
      throw err;
    }
  };

  return {
    shifts,             // シフトデータ配列
    loading,            // ローディング状態
    error,              // エラーメッセージ（null: エラーなし）
    fetchShifts,        // データ再取得関数
    createShift,        // シフト作成関数
    editShift,          // シフト編集関数
    markShiftAsDeleted, // シフト削除関数
    approveShift,       // シフト承認関数
    updateShiftStatus,  // ステータス更新関数
    debugInfo: { service: "ServiceProvider.shifts" }, // デバッグ用情報
  };
};

/** Shift型を再エクスポート（利用側でインポートしやすくするため） */
export type { Shift } from "@/common/common-models/ModelIndex";
