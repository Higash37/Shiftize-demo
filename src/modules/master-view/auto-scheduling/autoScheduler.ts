/**
 * @file autoScheduler.ts
 * @description 自動スケジューリングエンジン。均等分配アルゴリズムで
 *   スタッフにタスク・業務を自動配置する。
 *
 * 【このファイルの位置づけ】
 *   master-view > auto-scheduling 配下のビジネスロジック。
 *   DailyTaskGanttView の「自動配置」ボタンから呼ばれる。
 *
 * 主な内部ロジック:
 *   - 各スタッフの空き時間帯を算出
 *   - タスクの所要時間とスタッフの空き時間をマッチング
 *   - 均等分配: 各スタッフの担当量が偏らないように配分
 *   - 結果を ShiftTaskAssignment[] として返す
 */
import { timeStringToMinutes } from "@/common/common-utils/util-shift/wageCalculator";
import type { StaffRole, RoleTask, RoleAssignment, TaskAssignment } from "../info-dashboard/useStaffTasks";
import type { ShiftTaskAssignment } from "../info-dashboard/useShiftTaskAssignments";

interface ShiftForScheduling {
  id: string;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  status?: string;
}

export interface ProposedAssignment {
  shiftId: string;
  taskId: string | null;
  roleId: string | null;
  storeId: string;
  userId: string;
  scheduledDate: string;
  scheduledStartTime: string;
  scheduledEndTime: string;
  source: "auto";
  // 表示用（非保存）
  taskName?: string | undefined;
  roleName?: string | undefined;
  userName?: string | undefined;
  taskColor?: string | undefined;
  taskIcon?: string | undefined;
}

interface SchedulableItem {
  id: string;
  roleId: string | null;
  name: string;
  icon: string;
  color: string;
  scheduleDays: number[];
  scheduleStartTime: string | null;
  scheduleDurationMinutes: number;
  scheduleIntervalMinutes: number | null;
  requiredCount: number;
  type: "role" | "task";
  eligibleUserIds: string[];
}

interface AutoScheduleInput {
  shifts: ShiftForScheduling[];
  roles: StaffRole[];
  tasks: RoleTask[];
  roleAssignments: RoleAssignment[];
  taskAssignments: TaskAssignment[];
  existingAssignments: ShiftTaskAssignment[];
  storeId: string;
  year: number;
  month: number;
  userNames?: Record<string, string>;
}

function addMinutesToTime(time: string, minutes: number): string {
  const total = timeStringToMinutes(time) + minutes;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

function shiftOverlapsTimeRange(
  shiftStart: string,
  shiftEnd: string,
  rangeStart: string,
  rangeEnd: string
): boolean {
  const ss = timeStringToMinutes(shiftStart);
  const se = timeStringToMinutes(shiftEnd);
  const rs = timeStringToMinutes(rangeStart);
  const re = timeStringToMinutes(rangeEnd);
  return ss < re && se > rs;
}

function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = [];
  const date = new Date(year, month - 1, 1);
  while (date.getMonth() === month - 1) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
}

