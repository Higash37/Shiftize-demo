/**
 * @file SupabaseTeacherStatusAdapter.ts
 * @description 講師（teacher）のステータス情報を取得するSupabaseアダプター。
 *
 * 【このファイルの位置づけ】
 * ITeacherStatusService インターフェースを実装し、
 * 「講師一覧」「講師ごとのシフト統計」「講師のシフト確認状態」を
 * Supabaseから取得する。マスター画面の講師管理やダッシュボードで使用。
 *
 *   マスター画面（講師ステータスセクション）
 *        ↓ ServiceProvider.teacherStatus.getAllTeacherStatus()
 *   SupabaseTeacherStatusAdapter（★このファイル）
 *        ↓ Supabase クエリ
 *   Supabase DB（users, shifts, shift_confirmations テーブル）
 *
 * 【Adapterパターンとは】
 * 既存のインターフェース（ITeacherStatusService）と実際のデータ源（Supabase）を
 * 接続する変換層。将来Supabase以外のDBに変更する場合も、
 * このファイルだけ差し替えれば他のコードは変更不要。
 */

// ITeacherStatusService: 講師ステータスサービスのインターフェース（契約）
// TeacherInfo: 講師の基本情報型
// ShiftStats: シフト統計型（承認済み/申請中/却下の件数）
// TeacherStatus: 講師の総合ステータス型（基本情報 + 確認状態 + シフト統計）
import type { ITeacherStatusService, TeacherInfo, ShiftStats, TeacherStatus } from "../interfaces/ITeacherStatusService";
// ServiceProvider: 他のサービスにアクセスするためのシングルトン
import { ServiceProvider } from "../ServiceProvider";
// getSupabase: Supabaseクライアント取得
import { getSupabase } from "./supabase-client";

/**
 * SupabaseTeacherStatusAdapter: 講師ステータスサービスのSupabase実装。
 * implements ITeacherStatusService で、インターフェースの全メソッドを実装する。
 */
export class SupabaseTeacherStatusAdapter implements ITeacherStatusService {
  /**
   * getTeachersByStore: 指定店舗に所属する全講師の基本情報を取得する。
   *
   * SQLに相当するクエリ:
   *   SELECT uid, nickname, email, store_id
   *   FROM users
   *   WHERE store_id = :storeId AND role = 'teacher'
   *
   * @param storeId - 店舗ID
   * @returns Promise<TeacherInfo[]> - 講師一覧（ニックネーム順にソート済み）
   */
  async getTeachersByStore(storeId: string): Promise<TeacherInfo[]> {
    try {
      const supabase = getSupabase();
      // Supabaseクエリビルダー: メソッドチェーンでSQLを組み立てる
      const { data } = await supabase
        .from("users")                               // FROM users
        .select("uid, nickname, email, store_id")    // SELECT カラム名
        .eq("store_id", storeId)                     // WHERE store_id = storeId
        .eq("role", "teacher");                      // AND role = 'teacher'

      // data を TeacherInfo[] に変換
      // (data || []) で data が null の場合に空配列を使う
      return (data || [])
        .map((row: any) => ({
          uid: row.uid,
          // ニックネームが未設定の場合はメール、それもなければ"名前未設定"
          nickname: row.nickname || row.email || "名前未設定",
          email: row.email,
          storeId: row.store_id,
        }))
        // localeCompare: 日本語を含む文字列の正しいソート（あいうえお順）
        .sort((a: TeacherInfo, b: TeacherInfo) => a.nickname.localeCompare(b.nickname));
    } catch {
      // エラー時は空配列を返す（画面表示に影響しないように）
      return [];
    }
  }

