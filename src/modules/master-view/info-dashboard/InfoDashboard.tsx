/**
 * @file InfoDashboard.tsx
 * @description マスターユーザー向けの情報ダッシュボード。タブ切り替えで
 *   スタッフ管理・ロール管理・休憩設定・Todoテンプレートなどを表示する。
 *
 * 【このファイルの位置づけ】
 *   master-view > info-dashboard 配下の画面コンポーネント。
 *   マスターの「情報」タブで描画される、大きな管理画面。
 *
 * 主なタブ:
 *   - スタッフ一覧: UserManagement を内包
 *   - ロール管理: StaffRole の CRUD
 *   - 休憩設定: TimeSegmentType の CRUD
 *   - Todoテンプレート: TodoSettingsView を内包
 *   - 予算: BudgetSection を内包
 *   - 連携: StoreConnectionModal を内包
 */
import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Pressable,
  Alert,
  useWindowDimensions,
} from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useShiftsRealtime } from "@/common/common-utils/util-shift/useShiftsRealtime";
import { useUsers } from "@/modules/reusable-widgets/user-management/user-hooks/useUserList";
import { calculateTotalWage } from "@/common/common-utils/util-shift/wageCalculator";
import { useAuth } from "@/services/auth/useAuth";
import { useMD3Theme } from "@/common/common-theme/md3/MD3ThemeContext";
import { useBreakpoint } from "@/common/common-constants/Breakpoints";
import { createInfoDashboardStyles } from "./InfoDashboard.styles";
import { useStaffRoles, type StaffRole, type RoleTask } from "./useStaffTasks";
import { useTimeSegmentTypes } from "./useTimeSegmentTypes";
import { getSupabase } from "@/services/supabase/supabase-client";
import { Picker } from "@react-native-picker/picker";
import Button from "@/common/common-ui/ui-forms/FormButton";
import { TodoSettingsView } from "@/modules/master-view/todayView/TodoSettingsView";
import type { WageMode } from "@/common/common-models/model-shift/shiftTypes";

interface StaffData {
  id: string;
  name: string;
  furigana: string;
  color: string;
  workedHours: number;
  efficiency: number;
  totalEarnings: number;
  hourlyWage: number;
  approvedShiftCount: number;
  monthsSinceJoin: number;
  createdAt: string;
}

/**
 * Wrapper: auth解決後にContentをマウントし、hooks が loading=true の初期状態から開始する
 */
export const InfoDashboard: React.FC = () => {
  const { user, loading: authLoading } = useAuth();

  if (authLoading || !user?.storeId) {
    return null;
  }

  return <InfoDashboardContent storeId={user.storeId} />;
};


import { COLOR_GRID } from "@/common/common-ui/ui-forms/FormColorPicker.constants";

// アイコン候補リスト（約50種類）
const ICON_OPTIONS = [
  // 飲食・調理
  "🍳", "🍕", "🍜", "🍣", "🍰", "☕", "🍺", "🥗", "🍔", "🧁",
  "🍱", "🍩", "🧇", "🥘", "🍝", "🥐", "🍞", "🥩", "🍖", "🥟",
  "🍤", "🧆", "🥪", "🫕", "🍿", "🧃", "🍷", "🥂", "🫖", "🍵",
  // 清掃・整理
  "🧹", "🧽", "🪣", "🧴", "🗑️", "♻️", "🧼", "🪥", "🧺", "✨",
  // 接客・対応
  "🤝", "💁", "📞", "🛎️", "💬", "👋", "😊", "🙇", "💳", "🧾",
  "🎁", "💝", "🪧", "📢", "📣",
  // 管理・事務
  "📋", "📊", "💰", "🗂️", "📝", "✅", "📌", "📎", "🗃️", "💼",
  "🧮", "📐", "📏", "🖊️", "🖋️", "📑", "🗓️", "📅", "🏷️", "📄",
  // 運搬・物流
  "📦", "🚚", "🛒", "🏗️", "🚛", "🛻", "📬", "📮", "🧳", "🪜",
  // 教育・研修
  "📚", "🎓", "✏️", "🧑‍🏫", "📖", "🔬", "🔭", "🧪", "🧠", "💡",
  "📓", "📒", "🎒", "🖍️", "🗒️",
  // 医療・安全・介護
  "🏥", "🩺", "⛑️", "🔒", "💊", "🩹", "🏨", "🧑‍⚕️", "♿", "🛡️",
  "🚑", "🦺", "⚠️", "🚨", "🔑",
  // 時間・休憩
  "⏸", "🕐", "🔔", "⏰", "💤", "🛏️", "🪑", "🚬", "⏱️", "⌛",
  "🕑", "🕒", "🕓", "🕔", "🕕",
  // 工具・技術・IT
  "🔧", "💻", "🖥️", "⚙️", "🔌", "🔩", "🪛", "🪚", "🔨", "⛏️",
  "🖨️", "📱", "📡", "🔋", "💾", "🌐", "📷", "🎥", "🎙️",
  // 人・役割
  "👤", "👥", "🧑‍💼", "👷", "🧑‍🔧", "🧑‍🍳", "🧑‍💻", "🧑‍🎨", "🧑‍🔬", "🧑‍🚒",
  "🧑‍✈️", "🧑‍🌾", "💂", "🕵️", "👮",
  // 建物・場所
  "🏪", "🏭", "🏢", "🏠", "🏫", "🏬", "🏣", "🏤", "🏰", "⛪",
  "🏟️", "🅿️", "🚪", "🛗",
  // 乗り物
  "🚗", "🚌", "🚲", "🏍️", "✈️", "🚄", "🚢", "⛵", "🛵",
  // スポーツ・活動
  "⚽", "🏀", "🎾", "🏊", "🏃", "🧘", "🎳", "🎮", "🎲", "🏋️",
  // 自然・天気
  "🌸", "🌻", "🍀", "🌈", "☀️", "🌙", "❄️", "🌊", "🔥", "🌿",
  // 動物
  "🐶", "🐱", "🐟", "🐔", "🐴", "🦁", "🐰", "🐻", "🦊", "🐧",
  // 音楽・アート
  "🎵", "🎶", "🎨", "🎭", "🎪", "🎬", "🎤", "🎹", "🥁", "🎻",
  // 記号・マーク
  "⭐", "🎯", "🌟", "❤️", "💎", "🏆", "🥇", "🎖️", "👑", "💫",
  "🔴", "🟠", "🟡", "🟢", "🔵", "🟣", "⚪", "⚫", "🟤", "🩷",
  "❌", "⭕", "✖️", "➕", "➖", "❓", "❗", "💯", "🔺", "🔻",
  "▶️", "⏩", "⏪", "🔄", "🔁", "↗️", "↘️", "↩️", "🔀",
];

type DashboardTab = "staff" | "roles" | "breaks" | "todoSettings";
type StaffDetailTab = "info" | "skills";
type StaffSortKey = "name" | "wage" | "shifts" | "joined";

const SORT_OPTIONS: { key: StaffSortKey; label: string }[] = [
  { key: "name", label: "名前順" },
  { key: "wage", label: "金額順" },
  { key: "shifts", label: "稼働回数順" },
  { key: "joined", label: "登録順" },
];

const TAB_CONFIG: { key: DashboardTab; label: string; icon: string }[] = [
  { key: "staff", label: "スタッフ", icon: "people" },
  { key: "roles", label: "業務作成", icon: "work" },
  { key: "breaks", label: "途中時間", icon: "timer" },
  { key: "todoSettings", label: "Todo設定", icon: "checklist" },
];

// スケジュール設定用の時間選択肢（30分刻み、6:00~23:00）
const SCHEDULE_TIME_OPTIONS = (() => {
  const opts: string[] = [];
  for (let h = 6; h <= 23; h++) {
    opts.push(`${h.toString().padStart(2, "0")}:00`);
    opts.push(`${h.toString().padStart(2, "0")}:30`);
  }
  return opts;
})();

// スケジュール設定用の所要時間選択肢
const SCHEDULE_DURATION_OPTIONS = [
  { label: "15分", value: "15" },
  { label: "30分", value: "30" },
  { label: "45分", value: "45" },
  { label: "1時間", value: "60" },
  { label: "1.5時間", value: "90" },
  { label: "2時間", value: "120" },
  { label: "2.5時間", value: "150" },
  { label: "3時間", value: "180" },
  { label: "4時間", value: "240" },
  { label: "5時間", value: "300" },
  { label: "6時間", value: "360" },
  { label: "8時間", value: "480" },
];

// スケジュール設定用の繰り返し間隔選択肢
const SCHEDULE_INTERVAL_OPTIONS = [
  { label: "15分ごと", value: "15" },
  { label: "30分ごと", value: "30" },
  { label: "45分ごと", value: "45" },
  { label: "1時間ごと", value: "60" },
  { label: "1.5時間ごと", value: "90" },
  { label: "2時間ごと", value: "120" },
  { label: "3時間ごと", value: "180" },
  { label: "4時間ごと", value: "240" },
];

const getMonthsDiff = (dateStr?: string): number => {
  if (!dateStr) return 0;
  const created = new Date(dateStr);
  const now = new Date();
  return (now.getFullYear() - created.getFullYear()) * 12 + (now.getMonth() - created.getMonth());
};

