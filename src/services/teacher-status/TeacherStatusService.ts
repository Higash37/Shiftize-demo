import { 
  collection, 
  query, 
  where, 
  getDocs,
  doc,
  getDoc
} from "firebase/firestore";
import { db } from "@/services/firebase/firebase";
import { ShiftConfirmationService } from "@/services/shift-confirmation/ShiftConfirmationService";

export interface TeacherInfo {
  uid: string;
  nickname: string;
  email?: string;
  storeId: string;
}

export interface ShiftStats {
  pending: number;    // 未承認
  approved: number;   // 承認済み
  rejected: number;   // 却下
  total: number;      // 合計
}

export interface TeacherStatus {
  teacher: TeacherInfo;
  isConfirmed: boolean;
  shiftStats: ShiftStats;
}

export class TeacherStatusService {
  /**
   * 店舗の講師リストを取得
   */
  static async getTeachersByStore(storeId: string): Promise<TeacherInfo[]> {
    try {
      const q = query(
        collection(db, "users"),
        where("storeId", "==", storeId),
        where("role", "==", "teacher")
      );
      
      const querySnapshot = await getDocs(q);
      const teachers: TeacherInfo[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        teachers.push({
          uid: doc.id,
          nickname: data.nickname || data.email || "名前未設定",
          email: data.email,
          storeId: data.storeId
        });
      });
      
      return teachers.sort((a, b) => a.nickname.localeCompare(b.nickname));
    } catch (error) {
      return [];
    }
  }

  /**
   * 指定月の講師のシフト統計を取得
   */
  static async getTeacherShiftStats(
    teacherId: string, 
    storeId: string, 
    targetMonth: string
  ): Promise<ShiftStats> {
    try {
      // targetMonth は "2024-01" 形式
      const [year, month] = targetMonth.split('-');
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
      
      const startDateString = startDate.toISOString().split('T')[0];
      const endDateString = endDate.toISOString().split('T')[0];

      const q = query(
        collection(db, "shifts"),
        where("userId", "==", teacherId),
        where("storeId", "==", storeId),
        where("date", ">=", startDateString),
        where("date", "<=", endDateString)
      );
      
      const querySnapshot = await getDocs(q);
      const stats: ShiftStats = {
        pending: 0,
        approved: 0,
        rejected: 0,
        total: 0
      };
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const status = data.status || "pending";
        
        stats.total++;
        switch (status) {
          case "approved":
            stats.approved++;
            break;
          case "rejected":
            stats.rejected++;
            break;
          default:
            stats.pending++;
            break;
        }
      });
      
      return stats;
    } catch (error) {
      return {
        pending: 0,
        approved: 0,
        rejected: 0,
        total: 0
      };
    }
  }

  /**
   * 店舗の全講師の状態を取得（完了ボタンを押されていなくても未完了として表示）
   */
  static async getAllTeacherStatus(
    storeId: string, 
    periodId: string,
    targetMonth: string
  ): Promise<TeacherStatus[]> {
    try {
      // 全講師を取得（PayrollListと同様のロジック）
      const teachers = await this.getTeachersByStore(storeId);
      const teacherStatuses: TeacherStatus[] = [];

      // 各講師について状態を取得
      for (const teacher of teachers) {
        try {
          // 確定状況を取得（エラーが発生しても未確定として扱う）
          let isConfirmed = false;
          try {
            isConfirmed = await ShiftConfirmationService.getUserConfirmationStatus(
              teacher.uid, 
              periodId
            );
          } catch (confirmError) {
            // 確定状況の取得に失敗した場合は未確定とする
            isConfirmed = false;
          }

          // シフト統計を取得（エラーが発生しても空の統計として扱う）
          let shiftStats: ShiftStats;
          try {
            shiftStats = await this.getTeacherShiftStats(
              teacher.uid, 
              storeId, 
              targetMonth
            );
          } catch (statsError) {
            // 統計取得に失敗した場合は空の統計とする
            shiftStats = {
              pending: 0,
              approved: 0,
              rejected: 0,
              total: 0
            };
          }

          // 講師の状態を配列に追加（エラーが発生しても含める）
          teacherStatuses.push({
            teacher,
            isConfirmed,
            shiftStats
          });
        } catch (teacherError) {
          // 個別講師の処理でエラーが発生しても他の講師は表示する
          teacherStatuses.push({
            teacher,
            isConfirmed: false,
            shiftStats: {
              pending: 0,
              approved: 0,
              rejected: 0,
              total: 0
            }
          });
        }
      }

      // 確定状況でソート（未確定を先に表示、同じ確定状況内では名前順）
      return teacherStatuses.sort((a, b) => {
        if (a.isConfirmed === b.isConfirmed) {
          return a.teacher.nickname.localeCompare(b.teacher.nickname);
        }
        return a.isConfirmed ? 1 : -1;
      });
    } catch (error) {
      // エラーが発生しても空の配列を返して画面をクラッシュさせない
      return [];
    }
  }
}