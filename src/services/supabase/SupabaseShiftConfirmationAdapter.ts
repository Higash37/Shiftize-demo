/** @file SupabaseShiftConfirmationAdapter.ts @description シフト確認状態の管理のSupabase実装 */

import type { IShiftConfirmationService, ShiftConfirmation } from "../interfaces/IShiftConfirmationService";
import { getSupabase } from "./supabase-client";

/** シフト確認サービスのSupabase実装 */
export class SupabaseShiftConfirmationAdapter implements IShiftConfirmationService {
  /** シフトを確認済みにする */
  async confirmShift(userId: string, storeId: string, periodId: string): Promise<void> {
    const supabase = getSupabase();
    const confirmationId = `${userId}_${periodId}`;

    await supabase.from("shift_confirmations").upsert({
      id: confirmationId,
      user_id: userId,
      store_id: storeId,
      period_id: periodId,
      confirmed_at: new Date().toISOString(),
      status: "confirmed",
    });
  }

  /** シフトの確認を取り消す */
  async cancelConfirmation(userId: string, periodId: string): Promise<void> {
    const supabase = getSupabase();
    const confirmationId = `${userId}_${periodId}`;

    await supabase.from("shift_confirmations").delete().eq("id", confirmationId);
  }

  /** ユーザーの確認状態を取得する */
  async getUserConfirmationStatus(userId: string, periodId: string): Promise<boolean> {
    try {
      const supabase = getSupabase();
      const confirmationId = `${userId}_${periodId}`;

      const { data } = await supabase
        .from("shift_confirmations")
        .select("id")
        .eq("id", confirmationId)
        .eq("status", "confirmed")
        .maybeSingle();

      return data !== null;
    } catch {
      return false;
    }
  }

  /** 店舗全体の確認状態一覧を取得する */
  async getStoreConfirmationStatus(storeId: string, periodId: string): Promise<ShiftConfirmation[]> {
    try {
      const supabase = getSupabase();

      const { data } = await supabase
        .from("shift_confirmations")
        .select("*")
        .eq("store_id", storeId)
        .eq("period_id", periodId)
        .eq("status", "confirmed");

      return (data || []).map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        storeId: row.store_id,
        periodId: row.period_id,
        confirmedAt: new Date(row.confirmed_at),
        status: row.status,
      }));
    } catch {
      return [];
    }
  }
}
