import type { ITeacherStatusService, TeacherInfo, ShiftStats, TeacherStatus } from "../interfaces/ITeacherStatusService";
import { ServiceProvider } from "../ServiceProvider";
import { getSupabase } from "./supabase-client";

export class SupabaseTeacherStatusAdapter implements ITeacherStatusService {
  async getTeachersByStore(storeId: string): Promise<TeacherInfo[]> {
    try {
      const supabase = getSupabase();
      const { data } = await supabase
        .from("users")
        .select("uid, nickname, email, store_id")
        .eq("store_id", storeId)
        .eq("role", "teacher");

      return (data || [])
        .map((row: any) => ({
          uid: row.uid,
          nickname: row.nickname || row.email || "名前未設定",
          email: row.email,
          storeId: row.store_id,
        }))
        .sort((a: TeacherInfo, b: TeacherInfo) => a.nickname.localeCompare(b.nickname));
    } catch {
      return [];
    }
  }

  async getTeacherShiftStats(
    teacherId: string,
    storeId: string,
    targetMonth: string
  ): Promise<ShiftStats> {
    try {
      const [year, month] = targetMonth.split('-');
      if (!year || !month) throw new Error('Invalid targetMonth format');

      // TZ非依存: 文字列から直接 'YYYY-MM-DD' を生成（UTC変換を介さない）
      const y = Number.parseInt(year, 10);
      const m = Number.parseInt(month, 10);
      const startStr = `${y}-${String(m).padStart(2, '0')}-01`;
      // 月末日を計算（翌月0日 = 当月末日）
      const lastDay = new Date(y, m, 0).getDate();
      const endStr = `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

      const supabase = getSupabase();
      const { data } = await supabase
        .from("shifts")
        .select("status")
        .eq("user_id", teacherId)
        .eq("store_id", storeId)
        .gte("date", startStr)
        .lte("date", endStr);

      const stats: ShiftStats = { pending: 0, approved: 0, rejected: 0, total: 0 };
      (data || []).forEach((row: any) => {
        stats.total++;
        switch (row.status) {
          case "approved": stats.approved++; break;
          case "rejected": stats.rejected++; break;
          default: stats.pending++; break;
        }
      });

      return stats;
    } catch {
      return { pending: 0, approved: 0, rejected: 0, total: 0 };
    }
  }

  async getAllTeacherStatus(
    storeId: string,
    periodId: string,
    targetMonth: string
  ): Promise<TeacherStatus[]> {
    try {
      const teachers = await this.getTeachersByStore(storeId);
      const teacherStatuses: TeacherStatus[] = [];

      for (const teacher of teachers) {
        try {
          let isConfirmed = false;
          try {
            isConfirmed = await ServiceProvider.shiftConfirmations.getUserConfirmationStatus(
              teacher.uid,
              periodId
            );
          } catch {
            isConfirmed = false;
          }

          let shiftStats: ShiftStats;
          try {
            shiftStats = await this.getTeacherShiftStats(teacher.uid, storeId, targetMonth);
          } catch {
            shiftStats = { pending: 0, approved: 0, rejected: 0, total: 0 };
          }

          teacherStatuses.push({ teacher, isConfirmed, shiftStats });
        } catch {
          teacherStatuses.push({
            teacher,
            isConfirmed: false,
            shiftStats: { pending: 0, approved: 0, rejected: 0, total: 0 },
          });
        }
      }

      return teacherStatuses.sort((a, b) => {
        if (a.isConfirmed === b.isConfirmed) return a.teacher.nickname.localeCompare(b.teacher.nickname);
        return a.isConfirmed ? 1 : -1;
      });
    } catch {
      return [];
    }
  }
}
