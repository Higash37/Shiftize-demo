import type { IRecruitmentShiftService } from "../interfaces/IRecruitmentShiftService";
import type {
  RecruitmentShift,
  RecruitmentApplication,
} from "@/common/common-models/model-shift/shiftTypes";
import { getSupabase } from "./supabase-client";
import { ShiftAPIService } from "@/services/api/ShiftAPIService";

function mapRowToShift(row: any): RecruitmentShift {
  return {
    id: row.id,
    storeId: row.store_id,
    date: row.date,
    startTime: row.start_time,
    endTime: row.end_time,
    notes: row.notes,
    subject: row.subject,
    status: row.status,
    createdBy: row.created_by,
    applications: row.applications || [],
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  } as RecruitmentShift;
}

export class SupabaseRecruitmentShiftAdapter implements IRecruitmentShiftService {
  async createRecruitmentShift(
    shift: Omit<RecruitmentShift, "id" | "createdAt" | "updatedAt" | "applications">,
    _options?: { sendLineNotification?: boolean; masterName?: string }
  ): Promise<string> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("recruitment_shifts")
      .insert({
        store_id: shift.storeId,
        date: shift.date,
        start_time: shift.startTime,
        end_time: shift.endTime,
        notes: shift.notes || null,
        subject: (shift as any).subject || null,
        status: "open",
        created_by: shift.createdBy,
        applications: [],
      })
      .select("id")
      .single();

    if (error) throw error;
    return data.id;
  }

  async updateRecruitmentShift(shiftId: string, updates: Partial<RecruitmentShift>): Promise<void> {
    const supabase = getSupabase();
    const row: any = { updated_at: new Date().toISOString() };
    if (updates.date !== undefined) row.date = updates.date;
    if (updates.startTime !== undefined) row.start_time = updates.startTime;
    if (updates.endTime !== undefined) row.end_time = updates.endTime;
    if (updates.notes !== undefined) row.notes = updates.notes;
    if (updates.status !== undefined) row.status = updates.status;
    if (updates.applications !== undefined) row.applications = updates.applications;

    await supabase.from("recruitment_shifts").update(row).eq("id", shiftId);
  }

  async applyToRecruitmentShift(
    shiftId: string,
    application: Omit<RecruitmentApplication, "appliedAt" | "status">
  ): Promise<void> {
    const supabase = getSupabase();

    // Get current shift
    const { data: shift } = await supabase
      .from("recruitment_shifts")
      .select("*")
      .eq("id", shiftId)
      .single();

    if (!shift) throw new Error("募集シフトが見つかりません");

    const newApplication = {
      ...application,
      appliedAt: new Date().toISOString(),
      status: "pending",
    };

    const applications = [...(shift.applications || []), newApplication];

    await supabase
      .from("recruitment_shifts")
      .update({ applications, updated_at: new Date().toISOString() })
      .eq("id", shiftId);

    // Create pending shift
    const pendingShift = {
      storeId: shift.store_id,
      userId: application.userId,
      nickname: application.nickname,
      date: shift.date,
      startTime: application.requestedStartTime,
      endTime: application.requestedEndTime,
      notes: (application.notes || "") + " (募集シフト応募・承認待ち)",
      status: "pending" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await ShiftAPIService.createShift(pendingShift as any);
  }

  async approveApplication(
    recruitmentShiftId: string,
    userId: string,
    shiftData: { startTime: string; endTime: string }
  ): Promise<void> {
    const supabase = getSupabase();

    const { data: shift } = await supabase
      .from("recruitment_shifts")
      .select("*")
      .eq("id", recruitmentShiftId)
      .single();

    if (!shift) throw new Error("募集シフトが見つかりません");

    const application = (shift.applications || []).find((app: any) => app.userId === userId);
    if (!application) throw new Error("応募が見つかりません");

    // Delete existing pending shift
    try {
      const existingShifts = await ShiftAPIService.getShifts({
        storeId: shift.store_id,
        userId,
      });
      const pendingShift = existingShifts.find(
        (s: any) => s.notes?.includes("募集シフト応募・承認待ち") && s.status === "pending"
      );
      if (pendingShift) await ShiftAPIService.deleteShift(pendingShift.id);
    } catch {}

    // Create approved shift
    await ShiftAPIService.createShift({
      storeId: shift.store_id,
      userId,
      nickname: application.nickname,
      date: shift.date,
      startTime: shiftData.startTime,
      endTime: shiftData.endTime,
      notes: application.notes || "",
      createdBy: shift.created_by,
      status: "approved",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    // Update application status
    const updatedApplications = (shift.applications || []).map((app: any) =>
      app.userId === userId ? { ...app, status: "approved" } : app
    );

    await supabase
      .from("recruitment_shifts")
      .update({ applications: updatedApplications, updated_at: new Date().toISOString() })
      .eq("id", recruitmentShiftId);
  }

  async rejectApplication(recruitmentShiftId: string, userId: string): Promise<void> {
    const supabase = getSupabase();

    const { data: shift } = await supabase
      .from("recruitment_shifts")
      .select("applications")
      .eq("id", recruitmentShiftId)
      .single();

    if (!shift) return;

    const updatedApplications = (shift.applications || []).map((app: any) =>
      app.userId === userId ? { ...app, status: "rejected" } : app
    );

    await supabase
      .from("recruitment_shifts")
      .update({ applications: updatedApplications, updated_at: new Date().toISOString() })
      .eq("id", recruitmentShiftId);
  }

  async deleteRecruitmentShift(shiftId: string): Promise<void> {
    const supabase = getSupabase();
    await supabase.from("recruitment_shifts").delete().eq("id", shiftId);
  }

  async updateRecruitmentStatus(
    shiftId: string,
    status: "open" | "closed" | "cancelled"
  ): Promise<void> {
    const supabase = getSupabase();
    await supabase
      .from("recruitment_shifts")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", shiftId);
  }

  async getRecruitmentShift(shiftId: string): Promise<RecruitmentShift | null> {
    const supabase = getSupabase();
    const { data } = await supabase
      .from("recruitment_shifts")
      .select("*")
      .eq("id", shiftId)
      .maybeSingle();

    return data ? mapRowToShift(data) : null;
  }

  async getOpenRecruitmentShifts(storeId: string): Promise<RecruitmentShift[]> {
    const supabase = getSupabase();
    const { data } = await supabase
      .from("recruitment_shifts")
      .select("*")
      .eq("store_id", storeId)
      .eq("status", "open");

    return (data || []).map(mapRowToShift);
  }

  onOpenRecruitmentShifts(
    storeId: string,
    callback: (shifts: RecruitmentShift[]) => void,
    onError?: (error: any) => void
  ): () => void {
    const supabase = getSupabase();

    // Initial fetch
    this.getOpenRecruitmentShifts(storeId).then(callback).catch((e) => onError?.(e));

    // Realtime
    const channel = supabase
      .channel(`recruitment_shifts_${storeId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "recruitment_shifts",
          filter: `store_id=eq.${storeId}`,
        },
        () => {
          this.getOpenRecruitmentShifts(storeId).then(callback).catch((e) => onError?.(e));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  async getRecruitmentShifts(storeId: string): Promise<RecruitmentShift[]> {
    const supabase = getSupabase();
    const { data } = await supabase
      .from("recruitment_shifts")
      .select("*")
      .eq("store_id", storeId);

    return (data || []).map(mapRowToShift);
  }
}
