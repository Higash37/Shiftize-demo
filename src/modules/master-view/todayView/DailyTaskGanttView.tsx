import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Platform,
  useWindowDimensions,
} from "react-native";
import { format, addDays, subDays } from "date-fns";
import { ja } from "date-fns/locale";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { ShiftItem } from "@/common/common-models/ModelIndex";
import { SHIFT_HOURS } from "@/common/common-constants/BoundaryConstants";
import { useShiftsByMonth } from "@/common/common-utils/util-shift/useShiftsRealtime";
import { useUsers } from "@/modules/reusable-widgets/user-management/user-hooks/useUserList";
import { useAuth } from "@/services/auth/useAuth";
import { Header, MasterHeader } from "@/common/common-ui/ui-layout";
import { useMD3Theme } from "@/common/common-theme/md3/MD3ThemeContext";
import { useStaffRolesContext } from "@/common/common-context/StaffRolesContext";
import { useShiftTaskAssignmentsContext } from "@/common/common-context/ShiftTaskAssignmentsContext";
import { useTimeSegmentTypesContext } from "@/common/common-context/TimeSegmentTypesContext";
import { timeStringToMinutes, calculateMinutesBetween } from "@/common/common-utils/util-shift/wageCalculator";
import { getButtonStyle, getButtonTextStyle, UnifiedButtonStyles } from "@/modules/reusable-widgets/gantt-chart/gantt-chart-common/UnifiedButtonStyles";
import { PrintButton } from "@/modules/reusable-widgets/gantt-chart/print/PrintButton";
// 今月ガントチャートと同じステータスカラー
const GANTT_STATUS_COLORS: Record<string, string> = {
  approved: "#90caf9",
  pending: "#FFD700",
  rejected: "#ffcdd2",
  deleted: "#9e9e9e",
  completed: "#4CAF50",
};
function getGanttStatusColor(status: string): string {
  return GANTT_STATUS_COLORS[status] || "#90caf9";
}

/** 背景色の明度を判定し、濃い色なら白、薄い色なら黒を返す */
function contrastText(hex: string): string {
  const c = hex.replace("#", "").slice(0, 6);
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  // relative luminance (sRGB)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#000" : "#fff";
}
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ShiftTaskAssignment } from "@/modules/master-view/info-dashboard/useShiftTaskAssignments";
import type { RoleTask, StaffRole } from "@/modules/master-view/info-dashboard/useStaffTasks";
import { ServiceProvider } from "@/services/ServiceProvider";
import type { ClassTimeSlot } from "@/common/common-models/model-shift/shiftTypes";
import { DailyTodoView } from "./DailyTodoView";
import { DateNavigator, SUB_HEADER_HEIGHT } from "@/common/common-ui/ui-navigation/DateNavigator";
import { useTodoBadge } from "@/common/common-context/TodoBadgeContext";

const AUTO_ASSIGN_KEY = "daily_gantt_auto_assign";