export function computeAutoSchedule(input: AutoScheduleInput): ProposedAssignment[] {
  const { shifts, roles, tasks, roleAssignments, taskAssignments, storeId, year, month, userNames } = input;

  // スケジュール設定のあるアイテムを収集
  const schedulables: SchedulableItem[] = [];

  // 全ユーザーIDを取得（anyoneモード用）
  const allUserIds = [...new Set(shifts.map((s) => s.userId))];

  for (const role of roles) {
    if (role.schedule_days.length > 0 && role.schedule_duration_minutes && (role.schedule_start_time || role.schedule_interval_minutes)) {
      const eligibleUserIds = role.assignment_mode === "anyone"
        ? allUserIds
        : roleAssignments.filter((a) => a.role_id === role.id).map((a) => a.user_id);
      schedulables.push({
        id: role.id,
        roleId: null,
        name: role.name,
        icon: role.icon,
        color: role.color,
        scheduleDays: role.schedule_days,
        scheduleStartTime: role.schedule_start_time,
        scheduleDurationMinutes: role.schedule_duration_minutes,
        scheduleIntervalMinutes: role.schedule_interval_minutes,
        requiredCount: role.required_count,
        type: "role",
        eligibleUserIds,
      });
    }
  }

  for (const task of tasks) {
    if (task.schedule_days.length > 0 && task.schedule_duration_minutes && (task.schedule_start_time || task.schedule_interval_minutes)) {
      const eligibleUserIds = task.assignment_mode === "anyone"
        ? allUserIds
        : taskAssignments.filter((a) => a.task_id === task.id).map((a) => a.user_id);
      schedulables.push({
        id: task.id,
        roleId: task.role_id,
        name: task.name,
        icon: task.icon,
        color: task.color,
        scheduleDays: task.schedule_days,
        scheduleStartTime: task.schedule_start_time,
        scheduleDurationMinutes: task.schedule_duration_minutes,
        scheduleIntervalMinutes: task.schedule_interval_minutes,
        requiredCount: task.required_count,
        type: "task",
        eligibleUserIds,
      });
    }
  }

  if (schedulables.length === 0) return [];

  // 割り当て回数カウント（均等分散用）
  const assignmentCounts: Record<string, number> = {};
  const countKey = (itemId: string, userId: string) => `${itemId}:${userId}`;
  // グローバル割り当て回数（全タスク横断で均等分散）
  const globalCounts: Record<string, number> = {};
  // 日別ユーザー割り当て回数（同日に複数人に分散）
  const dailyCounts: Record<string, number> = {};
  const dailyKey = (userId: string, date: string) => `${userId}:${date}`;

  const days = getDaysInMonth(year, month);
  const proposals: ProposedAssignment[] = [];

  // シフトを日付別にインデックス
  const shiftsByDate: Record<string, ShiftForScheduling[]> = {};
  for (const shift of shifts) {
    if (shift.status && shift.status !== "approved" && shift.status !== "completed") continue;
    if (!shiftsByDate[shift.date]) shiftsByDate[shift.date] = [];
    shiftsByDate[shift.date]!.push(shift);
  }

  // 既に割り当て済みの時間帯を追跡（ユーザー×日付×時間帯）
  const assignedSlots: Record<string, Array<{ start: number; end: number }>> = {};
  const slotKey = (userId: string, date: string) => `${userId}:${date}`;

  const isSlotFree = (userId: string, date: string, startMin: number, endMin: number): boolean => {
    const slots = assignedSlots[slotKey(userId, date)] || [];
    return !slots.some((s) => startMin < s.end && endMin > s.start);
  };

  const markSlot = (userId: string, date: string, startMin: number, endMin: number) => {
    const k = slotKey(userId, date);
    if (!assignedSlots[k]) assignedSlots[k] = [];
    assignedSlots[k]!.push({ start: startMin, end: endMin });
  };

  for (const item of schedulables) {
    for (const day of days) {
      const dayOfWeek = day.getDay(); // 0=Sun
      if (!item.scheduleDays.includes(dayOfWeek)) continue;

      const dateStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
      const dayShifts = shiftsByDate[dateStr] || [];

      // 時間スロットを生成
      const timeSlots: Array<{ startTime: string; endTime: string }> = [];

      if (item.scheduleStartTime && !item.scheduleIntervalMinutes) {
        // 固定開始時間モード
        const endTime = addMinutesToTime(item.scheduleStartTime, item.scheduleDurationMinutes);
        timeSlots.push({ startTime: item.scheduleStartTime, endTime });
      } else if (item.scheduleIntervalMinutes) {
        // 繰り返し間隔モード: 各シフトの出勤時間内でスロットを生成
        // まず対象シフトの最早開始〜最遅終了を求めてスロット候補を作る
        const eligibleShifts = dayShifts.filter((s) => item.eligibleUserIds.includes(s.userId));
        if (eligibleShifts.length === 0) continue;

        // 全対象シフトの時間範囲からスロット候補を生成
        const allStarts = eligibleShifts.map((s) => timeStringToMinutes(s.startTime));
        const allEnds = eligibleShifts.map((s) => timeStringToMinutes(s.endTime));
        const rangeStart = Math.min(...allStarts);
        const rangeEnd = Math.max(...allEnds);

        for (let t = rangeStart; t + item.scheduleDurationMinutes <= rangeEnd; t += item.scheduleIntervalMinutes) {
          const slotStart = addMinutesToTime("00:00", t);
          const slotEnd = addMinutesToTime("00:00", t + item.scheduleDurationMinutes);
          timeSlots.push({ startTime: slotStart, endTime: slotEnd });
        }
      }

      // 各スロットで候補者を選定
      for (const slot of timeSlots) {
        const slotStartMin = timeStringToMinutes(slot.startTime);
        const slotEndMin = timeStringToMinutes(slot.endTime);

        const candidates: { userId: string; shiftId: string; dailyCount: number; count: number; globalCount: number }[] = [];

        for (const shift of dayShifts) {
          if (!item.eligibleUserIds.includes(shift.userId)) continue;
          if (!shiftOverlapsTimeRange(shift.startTime, shift.endTime, slot.startTime, slot.endTime)) continue;
          if (!isSlotFree(shift.userId, dateStr, slotStartMin, slotEndMin)) continue;

          const key = countKey(item.id, shift.userId);
          const count = assignmentCounts[key] || 0;
          const gc = globalCounts[shift.userId] || 0;
          const dc = dailyCounts[dailyKey(shift.userId, dateStr)] || 0;
          candidates.push({ userId: shift.userId, shiftId: shift.id, dailyCount: dc, count, globalCount: gc });
        }

        // 均等分散: 1) 当日の割り当て少ない人優先 → 2) 同タスク回数少ない順 → 3) 全体回数少ない順 → 4) ランダム
        candidates.sort((a, b) => a.dailyCount - b.dailyCount || a.count - b.count || a.globalCount - b.globalCount || Math.random() - 0.5);

        // required_count 人を選択
        const selected = candidates.slice(0, item.requiredCount);

        for (const s of selected) {
          const key = countKey(item.id, s.userId);
          assignmentCounts[key] = (assignmentCounts[key] || 0) + 1;
          globalCounts[s.userId] = (globalCounts[s.userId] || 0) + 1;
          const dk = dailyKey(s.userId, dateStr);
          dailyCounts[dk] = (dailyCounts[dk] || 0) + 1;
          markSlot(s.userId, dateStr, slotStartMin, slotEndMin);

          const roleName = item.type === "role" ? item.name : roles.find((r) => r.id === item.roleId)?.name;

          proposals.push({
            shiftId: s.shiftId,
            taskId: item.type === "task" ? item.id : null,
            roleId: item.type === "role" ? item.id : item.roleId,
            storeId,
            userId: s.userId,
            scheduledDate: dateStr,
            scheduledStartTime: slot.startTime,
            scheduledEndTime: slot.endTime,
            source: "auto",
            taskName: item.name,
            roleName: roleName || undefined,
            userName: userNames?.[s.userId],
            taskColor: item.color,
            taskIcon: item.icon,
          });
        }
      }
    }
  }

  return proposals;
}