const InfoDashboardContent: React.FC<{ storeId: string }> = ({ storeId }) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>("staff");
  const [minimumWage, setMinimumWage] = useState<number>(1100);
  const [staffSortKey, setStaffSortKey] = useState<StaffSortKey>("name");

  // Load persisted settings
  useEffect(() => {
    (async () => {
      const supabase = getSupabase();
      const { data } = await supabase
        .from("settings")
        .select("settings_key, data")
        .eq("store_id", storeId)
        .in("settings_key", ["minimum_wage"]);
      if (!data) return;
      for (const row of data) {
        if (row.settings_key === "minimum_wage" && row.data?.value) setMinimumWage(row.data.value);
      }
    })();
  }, [storeId]);

  const saveSetting = useCallback(async (key: string, value: number) => {
    const supabase = getSupabase();
    const { data: existing } = await supabase
      .from("settings")
      .select("id")
      .eq("store_id", storeId)
      .eq("settings_key", key)
      .maybeSingle();
    if (existing) {
      await supabase.from("settings").update({ data: { value } }).eq("id", existing.id);
    } else {
      await supabase.from("settings").insert({ store_id: storeId, settings_key: key, data: { value } });
    }
  }, [storeId]);

  // Role & task management state
  const {
    roles: staffRoles,
    roleAssignments,
    taskAssignments: staffTaskAssignments,
    refetch: refetchStaffRoles,
    addRole,
    updateRole,
    deleteRole,
    addTask,
    updateTask,
    deleteTask,
    toggleRoleAssignment,
    toggleTaskAssignment,
    getUserRoles,
    getUserTasks,
    isRoleAssigned,
    isTaskAssigned,
    getRoleTasks,
  } = useStaffRoles(storeId);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskTargetRoleId, setTaskTargetRoleId] = useState<string | null>(null);
  const [newRoleIcon, setNewRoleIcon] = useState("");
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleColor, setNewRoleColor] = useState("#4A90E2");
  const [newRoleDesc, setNewRoleDesc] = useState("");
  const [newTaskIcon, setNewTaskIcon] = useState("");
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskColor, setNewTaskColor] = useState("#4A90E2");
  const [newTaskDesc, setNewTaskDesc] = useState("");

  // Schedule state for role/task modals
  const [newRoleScheduleDays, setNewRoleScheduleDays] = useState<number[]>([]);
  const [newRoleScheduleStartTime, setNewRoleScheduleStartTime] = useState<string>("");
  const [newRoleScheduleDuration, setNewRoleScheduleDuration] = useState<string>("");
  const [newRoleScheduleInterval, setNewRoleScheduleInterval] = useState<string>("");
  const [newRoleUseStartTime, setNewRoleUseStartTime] = useState(false);
  const [newRoleRequiredCount, setNewRoleRequiredCount] = useState<string>("1");
  const [newTaskScheduleDays, setNewTaskScheduleDays] = useState<number[]>([]);
  const [newTaskScheduleStartTime, setNewTaskScheduleStartTime] = useState<string>("");
  const [newTaskScheduleDuration, setNewTaskScheduleDuration] = useState<string>("");
  const [newTaskScheduleInterval, setNewTaskScheduleInterval] = useState<string>("");
  const [newTaskUseStartTime, setNewTaskUseStartTime] = useState(false);
  const [newTaskRequiredCount, setNewTaskRequiredCount] = useState<string>("1");

  // Edit state (reuses newRole*/newTask* fields via modal)
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [roleModalTab, setRoleModalTab] = useState<"info" | "schedule" | "assign">("info");
  const [taskModalTab, setTaskModalTab] = useState<"info" | "schedule" | "assign">("info");
  const [newRoleAssignMode, setNewRoleAssignMode] = useState<"anyone" | "manual">("manual");
  const [newTaskAssignMode, setNewTaskAssignMode] = useState<"anyone" | "manual">("manual");
  const [roleAssignedUsers, setRoleAssignedUsers] = useState<string[]>([]);
  const [taskAssignedUsers, setTaskAssignedUsers] = useState<string[]>([]);
  const [showRoleColorPicker, setShowRoleColorPicker] = useState(false);
  const [showTaskColorPicker, setShowTaskColorPicker] = useState(false);
  const [showRoleIconPicker, setShowRoleIconPicker] = useState(false);
  const [showTaskIconPicker, setShowTaskIconPicker] = useState(false);
  const [showTypeIconPicker, setShowTypeIconPicker] = useState(false);
  const [roleScheduleManual, setRoleScheduleManual] = useState(false);
  const [taskScheduleManual, setTaskScheduleManual] = useState(false);

  // Time segment type management
  const {
    types: timeSegmentTypes,
    addType: addSegmentType,
    updateType: updateSegmentType,
    deleteType: deleteSegmentType,
  } = useTimeSegmentTypes(storeId);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [editingTypeId, setEditingTypeId] = useState<string | null>(null);
  const [newTypeIcon, setNewTypeIcon] = useState("⏸");
  const [newTypeName, setNewTypeName] = useState("");
  const [newTypeColor, setNewTypeColor] = useState("#9e9e9e");
  const [showTypeColorPicker, setShowTypeColorPicker] = useState(false);
  const [newTypeWageMode, setNewTypeWageMode] = useState<WageMode>("exclude");
  const [newTypeCustomRate, setNewTypeCustomRate] = useState("");
  const [newTypeAllowTaskOverlap, setNewTypeAllowTaskOverlap] = useState(true);

  // Staff detail modal
  const [selectedStaff, setSelectedStaff] = useState<StaffData | null>(null);
  const [staffDetailTab, setStaffDetailTab] = useState<StaffDetailTab>("info");
  const [editingWage, setEditingWage] = useState(false);
  const [wageInput, setWageInput] = useState("");
  const [furiganaInput, setFuriganaInput] = useState("");

  const theme = useMD3Theme();
  const bp = useBreakpoint();
  const styles = useMemo(
    () => createInfoDashboardStyles(theme, bp),
    [theme, bp]
  );

  const { isTablet, isDesktop } = bp;
  const { width: windowWidth } = useWindowDimensions();

  const numColumns = isDesktop ? 5 : isTablet ? 3 : 1;
  const roleColumns = isDesktop ? 5 : isTablet ? 3 : windowWidth >= 400 ? 2 : 1;

  const { shifts, loading: shiftsLoading } = useShiftsRealtime(storeId);
  const { users, loading: usersLoading, refetchUsers } = useUsers(storeId);

  // Current month shifts
  const currentMonthShifts = useMemo(() => {
    const now = new Date();
    return shifts.filter((shift) => {
      const d = new Date(shift.date);
      return (
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear() &&
        (shift.status === "approved" ||
          shift.status === "completed")
      );
    });
  }, [shifts]);

  // Per-staff data
  const staffData = useMemo<StaffData[]>(() => {
    if (users.length === 0) return [];

    return users.map((u) => {
      const userShifts = currentMonthShifts.filter(
        (s) => s.userId === u.uid
      );
      let totalWorkedMinutes = 0;
      let totalEarnings = 0;
      const hourlyWage = u.hourlyWage || minimumWage;

      userShifts.forEach((shift) => {
        const { totalMinutes, totalWage } = calculateTotalWage(
          {
            startTime: shift.startTime,
            endTime: shift.endTime,
            classes: shift.classes || [],
          },
          hourlyWage
        );
        totalWorkedMinutes += totalMinutes;
        totalEarnings += totalWage;
      });

      const workedHours = Math.round((totalWorkedMinutes / 60) * 10) / 10;
      const targetHours = 100;
      const efficiency = Math.round(((workedHours / targetHours) * 100) * 10) / 10;

      const approvedShiftCount = shifts.filter(
        (s) => s.userId === u.uid && (s.status === "approved" || s.status === "completed")
      ).length;

      return {
        id: u.uid,
        name: u.nickname || "名前未設定",
        furigana: u.furigana || "",
        color: u.color || "",
        workedHours,
        efficiency,
        totalEarnings: Math.round(totalEarnings),
        hourlyWage,
        approvedShiftCount,
        monthsSinceJoin: getMonthsDiff(u.createdAt),
        createdAt: u.createdAt || "",
      };
    });
  }, [users, currentMonthShifts, shifts, minimumWage]);

  // Sorted staff data
  const sortedStaffData = useMemo(() => {
    const sorted = [...staffData];
    switch (staffSortKey) {
      case "wage":
        sorted.sort((a, b) => b.totalEarnings - a.totalEarnings);
        break;
      case "shifts":
        sorted.sort((a, b) => b.approvedShiftCount - a.approvedShiftCount);
        break;
      case "joined":
        sorted.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
        break;
      default:
        sorted.sort((a, b) => (a.furigana || a.name).localeCompare(b.furigana || b.name, "ja"));
        break;
    }
    return sorted;
  }, [staffData, staffSortKey]);

  const getEfficiencyColor = useCallback(
    (efficiency: number) => {
      if (efficiency >= 100) return theme.colorScheme.success;
      if (efficiency >= 80) return theme.colorScheme.warning;
      return theme.colorScheme.error;
    },
    [theme]
  );

  // Role management handlers
  const handleSaveRole = useCallback(async () => {
    if (!newRoleIcon.trim() || !newRoleName.trim()) {
      Alert.alert("エラー", "アイコンと業務名を入力してください");
      return;
    }
    const icon = [...newRoleIcon.trim()][0] || "";
    const scheduleFields = {
      schedule_days: newRoleScheduleDays,
      schedule_start_time: newRoleUseStartTime ? (newRoleScheduleStartTime || null) : null,
      schedule_duration_minutes: newRoleScheduleDuration ? parseInt(newRoleScheduleDuration, 10) : null,
      schedule_interval_minutes: !newRoleUseStartTime && newRoleScheduleInterval ? parseInt(newRoleScheduleInterval, 10) : null,
      required_count: parseInt(newRoleRequiredCount, 10) || 1,
      assignment_mode: newRoleAssignMode,
    };
    if (editingRoleId) {
      await updateRole(editingRoleId, { icon, name: newRoleName.trim(), color: newRoleColor, description: newRoleDesc.trim(), ...scheduleFields });
      // ユーザー割り当て更新（manualモード時）
      if (newRoleAssignMode === "manual") {
        const supabase = getSupabase();
        await supabase.from("user_role_assignments").delete().eq("role_id", editingRoleId).eq("store_id", storeId);
        if (roleAssignedUsers.length > 0) {
          await supabase.from("user_role_assignments").insert(roleAssignedUsers.map((uid) => ({ role_id: editingRoleId, user_id: uid, store_id: storeId })));
        }
        await refetchStaffRoles();
      }
    } else {
      const result = await addRole(icon, newRoleName.trim(), newRoleColor, newRoleDesc.trim());
      if (result?.data?.id && newRoleAssignMode === "manual" && roleAssignedUsers.length > 0) {
        const supabase = getSupabase();
        await supabase.from("user_role_assignments").insert(roleAssignedUsers.map((uid) => ({ role_id: result.data.id, user_id: uid, store_id: storeId })));
        await refetchStaffRoles();
      }
    }
    setNewRoleIcon(""); setNewRoleName(""); setNewRoleColor("#4A90E2"); setNewRoleDesc("");
    setNewRoleScheduleDays([]); setNewRoleScheduleStartTime(""); setNewRoleScheduleDuration(""); setNewRoleScheduleInterval(""); setNewRoleUseStartTime(false); setNewRoleRequiredCount("1");
    setNewRoleAssignMode("manual"); setRoleAssignedUsers([]);
    setEditingRoleId(null); setShowRoleModal(false);
  }, [newRoleIcon, newRoleName, newRoleColor, newRoleDesc, newRoleScheduleDays, newRoleScheduleStartTime, newRoleScheduleDuration, newRoleScheduleInterval, newRoleUseStartTime, newRoleRequiredCount, newRoleAssignMode, roleAssignedUsers, editingRoleId, addRole, updateRole, storeId, refetchStaffRoles]);

  const handleSaveTask = useCallback(async () => {
    if (!newTaskIcon.trim() || !newTaskName.trim()) {
      Alert.alert("エラー", "アイコンとタスク名を入力してください");
      return;
    }
    const icon = [...newTaskIcon.trim()][0] || "";
    const scheduleFields = {
      schedule_days: newTaskScheduleDays,
      schedule_start_time: newTaskUseStartTime ? (newTaskScheduleStartTime || null) : null,
      schedule_duration_minutes: newTaskScheduleDuration ? parseInt(newTaskScheduleDuration, 10) : null,
      schedule_interval_minutes: !newTaskUseStartTime && newTaskScheduleInterval ? parseInt(newTaskScheduleInterval, 10) : null,
      required_count: parseInt(newTaskRequiredCount, 10) || 1,
      assignment_mode: newTaskAssignMode,
    };
    if (editingTaskId) {
      await updateTask(editingTaskId, { icon, name: newTaskName.trim(), color: newTaskColor, description: newTaskDesc.trim(), ...scheduleFields });
      if (newTaskAssignMode === "manual") {
        const supabase = getSupabase();
        await supabase.from("user_task_assignments").delete().eq("task_id", editingTaskId).eq("store_id", storeId);
        if (taskAssignedUsers.length > 0) {
          await supabase.from("user_task_assignments").insert(taskAssignedUsers.map((uid) => ({ task_id: editingTaskId, user_id: uid, store_id: storeId })));
        }
        await refetchStaffRoles();
      }
    } else if (taskTargetRoleId) {
      const result = await addTask(taskTargetRoleId, icon, newTaskName.trim(), newTaskColor, newTaskDesc.trim());
      if (result?.data?.id && newTaskAssignMode === "manual" && taskAssignedUsers.length > 0) {
        const supabase = getSupabase();
        await supabase.from("user_task_assignments").insert(taskAssignedUsers.map((uid) => ({ task_id: result.data.id, user_id: uid, store_id: storeId })));
        await refetchStaffRoles();
      }
    }
    setNewTaskIcon(""); setNewTaskName(""); setNewTaskColor("#4A90E2"); setNewTaskDesc("");
    setNewTaskScheduleDays([]); setNewTaskScheduleStartTime(""); setNewTaskScheduleDuration(""); setNewTaskScheduleInterval(""); setNewTaskUseStartTime(false); setNewTaskRequiredCount("1");
    setNewTaskAssignMode("manual"); setTaskAssignedUsers([]);
    setEditingTaskId(null); setShowTaskModal(false); setTaskTargetRoleId(null);
  }, [taskTargetRoleId, newTaskIcon, newTaskName, newTaskColor, newTaskDesc, newTaskScheduleDays, newTaskScheduleStartTime, newTaskScheduleDuration, newTaskScheduleInterval, newTaskUseStartTime, newTaskRequiredCount, newTaskAssignMode, taskAssignedUsers, editingTaskId, addTask, updateTask, storeId, refetchStaffRoles]);

  const openAddTaskModal = useCallback((roleId: string) => {
    setTaskTargetRoleId(roleId);
    setNewTaskIcon("");
    setNewTaskName("");
    setNewTaskColor("#4A90E2");
    setNewTaskDesc("");
    setNewTaskScheduleDays([]);
    setNewTaskScheduleStartTime("");
    setNewTaskScheduleDuration("");
    setNewTaskScheduleInterval("");
    setNewTaskUseStartTime(false);
    setNewTaskRequiredCount("1");
    setNewTaskAssignMode("manual");
    setTaskAssignedUsers([]);
    setTaskModalTab("info");
    setShowTaskColorPicker(false);
    setShowTaskIconPicker(false);
    setTaskScheduleManual(false);
    setShowTaskModal(true);
  }, []);

  const openEditRole = useCallback((role: StaffRole) => {
    setEditingRoleId(role.id);
    setNewRoleIcon(role.icon);
    setNewRoleName(role.name);
    setNewRoleColor(role.color);
    setNewRoleDesc(role.description);
    setNewRoleScheduleDays(role.schedule_days || []);
    setNewRoleScheduleStartTime(role.schedule_start_time || "");
    setNewRoleScheduleDuration(role.schedule_duration_minutes?.toString() || "");
    setNewRoleScheduleInterval(role.schedule_interval_minutes?.toString() || "");
    setNewRoleUseStartTime(!!role.schedule_start_time);
    setNewRoleRequiredCount((role.required_count || 1).toString());
    setNewRoleAssignMode(role.assignment_mode || "manual");
    setRoleAssignedUsers(roleAssignments.filter((a) => a.role_id === role.id).map((a) => a.user_id));
    setRoleModalTab("info");
    setShowRoleColorPicker(false);
    setRoleScheduleManual(false);
    setShowRoleModal(true);
  }, [roleAssignments]);

  const openEditTask = useCallback((task: RoleTask) => {
    setEditingTaskId(task.id);
    setNewTaskIcon(task.icon);
    setNewTaskName(task.name);
    setNewTaskColor(task.color);
    setNewTaskDesc(task.description);
    setNewTaskScheduleDays(task.schedule_days || []);
    setNewTaskScheduleStartTime(task.schedule_start_time || "");
    setNewTaskScheduleDuration(task.schedule_duration_minutes?.toString() || "");
    setNewTaskScheduleInterval(task.schedule_interval_minutes?.toString() || "");
    setNewTaskUseStartTime(!!task.schedule_start_time);
    setNewTaskRequiredCount((task.required_count || 1).toString());
    setNewTaskAssignMode(task.assignment_mode || "manual");
    setTaskAssignedUsers(staffTaskAssignments.filter((a) => a.task_id === task.id).map((a) => a.user_id));
    setTaskModalTab("info");
    setShowTaskColorPicker(false);
    setShowTaskIconPicker(false);
    setTaskScheduleManual(false);
    setShowTaskModal(true);
  }, [staffTaskAssignments]);

  // --- Time segment type handlers ---
  const handleSaveType = useCallback(async () => {
    if (!newTypeIcon.trim() || !newTypeName.trim()) {
      Alert.alert("エラー", "アイコンと名前を入力してください");
      return;
    }
    const icon = [...newTypeIcon.trim()][0] || "";
    const customRate = newTypeWageMode === "custom_rate" ? (Number.parseInt(newTypeCustomRate, 10) || 0) : 0;
    if (editingTypeId) {
      await updateSegmentType(editingTypeId, { icon, name: newTypeName.trim(), color: newTypeColor, wageMode: newTypeWageMode, customRate, allowTaskOverlap: newTypeAllowTaskOverlap });
    } else {
      await addSegmentType(newTypeName.trim(), icon, newTypeColor, newTypeWageMode, customRate);
    }
    setShowTypeModal(false);
    setEditingTypeId(null);
    setNewTypeIcon("⏸"); setNewTypeName(""); setNewTypeColor("#9e9e9e"); setNewTypeWageMode("exclude"); setNewTypeCustomRate(""); setNewTypeAllowTaskOverlap(true);
  }, [newTypeIcon, newTypeName, newTypeColor, newTypeWageMode, newTypeCustomRate, newTypeAllowTaskOverlap, editingTypeId, addSegmentType, updateSegmentType]);

  const openEditType = useCallback((t: { id: string; icon: string; name: string; color: string; wageMode: WageMode; customRate: number; allowTaskOverlap: boolean }) => {
    setEditingTypeId(t.id);
    setNewTypeIcon(t.icon);
    setNewTypeName(t.name);
    setNewTypeColor(t.color);
    setNewTypeWageMode(t.wageMode);
    setNewTypeCustomRate(t.wageMode === "custom_rate" ? String(t.customRate) : "");
    setNewTypeAllowTaskOverlap(t.allowTaskOverlap);
    setShowTypeColorPicker(false);
    setShowTypeModal(true);
  }, []);

  const openStaffDetail = useCallback((staff: StaffData) => {
    setSelectedStaff(staff);
    setStaffDetailTab("info");
    setEditingWage(false);
    setFuriganaInput(staff.furigana);
  }, []);

  const handleCloseStaffDetail = useCallback(() => {
    if (!selectedStaff) return;
    const trimmed = furiganaInput.trim();
    if (trimmed && !/^[\u3040-\u309F\s\u3000]*$/.test(trimmed)) {
      Alert.alert("エラー", "ふりがなはひらがなのみで入力してください");
      return;
    }
    const staffId = selectedStaff.id;
    setSelectedStaff(null);
    const supabase = getSupabase();
    supabase.from("users").update({ furigana: trimmed }).eq("uid", staffId).then(() => refetchUsers());
  }, [selectedStaff, furiganaInput, refetchUsers]);

  const handleSaveWage = useCallback(() => {
    if (!selectedStaff) return;
    const newWage = Number.parseInt(wageInput.replace(/,/g, ""), 10);
    if (Number.isNaN(newWage) || newWage < 0) return;
    const staffId = selectedStaff.id;
    setSelectedStaff(null);
    const supabase = getSupabase();
    supabase.from("users").update({ hourly_wage: newWage }).eq("uid", staffId).then(() => refetchUsers());
  }, [selectedStaff, wageInput, refetchUsers]);

  // Staff card renderer
  const renderStaffCard = useCallback(
    ({ item }: { item: StaffData }) => {
      const effColor = getEfficiencyColor(item.efficiency);
      const userRoles = getUserRoles(item.id);
      const userTasks = getUserTasks(item.id);
      return (
        <TouchableOpacity style={styles.staffCard} onPress={() => openStaffDetail(item)} activeOpacity={0.7}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: theme.spacing.xs }}>
            <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: (item.color || theme.colorScheme.primary) + "22", justifyContent: "center", alignItems: "center", marginRight: theme.spacing.xs }}>
              <MaterialIcons name="person" size={16} color={item.color || theme.colorScheme.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.staffName} numberOfLines={1}>
                {item.name}{item.furigana ? <Text style={{ ...theme.typography.bodySmall, color: theme.colorScheme.onSurfaceVariant }}>（{item.furigana}）</Text> : null}
              </Text>
              <Text style={{ fontSize: 10, color: theme.colorScheme.onSurfaceVariant }}>
                {item.monthsSinceJoin}ヶ月 / 稼働{item.approvedShiftCount}回
              </Text>
            </View>
          </View>
          {(userRoles.length > 0 || userTasks.length > 0) && (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 3, marginBottom: theme.spacing.xs, alignItems: "flex-end" }}>
              {userRoles.map((r) => {
                const rTasks = getRoleTasks(r.id).filter((t) => userTasks.some((ut) => ut.id === t.id));
                return (
                  <View key={r.id} style={{ flexDirection: "row", gap: 2, alignItems: "flex-end" }}>
                    <View style={[styles.taskBadge, { backgroundColor: r.color + "22", width: 20, height: 20, borderRadius: 10 }]}>
                      <Text style={[styles.taskBadgeText, { color: r.color, fontSize: 11 }]}>{r.icon}</Text>
                    </View>
                    {rTasks.map((t) => (
                      <View key={t.id} style={[styles.taskBadge, { backgroundColor: t.color + "22", width: 24, height: 18, borderRadius: 9 }]}>
                        <Text style={[styles.taskBadgeText, { color: t.color, fontSize: 10 }]}>{r.icon}{t.icon}</Text>
                      </View>
                    ))}
                  </View>
                );
              })}
            </View>
          )}
          <Text style={styles.staffHours}>{item.workedHours}h</Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressBg}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(item.efficiency, 100)}%`,
                    backgroundColor: effColor,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {item.efficiency.toFixed(0)}%
            </Text>
          </View>
          <Text style={styles.staffWage}>
            ¥{item.totalEarnings.toLocaleString()}
          </Text>
        </TouchableOpacity>
      );
    },
    [styles, theme, getEfficiencyColor, getUserRoles, getUserTasks, getRoleTasks, openStaffDetail]
  );

  // Loading (データ取得中)
  if (shiftsLoading || usersLoading) {
    return null;
  }

  // No data
  if (shifts.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.noDataContainer}>
          <MaterialIcons
            name="info"
            size={48}
            color={theme.colorScheme.outline}
          />
          <Text style={styles.noDataTitle}>シフトデータがありません</Text>
          <Text style={styles.noDataDescription}>
            シフトを登録すると、ここに分析データが表示されます。
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.mainContent}>
        {/* Sub-header tabs */}
        <View style={styles.tabBar}>
          {TAB_CONFIG.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tabItem, isActive && styles.tabItemActive]}
                onPress={() => setActiveTab(tab.key)}
              >
                <MaterialIcons
                  name={tab.icon as any}
                  size={18}
                  color={isActive ? theme.colorScheme.primary : theme.colorScheme.onSurfaceVariant}
                />
                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {activeTab === "todoSettings" ? (
          <TodoSettingsView />
        ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >

          {/* ===== Staff Tab ===== */}
          {activeTab === "staff" && (
            <View style={styles.staffSection}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: theme.spacing.lg, flexWrap: "wrap", gap: theme.spacing.sm }}>
                <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>スタッフ一覧</Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.md }}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View style={{ borderWidth: 1, borderColor: theme.colorScheme.outline + "44", borderRadius: theme.shape.small, overflow: "hidden" }}>
                      <Picker
                        selectedValue={staffSortKey}
                        onValueChange={(v) => setStaffSortKey(v as StaffSortKey)}
                        style={{ height: 32, width: 130, fontSize: 12, color: theme.colorScheme.onSurface, border: "none", outline: "none", backgroundColor: "transparent" } as any}
                      >
                        {SORT_OPTIONS.map((opt) => (
                          <Picker.Item key={opt.key} label={opt.label} value={opt.key} style={{ fontSize: 13 }} />
                        ))}
                      </Picker>
                    </View>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.sm }}>
                    <Text style={{ color: theme.colorScheme.onSurfaceVariant, fontSize: 12 }}>最低時給 ¥</Text>
                    <TextInput
                      style={[styles.taskInput, { width: 64, paddingVertical: 4, paddingHorizontal: theme.spacing.sm, textAlign: "right", fontSize: 13 }]}
                      value={minimumWage.toString()}
                      onChangeText={(t) => {
                        const n = Number.parseInt(t.replace(/[^0-9]/g, ""), 10);
                        if (!Number.isNaN(n)) setMinimumWage(n);
                        else if (t === "") setMinimumWage(0);
                      }}
                      keyboardType="numeric"
                      onBlur={async () => {
                        if (minimumWage <= 0) return;
                        await saveSetting("minimum_wage", minimumWage);
                        const belowMin = users.filter((u) => (u.hourlyWage || 0) < minimumWage);
                        if (belowMin.length === 0) return;
                        const supabase = getSupabase();
                        const uids = belowMin.map((u) => u.uid);
                        await supabase.from("users").update({ hourly_wage: minimumWage }).in("uid", uids);
                        await refetchUsers();
                        Alert.alert("更新完了", `${belowMin.length}名の時給を¥${minimumWage.toLocaleString()}に更新しました`);
                      }}
                    />
                  </View>
                </View>
              </View>
              <FlatList
                data={sortedStaffData}
                renderItem={renderStaffCard}
                keyExtractor={(item) => item.id}
                numColumns={numColumns}
                key={numColumns}
                columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : undefined}
                scrollEnabled={false}
                contentContainerStyle={{ gap: theme.spacing.md }}
              />
            </View>
          )}

          {/* ===== Roles Tab ===== */}
          {activeTab === "roles" && (
            <>
              {/* Header with action buttons */}
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: theme.spacing.lg }}>
                <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>業務・タスク管理</Text>
                <TouchableOpacity
                  style={[styles.taskActionBtn, { backgroundColor: theme.colorScheme.primary }]}
                  onPress={() => { setEditingRoleId(null); setNewRoleIcon(""); setNewRoleName(""); setNewRoleColor("#4A90E2"); setNewRoleDesc(""); setNewRoleScheduleDays([]); setNewRoleScheduleStartTime(""); setNewRoleScheduleDuration(""); setNewRoleScheduleInterval(""); setNewRoleUseStartTime(false); setNewRoleRequiredCount("1"); setNewRoleAssignMode("manual"); setRoleAssignedUsers([]); setRoleModalTab("info"); setShowRoleColorPicker(false); setShowRoleIconPicker(false); setRoleScheduleManual(false); setShowRoleModal(true); }}
                >
                  <Ionicons name="add" size={18} color={theme.colorScheme.onPrimary} />
                  <Text style={{ color: theme.colorScheme.onPrimary, fontSize: 13, fontWeight: "600", marginLeft: 2 }}>業務追加</Text>
                </TouchableOpacity>
              </View>

              {staffRoles.length === 0 ? (
                <View style={styles.summaryCard}>
                  <Text style={{ color: theme.colorScheme.onSurfaceVariant, textAlign: "center", paddingVertical: theme.spacing.lg }}>
                    業務を追加して、スタッフのスキルを管理しましょう
                  </Text>
                </View>
              ) : (
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.sm }}>
                  {staffRoles.map((role) => {
                    const roleTasks = getRoleTasks(role.id);
                    const assignedCount = roleAssignments.filter((a) => a.role_id === role.id).length;
                    const cardWidth = roleColumns > 1 ? `${(100 - (roleColumns - 1) * 1.5) / roleColumns}%` as any : "100%";
                    return (
                      <View key={role.id} style={[styles.staffCard, { padding: theme.spacing.sm, width: cardWidth, marginBottom: 0, maxHeight: 220 }]}>
                        {/* Role header */}
                        <TouchableOpacity style={{ flexDirection: "row", alignItems: "center" }} onPress={() => openEditRole(role)} activeOpacity={0.6}>
                          <View style={[styles.taskBadgeLg, { backgroundColor: role.color + "22" }]}>
                            <Text style={{ fontSize: 18, color: role.color }}>{role.icon}</Text>
                          </View>
                          <Text style={{ color: theme.colorScheme.onSurface, fontWeight: "700", fontSize: 14, marginLeft: theme.spacing.sm, flex: 1 }} numberOfLines={1}>{role.name}</Text>
                          <Text style={{ color: theme.colorScheme.onSurfaceVariant, fontSize: 11, marginLeft: theme.spacing.xs }}>
                            {assignedCount}人
                          </Text>
                          <TouchableOpacity onPress={() => deleteRole(role.id)} hitSlop={8} style={{ marginLeft: theme.spacing.xs }}>
                            <Ionicons name="trash-outline" size={16} color={theme.colorScheme.error} />
                          </TouchableOpacity>
                        </TouchableOpacity>

                        {/* Tasks within role (scrollable) */}
                        <ScrollView style={{ flex: 1, marginTop: theme.spacing.xs }} nestedScrollEnabled>
                          {roleTasks.map((task) => (
                            <TouchableOpacity key={task.id} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 2, paddingLeft: theme.spacing.md }} onPress={() => openEditTask(task)} activeOpacity={0.6}>
                              <View style={[styles.taskBadge, { backgroundColor: task.color + "22", width: 20, height: 20, borderRadius: 10 }]}>
                                <Text style={{ fontSize: 11, fontWeight: "700", color: task.color }}>{task.icon}</Text>
                              </View>
                              <Text style={{ color: theme.colorScheme.onSurface, fontSize: 12, fontWeight: "500", marginLeft: theme.spacing.xs, flex: 1 }} numberOfLines={1}>
                                {task.name}
                                <Text style={{ color: theme.colorScheme.onSurfaceVariant, fontWeight: "400" }}>
                                  {"  "}{role.icon}{task.icon}
                                </Text>
                              </Text>
                              <TouchableOpacity onPress={() => deleteTask(task.id)} hitSlop={8}>
                                <Ionicons name="close-circle-outline" size={14} color={theme.colorScheme.outline} />
                              </TouchableOpacity>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>

                        {/* Add task button */}
                        <TouchableOpacity
                          style={{ flexDirection: "row", alignItems: "center", paddingTop: theme.spacing.xs, paddingLeft: theme.spacing.md }}
                          onPress={() => openAddTaskModal(role.id)}
                        >
                          <Ionicons name="add-circle-outline" size={14} color={theme.colorScheme.primary} />
                          <Text style={{ color: theme.colorScheme.primary, fontSize: 12, marginLeft: 4 }}>タスク追加</Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              )}
            </>
          )}

          {/* ===== Breaks Tab ===== */}
          {activeTab === "breaks" && (
            <>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: theme.spacing.lg }}>
                <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>途中時間タイプ管理</Text>
                <TouchableOpacity
                  style={[styles.taskActionBtn, { backgroundColor: theme.colorScheme.primary }]}
                  onPress={() => { setEditingTypeId(null); setNewTypeIcon("⏸"); setNewTypeName(""); setNewTypeColor("#9e9e9e"); setNewTypeWageMode("exclude"); setNewTypeCustomRate(""); setShowTypeColorPicker(false); setShowTypeIconPicker(false); setShowTypeModal(true); }}
                >
                  <Ionicons name="add" size={18} color={theme.colorScheme.onPrimary} />
                  <Text style={{ color: theme.colorScheme.onPrimary, fontSize: 13, fontWeight: "600", marginLeft: 2 }}>タイプ追加</Text>
                </TouchableOpacity>
              </View>

              {timeSegmentTypes.length === 0 ? (
                <View style={styles.summaryCard}>
                  <Text style={{ color: theme.colorScheme.onSurfaceVariant, textAlign: "center", paddingVertical: theme.spacing.lg }}>
                    途中時間タイプを追加して、シフト内の時間区分を管理しましょう
                  </Text>
                </View>
              ) : (
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.sm }}>
                  {timeSegmentTypes.map((segType) => {
                    const cardWidth = roleColumns > 1 ? `${(100 - (roleColumns - 1) * 1.5) / roleColumns}%` as any : "100%";
                    const wageModeLabel = segType.wageMode === "exclude" ? "給与除外"
                      : segType.wageMode === "include" ? "通常単価で含む"
                      : `別単価 ¥${segType.customRate}/時`;
                    return (
                      <TouchableOpacity key={segType.id} style={[styles.staffCard, { padding: theme.spacing.sm, width: cardWidth, marginBottom: 0 }]} onPress={() => openEditType(segType)} activeOpacity={0.6}>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                          <View style={[styles.taskBadgeLg, { backgroundColor: segType.color + "22" }]}>
                            <Text style={{ fontSize: 18, color: segType.color }}>{segType.icon}</Text>
                          </View>
                          <View style={{ flex: 1, marginLeft: theme.spacing.sm }}>
                            <Text style={{ color: theme.colorScheme.onSurface, fontWeight: "700", fontSize: 14 }} numberOfLines={1}>{segType.name}</Text>
                            <Text style={{ color: theme.colorScheme.onSurfaceVariant, fontSize: 11, marginTop: 2 }}>{wageModeLabel}</Text>
                          </View>
                          <TouchableOpacity onPress={() => deleteSegmentType(segType.id)} hitSlop={8}>
                            <Ionicons name="trash-outline" size={16} color={theme.colorScheme.error} />
                          </TouchableOpacity>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </>
          )}

        </ScrollView>
        )}

        {/* ===== Staff Detail Modal ===== */}
        <Modal
          visible={!!selectedStaff}
          transparent={true}
          animationType="fade"
          onRequestClose={handleCloseStaffDetail}
        >
          <Pressable style={styles.modalOverlay} onPress={handleCloseStaffDetail}>
            <Pressable style={[styles.modalContent, { maxWidth: 480, maxHeight: "85%" }]} onPress={(e) => e.stopPropagation()}>
              {selectedStaff && (
                <>
                  {/* Header */}
                  <View style={styles.modalHeader}>
                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: (selectedStaff.color || theme.colorScheme.primary) + "22", justifyContent: "center", alignItems: "center" }}>
                      <MaterialIcons name="person" size={24} color={selectedStaff.color || theme.colorScheme.primary} />
                    </View>
                    <Text style={styles.modalTitle}>{selectedStaff.name}</Text>
                    <TouchableOpacity onPress={handleCloseStaffDetail} style={styles.closeButton}>
                      <MaterialIcons name="close" size={24} color={theme.colorScheme.onSurfaceVariant} />
                    </TouchableOpacity>
                  </View>

                  {/* Sub-tabs */}
                  <View style={[styles.tabBar, { marginBottom: theme.spacing.lg }]}>
                    {([
                      { key: "info" as StaffDetailTab, label: "講師情報", icon: "info" },
                      { key: "skills" as StaffDetailTab, label: "可能業務", icon: "assignment-ind" },
                    ]).map((tab) => {
                      const isActive = staffDetailTab === tab.key;
                      return (
                        <TouchableOpacity
                          key={tab.key}
                          style={[styles.tabItem, isActive && styles.tabItemActive]}
                          onPress={() => setStaffDetailTab(tab.key)}
                        >
                          <MaterialIcons name={tab.icon as any} size={16} color={isActive ? theme.colorScheme.primary : theme.colorScheme.onSurfaceVariant} />
                          <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{tab.label}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <ScrollView showsVerticalScrollIndicator={false}>
                    {staffDetailTab === "info" && (
                      <View style={{ gap: theme.spacing.lg }}>
                        {/* Furigana */}
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                          <MaterialIcons name="translate" size={20} color={theme.colorScheme.primary} />
                          <Text style={{ flex: 1, marginLeft: theme.spacing.md, color: theme.colorScheme.onSurfaceVariant, fontSize: 14 }}>ふりがな</Text>
                          <TextInput
                            style={[styles.taskInput, { width: 140, paddingVertical: 4, paddingHorizontal: theme.spacing.sm, fontSize: 14 }]}
                            value={furiganaInput}
                            onChangeText={setFuriganaInput}
                            placeholder="ひらがな"
                            placeholderTextColor={theme.colorScheme.outline}
                          />
                        </View>

                        {/* Hourly wage (editable) */}
                        <TouchableOpacity
                          style={{ flexDirection: "row", alignItems: "center" }}
                          onPress={() => { setEditingWage(true); setWageInput(selectedStaff.hourlyWage.toString()); }}
                        >
                          <MaterialIcons name="badge" size={20} color={theme.colorScheme.primary} />
                          <Text style={{ flex: 1, marginLeft: theme.spacing.md, color: theme.colorScheme.onSurfaceVariant, fontSize: 14 }}>時給</Text>
                          {editingWage ? (
                            <View style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.sm }}>
                              <Text style={{ color: theme.colorScheme.onSurfaceVariant, fontSize: 14 }}>¥</Text>
                              <TextInput
                                style={[styles.taskInput, { width: 80, paddingVertical: 4, textAlign: "right", fontSize: 14 }]}
                                value={wageInput}
                                onChangeText={setWageInput}
                                keyboardType="numeric"
                                autoFocus
                                onSubmitEditing={handleSaveWage}
                              />
                              <TouchableOpacity onPress={handleSaveWage} hitSlop={8}>
                                <Ionicons name="checkmark-circle" size={22} color={theme.colorScheme.primary} />
                              </TouchableOpacity>
                              <TouchableOpacity onPress={() => setEditingWage(false)} hitSlop={8}>
                                <Ionicons name="close-circle" size={22} color={theme.colorScheme.outline} />
                              </TouchableOpacity>
                            </View>
                          ) : (
                            <View style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.xs }}>
                              <Text style={{ color: theme.colorScheme.onSurface, fontSize: 14, fontWeight: "600" }}>¥{selectedStaff.hourlyWage.toLocaleString()}</Text>
                              <MaterialIcons name="edit" size={14} color={theme.colorScheme.outline} />
                            </View>
                          )}
                        </TouchableOpacity>

                        {/* Other info rows */}
                        {([
                          { icon: "calendar-today" as const, label: "登録", value: selectedStaff.createdAt ? new Date(selectedStaff.createdAt).toLocaleDateString("ja-JP") : "-" },
                          { icon: "history" as const, label: "在籍期間", value: `${selectedStaff.monthsSinceJoin}ヶ月` },
                          { icon: "check-circle" as const, label: "承認済みシフト", value: `${selectedStaff.approvedShiftCount}件` },
                          { icon: "schedule" as const, label: "今月稼働", value: `${selectedStaff.workedHours}h` },
                          { icon: "attach-money" as const, label: "今月給与", value: `¥${selectedStaff.totalEarnings.toLocaleString()}` },
                          { icon: "trending-up" as const, label: "稼働率", value: `${selectedStaff.efficiency.toFixed(1)}%` },
                        ]).map((row) => (
                          <View key={row.label} style={{ flexDirection: "row", alignItems: "center" }}>
                            <MaterialIcons name={row.icon} size={20} color={theme.colorScheme.primary} />
                            <Text style={{ flex: 1, marginLeft: theme.spacing.md, color: theme.colorScheme.onSurfaceVariant, fontSize: 14 }}>{row.label}</Text>
                            <Text style={{ color: theme.colorScheme.onSurface, fontSize: 14, fontWeight: "600" }}>{row.value}</Text>
                          </View>
                        ))}

                        {/* Role badges */}
                        {getUserRoles(selectedStaff.id).length > 0 && (
                          <View>
                            <Text style={{ color: theme.colorScheme.onSurfaceVariant, fontSize: 12, marginBottom: theme.spacing.sm }}>担当業務</Text>
                            <View style={[styles.taskBadgeRow, { flexWrap: "wrap" }]}>
                              {getUserRoles(selectedStaff.id).map((r) => (
                                <View key={r.id} style={{ flexDirection: "row", alignItems: "center", backgroundColor: r.color + "18", borderRadius: 12, paddingHorizontal: theme.spacing.sm, paddingVertical: 4, gap: 4 }}>
                                  <Text style={{ color: r.color, fontSize: 14, fontWeight: "700" }}>{r.icon}</Text>
                                  <Text style={{ color: r.color, fontSize: 12, fontWeight: "500" }}>{r.name}</Text>
                                </View>
                              ))}
                            </View>
                          </View>
                        )}
                      </View>
                    )}

                    {staffDetailTab === "skills" && (
                      <View style={{ gap: theme.spacing.lg }}>
                        {staffRoles.length === 0 ? (
                          <Text style={{ color: theme.colorScheme.onSurfaceVariant, textAlign: "center", paddingVertical: theme.spacing.lg }}>
                            業務作成タブから業務を追加してください
                          </Text>
                        ) : (
                          staffRoles.map((role) => {
                            const roleTasks = getRoleTasks(role.id);
                            const roleChecked = isRoleAssigned(role.id, selectedStaff.id);
                            return (
                              <View key={role.id}>
                                {/* Role row */}
                                <TouchableOpacity
                                  style={{ flexDirection: "row", alignItems: "center", paddingVertical: theme.spacing.sm }}
                                  onPress={() => toggleRoleAssignment(role.id, selectedStaff.id)}
                                >
                                  <Ionicons
                                    name={roleChecked ? "checkbox" : "square-outline"}
                                    size={24}
                                    color={roleChecked ? role.color : theme.colorScheme.outline}
                                  />
                                  <View style={[styles.taskBadgeLg, { backgroundColor: role.color + "22", marginLeft: theme.spacing.sm }]}>
                                    <Text style={{ fontSize: 16, color: role.color }}>{role.icon}</Text>
                                  </View>
                                  <Text style={{ flex: 1, marginLeft: theme.spacing.sm, color: theme.colorScheme.onSurface, fontWeight: "600", fontSize: 15 }}>
                                    {role.name}
                                  </Text>
                                </TouchableOpacity>

                                {/* Task rows (indented) */}
                                {roleTasks.map((task) => {
                                  const taskChecked = isTaskAssigned(task.id, selectedStaff.id);
                                  return (
                                    <TouchableOpacity
                                      key={task.id}
                                      style={{ flexDirection: "row", alignItems: "center", paddingVertical: theme.spacing.xs, paddingLeft: theme.spacing.xxxl }}
                                      onPress={() => toggleTaskAssignment(task.id, selectedStaff.id)}
                                    >
                                      <Ionicons
                                        name={taskChecked ? "checkbox" : "square-outline"}
                                        size={20}
                                        color={taskChecked ? task.color : theme.colorScheme.outline}
                                      />
                                      <View style={[styles.taskBadge, { backgroundColor: task.color + "22", marginLeft: theme.spacing.sm }]}>
                                        <Text style={[styles.taskBadgeText, { color: task.color }]}>{task.icon}</Text>
                                      </View>
                                      <Text style={{ flex: 1, marginLeft: theme.spacing.sm, color: theme.colorScheme.onSurface, fontSize: 13 }}>
                                        {task.name}
                                        <Text style={{ color: theme.colorScheme.onSurfaceVariant, fontWeight: "400" }}>
                                          {"  "}{role.icon}{task.icon}
                                        </Text>
                                      </Text>
                                    </TouchableOpacity>
                                  );
                                })}
                              </View>
                            );
                          })
                        )}
                      </View>
                    )}
                  </ScrollView>
                </>
              )}
            </Pressable>
          </Pressable>
        </Modal>

        {/* Role creation modal */}
        <Modal
          visible={showRoleModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => { setShowRoleModal(false); setEditingRoleId(null); }}
        >
          <Pressable style={styles.modalOverlay} onPress={() => { setShowRoleModal(false); setEditingRoleId(null); }}>
            <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalHeader}>
                <MaterialIcons name="work" size={24} color={theme.colorScheme.primary} />
                <Text style={styles.modalTitle}>{editingRoleId ? "業務編集" : "業務追加"}</Text>
                <TouchableOpacity onPress={() => { setShowRoleModal(false); setEditingRoleId(null); }} style={styles.closeButton}>
                  <MaterialIcons name="close" size={24} color={theme.colorScheme.onSurfaceVariant} />
                </TouchableOpacity>
              </View>

              {/* タブ切替 */}
              <View style={{ flexDirection: "row", marginBottom: theme.spacing.lg, borderBottomWidth: 1, borderBottomColor: theme.colorScheme.outlineVariant }}>
                {(["info", "schedule", "assign"] as const).map((tab) => (
                  <TouchableOpacity
                    key={tab}
                    onPress={() => setRoleModalTab(tab)}
                    style={{ flex: 1, paddingVertical: 10, alignItems: "center", borderBottomWidth: roleModalTab === tab ? 2 : 0, borderBottomColor: theme.colorScheme.primary }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: roleModalTab === tab ? "700" : "400", color: roleModalTab === tab ? theme.colorScheme.primary : theme.colorScheme.onSurfaceVariant }}>
                      {tab === "info" ? "基本情報" : tab === "schedule" ? "スケジュール" : "割り当て"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={{ gap: theme.spacing.lg, marginBottom: theme.spacing.xxl }}>
                {roleModalTab === "info" ? (
                  <>
                    <View style={{ flexDirection: "row", gap: theme.spacing.md }}>
                      <View style={{ width: 60 }}>
                        <Text style={styles.taskInputLabel}>アイコン</Text>
                        <TouchableOpacity
                          style={[styles.taskInput, { justifyContent: "center", alignItems: "center", backgroundColor: newRoleColor + "22", borderColor: newRoleColor + "44" }]}
                          onPress={() => setShowRoleIconPicker(true)}
                        >
                          <Text style={{ fontSize: 20, color: newRoleColor }}>{newRoleIcon || "+"}</Text>
                        </TouchableOpacity>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.taskInputLabel}>業務名</Text>
                        <TextInput
                          style={styles.taskInput}
                          value={newRoleName}
                          onChangeText={setNewRoleName}
                          placeholder="例: キッチン"
                          placeholderTextColor={theme.colorScheme.outline}
                        />
                      </View>
                    </View>
                    <View>
                      <Text style={styles.taskInputLabel}>カラー</Text>
                      <TouchableOpacity
                        onPress={() => setShowRoleColorPicker(true)}
                        style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 6, borderWidth: 1, borderColor: theme.colorScheme.outlineVariant, backgroundColor: theme.colorScheme.surface }}
                      >
                        <View style={{ width: 24, height: 24, borderRadius: 4, backgroundColor: newRoleColor }} />
                        <Text style={{ flex: 1, fontSize: 13, color: theme.colorScheme.onSurface }}>{newRoleColor}</Text>
                        <MaterialIcons name="palette" size={18} color={theme.colorScheme.onSurfaceVariant} />
                      </TouchableOpacity>
                    </View>
                    <View>
                      <Text style={styles.taskInputLabel}>詳細（任意）</Text>
                      <TextInput
                        style={[styles.taskInput, { minHeight: 48 }]}
                        value={newRoleDesc}
                        onChangeText={setNewRoleDesc}
                        placeholder="業務の詳細説明"
                        placeholderTextColor={theme.colorScheme.outline}
                        multiline
                      />
                    </View>
                  </>
                ) : (
                  <>
                    <Text style={{ fontSize: 12, color: theme.colorScheme.onSurfaceVariant, marginBottom: theme.spacing.xs }}>
                      自動配置で使用するスケジュールを設定します。出勤中かつ他の仕事がないスタッフに自動で割り当てられます。
                    </Text>
                    <View>
                      <Text style={[styles.taskInputLabel, { marginBottom: theme.spacing.sm }]}>実施曜日</Text>
                      <View style={{ flexDirection: "row", gap: 4 }}>
                        {["日", "月", "火", "水", "木", "金", "土"].map((label, idx) => {
                          const isOn = newRoleScheduleDays.includes(idx);
                          return (
                            <TouchableOpacity key={idx} onPress={() => setNewRoleScheduleDays((prev) => isOn ? prev.filter((d) => d !== idx) : [...prev, idx])}
                              style={{ width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center", backgroundColor: isOn ? theme.colorScheme.primary : theme.colorScheme.surfaceVariant }}>
                              <Text style={{ fontSize: 13, fontWeight: "600", color: isOn ? theme.colorScheme.onPrimary : theme.colorScheme.onSurfaceVariant }}>{label}</Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                    <View>
                      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                        <Text style={styles.taskInputLabel}>1回の所要時間</Text>
                        <TouchableOpacity onPress={() => setRoleScheduleManual((p) => !p)} hitSlop={8}>
                          <Text style={{ fontSize: 11, color: theme.colorScheme.primary }}>{roleScheduleManual ? "リストから" : "手動入力"}</Text>
                        </TouchableOpacity>
                      </View>
                      {roleScheduleManual ? (
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                          <TextInput style={[styles.taskInput, { flex: 1 }]} value={newRoleScheduleDuration} onChangeText={setNewRoleScheduleDuration} placeholder="分数を入力" placeholderTextColor={theme.colorScheme.outline} keyboardType="numeric" />
                          <Text style={{ fontSize: 12, color: theme.colorScheme.onSurfaceVariant }}>分</Text>
                        </View>
                      ) : (
                        <Picker selectedValue={newRoleScheduleDuration} onValueChange={(v) => setNewRoleScheduleDuration(v)} style={[styles.taskInput, { height: 40, paddingVertical: 0 }] as any}>
                          <Picker.Item label="--分" value="" />
                          {SCHEDULE_DURATION_OPTIONS.map((d) => <Picker.Item key={d.value} label={d.label} value={d.value} />)}
                        </Picker>
                      )}
                    </View>
                    <View>
                      <Text style={styles.taskInputLabel}>必要人数</Text>
                      <Picker selectedValue={newRoleRequiredCount} onValueChange={(v) => setNewRoleRequiredCount(v)} style={[styles.taskInput, { height: 40, paddingVertical: 0 }] as any}>
                        {["1","2","3","4","5"].map((n) => <Picker.Item key={n} label={`${n}名`} value={n} />)}
                      </Picker>
                    </View>
                    {/* 繰り返し間隔 or 開始時間指定 */}
                    <View style={{ flexDirection: "row", gap: theme.spacing.md, alignItems: "flex-end" }}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.taskInputLabel}>繰り返し間隔</Text>
                        <Picker
                          selectedValue={newRoleScheduleInterval}
                          onValueChange={(v) => setNewRoleScheduleInterval(v)}
                          style={[styles.taskInput, { height: 40, paddingVertical: 0 }] as any}
                          enabled={!newRoleUseStartTime}
                        >
                          <Picker.Item label="--" value="" />
                          {SCHEDULE_INTERVAL_OPTIONS.map((d) => <Picker.Item key={d.value} label={d.label} value={d.value} />)}
                        </Picker>
                      </View>
                      <TouchableOpacity
                        onPress={() => setNewRoleUseStartTime((p) => !p)}
                        style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 10 }}
                      >
                        <MaterialIcons name={newRoleUseStartTime ? "check-box" : "check-box-outline-blank"} size={20} color={theme.colorScheme.primary} />
                        <Text style={{ fontSize: 12, color: theme.colorScheme.primary }}>開始時間を指定</Text>
                      </TouchableOpacity>
                    </View>
                    {newRoleUseStartTime && (
                      <View>
                        <Text style={styles.taskInputLabel}>開始時間</Text>
                        <Picker selectedValue={newRoleScheduleStartTime} onValueChange={(v) => setNewRoleScheduleStartTime(v)} style={[styles.taskInput, { height: 40, paddingVertical: 0 }] as any}>
                          <Picker.Item label="--:--" value="" />
                          {SCHEDULE_TIME_OPTIONS.map((t) => <Picker.Item key={t} label={t} value={t} />)}
                        </Picker>
                      </View>
                    )}
                    {newRoleScheduleDays.length > 0 && newRoleScheduleDuration && (newRoleScheduleInterval || newRoleScheduleStartTime) && (
                      <View style={{ backgroundColor: theme.colorScheme.primaryContainer, borderRadius: 8, padding: theme.spacing.md }}>
                        <Text style={{ fontSize: 12, color: theme.colorScheme.onPrimaryContainer }}>
                          毎週 {newRoleScheduleDays.sort((a, b) => a - b).map((d) => ["日", "月", "火", "水", "木", "金", "土"][d]).join("・")}
                          {newRoleUseStartTime && newRoleScheduleStartTime ? ` ${newRoleScheduleStartTime}~` : ""}
                          {" "}{newRoleScheduleDuration}分間
                          {!newRoleUseStartTime && newRoleScheduleInterval ? ` / ${newRoleScheduleInterval}分ごとに繰り返し` : ""}
                          {" "}x {newRoleRequiredCount || "1"}名
                        </Text>
                      </View>
                    )}
                  </>
                )}
                {roleModalTab === "assign" && (
                  <>
                    <Text style={{ fontSize: 12, color: theme.colorScheme.onSurfaceVariant, marginBottom: theme.spacing.xs }}>
                      この業務を誰に割り当てるかを設定します。
                    </Text>
                    <View style={{ flexDirection: "row", gap: theme.spacing.sm, marginBottom: theme.spacing.md }}>
                      <TouchableOpacity
                        onPress={() => setNewRoleAssignMode("anyone")}
                        style={{ flex: 1, paddingVertical: 12, borderRadius: 8, borderWidth: 1.5, borderColor: newRoleAssignMode === "anyone" ? theme.colorScheme.primary : theme.colorScheme.outlineVariant, backgroundColor: newRoleAssignMode === "anyone" ? theme.colorScheme.primaryContainer : theme.colorScheme.surface, alignItems: "center" }}
                      >
                        <MaterialIcons name="groups" size={24} color={newRoleAssignMode === "anyone" ? theme.colorScheme.primary : theme.colorScheme.onSurfaceVariant} />
                        <Text style={{ fontSize: 12, fontWeight: "600", color: newRoleAssignMode === "anyone" ? theme.colorScheme.primary : theme.colorScheme.onSurfaceVariant, marginTop: 4 }}>誰でも</Text>
                        <Text style={{ fontSize: 10, color: theme.colorScheme.onSurfaceVariant, marginTop: 2 }}>出勤中の全員が対象</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => setNewRoleAssignMode("manual")}
                        style={{ flex: 1, paddingVertical: 12, borderRadius: 8, borderWidth: 1.5, borderColor: newRoleAssignMode === "manual" ? theme.colorScheme.primary : theme.colorScheme.outlineVariant, backgroundColor: newRoleAssignMode === "manual" ? theme.colorScheme.primaryContainer : theme.colorScheme.surface, alignItems: "center" }}
                      >
                        <MaterialIcons name="person-add" size={24} color={newRoleAssignMode === "manual" ? theme.colorScheme.primary : theme.colorScheme.onSurfaceVariant} />
                        <Text style={{ fontSize: 12, fontWeight: "600", color: newRoleAssignMode === "manual" ? theme.colorScheme.primary : theme.colorScheme.onSurfaceVariant, marginTop: 4 }}>手動で割り当て</Text>
                        <Text style={{ fontSize: 10, color: theme.colorScheme.onSurfaceVariant, marginTop: 2 }}>指定したスタッフのみ</Text>
                      </TouchableOpacity>
                    </View>
                    {newRoleAssignMode === "manual" && (
                      <View style={{ gap: theme.spacing.xs }}>
                        <Text style={styles.taskInputLabel}>スタッフ選択</Text>
                        {users.map((u) => {
                          const isChecked = roleAssignedUsers.includes(u.uid);
                          return (
                            <TouchableOpacity
                              key={u.uid}
                              onPress={() => setRoleAssignedUsers((prev) => isChecked ? prev.filter((id) => id !== u.uid) : [...prev, u.uid])}
                              style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8, paddingHorizontal: 8, borderRadius: 6, backgroundColor: isChecked ? theme.colorScheme.primaryContainer : "transparent" }}
                            >
                              <MaterialIcons name={isChecked ? "check-box" : "check-box-outline-blank"} size={20} color={isChecked ? theme.colorScheme.primary : theme.colorScheme.outline} />
                              <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: u.color || theme.colorScheme.primary, justifyContent: "center", alignItems: "center" }}>
                                <Text style={{ fontSize: 12, fontWeight: "bold", color: "#fff" }}>{(u.nickname || "?")[0]}</Text>
                              </View>
                              <Text style={{ fontSize: 13, color: theme.colorScheme.onSurface }}>{u.nickname}</Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    )}
                  </>
                )}
              </View>

              <View style={styles.modalButtonContainer}>
                <Button title="キャンセル" onPress={() => { setShowRoleModal(false); setEditingRoleId(null); }} variant="outline" size="medium" style={styles.modalButton} />
                <Button title={editingRoleId ? "保存" : "追加"} onPress={handleSaveRole} variant="primary" size="medium" style={styles.modalButton} />
              </View>
            </Pressable>
          </Pressable>
        </Modal>

        {/* Task creation modal (within a role) */}
        <Modal
          visible={showTaskModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => { setShowTaskModal(false); setEditingTaskId(null); }}
        >
          <Pressable style={styles.modalOverlay} onPress={() => { setShowTaskModal(false); setEditingTaskId(null); }}>
            <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalHeader}>
                <MaterialIcons name={editingTaskId ? "edit" : "add-task"} size={24} color={theme.colorScheme.primary} />
                <Text style={styles.modalTitle}>{editingTaskId ? "タスク編集" : "タスク追加"}</Text>
                <TouchableOpacity onPress={() => { setShowTaskModal(false); setEditingTaskId(null); }} style={styles.closeButton}>
                  <MaterialIcons name="close" size={24} color={theme.colorScheme.onSurfaceVariant} />
                </TouchableOpacity>
              </View>

              {/* タブ切替 */}
              <View style={{ flexDirection: "row", marginBottom: theme.spacing.lg, borderBottomWidth: 1, borderBottomColor: theme.colorScheme.outlineVariant }}>
                {(["info", "schedule", "assign"] as const).map((tab) => (
                  <TouchableOpacity
                    key={tab}
                    onPress={() => setTaskModalTab(tab)}
                    style={{ flex: 1, paddingVertical: 10, alignItems: "center", borderBottomWidth: taskModalTab === tab ? 2 : 0, borderBottomColor: theme.colorScheme.primary }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: taskModalTab === tab ? "700" : "400", color: taskModalTab === tab ? theme.colorScheme.primary : theme.colorScheme.onSurfaceVariant }}>
                      {tab === "info" ? "基本情報" : tab === "schedule" ? "スケジュール" : "割り当て"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={{ gap: theme.spacing.lg, marginBottom: theme.spacing.xxl }}>
                {taskModalTab === "info" ? (
                  <>
                    <View style={{ flexDirection: "row", gap: theme.spacing.md }}>
                      <View style={{ width: 60 }}>
                        <Text style={styles.taskInputLabel}>アイコン</Text>
                        <TouchableOpacity
                          style={[styles.taskInput, { justifyContent: "center", alignItems: "center", backgroundColor: newTaskColor + "22", borderColor: newTaskColor + "44" }]}
                          onPress={() => setShowTaskIconPicker(true)}
                        >
                          <Text style={{ fontSize: 20, color: newTaskColor }}>{newTaskIcon || "+"}</Text>
                        </TouchableOpacity>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.taskInputLabel}>タスク名</Text>
                        <TextInput
                          style={styles.taskInput}
                          value={newTaskName}
                          onChangeText={setNewTaskName}
                          placeholder="例: 洗い物"
                          placeholderTextColor={theme.colorScheme.outline}
                        />
                      </View>
                    </View>
                    <View>
                      <Text style={styles.taskInputLabel}>カラー</Text>
                      <TouchableOpacity
                        onPress={() => setShowTaskColorPicker(true)}
                        style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 6, borderWidth: 1, borderColor: theme.colorScheme.outlineVariant, backgroundColor: theme.colorScheme.surface }}
                      >
                        <View style={{ width: 24, height: 24, borderRadius: 4, backgroundColor: newTaskColor }} />
                        <Text style={{ flex: 1, fontSize: 13, color: theme.colorScheme.onSurface }}>{newTaskColor}</Text>
                        <MaterialIcons name="palette" size={18} color={theme.colorScheme.onSurfaceVariant} />
                      </TouchableOpacity>
                    </View>
                    <View>
                      <Text style={styles.taskInputLabel}>詳細（任意）</Text>
                      <TextInput
                        style={[styles.taskInput, { minHeight: 48 }]}
                        value={newTaskDesc}
                        onChangeText={setNewTaskDesc}
                        placeholder="タスクの詳細説明"
                        placeholderTextColor={theme.colorScheme.outline}
                        multiline
                      />
                    </View>
                  </>
                ) : (
                  <>
                    <Text style={{ fontSize: 12, color: theme.colorScheme.onSurfaceVariant, marginBottom: theme.spacing.xs }}>
                      自動配置で使用するスケジュールを設定します。出勤中かつ他の仕事がないスタッフに自動で割り当てられます。
                    </Text>
                    <View>
                      <Text style={[styles.taskInputLabel, { marginBottom: theme.spacing.sm }]}>実施曜日</Text>
                      <View style={{ flexDirection: "row", gap: 4 }}>
                        {["日", "月", "火", "水", "木", "金", "土"].map((label, idx) => {
                          const isOn = newTaskScheduleDays.includes(idx);
                          return (
                            <TouchableOpacity key={idx} onPress={() => setNewTaskScheduleDays((prev) => isOn ? prev.filter((d) => d !== idx) : [...prev, idx])}
                              style={{ width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center", backgroundColor: isOn ? theme.colorScheme.primary : theme.colorScheme.surfaceVariant }}>
                              <Text style={{ fontSize: 13, fontWeight: "600", color: isOn ? theme.colorScheme.onPrimary : theme.colorScheme.onSurfaceVariant }}>{label}</Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                    <View>
                      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                        <Text style={styles.taskInputLabel}>1回の所要時間</Text>
                        <TouchableOpacity onPress={() => setTaskScheduleManual((p) => !p)} hitSlop={8}>
                          <Text style={{ fontSize: 11, color: theme.colorScheme.primary }}>{taskScheduleManual ? "リストから" : "手動入力"}</Text>
                        </TouchableOpacity>
                      </View>
                      {taskScheduleManual ? (
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                          <TextInput style={[styles.taskInput, { flex: 1 }]} value={newTaskScheduleDuration} onChangeText={setNewTaskScheduleDuration} placeholder="分数を入力" placeholderTextColor={theme.colorScheme.outline} keyboardType="numeric" />
                          <Text style={{ fontSize: 12, color: theme.colorScheme.onSurfaceVariant }}>分</Text>
                        </View>
                      ) : (
                        <Picker selectedValue={newTaskScheduleDuration} onValueChange={(v) => setNewTaskScheduleDuration(v)} style={[styles.taskInput, { height: 40, paddingVertical: 0 }] as any}>
                          <Picker.Item label="--分" value="" />
                          {SCHEDULE_DURATION_OPTIONS.map((d) => <Picker.Item key={d.value} label={d.label} value={d.value} />)}
                        </Picker>
                      )}
                    </View>
                    <View>
                      <Text style={styles.taskInputLabel}>必要人数</Text>
                      <Picker selectedValue={newTaskRequiredCount} onValueChange={(v) => setNewTaskRequiredCount(v)} style={[styles.taskInput, { height: 40, paddingVertical: 0 }] as any}>
                        {["1","2","3","4","5"].map((n) => <Picker.Item key={n} label={`${n}名`} value={n} />)}
                      </Picker>
                    </View>
                    {/* 繰り返し間隔 or 開始時間指定 */}
                    <View style={{ flexDirection: "row", gap: theme.spacing.md, alignItems: "flex-end" }}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.taskInputLabel}>繰り返し間隔</Text>
                        <Picker
                          selectedValue={newTaskScheduleInterval}
                          onValueChange={(v) => setNewTaskScheduleInterval(v)}
                          style={[styles.taskInput, { height: 40, paddingVertical: 0 }] as any}
                          enabled={!newTaskUseStartTime}
                        >
                          <Picker.Item label="--" value="" />
                          {SCHEDULE_INTERVAL_OPTIONS.map((d) => <Picker.Item key={d.value} label={d.label} value={d.value} />)}
                        </Picker>
                      </View>
                      <TouchableOpacity
                        onPress={() => setNewTaskUseStartTime((p) => !p)}
                        style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 10 }}
                      >
                        <MaterialIcons name={newTaskUseStartTime ? "check-box" : "check-box-outline-blank"} size={20} color={theme.colorScheme.primary} />
                        <Text style={{ fontSize: 12, color: theme.colorScheme.primary }}>開始時間を指定</Text>
                      </TouchableOpacity>
                    </View>
                    {newTaskUseStartTime && (
                      <View>
                        <Text style={styles.taskInputLabel}>開始時間</Text>
                        <Picker selectedValue={newTaskScheduleStartTime} onValueChange={(v) => setNewTaskScheduleStartTime(v)} style={[styles.taskInput, { height: 40, paddingVertical: 0 }] as any}>
                          <Picker.Item label="--:--" value="" />
                          {SCHEDULE_TIME_OPTIONS.map((t) => <Picker.Item key={t} label={t} value={t} />)}
                        </Picker>
                      </View>
                    )}
                    {newTaskScheduleDays.length > 0 && newTaskScheduleDuration && (newTaskScheduleInterval || newTaskScheduleStartTime) && (
                      <View style={{ backgroundColor: theme.colorScheme.primaryContainer, borderRadius: 8, padding: theme.spacing.md }}>
                        <Text style={{ fontSize: 12, color: theme.colorScheme.onPrimaryContainer }}>
                          毎週 {newTaskScheduleDays.sort((a, b) => a - b).map((d) => ["日", "月", "火", "水", "木", "金", "土"][d]).join("・")}
                          {newTaskUseStartTime && newTaskScheduleStartTime ? ` ${newTaskScheduleStartTime}~` : ""}
                          {" "}{newTaskScheduleDuration}分間
                          {!newTaskUseStartTime && newTaskScheduleInterval ? ` / ${newTaskScheduleInterval}分ごとに繰り返し` : ""}
                          {" "}x {newTaskRequiredCount || "1"}名
                        </Text>
                      </View>
                    )}
                  </>
                )}
                {taskModalTab === "assign" && (
                  <>
                    <Text style={{ fontSize: 12, color: theme.colorScheme.onSurfaceVariant, marginBottom: theme.spacing.xs }}>
                      このタスクを誰に割り当てるかを設定します。
                    </Text>
                    <View style={{ flexDirection: "row", gap: theme.spacing.sm, marginBottom: theme.spacing.md }}>
                      <TouchableOpacity
                        onPress={() => setNewTaskAssignMode("anyone")}
                        style={{ flex: 1, paddingVertical: 12, borderRadius: 8, borderWidth: 1.5, borderColor: newTaskAssignMode === "anyone" ? theme.colorScheme.primary : theme.colorScheme.outlineVariant, backgroundColor: newTaskAssignMode === "anyone" ? theme.colorScheme.primaryContainer : theme.colorScheme.surface, alignItems: "center" }}
                      >
                        <MaterialIcons name="groups" size={24} color={newTaskAssignMode === "anyone" ? theme.colorScheme.primary : theme.colorScheme.onSurfaceVariant} />
                        <Text style={{ fontSize: 12, fontWeight: "600", color: newTaskAssignMode === "anyone" ? theme.colorScheme.primary : theme.colorScheme.onSurfaceVariant, marginTop: 4 }}>誰でも</Text>
                        <Text style={{ fontSize: 10, color: theme.colorScheme.onSurfaceVariant, marginTop: 2 }}>出勤中の全員が対象</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => setNewTaskAssignMode("manual")}
                        style={{ flex: 1, paddingVertical: 12, borderRadius: 8, borderWidth: 1.5, borderColor: newTaskAssignMode === "manual" ? theme.colorScheme.primary : theme.colorScheme.outlineVariant, backgroundColor: newTaskAssignMode === "manual" ? theme.colorScheme.primaryContainer : theme.colorScheme.surface, alignItems: "center" }}
                      >
                        <MaterialIcons name="person-add" size={24} color={newTaskAssignMode === "manual" ? theme.colorScheme.primary : theme.colorScheme.onSurfaceVariant} />
                        <Text style={{ fontSize: 12, fontWeight: "600", color: newTaskAssignMode === "manual" ? theme.colorScheme.primary : theme.colorScheme.onSurfaceVariant, marginTop: 4 }}>手動で割り当て</Text>
                        <Text style={{ fontSize: 10, color: theme.colorScheme.onSurfaceVariant, marginTop: 2 }}>指定したスタッフのみ</Text>
                      </TouchableOpacity>
                    </View>
                    {newTaskAssignMode === "manual" && (
                      <View style={{ gap: theme.spacing.xs }}>
                        <Text style={styles.taskInputLabel}>スタッフ選択</Text>
                        {users.map((u) => {
                          const isChecked = taskAssignedUsers.includes(u.uid);
                          return (
                            <TouchableOpacity
                              key={u.uid}
                              onPress={() => setTaskAssignedUsers((prev) => isChecked ? prev.filter((id) => id !== u.uid) : [...prev, u.uid])}
                              style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8, paddingHorizontal: 8, borderRadius: 6, backgroundColor: isChecked ? theme.colorScheme.primaryContainer : "transparent" }}
                            >
                              <MaterialIcons name={isChecked ? "check-box" : "check-box-outline-blank"} size={20} color={isChecked ? theme.colorScheme.primary : theme.colorScheme.outline} />
                              <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: u.color || theme.colorScheme.primary, justifyContent: "center", alignItems: "center" }}>
                                <Text style={{ fontSize: 12, fontWeight: "bold", color: "#fff" }}>{(u.nickname || "?")[0]}</Text>
                              </View>
                              <Text style={{ fontSize: 13, color: theme.colorScheme.onSurface }}>{u.nickname}</Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    )}
                  </>
                )}
              </View>

              <View style={styles.modalButtonContainer}>
                <Button title="キャンセル" onPress={() => { setShowTaskModal(false); setEditingTaskId(null); }} variant="outline" size="medium" style={styles.modalButton} />
                <Button title={editingTaskId ? "保存" : "追加"} onPress={handleSaveTask} variant="primary" size="medium" style={styles.modalButton} />
              </View>
            </Pressable>
          </Pressable>
        </Modal>

        {/* ===== Time Segment Type Modal ===== */}
        <Modal visible={showTypeModal} transparent animationType="fade" onRequestClose={() => { setShowTypeModal(false); setEditingTypeId(null); }}>
          <Pressable style={styles.modalOverlay} onPress={() => { setShowTypeModal(false); setEditingTypeId(null); }}>
            <Pressable style={[styles.modalContent, { maxWidth: 400 }]} onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalHeader}>
                <MaterialIcons name="timer" size={20} color={theme.colorScheme.primary} />
                <Text style={styles.modalTitle}>{editingTypeId ? "タイプ編集" : "タイプ追加"}</Text>
                <TouchableOpacity onPress={() => { setShowTypeModal(false); setEditingTypeId(null); }} hitSlop={8}>
                  <Ionicons name="close" size={22} color={theme.colorScheme.onSurfaceVariant} />
                </TouchableOpacity>
              </View>

              <View style={{ gap: theme.spacing.md }}>
                {/* Icon */}
                <View>
                  <Text style={styles.taskInputLabel}>アイコン</Text>
                  <TouchableOpacity
                    style={[styles.taskInput, { justifyContent: "center", alignItems: "center", backgroundColor: newTypeColor + "22", borderColor: newTypeColor + "44", width: 60 }]}
                    onPress={() => setShowTypeIconPicker(true)}
                  >
                    <Text style={{ fontSize: 20, color: newTypeColor }}>{newTypeIcon || "+"}</Text>
                  </TouchableOpacity>
                </View>

                {/* Name */}
                <View>
                  <Text style={styles.taskInputLabel}>名前</Text>
                  <TextInput style={styles.taskInput} value={newTypeName} onChangeText={setNewTypeName} placeholder="例: 休憩、授業" placeholderTextColor={theme.colorScheme.outline} />
                </View>

                {/* Color */}
                <View>
                  <Text style={styles.taskInputLabel}>カラー</Text>
                  <TouchableOpacity
                    onPress={() => setShowTypeColorPicker(true)}
                    style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 6, borderWidth: 1, borderColor: theme.colorScheme.outlineVariant, backgroundColor: theme.colorScheme.surface }}
                  >
                    <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: newTypeColor }} />
                    <Text style={{ flex: 1, fontSize: 13, color: theme.colorScheme.onSurface }}>{newTypeColor}</Text>
                    <MaterialIcons name="palette" size={18} color={theme.colorScheme.onSurfaceVariant} />
                  </TouchableOpacity>
                </View>

                {/* Wage mode */}
                <View>
                  <Text style={styles.taskInputLabel}>給与モード</Text>
                  <View style={{ borderWidth: 1, borderColor: theme.colorScheme.outlineVariant, borderRadius: theme.shape.small, overflow: "hidden" }}>
                    <Picker
                      selectedValue={newTypeWageMode}
                      onValueChange={(v) => setNewTypeWageMode(v as WageMode)}
                      style={{ height: 40, color: theme.colorScheme.onSurface, border: "none", outline: "none", backgroundColor: "transparent" } as any}
                    >
                      <Picker.Item label="給与除外" value="exclude" />
                      <Picker.Item label="通常単価で含む" value="include" />
                      <Picker.Item label="別単価" value="custom_rate" />
                    </Picker>
                  </View>
                </View>

                {/* Custom rate (only for custom_rate mode) */}
                {newTypeWageMode === "custom_rate" && (
                  <View>
                    <Text style={styles.taskInputLabel}>時給（円）</Text>
                    <TextInput
                      style={styles.taskInput}
                      value={newTypeCustomRate}
                      onChangeText={setNewTypeCustomRate}
                      placeholder="例: 800"
                      placeholderTextColor={theme.colorScheme.outline}
                      keyboardType="numeric"
                    />
                  </View>
                )}

                {/* タスク・業務の重複許可 */}
                <TouchableOpacity
                  style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 4 }}
                  onPress={() => setNewTypeAllowTaskOverlap(!newTypeAllowTaskOverlap)}
                >
                  <MaterialIcons
                    name={newTypeAllowTaskOverlap ? "check-box" : "check-box-outline-blank"}
                    size={22}
                    color={newTypeAllowTaskOverlap ? theme.colorScheme.primary : theme.colorScheme.onSurfaceVariant}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, fontWeight: "600", color: theme.colorScheme.onSurface }}>タスク・業務の配置を許可</Text>
                    <Text style={{ fontSize: 11, color: theme.colorScheme.onSurfaceVariant }}>OFFの場合、この時間帯にタスク・業務は配置されません</Text>
                  </View>
                </TouchableOpacity>
              </View>

              <View style={styles.modalButtonContainer}>
                <Button title="キャンセル" onPress={() => { setShowTypeModal(false); setEditingTypeId(null); }} variant="outline" size="medium" style={styles.modalButton} />
                <Button title={editingTypeId ? "保存" : "追加"} onPress={handleSaveType} variant="primary" size="medium" style={styles.modalButton} />
              </View>
            </Pressable>
          </Pressable>
        </Modal>

      </View>

      {/* カラーピッカーModal */}
      <Modal
        visible={showRoleColorPicker || showTaskColorPicker || showTypeColorPicker}
        transparent
        animationType="fade"
        onRequestClose={() => { setShowRoleColorPicker(false); setShowTaskColorPicker(false); setShowTypeColorPicker(false); }}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" }}
          onPress={() => { setShowRoleColorPicker(false); setShowTaskColorPicker(false); setShowTypeColorPicker(false); }}
        >
          <Pressable style={{ backgroundColor: theme.colorScheme.surface, borderRadius: 16, padding: 20, width: "85%", maxWidth: 360 }} onPress={(e) => e.stopPropagation()}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: "bold", color: theme.colorScheme.onSurface }}>カラー選択</Text>
              <TouchableOpacity onPress={() => { setShowRoleColorPicker(false); setShowTaskColorPicker(false); setShowTypeColorPicker(false); }} hitSlop={8}>
                <MaterialIcons name="close" size={22} color={theme.colorScheme.onSurfaceVariant} />
              </TouchableOpacity>
            </View>
            <View style={{ alignItems: "center", marginBottom: 16 }}>
              <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: showRoleColorPicker ? newRoleColor : showTaskColorPicker ? newTaskColor : newTypeColor, borderWidth: 2, borderColor: theme.colorScheme.outlineVariant }} />
            </View>
            <View style={{ gap: 3 }}>
              {COLOR_GRID.map((row, ri) => (
                <View key={ri} style={{ flexDirection: "row", gap: 3, justifyContent: "center" }}>
                  {row.map((c) => {
                    const currentColor = showRoleColorPicker ? newRoleColor : showTaskColorPicker ? newTaskColor : newTypeColor;
                    const isSelected = currentColor === c;
                    return (
                      <TouchableOpacity
                        key={c}
                        onPress={() => {
                          if (showRoleColorPicker) setNewRoleColor(c);
                          else if (showTaskColorPicker) setNewTaskColor(c);
                          else setNewTypeColor(c);
                        }}
                        style={{ width: 32, height: 32, borderRadius: 6, backgroundColor: c, borderWidth: isSelected ? 2.5 : 0, borderColor: theme.colorScheme.onSurface }}
                      />
                    );
                  })}
                </View>
              ))}
            </View>
            <TouchableOpacity
              onPress={() => { setShowRoleColorPicker(false); setShowTaskColorPicker(false); setShowTypeColorPicker(false); }}
              style={{ marginTop: 20, alignSelf: "stretch", paddingVertical: 10, borderRadius: 8, backgroundColor: theme.colorScheme.primary, alignItems: "center" }}
            >
              <Text style={{ fontSize: 14, fontWeight: "600", color: theme.colorScheme.onPrimary }}>決定</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* アイコンピッカーModal */}
      <Modal
        visible={showRoleIconPicker || showTaskIconPicker || showTypeIconPicker}
        transparent
        animationType="fade"
        onRequestClose={() => { setShowRoleIconPicker(false); setShowTaskIconPicker(false); setShowTypeIconPicker(false); }}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" }}
          onPress={() => { setShowRoleIconPicker(false); setShowTaskIconPicker(false); setShowTypeIconPicker(false); }}
        >
          <Pressable style={{ backgroundColor: theme.colorScheme.surface, borderRadius: 16, padding: 20, width: "85%", maxWidth: 400 }} onPress={(e) => e.stopPropagation()}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: "bold", color: theme.colorScheme.onSurface }}>アイコン選択</Text>
              <TouchableOpacity onPress={() => { setShowRoleIconPicker(false); setShowTaskIconPicker(false); setShowTypeIconPicker(false); }} hitSlop={8}>
                <MaterialIcons name="close" size={22} color={theme.colorScheme.onSurfaceVariant} />
              </TouchableOpacity>
            </View>
            <View style={{ alignItems: "center", marginBottom: 16 }}>
              <View style={{
                width: 52, height: 52, borderRadius: 12,
                backgroundColor: (showRoleIconPicker ? newRoleColor : showTaskIconPicker ? newTaskColor : newTypeColor) + "22",
                borderWidth: 2, borderColor: (showRoleIconPicker ? newRoleColor : showTaskIconPicker ? newTaskColor : newTypeColor) + "44",
                justifyContent: "center", alignItems: "center",
              }}>
                <Text style={{ fontSize: 28, color: showRoleIconPicker ? newRoleColor : showTaskIconPicker ? newTaskColor : newTypeColor }}>
                  {showRoleIconPicker ? (newRoleIcon || "?") : showTaskIconPicker ? (newTaskIcon || "?") : (newTypeIcon || "?")}
                </Text>
              </View>
            </View>
            <ScrollView style={{ maxHeight: 280 }} showsVerticalScrollIndicator={false}>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, justifyContent: "center" }}>
                {ICON_OPTIONS.map((icon) => {
                  const currentIcon = showRoleIconPicker ? newRoleIcon : showTaskIconPicker ? newTaskIcon : newTypeIcon;
                  const isSelected = currentIcon === icon;
                  return (
                    <TouchableOpacity
                      key={icon}
                      onPress={() => {
                        if (showRoleIconPicker) setNewRoleIcon(icon);
                        else if (showTaskIconPicker) setNewTaskIcon(icon);
                        else setNewTypeIcon(icon);
                      }}
                      style={{
                        width: 44, height: 44, borderRadius: 10, justifyContent: "center", alignItems: "center",
                        backgroundColor: isSelected ? (showRoleIconPicker ? newRoleColor : showTaskIconPicker ? newTaskColor : newTypeColor) + "22" : theme.colorScheme.surfaceVariant + "44",
                        borderWidth: isSelected ? 2 : 0,
                        borderColor: showRoleIconPicker ? newRoleColor : showTaskIconPicker ? newTaskColor : newTypeColor,
                      }}
                    >
                      <Text style={{ fontSize: 22 }}>{icon}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
            <TouchableOpacity
              onPress={() => { setShowRoleIconPicker(false); setShowTaskIconPicker(false); setShowTypeIconPicker(false); }}
              style={{ marginTop: 20, alignSelf: "stretch", paddingVertical: 10, borderRadius: 8, backgroundColor: theme.colorScheme.primary, alignItems: "center" }}
            >
              <Text style={{ fontSize: 14, fontWeight: "600", color: theme.colorScheme.onPrimary }}>決定</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

    </View>
  );
};
