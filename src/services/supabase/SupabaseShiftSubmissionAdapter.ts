/**
 * @file SupabaseShiftSubmissionAdapter.ts
 * @description シフト希望提出の管理（募集期間・提出・購読）のSupabase実装。
 *
 * 【このファイルの位置づけ】
 * IShiftSubmissionService インターフェースの Supabase 実装。
 * マスターが設定する「募集期間」と、講師が提出する「シフト希望」の
 * CRUD・リアルタイム購読・期間判定を担当する。
 *
 *   PeriodSettingModal → ServiceProvider.shiftSubmissions
 *                          → SupabaseShiftSubmissionAdapter（このファイル）
 *                            → Supabase DB (shift_submission_periods / shift_submissions)
 *
 * 【テーブル構成】
 * - shift_submission_periods: 募集期間（開始日・終了日・対象月・有効フラグ）
 * - shift_submissions: 講師のシフト希望（期間ID・ユーザーID・希望リスト・ステータス）
 */

import type {
  IShiftSubmissionService,
  ShiftSubmissionPeriod,
  ShiftRequest,
  ShiftSubmission,
} from "../interfaces/IShiftSubmissionService";
import { getSupabase } from "./supabase-client";

/**
 * parseDateString: 日付文字列 "YYYY-MM-DD" をローカル日付としてパースする。
 *
 * new Date("2025-01-15") は UTC として解釈されるため、
 * JST(+9) 環境では 2025-01-14 になるバグが発生する。
 * そのため年・月・日を個別に取り出し、new Date(y, m-1, d) でローカル日付を生成する。
 *
 * @param dateStr - "YYYY-MM-DD" 形式の日付文字列
 * @returns ローカルタイムゾーンの Date オブジェクト
 */
function parseDateString(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y!, m! - 1, d!);
}

/**
 * mapRowToPeriod: DBの行データ（snake_case）をアプリモデル（ShiftSubmissionPeriod）に変換する。
 * 日付フィールドは parseDateString でローカル日付に変換する。
 *
 * @param row - Supabase から取得した shift_submission_periods テーブルの行
 * @returns ShiftSubmissionPeriod 型のオブジェクト
 */
function mapRowToPeriod(row: any): ShiftSubmissionPeriod {
  return {
    id: row.id,
    storeId: row.store_id,
    startDate: parseDateString(row.start_date),
    endDate: parseDateString(row.end_date),
    targetMonth: row.target_month,
    isActive: row.is_active,
    createdAt: new Date(row.created_at),
    createdBy: row.created_by,
  };
}

/**
 * mapRowToSubmission: DBの行データ（snake_case）をアプリモデル（ShiftSubmission）に変換する。
 * submitted_at は任意フィールドのため、存在する場合のみ変換する。
 *
 * @param row - Supabase から取得した shift_submissions テーブルの行
 * @returns ShiftSubmission 型のオブジェクト
 */
