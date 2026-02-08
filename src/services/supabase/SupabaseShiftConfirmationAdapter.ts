import type { IShiftConfirmationService, ShiftConfirmation } from "../interfaces/IShiftConfirmationService";
import { getSupabase } from "./supabase-client";

export class SupabaseShiftConfirmationAdapter implements IShiftConfirmationService {
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

  async cancelConfirmation(userId: string, periodId: string): Promise<void> {
    const supabase = getSupabase();
    const confirmationId = `${userId}_${periodId}`;

    await supabase.from("shift_confirmations").delete().eq("id", confirmationId);
  }

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