// --- ヘルパー ---
function addMinutesToTime(time: string, minutes: number): string {
  const total = timeStringToMinutes(time) + minutes;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

function minutesToTimeStr(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

/** 途中時間のうちタスク配置不可（allowTaskOverlap=false）の時間帯と重なるか判定 */
function conflictsWithBlockedSegments(
  shift: { classes?: Array<{ startTime: string; endTime: string; typeId?: string }> },
  slotStart: number,
  slotEnd: number,
  segmentTypesMap: Record<string, { allowTaskOverlap: boolean }>,
): boolean {
  if (!shift.classes) return false;
  return shift.classes.some((ct) => {
    const seg = ct.typeId ? segmentTypesMap[ct.typeId] : null;
    if (!seg || seg.allowTaskOverlap) return false;
    const ctStart = timeStringToMinutes(ct.startTime);
    const ctEnd = timeStringToMinutes(ct.endTime);
    return slotStart < ctEnd && slotEnd > ctStart;
  });
}

// --- 型 ---
interface ExpectedSlot {
  item: StaffRole | RoleTask;
  itemType: "role" | "task";
  startTime: string;
  endTime: string;
  requiredCount: number;
  assignedCount: number;
}

interface EditModalState {
  visible: boolean;
  assignment?: ShiftTaskAssignment;
  // 新規作成用
  newSlot?: {
    userId: string;
    shiftId: string;
    taskId: string | null;
    roleId: string | null;
    startTime: string;
    endTime: string;
    taskName: string;
    taskColor: string;
    taskIcon: string;
  };
}

interface DailyTaskGanttViewProps {
  readOnly?: boolean;
}

// --- メインコンポーネント ---
export const DailyTaskGanttView: React.FC<DailyTaskGanttViewProps> = ({ readOnly = false }) => {
  const { user } = useAuth();
  const { colorScheme: cs } = useMD3Theme();
  const { width: screenWidth } = useWindowDimensions();
  const isMobile = screenWidth < 768;
  const { todayUnreadCount } = useTodoBadge();

  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [hideEarlyHours, setHideEarlyHours] = useState(false);
  const [editModal, setEditModal] = useState<EditModalState>({ visible: false });
  const [editStartTime, setEditStartTime] = useState("");
  const [editEndTime, setEditEndTime] = useState("");
  const [editManual, setEditManual] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<"editStart" | "editEnd" | "assignStart" | "assignEnd" | null>(null);
  const [assignModal, setAssignModal] = useState<{ visible: boolean; slot?: ExpectedSlot }>({ visible: false });
  const [assignManual, setAssignManual] = useState(false);
  const [assignStartTime, setAssignStartTime] = useState("");
  const [assignEndTime, setAssignEndTime] = useState("");
  const [assignUserModal, setAssignUserModal] = useState<{ visible: boolean; userId?: string; shiftStart?: string; shiftEnd?: string }>({ visible: false });
  const [userModalStartTime, setUserModalStartTime] = useState("");
  const [userModalEndTime, setUserModalEndTime] = useState("");
  const [autoAssignOn, setAutoAssignOn] = useState(false);
  const [autoAssignRan, setAutoAssignRan] = useState("");
  const [activeTab, setActiveTab] = useState<"schedule" | "todo">("schedule");

  // タスク追加モーダル（FAB / カードタップ用）
  const [userAddModal, setUserAddModal] = useState<{ visible: boolean; startTime: string; endTime: string; userId?: string }>({ visible: false, startTime: "", endTime: "" });
  const [addModalTab, setAddModalTab] = useState<0 | 1>(0);
  // 確認モーダル
  const [confirmItem, setConfirmItem] = useState<{
    item: StaffRole | RoleTask | { id: string; name: string; icon: string; color: string };
    itemType: "role" | "task" | "type";
    startTime: string;
    endTime: string;
  } | null>(null);

  const dateStr = format(selectedDate, "yyyy-MM-dd");
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();

  const { shifts, changeMonth } = useShiftsByMonth(user?.storeId, year, month);
  const { users } = useUsers(user?.storeId);

  const { roles, tasks, rolesMap, tasksMap, roleAssignments, taskAssignments } =
    useStaffRolesContext();
  const { types: segmentTypes, typesMap: segmentTypesMap } = useTimeSegmentTypesContext();
  const { assignments, fetchForMonth, upsertAssignment, deleteAssignment } =
    useShiftTaskAssignmentsContext();

  // 当日データ取得
  useEffect(() => {
    fetchForMonth(year, month + 1);
  }, [year, month, fetchForMonth]);

  // 自動配置ON/OFF永続化の読み込み（readOnly時はスキップ）
  useEffect(() => {
    if (readOnly) return;
    AsyncStorage.getItem(AUTO_ASSIGN_KEY).then((v) => {
      if (v === "true") setAutoAssignOn(true);
    });
  }, [readOnly]);

  // 当日のシフト（表示用：全ステータス）
  const dayShiftsAll = useMemo(
    () =>
      shifts.filter(
        (s) =>
          s.date === dateStr &&
          s.status !== "deleted" &&
          s.status !== "purged"
      ),
    [shifts, dateStr]
  );

  // タスク・業務の割り当て対象（承認済み or 完了のみ）
  const dayShifts = useMemo(
    () => dayShiftsAll.filter((s) => s.status === "approved" || s.status === "completed"),
    [dayShiftsAll]
  );

  // ユーザー自身のシフト（readOnlyモード用）
  const myShift = useMemo(
    () => readOnly ? (dayShifts.find(s => s.userId === user?.uid) ?? dayShiftsAll.find(s => s.userId === user?.uid) ?? null) : null,
    [readOnly, dayShifts, dayShiftsAll, user?.uid]
  );

  // 当日の割り当て
  const dayAssignments = useMemo(
    () => assignments.filter((a) => a.scheduledDate === dateStr),
    [assignments, dateStr]
  );

  // シフトがあるユーザー（開始時間順）— 全ステータス表示
  const usersWithShifts = useMemo(() => {
    const userIdsWithShifts = new Set(dayShiftsAll.map((s) => s.userId));
    return users
      .filter((u) => userIdsWithShifts.has(u.uid))
      .sort((a, b) => {
        const sa = dayShiftsAll.find((s) => s.userId === a.uid);
        const sb = dayShiftsAll.find((s) => s.userId === b.uid);
        if (!sa || !sb) return 0;
        return sa.startTime.localeCompare(sb.startTime);
      });
  }, [users, dayShiftsAll]);

  // 当日の曜日でスケジュール設定済みタスク/ロールの「期待スロット」を計算
  const expectedSlots = useMemo(() => {
    const dayOfWeek = selectedDate.getDay();
    const slots: ExpectedSlot[] = [];

    const processItem = (
      item: StaffRole | RoleTask,
      itemType: "role" | "task"
    ) => {
      if (!item.schedule_days.includes(dayOfWeek)) return;
      if (!item.schedule_duration_minutes) return;
      if (!item.schedule_start_time && !item.schedule_interval_minutes) return;

      if (item.schedule_start_time && !item.schedule_interval_minutes) {
        const endTime = addMinutesToTime(
          item.schedule_start_time,
          item.schedule_duration_minutes
        );
        const assignedCount = dayAssignments.filter((a) => {
          if (itemType === "task") return a.taskId === item.id;
          return a.roleId === item.id && !a.taskId;
        }).length;
        slots.push({
          item,
          itemType,
          startTime: item.schedule_start_time,
          endTime,
          requiredCount: item.required_count,
          assignedCount,
        });
      } else if (item.schedule_interval_minutes) {
        const isAnyone = (item as any).assignment_mode === "anyone";
        const eligibleShifts = isAnyone
          ? dayShifts
          : dayShifts.filter((s) => {
              if (itemType === "role") {
                return roleAssignments.some(
                  (a) => a.role_id === item.id && a.user_id === s.userId
                );
              }
              return taskAssignments.some(
                (a) => a.task_id === item.id && a.user_id === s.userId
              );
            });
        if (eligibleShifts.length === 0) return;

        const allStarts = eligibleShifts.map((s) =>
          timeStringToMinutes(s.startTime)
        );
        const allEnds = eligibleShifts.map((s) =>
          timeStringToMinutes(s.endTime)
        );
        const rangeStart = Math.min(...allStarts);
        const rangeEnd = Math.max(...allEnds);

        for (
          let t = rangeStart;
          t + item.schedule_duration_minutes <= rangeEnd;
          t += item.schedule_interval_minutes
        ) {
          const startTime = minutesToTimeStr(t);
          const endTime = minutesToTimeStr(t + item.schedule_duration_minutes);
          const assignedCount = dayAssignments.filter((a) => {
            const match =
              itemType === "task"
                ? a.taskId === item.id
                : a.roleId === item.id && !a.taskId;
            return (
              match &&
              a.scheduledStartTime === startTime &&
              a.scheduledEndTime === endTime
            );
          }).length;
          slots.push({
            item,
            itemType,
            startTime,
            endTime,
            requiredCount: item.required_count,
            assignedCount,
          });
        }
      }
    };

    roles.forEach((r) => processItem(r, "role"));
    tasks.forEach((t) => processItem(t, "task"));
    return slots;
  }, [
    selectedDate,
    roles,
    tasks,
    dayAssignments,
    dayShifts,
    roleAssignments,
    taskAssignments,
  ]);

  // 未配置スロット
  const unfilledSlots = useMemo(
    () => expectedSlots.filter((s) => s.assignedCount < s.requiredCount),
    [expectedSlots]
  );

  // 合計時間・金額
  const { totalHours, totalAmount } = useMemo(() => {
    let mins = 0;
    let amount = 0;
    for (const shift of dayShiftsAll) {
      const m = calculateMinutesBetween(shift.startTime, shift.endTime);
      mins += m;
      const u = users.find((x) => x.uid === shift.userId);
      const wage = (u as any)?.hourlyWage ?? 0;
      amount += (m / 60) * wage;
    }
    return { totalHours: mins / 60, totalAmount: Math.round(amount) };
  }, [dayShiftsAll, users]);

  const formattedHours = useMemo(() => {
    if (totalHours <= 0) return "0h";
    const hours = Math.floor(totalHours);
    const minutes = Math.round((totalHours % 1) * 60);
    return minutes > 0 ? `${hours}h${minutes}m` : `${hours}h`;
  }, [totalHours]);

  // 色モード
  const [colorMode, setColorMode] = useState<"status" | "user">("status");

  // --- タイムライン定数 ---
  const baseHour = hideEarlyHours
    ? SHIFT_HOURS.AFTERNOON_START_HOUR_INCLUSIVE
    : SHIFT_HOURS.START_HOUR_INCLUSIVE;
  const endHour = SHIFT_HOURS.END_HOUR_INCLUSIVE;
  const totalSlots = (endHour - baseHour) * 2 + 1; // 30分刻み
  const ROW_HEIGHT = 48;
  const TASK_ROW_HEIGHT = Math.round(ROW_HEIGHT * 0.6);
  const LABEL_WIDTH = isMobile ? 110 : 160;
  const MOBILE_SLOT_HEIGHT = 24;

  // 時間ラベル
  const timeLabels = useMemo(() => {
    const labels: string[] = [];
    for (let hour = baseHour; hour <= endHour; hour++) {
      labels.push(`${hour}:00`);
      if (hour < endHour) labels.push(`${hour}:30`);
    }
    return labels;
  }, [baseHour, endHour]);

  // 時刻 -> パーセント位置 (0~100%)
  const totalMinutes = (endHour - baseHour) * 60 + 30; // 最後の:00も含む

  // 1時間ごとの縦線位置（パーセント）
  const hourLines = useMemo(() => {
    const lines: Array<{ hour: number; pct: number }> = [];
    for (let h = baseHour; h <= endHour; h++) {
      const mins = h * 60 - baseHour * 60;
      lines.push({ hour: h, pct: (mins / totalMinutes) * 100 });
    }
    return lines;
  }, [baseHour, endHour, totalMinutes]);
  const timeToPct = useCallback(
    (time: string) => {
      const mins = timeStringToMinutes(time);
      const baseMins = baseHour * 60;
      return ((mins - baseMins) / totalMinutes) * 100;
    },
    [baseHour, totalMinutes]
  );

  // 30分刻みの時間オプション
  const timeOptions = useMemo(() => {
    const opts: string[] = [];
    for (let m = baseHour * 60; m <= endHour * 60; m += 30) {
      opts.push(`${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`);
    }
    return opts;
  }, [baseHour, endHour]);

  // --- モバイルカードの事前計算データ ---
  const mobileCardData = useMemo(() => {
    return usersWithShifts.map((u) => {
      const userShift = dayShiftsAll.find((s) => s.userId === u.uid);
      if (!userShift) return null;
      const userAssignments = dayAssignments.filter((a) => a.userId === u.uid);
      const roleAssigns = userAssignments.filter((a) => a.roleId && !a.taskId);
      const taskAssigns = userAssignments.filter((a) => a.taskId);
      const barColor = colorMode === "user" ? (u.color || cs.primary) : getGanttStatusColor(userShift.status);
      const classes = (userShift as any).classes as Array<{ startTime: string; endTime: string; typeName?: string; typeId?: string }> | undefined;
      const shiftStartMin = timeStringToMinutes(userShift.startTime);
      const shiftEndMin = timeStringToMinutes(userShift.endTime);

      // 実際の時間境界からスロットを生成
      const boundaries = new Set<number>();
      boundaries.add(shiftStartMin);
      boundaries.add(shiftEndMin);
      if (classes) {
        for (const ct of classes) {
          const s = timeStringToMinutes(ct.startTime);
          const e = timeStringToMinutes(ct.endTime);
          if (s > shiftStartMin && s < shiftEndMin) boundaries.add(s);
          if (e > shiftStartMin && e < shiftEndMin) boundaries.add(e);
        }
      }
      for (const a of [...roleAssigns, ...taskAssigns]) {
        const s = timeStringToMinutes(a.scheduledStartTime);
        const e = timeStringToMinutes(a.scheduledEndTime);
        if (s > shiftStartMin && s < shiftEndMin) boundaries.add(s);
        if (e > shiftStartMin && e < shiftEndMin) boundaries.add(e);
      }
      const sortedBounds = [...boundaries].sort((a, b) => a - b);

      const slots: Array<{ time: string; endTime: string; label: string; bgColor: string; textColor: string; isSeg: boolean }> = [];
      for (let i = 0; i < sortedBounds.length - 1; i++) {
        const m = sortedBounds[i]!;
        const mEnd = sortedBounds[i + 1]!;
        const t = minutesToTimeStr(m);
        const tEnd = minutesToTimeStr(mEnd);

        // 途中時間チェック
        const seg = classes?.find((ct) => {
          const cs2 = timeStringToMinutes(ct.startTime);
          const ce = timeStringToMinutes(ct.endTime);
          return m >= cs2 && mEnd <= ce;
        });
        let segType = seg?.typeId ? segmentTypesMap[seg.typeId] : null;
        if (!segType && seg?.typeName) {
          segType = Object.values(segmentTypesMap).find((st) => st.name === seg!.typeName) || null;
        }

        // 業務チェック
        const roleA = roleAssigns.find((a) => {
          const as2 = timeStringToMinutes(a.scheduledStartTime);
          const ae = timeStringToMinutes(a.scheduledEndTime);
          return m >= as2 && mEnd <= ae;
        });
        const roleInfo = roleA?.roleId ? rolesMap[roleA.roleId] : null;

        // タスクチェック
        const taskA = taskAssigns.find((a) => {
          const as2 = timeStringToMinutes(a.scheduledStartTime);
          const ae = timeStringToMinutes(a.scheduledEndTime);
          return m >= as2 && mEnd <= ae;
        });
        const taskInfo = taskA?.taskId ? tasksMap[taskA.taskId] : null;

        // ラベル構築
        const labels: string[] = [];
        if (segType) labels.push(`${segType.icon} ${segType.name}`);
        if (roleInfo) labels.push(`${roleInfo.icon} ${roleInfo.name}`);
        if (taskInfo) labels.push(`${taskInfo.icon} ${taskInfo.name}`);

        // 背景色決定（優先: 途中時間 > 業務 > タスク > シフト色）
        let slotBg = barColor + "20";
        let slotText = cs.onSurface;
        let isSeg = false;
        if (segType) {
          slotBg = segType.color + "40";
          isSeg = true;
        }
        if (roleInfo) {
          slotBg = roleInfo.color;
          slotText = contrastText(roleInfo.color);
        } else if (taskInfo) {
          slotBg = taskInfo.color;
          slotText = contrastText(taskInfo.color);
        }

        slots.push({ time: t, endTime: tEnd, label: labels.join(" / ") || "", bgColor: slotBg, textColor: slotText, isSeg });
      }

      // 連続する同じラベルのスロットをマージ
      const merged: Array<{ startTime: string; endTime: string; label: string; bgColor: string; textColor: string }> = [];
      for (const slot of slots) {
        const prev = merged[merged.length - 1];
        if (prev && prev.label === slot.label && prev.bgColor === slot.bgColor) {
          prev.endTime = slot.endTime;
        } else {
          merged.push({ startTime: slot.time, endTime: slot.endTime, label: slot.label, bgColor: slot.bgColor, textColor: slot.textColor });
        }
      }

      const statusLabel = userShift.status === "approved" ? "承認済み" : userShift.status === "completed" ? "完了" : userShift.status === "pending" ? "申請中" : userShift.status === "rejected" ? "却下" : userShift.status;

      return {
        uid: u.uid,
        nickname: u.nickname,
        barColor,
        statusLabel,
        startTime: userShift.startTime,
        endTime: userShift.endTime,
        merged,
      };
    }).filter((item): item is NonNullable<typeof item> => item !== null);
  }, [usersWithShifts, dayShiftsAll, dayAssignments, colorMode, cs, segmentTypesMap, rolesMap, tasksMap]);

  // --- 日付ナビ ---
  const handlePrevDay = useCallback(() => {
    setSelectedDate((prev) => {
      const next = subDays(prev, 1);
      if (next.getMonth() !== prev.getMonth())
        changeMonth(next.getFullYear(), next.getMonth());
      return next;
    });
  }, [changeMonth]);

  const handleNextDay = useCallback(() => {
    setSelectedDate((prev) => {
      const next = addDays(prev, 1);
      if (next.getMonth() !== prev.getMonth())
        changeMonth(next.getFullYear(), next.getMonth());
      return next;
    });
  }, [changeMonth]);

  const handleToday = useCallback(() => {
    const today = new Date();
    setSelectedDate((prev) => {
      if (
        today.getMonth() !== prev.getMonth() ||
        today.getFullYear() !== prev.getFullYear()
      )
        changeMonth(today.getFullYear(), today.getMonth());
      return today;
    });
  }, [changeMonth]);

  const isToday = format(new Date(), "yyyy-MM-dd") === dateStr;

  // --- タスク割り当て編集 ---
  const openEditModal = useCallback((assignment: ShiftTaskAssignment) => {
    setEditStartTime(assignment.scheduledStartTime);
    setEditEndTime(assignment.scheduledEndTime);
    setEditManual(false);
    setEditModal({ visible: true, assignment });
  }, []);

  const openAssignModal = useCallback((slot: ExpectedSlot, userId: string) => {
    const shift = dayShifts.find((s) => s.userId === userId);
    if (!shift) return;
    setEditStartTime(slot.startTime);
    setEditEndTime(slot.endTime);
    setEditManual(false);
    setEditModal({
      visible: true,
      newSlot: {
        userId,
        shiftId: shift.id,
        taskId: slot.itemType === "task" ? slot.item.id : null,
        roleId:
          slot.itemType === "role"
            ? slot.item.id
            : (slot.item as RoleTask).role_id,
        startTime: slot.startTime,
        endTime: slot.endTime,
        taskName: slot.item.name,
        taskColor: slot.item.color,
        taskIcon: slot.item.icon,
      },
    });
  }, [dayShifts]);

  const handleSaveEdit = async () => {
    if (editModal.assignment) {
      await upsertAssignment({
        ...editModal.assignment,
        scheduledStartTime: editStartTime,
        scheduledEndTime: editEndTime,
      });
    } else if (editModal.newSlot) {
      await upsertAssignment({
        shiftId: editModal.newSlot.shiftId,
        taskId: editModal.newSlot.taskId,
        roleId: editModal.newSlot.roleId,
        storeId: user?.storeId || "",
        userId: editModal.newSlot.userId,
        scheduledDate: dateStr,
        scheduledStartTime: editStartTime,
        scheduledEndTime: editEndTime,
        source: "manual",
      });
    }
    setEditModal({ visible: false });
  };

  const handleDeleteAssignment = async () => {
    if (editModal.assignment) {
      await deleteAssignment(editModal.assignment.id);
    }
    setEditModal({ visible: false });
  };

  // --- 空セルクリック ---
  const handleEmptyCellClick = useCallback((userId: string, time: string) => {
    if (unfilledSlots.length === 0) return;
    const slot = unfilledSlots[0];
    if (!slot) return;
    openAssignModal(slot, userId);
  }, [unfilledSlots, openAssignModal]);

  // --- 自動配置（当日の未配置スロットを直接処理） ---
  const handleAutoSchedule = useCallback(async () => {
    if (!user?.storeId || unfilledSlots.length === 0) {
      Alert.alert("自動配置", "配置可能なスロットがありません");
      return;
    }
    let count = 0;
    // 割り当て済みユーザー×時間帯を追跡
    const usedSlots: Array<{ userId: string; start: number; end: number }> = [];
    // ユーザーごとの当日割り当て回数
    const userDayCounts: Record<string, number> = {};
    // 既存の割り当て分も追跡
    for (const a of dayAssignments) {
      usedSlots.push({ userId: a.userId, start: timeStringToMinutes(a.scheduledStartTime), end: timeStringToMinutes(a.scheduledEndTime) });
      userDayCounts[a.userId] = (userDayCounts[a.userId] || 0) + 1;
    }

    for (const slot of unfilledSlots) {
      const needed = slot.requiredCount - slot.assignedCount;
      if (needed <= 0) continue;
      const slotStartMin = timeStringToMinutes(slot.startTime);
      const slotEndMin = timeStringToMinutes(slot.endTime);

      // 候補: 出勤中かつ時間が重なり、まだこのスロットで空いてるスタッフ、かつブロック時間帯と重複しない
      const candidates = dayShifts.filter((s) => {
        const shiftStart = timeStringToMinutes(s.startTime);
        const shiftEnd = timeStringToMinutes(s.endTime);
        if (slotStartMin < shiftStart || slotEndMin > shiftEnd) return false;
        if (usedSlots.some((u) => u.userId === s.userId && slotStartMin < u.end && slotEndMin > u.start)) return false;
        if (conflictsWithBlockedSegments(s as any, slotStartMin, slotEndMin, segmentTypesMap)) return false;
        return true;
      });

      // 割り当て回数が少ない人を優先、同数ならランダム
      candidates.sort((a, b) => (userDayCounts[a.userId] || 0) - (userDayCounts[b.userId] || 0) || Math.random() - 0.5);

      const selected = candidates.slice(0, needed);
      for (const s of selected) {
        await upsertAssignment({
          shiftId: s.id,
          taskId: slot.itemType === "task" ? slot.item.id : null,
          roleId: slot.itemType === "role" ? slot.item.id : (slot.item as RoleTask).role_id || null,
          storeId: user.storeId,
          userId: s.userId,
          scheduledDate: dateStr,
          scheduledStartTime: slot.startTime,
          scheduledEndTime: slot.endTime,
          source: "auto",
        });
        usedSlots.push({ userId: s.userId, start: slotStartMin, end: slotEndMin });
        userDayCounts[s.userId] = (userDayCounts[s.userId] || 0) + 1;
        count++;
      }
    }
    Alert.alert("自動配置", count > 0 ? `${count}件を配置しました` : "配置可能な候補がいません");
  }, [user?.storeId, unfilledSlots, dayShifts, dayAssignments, dateStr, upsertAssignment, segmentTypesMap]);

  // 自動配置ON/OFFトグル
  const toggleAutoAssign = useCallback(async () => {
    const next = !autoAssignOn;
    setAutoAssignOn(next);
    await AsyncStorage.setItem(AUTO_ASSIGN_KEY, next ? "true" : "false");
  }, [autoAssignOn]);

  // 自動配置ON時、日付が変わったら自動実行
  useEffect(() => {
    if (!autoAssignOn || unfilledSlots.length === 0 || autoAssignRan === dateStr) return;
    if (!user?.storeId || dayShifts.length === 0) return;
    setAutoAssignRan(dateStr);
    handleAutoSchedule();
  }, [autoAssignOn, dateStr, unfilledSlots.length, dayShifts.length, user?.storeId, autoAssignRan, handleAutoSchedule]);

  // --- モーダルからユーザーを選んで割り当て ---
  const handleAssignSlotToUser = useCallback(async (userId: string) => {
    const slot = assignModal.slot;
    if (!slot || !user?.storeId) return;
    const userShift = dayShifts.find((s) => s.userId === userId);
    if (!userShift) return;
    await upsertAssignment({
      shiftId: userShift.id,
      taskId: slot.itemType === "task" ? slot.item.id : null,
      roleId: slot.itemType === "role" ? slot.item.id : (slot.item as RoleTask).role_id || null,
      storeId: user.storeId,
      userId,
      scheduledDate: dateStr,
      scheduledStartTime: assignStartTime,
      scheduledEndTime: assignEndTime,
      source: "manual",
    });
    setAssignModal({ visible: false });
  }, [assignModal.slot, user?.storeId, dayShifts, dateStr, upsertAssignment, assignStartTime, assignEndTime]);

  // --- 確認モーダルを開く ---
  const openConfirm = useCallback((item: StaffRole | RoleTask | { id: string; name: string; icon: string; color: string }, itemType: "role" | "task" | "type") => {
    setConfirmItem({ item, itemType, startTime: userAddModal.startTime, endTime: userAddModal.endTime });
  }, [userAddModal.startTime, userAddModal.endTime]);

  // --- 確認 → 保存 ---
  const handleConfirmSave = useCallback(async () => {
    if (!confirmItem || !user?.storeId) return;
    const targetUserId = userAddModal.userId || user.uid;
    if (!targetUserId) return;

    if (confirmItem.itemType === "type") {
      // タイプ追加 → shift.classes に追加
      const targetShift = dayShiftsAll.find(s => s.userId === targetUserId);
      if (!targetShift) return;
      const existingClasses: ClassTimeSlot[] = (targetShift as any).classes || [];
      await ServiceProvider.shifts.updateShift(targetShift.id, {
        classes: [...existingClasses, {
          startTime: confirmItem.startTime,
          endTime: confirmItem.endTime,
          typeId: confirmItem.item.id,
          typeName: confirmItem.item.name,
        }],
      });
    } else {
      // 業務・タスク追加 → shift_task_assignments
      const targetShift = dayShifts.find(s => s.userId === targetUserId) ?? dayShiftsAll.find(s => s.userId === targetUserId);
      if (!targetShift) return;
      const item = confirmItem.item as StaffRole | RoleTask;
      await upsertAssignment({
        shiftId: targetShift.id,
        taskId: confirmItem.itemType === "task" ? item.id : null,
        roleId: confirmItem.itemType === "role" ? item.id : (item as RoleTask).role_id || null,
        storeId: user.storeId,
        userId: targetUserId,
        scheduledDate: dateStr,
        scheduledStartTime: confirmItem.startTime,
        scheduledEndTime: confirmItem.endTime,
        source: "manual",
      });
    }
    setConfirmItem(null);
    setUserAddModal({ visible: false, startTime: "", endTime: "" });
  }, [confirmItem, user, dayShifts, dayShiftsAll, dateStr, upsertAssignment, userAddModal.userId]);

  // モーダル内の選択ユーザーのカードデータ
  const modalCardData = useMemo(() => {
    if (!userAddModal.userId) return null;
    return mobileCardData.find(c => c.uid === userAddModal.userId) ?? null;
  }, [userAddModal.userId, mobileCardData]);

  // --- レンダリング ---
  return (
    <View style={{ flex: 1, backgroundColor: cs.surface }}>
      {readOnly ? <Header title="当日スケジュール" /> : <MasterHeader title="当日スケジュール" />}

      {/* サブヘッダー */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: isMobile ? "center" : "space-between",
          alignItems: "center",
          paddingHorizontal: isMobile ? 0 : 8,
          height: SUB_HEADER_HEIGHT,
          backgroundColor: cs.surface,
          borderBottomWidth: 1,
          borderBottomColor: cs.outlineVariant,
          position: "relative",
        }}
      >
        {/* 左ゾーン: 金額/時間 + 色切替 + 時間範囲（PC のみ） */}
        {!isMobile && !readOnly ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4, flexShrink: 0, zIndex: 2 }}>
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#FFFFFF",
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 6,
                borderWidth: 1,
                borderColor: "#E0E0E0",
                minHeight: 36,
              }}
            >
              <Text style={{ fontWeight: "bold", color: "#333333", fontSize: 12 }}>
                ¥{totalAmount.toLocaleString()} / {formattedHours}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setColorMode((m) => (m === "status" ? "user" : "status"))}
              style={getButtonStyle("toolbar")}
            >
              <Ionicons
                name={colorMode === "status" ? "clipboard-outline" : "person-outline"}
                size={18}
                color="#2196F3"
                style={UnifiedButtonStyles.buttonIcon}
              />
              <Text style={getButtonTextStyle("toolbar")}>
                {colorMode === "status" ? "ステータス色" : "講師色"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={getButtonStyle("toolbar")}
              onPress={() => setHideEarlyHours(!hideEarlyHours)}
            >
              <Ionicons name="time-outline" size={18} color="#2196F3" style={UnifiedButtonStyles.buttonIcon} />
              <Text style={getButtonTextStyle("toolbar")}>
                {hideEarlyHours ? "13:00-22:00" : "9:00-22:00"}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* 中央ゾーン: 日付ナビゲーション */}
        {isMobile ? (
          <DateNavigator
            label={format(selectedDate, "yyyy年M月d日(E)", { locale: ja })}
            onPrev={handlePrevDay}
            onNext={handleNextDay}
            onLabelPress={handleToday}
            {...(!isToday ? { trailing: (
                <TouchableOpacity
                  onPress={handleToday}
                  style={{
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    backgroundColor: cs.primary,
                    borderRadius: 4,
                    marginLeft: 4,
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: "bold", color: cs.onPrimary }}>今日</Text>
                </TouchableOpacity>
            ) } : {})}
          />
        ) : (
          <View
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              alignItems: "center",
              pointerEvents: "box-none",
              zIndex: 1,
            }}
          >
            <View style={{ pointerEvents: "auto" }}>
              <DateNavigator
                label={format(selectedDate, "yyyy年M月d日(E)", { locale: ja })}
                onPrev={handlePrevDay}
                onNext={handleNextDay}
                onLabelPress={handleToday}
                {...(!isToday ? { trailing: (
                    <TouchableOpacity
                      onPress={handleToday}
                      style={{
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        backgroundColor: cs.primary,
                        borderRadius: 4,
                        marginLeft: 4,
                      }}
                    >
                      <Text style={{ fontSize: 11, fontWeight: "bold", color: cs.onPrimary }}>今日</Text>
                    </TouchableOpacity>
                ) } : {})}
              />
            </View>
          </View>
        )}

        {/* 右ゾーン: アクションボタン群（PC のみ） */}
        {!isMobile && !readOnly && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4, zIndex: 2 }}>
            {Platform.OS === "web" && (
              <PrintButton
                shifts={dayShiftsAll}
                users={usersWithShifts.map((u) => ({
                  uid: u.uid,
                  nickname: u.nickname,
                  color: u.color || "#000000",
                }))}
                selectedDate={selectedDate}
              />
            )}
            {unfilledSlots.length > 0 && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                  backgroundColor: "#FFF3E0",
                  paddingHorizontal: 8,
                  paddingVertical: 6,
                  borderRadius: 6,
                  borderWidth: 1,
                  borderColor: "#FFB74D",
                  minHeight: 36,
                }}
              >
                <Ionicons name="alert-circle" size={16} color="#F57C00" />
                <Text style={{ fontSize: 12, fontWeight: "600", color: "#E65100" }}>
                  未配置{unfilledSlots.length}件
                </Text>
              </View>
            )}
            <TouchableOpacity
              style={getButtonStyle("toolbar")}
              onPress={() => fetchForMonth(year, month + 1)}
            >
              <Ionicons name="refresh" size={18} color="#2196F3" style={UnifiedButtonStyles.buttonIcon} />
              <Text style={getButtonTextStyle("toolbar")}>更新</Text>
            </TouchableOpacity>
            <View style={{ flexDirection: "row", alignItems: "center", borderRadius: 8, borderWidth: 1, borderColor: autoAssignOn ? "#4CAF50" : cs.outlineVariant, backgroundColor: autoAssignOn ? "#4CAF5010" : undefined, overflow: "hidden" }}>
              <TouchableOpacity
                style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 6 }}
                onPress={handleAutoSchedule}
              >
                <MaterialIcons name="auto-fix-high" size={18} color={autoAssignOn ? "#4CAF50" : cs.onSurfaceVariant} style={UnifiedButtonStyles.buttonIcon} />
                <Text style={{ fontSize: 13, fontWeight: "600", color: autoAssignOn ? "#4CAF50" : cs.onSurfaceVariant }}>自動配置</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ paddingHorizontal: 6, paddingVertical: 6, borderLeftWidth: 1, borderLeftColor: autoAssignOn ? "#4CAF5040" : cs.outlineVariant }}
                onPress={toggleAutoAssign}
              >
                <MaterialIcons name={autoAssignOn ? "toggle-on" : "toggle-off"} size={22} color={autoAssignOn ? "#4CAF50" : cs.onSurfaceVariant} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* スケジュール / Todo タブ */}
      <View
        style={{
          flexDirection: "row",
          backgroundColor: cs.surfaceContainer,
          borderBottomWidth: 1,
          borderBottomColor: cs.outlineVariant,
        }}
      >
        {([
          { key: "schedule" as const, label: "スケジュール", icon: "calendar-outline" as const },
          { key: "todo" as const, label: "Todo", icon: "checkbox-outline" as const },
        ]).map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                paddingVertical: 10,
                borderBottomWidth: 3,
                borderBottomColor: isActive ? cs.primary : "transparent",
              }}
            >
              <Ionicons
                name={tab.icon}
                size={16}
                color={isActive ? cs.primary : cs.onSurfaceVariant}
              />
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: isActive ? "700" : "500",
                  color: isActive ? cs.primary : cs.onSurfaceVariant,
                }}
              >
                {tab.label}
              </Text>
              {tab.key === "todo" && todayUnreadCount > 0 && (
                <View style={{
                  minWidth: 18, height: 18, borderRadius: 9,
                  backgroundColor: "#D32F2F", justifyContent: "center", alignItems: "center",
                  paddingHorizontal: 4, marginLeft: 2,
                }}>
                  <Text style={{ fontSize: 10, fontWeight: "700", color: "#fff" }}>
                    {todayUnreadCount > 99 ? "99+" : todayUnreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {activeTab === "todo" ? (
        <DailyTodoView selectedDate={selectedDate} />
      ) : (
      <>

      {/* モバイル用ツールバー */}
      {isMobile && !readOnly && (
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingHorizontal: 8, paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: cs.outlineVariant, backgroundColor: cs.surfaceContainerLow }}>
          {unfilledSlots.length > 0 && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: "#FFF3E0", paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4, borderWidth: 1, borderColor: "#FFB74D" }}>
              <Ionicons name="alert-circle" size={12} color="#F57C00" />
              <Text style={{ fontSize: 10, fontWeight: "600", color: "#E65100" }}>未配置{unfilledSlots.length}</Text>
            </View>
          )}
          <View style={{ flexDirection: "row", alignItems: "center", borderRadius: 6, borderWidth: 1, borderColor: autoAssignOn ? "#4CAF50" : cs.outlineVariant, backgroundColor: autoAssignOn ? "#4CAF5010" : undefined, overflow: "hidden" }}>
            <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 6, paddingVertical: 3 }} onPress={handleAutoSchedule}>
              <MaterialIcons name="auto-fix-high" size={14} color={autoAssignOn ? "#4CAF50" : cs.onSurfaceVariant} />
              <Text style={{ fontSize: 10, fontWeight: "600", color: autoAssignOn ? "#4CAF50" : cs.onSurfaceVariant, marginLeft: 2 }}>自動配置</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ paddingHorizontal: 4, paddingVertical: 3, borderLeftWidth: 1, borderLeftColor: autoAssignOn ? "#4CAF5040" : cs.outlineVariant }} onPress={toggleAutoAssign}>
              <MaterialIcons name={autoAssignOn ? "toggle-on" : "toggle-off"} size={16} color={autoAssignOn ? "#4CAF50" : cs.onSurfaceVariant} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6, borderWidth: 1, borderColor: cs.outlineVariant }} onPress={() => setHideEarlyHours(!hideEarlyHours)}>
            <Text style={{ fontSize: 10, fontWeight: "600", color: cs.onSurfaceVariant }}>{hideEarlyHours ? "13-22" : "9-22"}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 未配置タスクパネル */}
      {unfilledSlots.length > 0 && (
        <View
          style={{
            backgroundColor: cs.errorContainer + "40",
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderBottomWidth: 1,
            borderBottomColor: cs.outlineVariant,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: "bold",
              color: cs.onSurface,
              marginBottom: 6,
            }}
          >
            未配置タスク
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {unfilledSlots.map((slot, idx) => (
                  <TouchableOpacity
                    key={`unfilled-${idx}`}
                    onPress={() => { setAssignModal({ visible: true, slot }); setAssignStartTime(slot.startTime); setAssignEndTime(slot.endTime); setAssignManual(false); }}
                    style={{
                      backgroundColor: slot.item.color + "30",
                      borderWidth: 1,
                      borderColor: slot.item.color,
                      borderRadius: 8,
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Text style={{ fontSize: 14 }}>{slot.item.icon}</Text>
                    <View>
                      <Text style={{ fontSize: 12, fontWeight: "bold", color: cs.onSurface }}>
                        {slot.item.name}
                      </Text>
                      <Text style={{ fontSize: 10, color: cs.onSurfaceVariant }}>
                        {slot.startTime}~{slot.endTime} (残{slot.requiredCount - slot.assignedCount}名)
                      </Text>
                    </View>
                  </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      )}


      {/* ガントチャート本体 */}
      {usersWithShifts.length === 0 ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Ionicons
            name="calendar-outline"
            size={48}
            color={cs.outlineVariant}
          />
          <Text
            style={{
              fontSize: 16,
              color: cs.onSurfaceVariant,
              marginTop: 12,
            }}
          >
            この日のシフトはありません
          </Text>
        </View>
      ) : isMobile ? (
        /* ===== モバイル カード形式レイアウト ===== */
        <ScrollView style={{ flex: 1, padding: 8 }}>
          {mobileCardData.map((card) => (
              <View
                key={card.uid}
                style={{
                  backgroundColor: cs.surface,
                  borderRadius: 12,
                  marginBottom: 10,
                  borderWidth: 1,
                  borderColor: cs.outlineVariant,
                  overflow: "hidden",
                  // @ts-ignore
                  boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                }}
              >
                {/* カードヘッダー */}
                <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 8, backgroundColor: card.barColor + "20", borderBottomWidth: 1, borderBottomColor: cs.outlineVariant }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: card.barColor, marginRight: 8 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: "bold", color: cs.onSurface }}>{card.nickname}</Text>
                  </View>
                  <Text style={{ fontSize: 11, color: cs.onSurfaceVariant }}>{card.startTime}~{card.endTime}</Text>
                  <View style={{ marginLeft: 6, backgroundColor: card.barColor + "30", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                    <Text style={{ fontSize: 10, fontWeight: "600", color: cs.onSurface }}>{card.statusLabel}</Text>
                  </View>
                </View>

                {/* タイムスロット一覧 */}
                {card.merged.map((row, idx) => {
                  const canTap = !readOnly || card.uid === user?.uid;
                  return (
                    <TouchableOpacity
                      key={idx}
                      activeOpacity={canTap ? 0.6 : 1}
                      disabled={!canTap}
                      onPress={() => {
                        if (canTap) setUserAddModal({ visible: true, startTime: row.startTime, endTime: row.endTime, userId: card.uid });
                      }}
                      style={{
                        flexDirection: "row",
                        alignItems: "stretch",
                        backgroundColor: cs.surface,
                        borderBottomWidth: idx < card.merged.length - 1 ? 0.5 : 0,
                        borderBottomColor: cs.outlineVariant + "60",
                        minHeight: 32,
                      }}
                    >
                      <View style={{ width: 4, backgroundColor: row.bgColor }} />
                      <View style={{ flex: 1, flexDirection: "row", alignItems: "center", paddingVertical: 6, paddingHorizontal: 12 }}>
                        <Text style={{ fontSize: 12, fontWeight: "bold", color: cs.onSurfaceVariant, minWidth: 90 }}>
                          {row.startTime}~{row.endTime}
                        </Text>
                        <Text style={{ fontSize: 13, color: cs.onSurface, flex: 1, marginLeft: 8, fontWeight: "600" }} numberOfLines={1}>
                          {row.label || "シフト"}
                        </Text>
                        {canTap && (
                          <Ionicons name="add-circle-outline" size={18} color={cs.primary} style={{ marginLeft: 4 }} />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
          ))}
        </ScrollView>
      ) : (
        /* ===== デスクトップ横レイアウト ===== */
        <ScrollView style={{ flex: 1 }}>
          {/* 時間ヘッダー */}
          <View style={{ flexDirection: "row" }}>
            <View
              style={{
                width: LABEL_WIDTH,
                backgroundColor: cs.surfaceContainer,
                borderBottomWidth: 1,
                borderBottomColor: cs.outlineVariant,
                borderRightWidth: 1,
                borderRightColor: cs.outlineVariant,
                justifyContent: "center",
                alignItems: "center",
                height: 28,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  color: cs.onSurfaceVariant,
                  fontWeight: "600",
                }}
              >
                スタッフ
              </Text>
            </View>
            <View style={{ flex: 1, position: "relative", height: 28, backgroundColor: cs.surfaceContainer, borderBottomWidth: 1, borderBottomColor: cs.outlineVariant }}>
              {hourLines.map(({ hour, pct }) => (
                <React.Fragment key={hour}>
                  <View style={{ position: "absolute", left: `${pct}%` as any, top: 0, bottom: 0, width: 1, backgroundColor: cs.outlineVariant, zIndex: 1 }} />
                  <View style={{ position: "absolute", left: `${pct}%` as any, marginLeft: -20, width: 40, top: 0, bottom: 0, justifyContent: "center", alignItems: "center" }}>
                    <Text style={{ fontSize: 10, color: cs.onSurfaceVariant, fontWeight: "bold" }}>{hour}:00</Text>
                  </View>
                </React.Fragment>
              ))}
            </View>
          </View>

          {/* ユーザー行 */}
          {usersWithShifts.map((u) => {
            const userShift = dayShiftsAll.find((s) => s.userId === u.uid);
            if (!userShift) return null;
            const userAssignments = dayAssignments.filter(
              (a) => a.userId === u.uid
            );
            const roleAssigns = userAssignments.filter((a) => a.roleId && !a.taskId);
            const taskAssigns = userAssignments.filter((a) => a.taskId);
            const taskRowCount = roleAssigns.length + taskAssigns.length;
            const totalHeight = ROW_HEIGHT + TASK_ROW_HEIGHT * taskRowCount;

            return (
              <View
                key={u.uid}
                style={{
                  flexDirection: "row",
                  borderBottomWidth: 1,
                  borderBottomColor: cs.outlineVariant,
                  minHeight: ROW_HEIGHT,
                }}
              >
                {/* ラベル: 名前 | 開始~終了（全行にまたがる） */}
                <View
                  style={{
                    width: LABEL_WIDTH,
                    backgroundColor: cs.surfaceContainerLow,
                    borderRightWidth: 1,
                    borderRightColor: cs.outlineVariant,
                    justifyContent: "center",
                    paddingHorizontal: 8,
                    minHeight: totalHeight,
                  }}
                >
                  <Text
                    style={{
                      fontSize: isMobile ? 12 : 14,
                      fontWeight: "bold",
                      color: cs.onSurface,
                    }}
                    numberOfLines={1}
                  >
                    {u.nickname}
                  </Text>
                  <Text
                    style={{
                      fontSize: isMobile ? 10 : 12,
                      color: cs.onSurfaceVariant,
                    }}
                  >
                    {userShift.startTime} ~ {userShift.endTime}
                  </Text>
                </View>

                {/* タイムライン列 */}
                <View style={{ flex: 1 }}>
                  {/* シフト行 */}
                  <View
                    style={{
                      height: ROW_HEIGHT,
                      position: "relative",
                    }}
                  >
                    {/* グリッド背景 */}
                    <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, flexDirection: "row" }}>
                      {timeLabels.map((time) => (
                        <View key={time} style={{ flex: 1, height: ROW_HEIGHT, backgroundColor: (() => { const mins = timeStringToMinutes(time); const ss = timeStringToMinutes(userShift.startTime); const se = timeStringToMinutes(userShift.endTime); return mins >= ss && mins < se ? cs.primaryContainer + "30" : "transparent"; })() }} />
                      ))}
                    </View>
                    {/* 1時間ごとの縦線 */}
                    {hourLines.map(({ hour, pct }) => (
                      <View key={`hline-${hour}`} style={{ position: "absolute", left: `${pct}%` as any, top: 0, bottom: 0, width: 1, backgroundColor: cs.outlineVariant, zIndex: 0 }} />
                    ))}

                    {/* シフト範囲バー + アイコン「シフト」+ 授業時間 */}
                    {(() => {
                      const leftPct = timeToPct(userShift.startTime);
                      const widthPct =
                        timeToPct(userShift.endTime) - leftPct;
                      if (widthPct <= 0) return null;
                      const barColor =
                        colorMode === "user"
                          ? (u.color || cs.primary)
                          : getGanttStatusColor(userShift.status);
                      const classes = (userShift as any).classes as
                        | Array<{ startTime: string; endTime: string; typeName?: string; typeId?: string }>
                        | undefined;
                      // シフト開始付近にクラスタイムが被っていたらその色でコントラスト判定
                      const overlappingClass = classes?.find((ct) => {
                        const ctStart = timeStringToMinutes(ct.startTime);
                        const shiftStart = timeStringToMinutes(userShift.startTime);
                        return ctStart <= shiftStart + 5;
                      });
                      let shiftLabelBg = barColor;
                      if (overlappingClass) {
                        let ot = overlappingClass.typeId ? segmentTypesMap[overlappingClass.typeId] : null;
                        if (!ot && overlappingClass.typeName) {
                          ot = Object.values(segmentTypesMap).find((t) => t.name === overlappingClass.typeName) || null;
                        }
                        shiftLabelBg = ot?.color || "#FF9800";
                      }
                      const shiftTextColor = contrastText(shiftLabelBg);

                      return (
                        <View
                          style={{
                            position: "absolute",
                            top: 2,
                            left: `${leftPct}%` as any,
                            width: `${widthPct}%` as any,
                            height: ROW_HEIGHT - 4,
                            backgroundColor: barColor + "50",
                            borderRadius: 4,
                            borderWidth: 1,
                            borderColor: barColor + "80",
                            overflow: "hidden",
                            pointerEvents: "none",
                          }}
                        >
                          {/* 左上: アイコン + シフト */}
                          <View
                            style={{
                              position: "absolute",
                              top: 1,
                              left: 3,
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 2,
                              zIndex: 2,
                            }}
                          >
                            <Ionicons name="briefcase-outline" size={10} color={shiftTextColor} />
                            <Text
                              style={{ fontSize: 9, fontWeight: "bold", color: shiftTextColor }}
                              numberOfLines={1}
                            >
                              シフト（{userShift.status === "approved" ? "承認済み" : userShift.status === "completed" ? "完了" : userShift.status === "pending" ? "申請中" : userShift.status === "rejected" ? "却下" : userShift.status}）
                            </Text>
                          </View>

                          {/* 授業時間を割り込み表示 */}
                          {classes?.map((ct, idx) => {
                            const shiftStartMin = timeStringToMinutes(userShift.startTime);
                            const shiftEndMin = timeStringToMinutes(userShift.endTime);
                            const shiftDuration = shiftEndMin - shiftStartMin;
                            if (shiftDuration <= 0) return null;

                            const ctStartMin = timeStringToMinutes(ct.startTime);
                            const ctEndMin = timeStringToMinutes(ct.endTime);
                            const ctLeftPct =
                              ((ctStartMin - shiftStartMin) / shiftDuration) * 100;
                            const ctWidthPct =
                              ((ctEndMin - ctStartMin) / shiftDuration) * 100;

                            // typeId → typeName完全一致で検索
                            let segType = ct.typeId ? segmentTypesMap[ct.typeId] : null;
                            if (!segType && ct.typeName) {
                              segType = Object.values(segmentTypesMap).find(
                                (t) => t.name === ct.typeName
                              ) || null;
                            }
                            const ctColor = segType?.color || "#FF9800";
                            const typeName = segType?.name || ct.typeName || "授業";
                            const typeIcon = segType?.icon || "";
                            const ctTextColor = contrastText(ctColor);

                            return (
                              <View
                                key={idx}
                                style={{
                                  position: "absolute",
                                  top: 0,
                                  bottom: 0,
                                  left: `${ctLeftPct}%` as any,
                                  width: `${ctWidthPct}%` as any,
                                  backgroundColor: ctColor + "CC",
                                  borderLeftWidth: 1,
                                  borderRightWidth: 1,
                                  borderColor: ctColor,
                                  justifyContent: "center",
                                  alignItems: "center",
                                }}
                              >
                                <Text
                                  style={{
                                    fontSize: 8,
                                    fontWeight: "bold",
                                    color: ctTextColor,
                                  }}
                                  numberOfLines={1}
                                >
                                  {typeIcon ? `${typeIcon} ` : ""}{typeName}
                                </Text>
                                <Text
                                  style={{ fontSize: 7, color: ctTextColor, opacity: 0.8 }}
                                  numberOfLines={1}
                                >
                                  {ct.startTime}~{ct.endTime}
                                </Text>
                              </View>
                            );
                          })}
                        </View>
                      );
                    })()}
                  </View>

                  {/* 業務行（1業務 = 1行、バー高さ70%） */}
                  {roleAssigns.map((a) => {
                    const leftPct = timeToPct(a.scheduledStartTime);
                    const widthPct =
                      timeToPct(a.scheduledEndTime) - timeToPct(a.scheduledStartTime);
                    const info = a.roleId ? rolesMap[a.roleId] : null;
                    const bgColor = info?.color || cs.secondaryContainer;
                    const icon = info?.icon || "";
                    const name = info?.name || "業務";
                    const minWidthPct = (30 / totalMinutes) * 100;
                    const txtColor = contrastText(bgColor);
                    const durMin = timeStringToMinutes(a.scheduledEndTime) - timeStringToMinutes(a.scheduledStartTime);
                    const isShort = durMin < 60;
                    return (
                      <View
                        key={a.id}
                        style={{
                          height: TASK_ROW_HEIGHT,
                          position: "relative",
                          borderTopWidth: 0.5,
                          borderTopColor: cs.outlineVariant + "60",
                        }}
                      >
                        {hourLines.map(({ hour, pct: hp }) => (
                          <View key={`rline-${hour}`} style={{ position: "absolute", left: `${hp}%` as any, top: 0, bottom: 0, width: 1, backgroundColor: cs.outlineVariant, zIndex: 0 }} />
                        ))}
                        <TouchableOpacity
                          style={{
                            position: "absolute",
                            top: 0,
                            left: `${leftPct}%` as any,
                            width: `${Math.max(widthPct, minWidthPct)}%` as any,
                            height: TASK_ROW_HEIGHT,
                            backgroundColor: bgColor,
                            borderRadius: 4,
                            flexDirection: "row",
                            alignItems: "center",
                            paddingHorizontal: 6,
                            gap: 4,
                            zIndex: 10,
                            // @ts-ignore web shadow
                            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                          }}
                          onPress={() => openEditModal(a)}
                        >
                          <Text style={{ fontSize: 14 }}>{icon}</Text>
                          {!isShort && (
                            <View style={{ flex: 1, overflow: "hidden" }}>
                              <Text style={{ fontSize: isMobile ? 10 : 12, fontWeight: "bold", color: txtColor }} numberOfLines={1}>{name}</Text>
                              <Text style={{ fontSize: 9, color: txtColor, opacity: 0.8 }} numberOfLines={1}>{a.scheduledStartTime}~{a.scheduledEndTime}</Text>
                            </View>
                          )}
                        </TouchableOpacity>
                        {isShort && (
                          <View style={{ position: "absolute", top: 0, left: `${leftPct + Math.max(widthPct, minWidthPct)}%` as any, height: TASK_ROW_HEIGHT, justifyContent: "center", paddingLeft: 4, zIndex: 11 , pointerEvents: "none" }}>
                            <Text style={{ fontSize: isMobile ? 10 : 11, fontWeight: "bold", color: cs.onSurface }} numberOfLines={1}>{name} {a.scheduledStartTime}~{a.scheduledEndTime}</Text>
                          </View>
                        )}
                      </View>
                    );
                  })}

                  {/* タスク行（1タスク = 1行、バー高さ50%） */}
                  {taskAssigns.map((a) => {
                    const leftPct = timeToPct(a.scheduledStartTime);
                    const widthPct =
                      timeToPct(a.scheduledEndTime) - timeToPct(a.scheduledStartTime);
                    const info = a.taskId ? tasksMap[a.taskId] : null;
                    const bgColor = info?.color || cs.secondaryContainer;
                    const icon = info?.icon || "";
                    const name = info?.name || "タスク";
                    const minWidthPct = (30 / totalMinutes) * 100;
                    const txtColor = contrastText(bgColor);
                    const durMin = timeStringToMinutes(a.scheduledEndTime) - timeStringToMinutes(a.scheduledStartTime);
                    const isShort = durMin < 60;
                    return (
                      <View
                        key={a.id}
                        style={{
                          height: TASK_ROW_HEIGHT,
                          position: "relative",
                          borderTopWidth: 0.5,
                          borderTopColor: cs.outlineVariant + "60",
                        }}
                      >
                        {hourLines.map(({ hour, pct: hp }) => (
                          <View key={`tline-${hour}`} style={{ position: "absolute", left: `${hp}%` as any, top: 0, bottom: 0, width: 1, backgroundColor: cs.outlineVariant, zIndex: 0 }} />
                        ))}
                        <TouchableOpacity
                          style={{
                            position: "absolute",
                            top: 0,
                            left: `${leftPct}%` as any,
                            width: `${Math.max(widthPct, minWidthPct)}%` as any,
                            height: TASK_ROW_HEIGHT,
                            backgroundColor: bgColor,
                            borderRadius: 4,
                            flexDirection: "row",
                            alignItems: "center",
                            paddingHorizontal: 6,
                            gap: 4,
                            zIndex: 10,
                            // @ts-ignore web shadow
                            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                          }}
                          onPress={() => openEditModal(a)}
                        >
                          <Text style={{ fontSize: 13 }}>{icon}</Text>
                          {!isShort && (
                            <View style={{ flex: 1, overflow: "hidden" }}>
                              <Text style={{ fontSize: isMobile ? 9 : 11, fontWeight: "bold", color: txtColor }} numberOfLines={1}>{name}</Text>
                              <Text style={{ fontSize: 8, color: txtColor, opacity: 0.8 }} numberOfLines={1}>{a.scheduledStartTime}~{a.scheduledEndTime}</Text>
                            </View>
                          )}
                        </TouchableOpacity>
                        {isShort && (
                          <View style={{ position: "absolute", top: 0, left: `${leftPct + Math.max(widthPct, minWidthPct)}%` as any, height: TASK_ROW_HEIGHT, justifyContent: "center", paddingLeft: 4, zIndex: 11 , pointerEvents: "none" }}>
                            <Text style={{ fontSize: isMobile ? 10 : 11, fontWeight: "bold", color: cs.onSurface }} numberOfLines={1}>{name} {a.scheduledStartTime}~{a.scheduledEndTime}</Text>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* タスク追加FAB (+) */}
      {(readOnly ? !!myShift : usersWithShifts.length > 0) && (
        <TouchableOpacity
          onPress={() => {
            if (readOnly && myShift) {
              setUserAddModal({ visible: true, startTime: myShift.startTime, endTime: myShift.endTime, userId: user!.uid });
            } else {
              setUserAddModal({ visible: true, startTime: "", endTime: "" });
            }
          }}
          style={{
            position: "absolute",
            right: 20,
            bottom: 20,
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: cs.primary,
            justifyContent: "center",
            alignItems: "center",
            // @ts-ignore
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            zIndex: 100,
          }}
        >
          <Ionicons name="add" size={28} color={cs.onPrimary} />
        </TouchableOpacity>
      )}

      {/* タスク追加モーダル */}
      <Modal
        visible={userAddModal.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setUserAddModal({ visible: false, startTime: "", endTime: "" })}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" }}
          activeOpacity={1}
          onPress={() => setUserAddModal({ visible: false, startTime: "", endTime: "" })}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={{
              backgroundColor: cs.surface,
              borderRadius: 16,
              padding: 16,
              width: isMobile ? "95%" : (userAddModal.userId ? 640 : 400),
              maxHeight: "85%",
              // @ts-ignore
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            }}
            onPress={() => {}}
          >
            {!userAddModal.userId ? (
              /* ===== ステップ1: スタッフ選択（マスターFABから） ===== */
              <>
                <Text style={{ fontSize: 18, fontWeight: "bold", color: cs.onSurface, marginBottom: 16 }}>
                  スタッフを選択
                </Text>
                <ScrollView style={{ maxHeight: 400 }}>
                  {usersWithShifts.map((u) => {
                    const shift = dayShiftsAll.find(s => s.userId === u.uid);
                    if (!shift) return null;
                    return (
                      <TouchableOpacity
                        key={u.uid}
                        onPress={() => { setUserAddModal(prev => ({ ...prev, userId: u.uid, startTime: shift.startTime, endTime: shift.endTime })); setAddModalTab(0); }}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 12,
                          paddingVertical: 10,
                          paddingHorizontal: 8,
                          borderBottomWidth: 1,
                          borderBottomColor: cs.outlineVariant + "40",
                        }}
                      >
                        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: u.color || cs.primary, justifyContent: "center", alignItems: "center" }}>
                          <Text style={{ fontSize: 16, fontWeight: "bold", color: "#fff" }}>{(u.nickname || "?").slice(0, 1)}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 15, fontWeight: "600", color: cs.onSurface }}>{u.nickname}</Text>
                          <Text style={{ fontSize: 12, color: cs.onSurfaceVariant }}>{shift.startTime}~{shift.endTime}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={cs.onSurfaceVariant} />
                      </TouchableOpacity>
                    );
                  })}
                  {usersWithShifts.length === 0 && (
                    <Text style={{ fontSize: 14, color: cs.onSurfaceVariant, textAlign: "center", paddingVertical: 20 }}>
                      この日にシフトがあるスタッフがいません
                    </Text>
                  )}
                </ScrollView>
                <TouchableOpacity
                  onPress={() => setUserAddModal({ visible: false, startTime: "", endTime: "" })}
                  style={{ marginTop: 16, alignSelf: "center", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 }}
                >
                  <Text style={{ fontSize: 14, color: cs.onSurfaceVariant }}>閉じる</Text>
                </TouchableOpacity>
              </>
            ) : (
              /* ===== ステップ2: 3:7分割レイアウト ===== */
              <>
                {/* ヘッダー */}
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                  {!readOnly && (
                    <TouchableOpacity
                      onPress={() => setUserAddModal({ visible: true, startTime: "", endTime: "" })}
                      style={{ marginRight: 8 }}
                    >
                      <Ionicons name="arrow-back" size={20} color={cs.onSurfaceVariant} />
                    </TouchableOpacity>
                  )}
                  {(() => {
                    const targetUser = users.find(u => u.uid === userAddModal.userId);
                    return targetUser ? (
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flex: 1 }}>
                        <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: targetUser.color || cs.primary, justifyContent: "center", alignItems: "center" }}>
                          <Text style={{ fontSize: 10, fontWeight: "bold", color: "#fff" }}>{(targetUser.nickname || "?").slice(0, 1)}</Text>
                        </View>
                        <Text style={{ fontSize: 15, fontWeight: "bold", color: cs.onSurface }}>{targetUser.nickname}</Text>
                      </View>
                    ) : null;
                  })()}
                  <TouchableOpacity onPress={() => setUserAddModal({ visible: false, startTime: "", endTime: "" })}>
                    <Ionicons name="close" size={20} color={cs.onSurfaceVariant} />
                  </TouchableOpacity>
                </View>

                {/* 3:7 分割 */}
                <View style={{ flexDirection: "row", flex: 1, minHeight: 300 }}>
                  {/* ===== 左 50%: スケジュール常時表示 ===== */}
                  <View style={{ flex: 1, borderRightWidth: 1, borderRightColor: cs.outlineVariant, paddingRight: 10, marginRight: 10 }}>
                    <Text style={{ fontSize: 11, fontWeight: "600", color: cs.onSurfaceVariant, marginBottom: 6 }}>スケジュール</Text>
                    <ScrollView showsVerticalScrollIndicator={false}>
                      {modalCardData ? (
                        <View style={{ borderRadius: 8, borderWidth: 1, borderColor: cs.outlineVariant, overflow: "hidden" }}>
                          {/* カードヘッダー */}
                          <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 6, paddingVertical: 4, backgroundColor: modalCardData.barColor + "20", borderBottomWidth: 1, borderBottomColor: cs.outlineVariant }}>
                            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: modalCardData.barColor, marginRight: 4 }} />
                            <Text style={{ fontSize: 10, fontWeight: "bold", color: cs.onSurface, flex: 1 }} numberOfLines={1}>{modalCardData.nickname}</Text>
                            <Text style={{ fontSize: 9, color: cs.onSurfaceVariant }}>{modalCardData.startTime}~{modalCardData.endTime}</Text>
                          </View>
                          {/* タイムスロット */}
                          {modalCardData.merged.map((row, idx) => (
                            <View
                              key={idx}
                              style={{
                                flexDirection: "row",
                                alignItems: "stretch",
                                backgroundColor: cs.surface,
                                borderBottomWidth: idx < modalCardData.merged.length - 1 ? 0.5 : 0,
                                borderBottomColor: cs.outlineVariant + "60",
                                minHeight: 26,
                              }}
                            >
                              <View style={{ width: 3, backgroundColor: row.bgColor }} />
                              <View style={{ flex: 1, paddingVertical: 4, paddingHorizontal: 6 }}>
                                <Text style={{ fontSize: 10, fontWeight: "bold", color: cs.onSurfaceVariant }}>
                                  {row.startTime}~{row.endTime}
                                </Text>
                                <Text style={{ fontSize: 10, color: cs.onSurface, fontWeight: "600" }} numberOfLines={1}>
                                  {row.label || "シフト"}
                                </Text>
                              </View>
                            </View>
                          ))}
                        </View>
                      ) : (
                        <Text style={{ fontSize: 11, color: cs.onSurfaceVariant, textAlign: "center", paddingVertical: 16 }}>
                          データなし
                        </Text>
                      )}
                    </ScrollView>
                  </View>

                  {/* ===== 右 50%: 業務・タスク / タイプ ===== */}
                  <View style={{ flex: 1 }}>
                    {/* タブバー */}
                    <View style={{ flexDirection: "row", borderBottomWidth: 1, borderBottomColor: cs.outlineVariant, marginBottom: 10 }}>
                      {([
                        { idx: 0 as const, label: "業務・タスク", icon: "briefcase-outline" as const },
                        { idx: 1 as const, label: "タイプ", icon: "time-outline" as const },
                      ]).map((tab) => (
                        <TouchableOpacity
                          key={tab.idx}
                          onPress={() => setAddModalTab(tab.idx)}
                          style={{
                            flex: 1,
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 4,
                            paddingVertical: 6,
                            borderBottomWidth: 2,
                            borderBottomColor: addModalTab === tab.idx ? cs.primary : "transparent",
                          }}
                        >
                          <Ionicons name={tab.icon} size={14} color={addModalTab === tab.idx ? cs.primary : cs.onSurfaceVariant} />
                          <Text style={{ fontSize: 11, fontWeight: "600", color: addModalTab === tab.idx ? cs.primary : cs.onSurfaceVariant }}>
                            {tab.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    {/* 時間設定（共通） */}
                    <View style={{ flexDirection: "row", gap: 6, marginBottom: 10 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 10, color: cs.onSurfaceVariant, marginBottom: 2 }}>開始</Text>
                        <TextInput
                          value={userAddModal.startTime}
                          onChangeText={(t) => setUserAddModal(prev => ({ ...prev, startTime: t }))}
                          style={{ borderWidth: 1, borderColor: cs.outline, borderRadius: 6, padding: 8, fontSize: 13, color: cs.onSurface }}
                          placeholder="09:00"
                          placeholderTextColor={cs.onSurfaceVariant}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 10, color: cs.onSurfaceVariant, marginBottom: 2 }}>終了</Text>
                        <TextInput
                          value={userAddModal.endTime}
                          onChangeText={(t) => setUserAddModal(prev => ({ ...prev, endTime: t }))}
                          style={{ borderWidth: 1, borderColor: cs.outline, borderRadius: 6, padding: 8, fontSize: 13, color: cs.onSurface }}
                          placeholder="10:00"
                          placeholderTextColor={cs.onSurfaceVariant}
                        />
                      </View>
                    </View>

                    {/* タブ0: 業務・タスク */}
                    {addModalTab === 0 && (
                      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                        {roles.length > 0 && (
                          <>
                            <Text style={{ fontSize: 11, fontWeight: "600", color: cs.primary, marginBottom: 4 }}>業務</Text>
                            {roles.map((role) => (
                              <TouchableOpacity
                                key={role.id}
                                onPress={() => openConfirm(role, "role")}
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                  gap: 8,
                                  paddingVertical: 8,
                                  paddingHorizontal: 6,
                                  borderBottomWidth: 1,
                                  borderBottomColor: cs.outlineVariant + "40",
                                }}
                              >
                                <View style={{ width: 32, height: 32, borderRadius: 6, backgroundColor: role.color + "30", justifyContent: "center", alignItems: "center" }}>
                                  <Text style={{ fontSize: 14 }}>{role.icon}</Text>
                                </View>
                                <Text style={{ flex: 1, fontSize: 14, fontWeight: "600", color: cs.onSurface }}>{role.name}</Text>
                                <Ionicons name="add-circle-outline" size={20} color={cs.primary} />
                              </TouchableOpacity>
                            ))}
                          </>
                        )}
                        {tasks.length > 0 && (
                          <>
                            <Text style={{ fontSize: 11, fontWeight: "600", color: cs.tertiary, marginTop: 10, marginBottom: 4 }}>タスク</Text>
                            {tasks.map((task) => (
                              <TouchableOpacity
                                key={task.id}
                                onPress={() => openConfirm(task, "task")}
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                  gap: 8,
                                  paddingVertical: 8,
                                  paddingHorizontal: 6,
                                  borderBottomWidth: 1,
                                  borderBottomColor: cs.outlineVariant + "40",
                                }}
                              >
                                <View style={{ width: 32, height: 32, borderRadius: 6, backgroundColor: task.color + "30", justifyContent: "center", alignItems: "center" }}>
                                  <Text style={{ fontSize: 14 }}>{task.icon}</Text>
                                </View>
                                <Text style={{ flex: 1, fontSize: 14, fontWeight: "600", color: cs.onSurface }}>{task.name}</Text>
                                <Ionicons name="add-circle-outline" size={20} color={cs.tertiary} />
                              </TouchableOpacity>
                            ))}
                          </>
                        )}
                        {roles.length === 0 && tasks.length === 0 && (
                          <Text style={{ fontSize: 13, color: cs.onSurfaceVariant, textAlign: "center", paddingVertical: 20 }}>
                            登録されている業務・タスクがありません
                          </Text>
                        )}
                      </ScrollView>
                    )}

                    {/* タブ1: タイプ（途中時間） */}
                    {addModalTab === 1 && (
                      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                        {segmentTypes.length > 0 ? (
                          segmentTypes.map((st) => (
                            <TouchableOpacity
                              key={st.id}
                              onPress={() => openConfirm({ id: st.id, name: st.name, icon: st.icon, color: st.color }, "type")}
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 8,
                                paddingVertical: 8,
                                paddingHorizontal: 6,
                                borderBottomWidth: 1,
                                borderBottomColor: cs.outlineVariant + "40",
                              }}
                            >
                              <View style={{ width: 32, height: 32, borderRadius: 6, backgroundColor: st.color + "30", justifyContent: "center", alignItems: "center" }}>
                                <Text style={{ fontSize: 14 }}>{st.icon}</Text>
                              </View>
                              <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 14, fontWeight: "600", color: cs.onSurface }}>{st.name}</Text>
                                <Text style={{ fontSize: 10, color: cs.onSurfaceVariant }}>
                                  {st.allowTaskOverlap ? "タスク重複可" : "タスク重複不可"}
                                </Text>
                              </View>
                              <Ionicons name="add-circle-outline" size={20} color={st.color} />
                            </TouchableOpacity>
                          ))
                        ) : (
                          <Text style={{ fontSize: 13, color: cs.onSurfaceVariant, textAlign: "center", paddingVertical: 20 }}>
                            登録されているタイプがありません
                          </Text>
                        )}
                      </ScrollView>
                    )}
                  </View>
                </View>
              </>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* 追加確認モーダル */}
      <Modal
        visible={!!confirmItem}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmItem(null)}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" }}
          activeOpacity={1}
          onPress={() => setConfirmItem(null)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={{
              backgroundColor: cs.surface,
              borderRadius: 16,
              padding: 20,
              width: isMobile ? "95%" : 600,
              // @ts-ignore
              boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
            }}
            onPress={() => {}}
          >
            {confirmItem && (() => {
              const typeLabel = confirmItem.itemType === "role" ? "業務" : confirmItem.itemType === "task" ? "タスク" : "タイプ";
              const itemColor = (confirmItem.item as any).color || cs.primary;
              return (
                <>
                  <Text style={{ fontSize: 16, fontWeight: "bold", color: cs.onSurface, marginBottom: 12 }}>
                    {typeLabel}を追加
                  </Text>

                  <View style={{ flexDirection: "row", minHeight: 200 }}>
                    {/* 左: スケジュール */}
                    <View style={{ flex: 1, borderRightWidth: 1, borderRightColor: cs.outlineVariant, paddingRight: 10, marginRight: 10 }}>
                      <Text style={{ fontSize: 11, fontWeight: "600", color: cs.onSurfaceVariant, marginBottom: 6 }}>スケジュール</Text>
                      <ScrollView showsVerticalScrollIndicator={false}>
                        {modalCardData ? (
                          <View style={{ borderRadius: 8, borderWidth: 1, borderColor: cs.outlineVariant, overflow: "hidden" }}>
                            <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 6, paddingVertical: 4, backgroundColor: modalCardData.barColor + "20", borderBottomWidth: 1, borderBottomColor: cs.outlineVariant }}>
                              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: modalCardData.barColor, marginRight: 4 }} />
                              <Text style={{ fontSize: 10, fontWeight: "bold", color: cs.onSurface, flex: 1 }} numberOfLines={1}>{modalCardData.nickname}</Text>
                              <Text style={{ fontSize: 9, color: cs.onSurfaceVariant }}>{modalCardData.startTime}~{modalCardData.endTime}</Text>
                            </View>
                            {modalCardData.merged.map((row, idx) => (
                              <View
                                key={idx}
                                style={{
                                  flexDirection: "row",
                                  alignItems: "stretch",
                                  backgroundColor: cs.surface,
                                  borderBottomWidth: idx < modalCardData.merged.length - 1 ? 0.5 : 0,
                                  borderBottomColor: cs.outlineVariant + "60",
                                  minHeight: 26,
                                }}
                              >
                                <View style={{ width: 3, backgroundColor: row.bgColor }} />
                                <View style={{ flex: 1, paddingVertical: 4, paddingHorizontal: 6 }}>
                                  <Text style={{ fontSize: 10, fontWeight: "bold", color: cs.onSurfaceVariant }}>
                                    {row.startTime}~{row.endTime}
                                  </Text>
                                  <Text style={{ fontSize: 10, color: cs.onSurface, fontWeight: "600" }} numberOfLines={1}>
                                    {row.label || "シフト"}
                                  </Text>
                                </View>
                              </View>
                            ))}
                          </View>
                        ) : (
                          <Text style={{ fontSize: 11, color: cs.onSurfaceVariant, textAlign: "center", paddingVertical: 16 }}>データなし</Text>
                        )}
                      </ScrollView>
                    </View>

                    {/* 右: 確認内容 */}
                    <View style={{ flex: 1 }}>
                      {/* 選択アイテム情報 */}
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, padding: 10, backgroundColor: itemColor + "15", borderRadius: 10, borderWidth: 1, borderColor: itemColor + "40", marginBottom: 14 }}>
                        <View style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: itemColor + "30", justifyContent: "center", alignItems: "center" }}>
                          <Text style={{ fontSize: 16 }}>{(confirmItem.item as any).icon || "📋"}</Text>
                        </View>
                        <Text style={{ flex: 1, fontSize: 15, fontWeight: "bold", color: cs.onSurface }}>{confirmItem.item.name}</Text>
                      </View>

                      {/* 時間設定 */}
                      <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 11, color: cs.onSurfaceVariant, marginBottom: 3 }}>開始時間</Text>
                          <TextInput
                            value={confirmItem.startTime}
                            onChangeText={(t) => setConfirmItem(prev => prev ? { ...prev, startTime: t } : null)}
                            style={{ borderWidth: 1, borderColor: cs.outline, borderRadius: 8, padding: 10, fontSize: 15, color: cs.onSurface, fontWeight: "600" }}
                            placeholder="09:00"
                            placeholderTextColor={cs.onSurfaceVariant}
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 11, color: cs.onSurfaceVariant, marginBottom: 3 }}>終了時間</Text>
                          <TextInput
                            value={confirmItem.endTime}
                            onChangeText={(t) => setConfirmItem(prev => prev ? { ...prev, endTime: t } : null)}
                            style={{ borderWidth: 1, borderColor: cs.outline, borderRadius: 8, padding: 10, fontSize: 15, color: cs.onSurface, fontWeight: "600" }}
                            placeholder="10:00"
                            placeholderTextColor={cs.onSurfaceVariant}
                          />
                        </View>
                      </View>

                      {/* ボタン */}
                      <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 8 }}>
                        <TouchableOpacity
                          onPress={() => setConfirmItem(null)}
                          style={{ paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8 }}
                        >
                          <Text style={{ fontSize: 14, color: cs.onSurfaceVariant }}>キャンセル</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={handleConfirmSave}
                          style={{ paddingHorizontal: 20, paddingVertical: 10, backgroundColor: cs.primary, borderRadius: 8 }}
                        >
                          <Text style={{ fontSize: 14, fontWeight: "600", color: cs.onPrimary }}>追加</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </>
              );
            })()}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* 編集モーダル群（readOnlyでは非表示） */}
      {!readOnly && <>
      <Modal
        visible={editModal.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditModal({ visible: false })}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "center",
            alignItems: "center",
          }}
          activeOpacity={1}
          onPress={() => setEditModal({ visible: false })}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={{
              backgroundColor: cs.surface,
              borderRadius: 16,
              padding: 24,
              width: isMobile ? "90%" : 360,
              // @ts-ignore web shadow
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            }}
            onPress={() => {}}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: cs.onSurface,
                marginBottom: 16,
              }}
            >
              {editModal.assignment ? "タスク時間編集" : "タスク配置"}
            </Text>

            {/* タスク情報 */}
            {(() => {
              const info = editModal.assignment
                ? editModal.assignment.taskId
                  ? tasksMap[editModal.assignment.taskId]
                  : editModal.assignment.roleId
                    ? rolesMap[editModal.assignment.roleId]
                    : null
                : null;
              const name = info?.name || editModal.newSlot?.taskName || "タスク";
              const icon = info?.icon || editModal.newSlot?.taskIcon || "";
              return (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16, padding: 10, backgroundColor: cs.surfaceContainerLow, borderRadius: 8 }}>
                  <Text style={{ fontSize: 20 }}>{icon}</Text>
                  <Text style={{ flex: 1, fontSize: 16, fontWeight: "600", color: cs.onSurface }}>{name}</Text>
                </View>
              );
            })()}

            {/* 開始時間 | 終了時間 | 手動切替 */}
            <View style={{ flexDirection: "row", gap: 8, alignItems: "flex-end", marginBottom: 4, zIndex: 10 }}>
              {/* 開始時間 */}
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, color: cs.onSurfaceVariant, marginBottom: 4 }}>開始時間</Text>
                {editManual ? (
                  <TextInput value={editStartTime} onChangeText={setEditStartTime} style={{ borderWidth: 1, borderColor: cs.outline, borderRadius: 8, padding: 10, fontSize: 14, color: cs.onSurface }} placeholder="09:00" placeholderTextColor={cs.onSurfaceVariant} />
                ) : (
                  <TouchableOpacity
                    onPress={() => setOpenDropdown(openDropdown === "editStart" ? null : "editStart")}
                    style={{ borderWidth: 1, borderColor: openDropdown === "editStart" ? cs.primary : cs.outline, borderRadius: 8, padding: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
                  >
                    <Text style={{ fontSize: 14, color: cs.onSurface }}>{editStartTime || "--:--"}</Text>
                    <Ionicons name={openDropdown === "editStart" ? "chevron-up" : "chevron-down"} size={16} color={cs.onSurfaceVariant} />
                  </TouchableOpacity>
                )}
              </View>
              {/* 終了時間 */}
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, color: cs.onSurfaceVariant, marginBottom: 4 }}>終了時間</Text>
                {editManual ? (
                  <TextInput value={editEndTime} onChangeText={setEditEndTime} style={{ borderWidth: 1, borderColor: cs.outline, borderRadius: 8, padding: 10, fontSize: 14, color: cs.onSurface }} placeholder="10:00" placeholderTextColor={cs.onSurfaceVariant} />
                ) : (
                  <TouchableOpacity
                    onPress={() => setOpenDropdown(openDropdown === "editEnd" ? null : "editEnd")}
                    style={{ borderWidth: 1, borderColor: openDropdown === "editEnd" ? cs.primary : cs.outline, borderRadius: 8, padding: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
                  >
                    <Text style={{ fontSize: 14, color: cs.onSurface }}>{editEndTime || "--:--"}</Text>
                    <Ionicons name={openDropdown === "editEnd" ? "chevron-up" : "chevron-down"} size={16} color={cs.onSurfaceVariant} />
                  </TouchableOpacity>
                )}
              </View>
              {/* 手動切替 */}
              <TouchableOpacity
                onPress={() => { setEditManual(!editManual); setOpenDropdown(null); }}
                style={{ paddingHorizontal: 10, paddingVertical: 11, borderRadius: 8, backgroundColor: editManual ? cs.primary : cs.surfaceContainer, borderWidth: 1, borderColor: cs.outline }}
              >
                <Text style={{ fontSize: 12, fontWeight: "600", color: editManual ? cs.onPrimary : cs.onSurfaceVariant }}>
                  {editManual ? "リスト" : "手動"}
                </Text>
              </TouchableOpacity>
            </View>
            {/* プルダウンリスト */}
            {(openDropdown === "editStart" || openDropdown === "editEnd") && (
              <View style={{ borderWidth: 1, borderColor: cs.outlineVariant, borderRadius: 8, backgroundColor: cs.surface, maxHeight: 200, marginBottom: 8, overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" } as any}>
                <ScrollView nestedScrollEnabled>
                  {timeOptions.map((t) => {
                    const isActive = t === (openDropdown === "editStart" ? editStartTime : editEndTime);
                    return (
                      <TouchableOpacity
                        key={t}
                        onPress={() => {
                          if (openDropdown === "editStart") setEditStartTime(t);
                          else setEditEndTime(t);
                          setOpenDropdown(null);
                        }}
                        style={{ paddingHorizontal: 14, paddingVertical: 10, backgroundColor: isActive ? cs.primaryContainer : "transparent", borderBottomWidth: 1, borderBottomColor: cs.outlineVariant + "40" }}
                      >
                        <Text style={{ fontSize: 14, fontWeight: isActive ? "bold" : "normal", color: isActive ? cs.onPrimaryContainer : cs.onSurface }}>{t}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* ボタン */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                gap: 8,
                marginTop: 20,
              }}
            >
              {editModal.assignment && (
                <TouchableOpacity
                  onPress={handleDeleteAssignment}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    backgroundColor: cs.errorContainer,
                    borderRadius: 8,
                    marginRight: "auto",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: cs.onErrorContainer,
                    }}
                  >
                    未配置に戻す
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => setEditModal({ visible: false })}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    color: cs.onSurfaceVariant,
                  }}
                >
                  キャンセル
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveEdit}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  backgroundColor: cs.primary,
                  borderRadius: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: cs.onPrimary,
                  }}
                >
                  保存
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* 割り当てモーダル */}
      <Modal
        visible={assignModal.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setAssignModal({ visible: false })}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" }}
          activeOpacity={1}
          onPress={() => setAssignModal({ visible: false })}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={{ backgroundColor: cs.surface, borderRadius: 16, padding: 24, width: isMobile ? "90%" : 360, maxHeight: "80%", boxShadow: "0 8px 32px rgba(0,0,0,0.3)" } as any}
            onPress={() => {}}
          >
            {assignModal.slot && (() => {
              const slot = assignModal.slot;
              const duration = timeStringToMinutes(slot.endTime) - timeStringToMinutes(slot.startTime);
              const curStartMin = timeStringToMinutes(assignStartTime);
              const curEndMin = timeStringToMinutes(assignEndTime);
              // 出勤中でスロット時間帯に勤務しており、ブロック時間帯と重複しないユーザー
              const matchingShifts = dayShifts.filter((s) => {
                const ss = timeStringToMinutes(s.startTime);
                const se = timeStringToMinutes(s.endTime);
                if (curStartMin < ss || curEndMin > se) return false;
                if (conflictsWithBlockedSegments(s as any, curStartMin, curEndMin, segmentTypesMap)) return false;
                return true;
              });
              // 当日出勤だがこの時間帯には入っていないユーザー
              const matchingIds = new Set(matchingShifts.map((s) => s.userId));
              const otherShifts = dayShifts.filter((s) => !matchingIds.has(s.userId));
              const alreadyAssigned = dayAssignments.filter((a) =>
                curStartMin < timeStringToMinutes(a.scheduledEndTime) && curEndMin > timeStringToMinutes(a.scheduledStartTime)
              ).map((a) => a.userId);
              const handlePickStart = (t: string) => {
                setAssignStartTime(t);
                // 終了時間 = 開始 + 元のduration
                const endMin = timeStringToMinutes(t) + duration;
                const eh = String(Math.floor(endMin / 60)).padStart(2, "0");
                const em = String(endMin % 60).padStart(2, "0");
                setAssignEndTime(`${eh}:${em}`);
              };

              return (
                <>
                  <Text style={{ fontSize: 18, fontWeight: "bold", color: cs.onSurface, marginBottom: 12 }}>
                    割り当て先を選択
                  </Text>
                  {/* タスク情報 */}
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12, padding: 10, backgroundColor: cs.surfaceContainerLow, borderRadius: 8 }}>
                    <Text style={{ fontSize: 20 }}>{slot.item.icon}</Text>
                    <Text style={{ flex: 1, fontSize: 16, fontWeight: "600", color: cs.onSurface }}>{slot.item.name}</Text>
                  </View>

                  {/* 開始時間 | 終了時間 | 手動切替 */}
                  <View style={{ flexDirection: "row", gap: 8, alignItems: "flex-end", marginBottom: 4, zIndex: 10 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 12, color: cs.onSurfaceVariant, marginBottom: 4 }}>開始時間</Text>
                      {assignManual ? (
                        <TextInput value={assignStartTime} onChangeText={(t) => handlePickStart(t)} style={{ borderWidth: 1, borderColor: cs.outline, borderRadius: 8, padding: 10, fontSize: 14, color: cs.onSurface }} placeholder="09:00" placeholderTextColor={cs.onSurfaceVariant} />
                      ) : (
                        <TouchableOpacity
                          onPress={() => setOpenDropdown(openDropdown === "assignStart" ? null : "assignStart")}
                          style={{ borderWidth: 1, borderColor: openDropdown === "assignStart" ? cs.primary : cs.outline, borderRadius: 8, padding: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
                        >
                          <Text style={{ fontSize: 14, color: cs.onSurface }}>{assignStartTime || "--:--"}</Text>
                          <Ionicons name={openDropdown === "assignStart" ? "chevron-up" : "chevron-down"} size={16} color={cs.onSurfaceVariant} />
                        </TouchableOpacity>
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 12, color: cs.onSurfaceVariant, marginBottom: 4 }}>終了時間</Text>
                      {assignManual ? (
                        <TextInput value={assignEndTime} onChangeText={setAssignEndTime} style={{ borderWidth: 1, borderColor: cs.outline, borderRadius: 8, padding: 10, fontSize: 14, color: cs.onSurface }} placeholder="10:00" placeholderTextColor={cs.onSurfaceVariant} />
                      ) : (
                        <TouchableOpacity
                          onPress={() => setOpenDropdown(openDropdown === "assignEnd" ? null : "assignEnd")}
                          style={{ borderWidth: 1, borderColor: openDropdown === "assignEnd" ? cs.primary : cs.outline, borderRadius: 8, padding: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
                        >
                          <Text style={{ fontSize: 14, color: cs.onSurface }}>{assignEndTime || "--:--"}</Text>
                          <Ionicons name={openDropdown === "assignEnd" ? "chevron-up" : "chevron-down"} size={16} color={cs.onSurfaceVariant} />
                        </TouchableOpacity>
                      )}
                    </View>
                    <TouchableOpacity
                      onPress={() => { setAssignManual(!assignManual); setOpenDropdown(null); }}
                      style={{ paddingHorizontal: 10, paddingVertical: 11, borderRadius: 8, backgroundColor: assignManual ? cs.primary : cs.surfaceContainer, borderWidth: 1, borderColor: cs.outline }}
                    >
                      <Text style={{ fontSize: 12, fontWeight: "600", color: assignManual ? cs.onPrimary : cs.onSurfaceVariant }}>
                        {assignManual ? "リスト" : "手動"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {/* プルダウンリスト */}
                  {(openDropdown === "assignStart" || openDropdown === "assignEnd") && (
                    <View style={{ borderWidth: 1, borderColor: cs.outlineVariant, borderRadius: 8, backgroundColor: cs.surface, maxHeight: 200, marginBottom: 8, overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" } as any}>
                      <ScrollView nestedScrollEnabled>
                        {timeOptions.map((t) => {
                          const isActive = t === (openDropdown === "assignStart" ? assignStartTime : assignEndTime);
                          return (
                            <TouchableOpacity
                              key={t}
                              onPress={() => {
                                if (openDropdown === "assignStart") handlePickStart(t);
                                else setAssignEndTime(t);
                                setOpenDropdown(null);
                              }}
                              style={{ paddingHorizontal: 14, paddingVertical: 10, backgroundColor: isActive ? cs.primaryContainer : "transparent", borderBottomWidth: 1, borderBottomColor: cs.outlineVariant + "40" }}
                            >
                              <Text style={{ fontSize: 14, fontWeight: isActive ? "bold" : "normal", color: isActive ? cs.onPrimaryContainer : cs.onSurface }}>{t}</Text>
                            </TouchableOpacity>
                          );
                        })}
                      </ScrollView>
                    </View>
                  )}

                  {/* スタッフ一覧 */}
                  <ScrollView style={{ maxHeight: 300 }}>
                    {matchingShifts.length > 0 && (
                      <>
                        <Text style={{ fontSize: 12, fontWeight: "600", color: cs.primary, marginBottom: 4, marginTop: 4 }}>
                          この時間帯に出勤中
                        </Text>
                        {matchingShifts.map((shift) => {
                          const u = users.find((x) => x.uid === shift.userId);
                          const isBusy = alreadyAssigned.includes(shift.userId);
                          return (
                            <TouchableOpacity
                              key={shift.userId}
                              onPress={() => !isBusy && handleAssignSlotToUser(shift.userId)}
                              disabled={isBusy}
                              style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: cs.outlineVariant + "40", opacity: isBusy ? 0.4 : 1 }}
                            >
                              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: u?.color || cs.primary, justifyContent: "center", alignItems: "center" }}>
                                <Text style={{ fontSize: 14, fontWeight: "bold", color: "#fff" }}>{(u?.nickname || "?").slice(0, 1)}</Text>
                              </View>
                              <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 15, fontWeight: "600", color: cs.onSurface }}>{u?.nickname || "?"}</Text>
                                <Text style={{ fontSize: 12, color: cs.onSurfaceVariant }}>{shift.startTime}~{shift.endTime}</Text>
                              </View>
                              {isBusy && <Text style={{ fontSize: 11, color: cs.error }}>他タスク中</Text>}
                            </TouchableOpacity>
                          );
                        })}
                      </>
                    )}
                    {otherShifts.length > 0 && (
                      <>
                        <Text style={{ fontSize: 12, fontWeight: "600", color: cs.onSurfaceVariant, marginBottom: 4, marginTop: 12 }}>
                          他の時間帯に出勤中（時間変更で割り当て可）
                        </Text>
                        {otherShifts.map((shift) => {
                          const u = users.find((x) => x.uid === shift.userId);
                          return (
                            <TouchableOpacity
                              key={shift.userId}
                              onPress={() => {
                                const endMin = timeStringToMinutes(shift.startTime) + duration;
                                const clamp = Math.min(endMin, timeStringToMinutes(shift.endTime));
                                setUserModalStartTime(shift.startTime);
                                setUserModalEndTime(`${String(Math.floor(clamp / 60)).padStart(2, "0")}:${String(clamp % 60).padStart(2, "0")}`);
                                setOpenDropdown(null);
                                setAssignUserModal({ visible: true, userId: shift.userId, shiftStart: shift.startTime, shiftEnd: shift.endTime });
                              }}
                              style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: cs.outlineVariant + "40" }}
                            >
                              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: (u?.color || cs.tertiary) + "80", justifyContent: "center", alignItems: "center", borderWidth: 1, borderStyle: "dashed" as any, borderColor: cs.outline }}>
                                <Text style={{ fontSize: 14, fontWeight: "bold", color: cs.onSurface }}>{(u?.nickname || "?").slice(0, 1)}</Text>
                              </View>
                              <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 15, fontWeight: "600", color: cs.onSurface }}>{u?.nickname || "?"}</Text>
                                <Text style={{ fontSize: 12, color: cs.onSurfaceVariant }}>{shift.startTime}~{shift.endTime}</Text>
                              </View>
                              <Text style={{ fontSize: 11, color: cs.onSurfaceVariant }}>時間外</Text>
                            </TouchableOpacity>
                          );
                        })}
                      </>
                    )}
                    {matchingShifts.length === 0 && otherShifts.length === 0 && (
                      <Text style={{ fontSize: 14, color: cs.onSurfaceVariant, textAlign: "center", paddingVertical: 20 }}>
                        この日に出勤中のスタッフがいません
                      </Text>
                    )}
                  </ScrollView>
                  <TouchableOpacity
                    onPress={() => setAssignModal({ visible: false })}
                    style={{ marginTop: 16, alignSelf: "center", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 }}
                  >
                    <Text style={{ fontSize: 14, color: cs.onSurfaceVariant }}>キャンセル</Text>
                  </TouchableOpacity>
                </>
              );
            })()}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* 時間外スタッフ割り当てモーダル */}
      <Modal
        visible={assignUserModal.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setAssignUserModal({ visible: false })}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" }}
          activeOpacity={1}
          onPress={() => setAssignUserModal({ visible: false })}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={{ backgroundColor: cs.surface, borderRadius: 16, padding: 24, width: isMobile ? "90%" : 400, maxHeight: "80%", boxShadow: "0 8px 32px rgba(0,0,0,0.3)" } as any}
            onPress={() => {}}
          >
            {assignUserModal.userId && (() => {
              const u = users.find((x) => x.uid === assignUserModal.userId);
              const shift = dayShifts.find((s) => s.userId === assignUserModal.userId);
              const userAssigns = dayAssignments.filter((a) => a.userId === assignUserModal.userId);
              const shiftStart = assignUserModal.shiftStart || "";
              const shiftEnd = assignUserModal.shiftEnd || "";
              // このスタッフのシフト範囲内の時間オプション
              const userTimeOpts = timeOptions.filter((t) => {
                const m = timeStringToMinutes(t);
                return m >= timeStringToMinutes(shiftStart) && m <= timeStringToMinutes(shiftEnd);
              });

              return (
                <>
                  {/* ヘッダー */}
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 }}>
                    <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: u?.color || cs.primary, justifyContent: "center", alignItems: "center" }}>
                      <Text style={{ fontSize: 18, fontWeight: "bold", color: "#fff" }}>{(u?.nickname || "?").slice(0, 1)}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 18, fontWeight: "bold", color: cs.onSurface }}>{u?.nickname || "?"}</Text>
                      <Text style={{ fontSize: 13, color: cs.onSurfaceVariant }}>シフト: {shiftStart}~{shiftEnd}</Text>
                    </View>
                  </View>

                  {/* 時間設定 */}
                  <View style={{ flexDirection: "row", gap: 8, alignItems: "flex-end", marginBottom: 16, zIndex: 10 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 12, color: cs.onSurfaceVariant, marginBottom: 4 }}>開始時間</Text>
                      <TouchableOpacity
                        onPress={() => setOpenDropdown(openDropdown === "assignStart" ? null : "assignStart")}
                        style={{ borderWidth: 1, borderColor: openDropdown === "assignStart" ? cs.primary : cs.outline, borderRadius: 8, padding: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
                      >
                        <Text style={{ fontSize: 14, color: cs.onSurface }}>{userModalStartTime}</Text>
                        <Ionicons name={openDropdown === "assignStart" ? "chevron-up" : "chevron-down"} size={16} color={cs.onSurfaceVariant} />
                      </TouchableOpacity>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 12, color: cs.onSurfaceVariant, marginBottom: 4 }}>終了時間</Text>
                      <TouchableOpacity
                        onPress={() => setOpenDropdown(openDropdown === "assignEnd" ? null : "assignEnd")}
                        style={{ borderWidth: 1, borderColor: openDropdown === "assignEnd" ? cs.primary : cs.outline, borderRadius: 8, padding: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
                      >
                        <Text style={{ fontSize: 14, color: cs.onSurface }}>{userModalEndTime}</Text>
                        <Ionicons name={openDropdown === "assignEnd" ? "chevron-up" : "chevron-down"} size={16} color={cs.onSurfaceVariant} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  {(openDropdown === "assignStart" || openDropdown === "assignEnd") && (
                    <View style={{ borderWidth: 1, borderColor: cs.outlineVariant, borderRadius: 8, backgroundColor: cs.surface, maxHeight: 180, marginBottom: 12, overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" } as any}>
                      <ScrollView nestedScrollEnabled>
                        {userTimeOpts.map((t) => {
                          const isActive = t === (openDropdown === "assignStart" ? userModalStartTime : userModalEndTime);
                          return (
                            <TouchableOpacity
                              key={t}
                              onPress={() => {
                                if (openDropdown === "assignStart") {
                                  setUserModalStartTime(t);
                                  const slot = assignModal.slot;
                                  const dur = slot ? timeStringToMinutes(slot.endTime) - timeStringToMinutes(slot.startTime) : 30;
                                  const eMin = Math.min(timeStringToMinutes(t) + dur, timeStringToMinutes(shiftEnd));
                                  setUserModalEndTime(`${String(Math.floor(eMin / 60)).padStart(2, "0")}:${String(eMin % 60).padStart(2, "0")}`);
                                } else {
                                  setUserModalEndTime(t);
                                }
                                setOpenDropdown(null);
                              }}
                              style={{ paddingHorizontal: 14, paddingVertical: 10, backgroundColor: isActive ? cs.primaryContainer : "transparent", borderBottomWidth: 1, borderBottomColor: cs.outlineVariant + "40" }}
                            >
                              <Text style={{ fontSize: 14, fontWeight: isActive ? "bold" : "normal", color: isActive ? cs.onPrimaryContainer : cs.onSurface }}>{t}</Text>
                            </TouchableOpacity>
                          );
                        })}
                      </ScrollView>
                    </View>
                  )}

                  {/* 現在の割り当て一覧 */}
                  <Text style={{ fontSize: 13, fontWeight: "600", color: cs.onSurfaceVariant, marginBottom: 8 }}>現在のスケジュール</Text>
                  <View style={{ backgroundColor: cs.surfaceContainerLow, borderRadius: 8, padding: 8, marginBottom: 16 }}>
                    {/* シフト */}
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 6 }}>
                      <Ionicons name="briefcase-outline" size={16} color={cs.onSurfaceVariant} />
                      <Text style={{ fontSize: 13, color: cs.onSurface, fontWeight: "600" }}>シフト</Text>
                      <Text style={{ fontSize: 13, color: cs.onSurfaceVariant }}>{shiftStart}~{shiftEnd}</Text>
                    </View>
                    {/* タスク/業務 */}
                    {userAssigns.length === 0 ? (
                      <Text style={{ fontSize: 12, color: cs.onSurfaceVariant, paddingVertical: 4, paddingLeft: 24 }}>割り当て済みタスクなし</Text>
                    ) : (
                      userAssigns.map((a) => {
                        const info = a.taskId ? tasksMap[a.taskId] : a.roleId ? rolesMap[a.roleId] : null;
                        return (
                          <View key={a.id} style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 4, borderTopWidth: 1, borderTopColor: cs.outlineVariant + "30" }}>
                            <Text style={{ fontSize: 14 }}>{info?.icon || "📋"}</Text>
                            <Text style={{ fontSize: 13, color: cs.onSurface, flex: 1 }}>{info?.name || "タスク"}</Text>
                            <Text style={{ fontSize: 12, color: cs.onSurfaceVariant }}>{a.scheduledStartTime}~{a.scheduledEndTime}</Text>
                          </View>
                        );
                      })
                    )}
                  </View>

                  {/* ボタン */}
                  <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 8 }}>
                    <TouchableOpacity
                      onPress={() => setAssignUserModal({ visible: false })}
                      style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 }}
                    >
                      <Text style={{ fontSize: 14, color: cs.onSurfaceVariant }}>キャンセル</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={async () => {
                        const slot = assignModal.slot;
                        if (!slot || !user?.storeId || !shift) return;
                        await upsertAssignment({
                          shiftId: shift.id,
                          taskId: slot.itemType === "task" ? slot.item.id : null,
                          roleId: slot.itemType === "role" ? slot.item.id : (slot.item as RoleTask).role_id || null,
                          storeId: user.storeId,
                          userId: assignUserModal.userId!,
                          scheduledDate: dateStr,
                          scheduledStartTime: userModalStartTime,
                          scheduledEndTime: userModalEndTime,
                          source: "manual",
                        });
                        setAssignUserModal({ visible: false });
                        setAssignModal({ visible: false });
                      }}
                      style={{ paddingHorizontal: 16, paddingVertical: 10, backgroundColor: cs.primary, borderRadius: 8 }}
                    >
                      <Text style={{ fontSize: 14, fontWeight: "600", color: cs.onPrimary }}>割り当て</Text>
                    </TouchableOpacity>
                  </View>
                </>
              );
            })()}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
      </>}
      </>
      )}
    </View>
  );
};