function mapRowToSubmission(row: any): ShiftSubmission {
  return {
    id: row.id,
    periodId: row.period_id,
    userId: row.user_id,
    storeId: row.store_id,
    requests: row.requests || [],
    status: row.status,
    ...(row.submitted_at ? { submittedAt: new Date(row.submitted_at) } : {}),
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

/** シフト希望提出サービスのSupabase実装 */
export class SupabaseShiftSubmissionAdapter implements IShiftSubmissionService {
  /** 有効な募集期間一覧を取得する */
  async getActivePeriods(storeId: string): Promise<ShiftSubmissionPeriod[]> {
    const supabase = getSupabase();
    const { data } = await supabase
      .from("shift_submission_periods")
      .select("*")
      .eq("store_id", storeId)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    return (data || []).map(mapRowToPeriod);
  }

  /** 全募集期間を取得する */
  async getAllPeriods(storeId: string): Promise<ShiftSubmissionPeriod[]> {
    const supabase = getSupabase();
    const { data } = await supabase
      .from("shift_submission_periods")
      .select("*")
      .eq("store_id", storeId)
      .order("created_at", { ascending: false });

    return (data || []).map(mapRowToPeriod);
  }

  /** 募集期間をIDで取得する */
  async getPeriod(periodId: string): Promise<ShiftSubmissionPeriod | null> {
    const supabase = getSupabase();
    const { data } = await supabase
      .from("shift_submission_periods")
      .select("*")
      .eq("id", periodId)
      .maybeSingle();

    return data ? mapRowToPeriod(data) : null;
  }

  /** ユーザーのシフト希望提出を取得する */
  async getUserSubmission(periodId: string, userId: string): Promise<ShiftSubmission | null> {
    const supabase = getSupabase();
    const { data } = await supabase
      .from("shift_submissions")
      .select("*")
      .eq("period_id", periodId)
      .eq("user_id", userId)
      .maybeSingle();

    return data ? mapRowToSubmission(data) : null;
  }

  /**
   * シフト希望を保存する（UPSERT相当）。
   * 既存の提出データがあれば requests を更新し、なければ新規作成する（status: "draft"）。
   *
   * @param periodId - 募集期間のID
   * @param userId - 提出するユーザーのID
   * @param storeId - 店舗ID
   * @param requests - シフト希望リスト（日付・時間帯の配列）
   */
  async saveSubmission(
    periodId: string,
    userId: string,
    storeId: string,
    requests: ShiftRequest[]
  ): Promise<void> {
    const supabase = getSupabase();
    const existing = await this.getUserSubmission(periodId, userId);

    if (existing) {
      // 既存レコードがあれば希望リストと更新日時を更新
      await supabase
        .from("shift_submissions")
        .update({ requests, updated_at: new Date().toISOString() })
        .eq("id", existing.id);
    } else {
      // 新規作成（初期ステータスは "draft"＝下書き）
      await supabase.from("shift_submissions").insert({
        period_id: periodId,
        user_id: userId,
        store_id: storeId,
        requests,
        status: "draft",
      });
    }
  }

  /**
   * シフト希望を正式に提出する（draft → submitted へステータス変更）。
   * 下書き保存済みの希望データが存在しない場合はエラーをスローする。
   *
   * @param periodId - 募集期間のID
   * @param userId - 提出するユーザーのID
   * @throws Error - 下書きデータが見つからない場合
   */
  async submitShiftRequests(periodId: string, userId: string): Promise<void> {
    const submission = await this.getUserSubmission(periodId, userId);
    if (!submission) throw new Error("提出するシフト希望が見つかりません");

    const supabase = getSupabase();
    await supabase
      .from("shift_submissions")
      .update({
        status: "submitted",
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", submission.id);
  }

  /**
   * 有効な募集期間をリアルタイムで購読する。
   * 初回は即座にデータを取得してコールバックを呼び、
   * 以降は Supabase Realtime（WebSocket）でテーブル変更を検知して自動更新する。
   *
   * @param storeId - 店舗ID
   * @param callback - 期間一覧が更新されるたびに呼ばれるコールバック
   * @returns 購読解除関数（コンポーネントのアンマウント時に呼ぶ）
   */
  subscribeToActivePeriods(
    storeId: string,
    callback: (periods: ShiftSubmissionPeriod[]) => void
  ): () => void {
    const supabase = getSupabase();

    // 初回データ取得（購読確立前にUIを表示するため）
    this.getActivePeriods(storeId).then(callback).catch(() => callback([]));

    // Realtime購読: shift_submission_periods テーブルの変更を監視
    const channel = supabase
      .channel(`shift_submission_periods_${storeId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "shift_submission_periods",
          filter: `store_id=eq.${storeId}`,
        },
        () => {
          // 変更検知時に最新データを再取得してコールバックに渡す
          this.getActivePeriods(storeId).then(callback).catch(() => callback([]));
        }
      )
      .subscribe();

    // 購読解除関数を返す（useEffect の cleanup 等で使用）
    return () => {
      supabase.removeChannel(channel);
    };
  }

  /**
   * 現在時刻が募集期間内かどうかを判定する。
   * startDate <= now <= endDate なら true。
   *
   * @param period - 判定対象の募集期間
   * @returns 現在が期間内なら true
   */
  isWithinPeriod(period: ShiftSubmissionPeriod): boolean {
    const now = new Date();
    return now >= period.startDate && now <= period.endDate;
  }

  /**
   * 募集締切（endDate）までの残り日数を計算する。
   * 戻り値が負の場合は既に期限切れ。Math.ceil で切り上げ（残り0.5日→1日と表示）。
   *
   * @param period - 対象の募集期間
   * @returns 締切までの残り日数（負の値は期限超過）
   */
  getDaysUntilDeadline(period: ShiftSubmissionPeriod): number {
    const now = new Date();
    const diffTime = period.endDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * 募集期間をIDで削除する。
   * PeriodSettingModal の「削除」ボタンから呼ばれる。
   *
   * @param periodId - 削除する募集期間のID
   */
  async deletePeriod(periodId: string): Promise<void> {
    const supabase = getSupabase();
    await supabase.from("shift_submission_periods").delete().eq("id", periodId);
  }
}
