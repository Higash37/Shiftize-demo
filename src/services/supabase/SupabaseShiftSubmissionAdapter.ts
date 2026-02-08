import type {
  IShiftSubmissionService,
  ShiftSubmissionPeriod,
  ShiftRequest,
  ShiftSubmission,
} from "../interfaces/IShiftSubmissionService";
import { getSupabase } from "./supabase-client";

// 日付文字列 "YYYY-MM-DD" をローカル日付としてパース（UTC解釈による日付ズレ防止）
function parseDateString(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y!, m! - 1, d!);
}

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

export class SupabaseShiftSubmissionAdapter implements IShiftSubmissionService {
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

  async getAllPeriods(storeId: string): Promise<ShiftSubmissionPeriod[]> {
    const supabase = getSupabase();
    const { data } = await supabase
      .from("shift_submission_periods")
      .select("*")
      .eq("store_id", storeId)
      .order("created_at", { ascending: false });

    return (data || []).map(mapRowToPeriod);
  }

  async getPeriod(periodId: string): Promise<ShiftSubmissionPeriod | null> {
    const supabase = getSupabase();
    const { data } = await supabase
      .from("shift_submission_periods")
      .select("*")
      .eq("id", periodId)
      .maybeSingle();

    return data ? mapRowToPeriod(data) : null;
  }

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

  async saveSubmission(
    periodId: string,
    userId: string,
    storeId: string,
    requests: ShiftRequest[]
  ): Promise<void> {
    const supabase = getSupabase();
    const existing = await this.getUserSubmission(periodId, userId);

    if (existing) {
      await supabase
        .from("shift_submissions")
        .update({ requests, updated_at: new Date().toISOString() })
        .eq("id", existing.id);
    } else {
      await supabase.from("shift_submissions").insert({
        period_id: periodId,
        user_id: userId,
        store_id: storeId,
        requests,
        status: "draft",
      });
    }
  }

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

  subscribeToActivePeriods(
    storeId: string,
    callback: (periods: ShiftSubmissionPeriod[]) => void
  ): () => void {
    const supabase = getSupabase();

    // Initial fetch
    this.getActivePeriods(storeId).then(callback).catch(() => callback([]));

    // Realtime subscription
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
          this.getActivePeriods(storeId).then(callback).catch(() => callback([]));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  isWithinPeriod(period: ShiftSubmissionPeriod): boolean {
    const now = new Date();
    return now >= period.startDate && now <= period.endDate;
  }

  getDaysUntilDeadline(period: ShiftSubmissionPeriod): number {
    const now = new Date();
    const diffTime = period.endDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  async deletePeriod(periodId: string): Promise<void> {
    const supabase = getSupabase();
    await supabase.from("shift_submission_periods").delete().eq("id", periodId);
  }
}
