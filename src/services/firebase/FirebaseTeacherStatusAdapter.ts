import type { ITeacherStatusService, TeacherInfo, ShiftStats, TeacherStatus } from "../interfaces/ITeacherStatusService";
import { ServiceProvider } from "../ServiceProvider";
import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "@/services/firebase/firebase";

export class FirebaseTeacherStatusAdapter implements ITeacherStatusService {
  async getTeachersByStore(storeId: string): Promise<TeacherInfo[]> {
    try {
      const q = query(
        collection(db, "users"),
        where("storeId", "==", storeId),
        where("role", "==", "teacher")
      );

      const querySnapshot = await getDocs(q);
      const teachers: TeacherInfo[] = [];

      querySnapshot.forEach((d) => {
        const data = d.data();
        teachers.push({
          uid: d.id,
          nickname: data['nickname'] || data['email'] || "名前未設定",
          email: data['email'],
          storeId: data['storeId'],
        });
      });

      return teachers.sort((a, b) => a.nickname.localeCompare(b.nickname));
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

      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);

      const startDateString = startDate.toISOString().split('T')[0];
      const endDateString = endDate.toISOString().split('T')[0];
      if (!startDateString || !endDateString) throw new Error('Failed to format dates');

      const q = query(
        collection(db, "shifts"),
        where("userId", "==", teacherId),
        where("storeId", "==", storeId),
        where("date", ">=", startDateString),
        where("date", "<=", endDateString)
      );

      const querySnapshot = await getDocs(q);
      const stats: ShiftStats = { pending: 0, approved: 0, rejected: 0, total: 0 };

      querySnapshot.forEach((d) => {
        const data = d.data();
        const status = data['status'] || "pending";
        stats.total++;
        switch (status) {
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
        if (a.isConfirmed === b.isConfirmed) {
          return a.teacher.nickname.localeCompare(b.teacher.nickname);
        }
        return a.isConfirmed ? 1 : -1;
      });
    } catch {
      return [];
    }
  }
}