  /**
   * getTeacherShiftStats: 特定の講師の、指定月のシフト統計を取得する。
   * 「承認済み3件、申請中2件、却下1件、合計6件」のような情報を返す。
   *
   * @param teacherId - 講師のUID
   * @param storeId - 店舗ID
   * @param targetMonth - 対象年月（"YYYY-MM"形式、例: "2025-03"）
   * @returns Promise<ShiftStats> - シフト統計
   */
  async getTeacherShiftStats(
    teacherId: string,
    storeId: string,
    targetMonth: string
  ): Promise<ShiftStats> {
    try {
      // "2025-03" を年と月に分割
      const [year, month] = targetMonth.split('-');
      if (!year || !month) throw new Error('Invalid targetMonth format');

      // --- 月の開始日・終了日を文字列で生成（タイムゾーン非依存） ---
      // new Date() を使うとUTC変換で日付がずれる可能性があるため、
      // 文字列操作で直接 'YYYY-MM-DD' を生成する
      const y = Number.parseInt(year, 10);   // 文字列→数値変換（10進数）
      const m = Number.parseInt(month, 10);
      // 月初: YYYY-MM-01
      const startStr = `${y}-${String(m).padStart(2, '0')}-01`;
      // 月末日の計算: new Date(年, 月, 0) で「その月の最終日」が得られる
      // 例: new Date(2025, 3, 0) → 2025-02-28（3月の0日 = 2月の末日）
      const lastDay = new Date(y, m, 0).getDate();
      const endStr = `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

      const supabase = getSupabase();
      // シフトのステータスだけ取得（他のカラムは不要）
      const { data } = await supabase
        .from("shifts")
        .select("status")              // statusカラムのみ取得
        .eq("user_id", teacherId)      // WHERE user_id = teacherId
        .eq("store_id", storeId)       // AND store_id = storeId
        .gte("date", startStr)         // AND date >= startStr（gte = Greater Than or Equal）
        .lte("date", endStr);          // AND date <= endStr（lte = Less Than or Equal）

      // ステータスごとにカウント
      const stats: ShiftStats = { pending: 0, approved: 0, rejected: 0, total: 0 };
      (data || []).forEach((row: any) => {
        stats.total++;  // 全件カウント
        switch (row.status) {
          case "approved": stats.approved++; break;   // 承認済み
          case "rejected": stats.rejected++; break;   // 却下
          default: stats.pending++; break;             // それ以外は申請中扱い
        }
      });

      return stats;
    } catch {
      // エラー時は全て0のデフォルト値を返す
      return { pending: 0, approved: 0, rejected: 0, total: 0 };
    }
  }

  /**
   * getAllTeacherStatus: 店舗内の全講師のステータスを取得する。
   * 講師一覧 × シフト確認状態 × シフト統計を結合した総合情報。
   *
   * @param storeId - 店舗ID
   * @param periodId - シフト確認期間のID（どの月の確認状態を見るか）
   * @param targetMonth - 対象年月（"YYYY-MM"形式）
   * @returns Promise<TeacherStatus[]> - 講師ステータス一覧（未確認者を上位に、名前順にソート）
   */
  async getAllTeacherStatus(
    storeId: string,
    periodId: string,
    targetMonth: string
  ): Promise<TeacherStatus[]> {
    try {
      // まず全講師の基本情報を取得
      const teachers = await this.getTeachersByStore(storeId);
      const teacherStatuses: TeacherStatus[] = [];

      // 各講師について個別にステータスを取得
      // forループで順次処理（並列化も可能だがDB負荷を考慮して順次実行）
      for (const teacher of teachers) {
        try {
          // --- シフト確認状態の取得 ---
          let isConfirmed = false;
          try {
            // shiftConfirmations サービス経由で確認状態を取得
            isConfirmed = await ServiceProvider.shiftConfirmations.getUserConfirmationStatus(
              teacher.uid,
              periodId
            );
          } catch {
            // 確認状態の取得に失敗しても、他の情報は表示できるようにする
            isConfirmed = false;
          }

          // --- シフト統計の取得 ---
          let shiftStats: ShiftStats;
          try {
            shiftStats = await this.getTeacherShiftStats(teacher.uid, storeId, targetMonth);
          } catch {
            // 統計取得に失敗した場合はデフォルト値
            shiftStats = { pending: 0, approved: 0, rejected: 0, total: 0 };
          }

          // 結合した結果を配列に追加
          teacherStatuses.push({ teacher, isConfirmed, shiftStats });
        } catch {
          // 個別の講師でエラーが起きても、他の講師の処理は続行する
          teacherStatuses.push({
            teacher,
            isConfirmed: false,
            shiftStats: { pending: 0, approved: 0, rejected: 0, total: 0 },
          });
        }
      }

      // ソート: 未確認者を先に表示し、同じ確認状態ならニックネーム順
      return teacherStatuses.sort((a, b) => {
        if (a.isConfirmed === b.isConfirmed) return a.teacher.nickname.localeCompare(b.teacher.nickname);
        // isConfirmed=false（未確認）を先に表示する
        return a.isConfirmed ? 1 : -1;
      });
    } catch {
      return [];
    }
  }
}
