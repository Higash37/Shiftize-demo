/** @file GanttChartMonthView.tsx
 *  @description ガントチャートの最上位コンポーネント。月間のシフトをガントチャート・カレンダー・
 *    モバイル縦型ビューなど複数のレイアウトで表示し、シフトの追加・編集・削除を管理する。
 *    デバイスサイズに応じて自動的に表示モードを切り替える。
 */

// 【このファイルの位置づけ】
// - import元: 多数の子コンポーネント + サービス + ユーティリティ
// - importされる先: master-view/ganttView, home-view など上位の画面コンポーネント
// - 関係図:
//   GanttChartMonthView（このファイル）
//     ├→ MonthSelectorBar: 月選択バー + ツールバーボタン群
//     ├→ GanttHeader: 時間軸ヘッダー（9:00, 10:00, ...）
//     ├→ GanttChartBody: ガントチャート本体（FlatListで行を描画）
//     │    └→ GanttChartRow: 1行分の描画（日付セル + グリッド + 情報セル）
//     │         └→ GanttChartGrid: シフトバーの描画
//     ├→ MobileVerticalView: タブレット/モバイル用のカレンダー+1日ビュー
//     ├→ GoogleCalendarView: Googleカレンダー風の週間ビュー
//     ├→ CalendarView: カレンダー形式のビュー
//     ├→ ShiftModalRenderer: シフト追加・編集モーダルの管理
//     └→ 各種モーダル（PayrollDetail, BatchConfirm, ShiftHistory, AutoSchedulePreview）

/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useRef, useCallback, useMemo, Suspense, lazy } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
  useWindowDimensions,
  DevSettings,
} from "react-native";
import {
  Shift,
  ShiftItem,
  ShiftStatus,
  ClassTimeSlot,
  TimeSlot,
  ShiftType,
} from "@/common/common-models/ModelIndex";
import { ServiceProvider } from "@/services/ServiceProvider";
import { format, addMonths, subMonths } from "date-fns";
import { ja } from "date-fns/locale";
import { Ionicons } from "@expo/vector-icons";
import CustomScrollView from "@/common/common-ui/ui-scroll/ScrollViewComponent";
import { DatePickerModal } from "@/modules/reusable-widgets/calendar/modals/DatePickerModal";
import { Picker } from "@react-native-picker/picker";
import { useAuth } from "@/services/auth/useAuth";
import {
  calculateMinutesBetween,
  calculateWage,
  calculateTotalWage,
} from "@/common/common-utils/util-shift/wageCalculator";
import {
  DEFAULT_SHIFT_STATUS_CONFIG,
  ShiftStatusConfig,
} from "@/common/common-models/model-shift/shiftTypes";
import { createGanttChartMonthViewStyles } from "./GanttChartMonthView.styles";
import { useThemedStyles } from "@/common/common-theme/md3/useThemedStyles";
import { GanttChartMonthViewProps } from "./GanttChartProps";
import {
  generateTimeOptions,
  groupShiftsByOverlap,
  groupNonOverlappingShifts,
  positionToTime,
  timeToPosition,
} from "./gantt-chart-common/utils";
import { SHIFT_HOURS, BREAKPOINTS } from "@/common/common-constants/BoundaryConstants";
import {
  DateCell,
  GanttChartGrid,
  GanttChartInfo,
  EmptyCell,
  ShiftSelectionProvider,
} from "./gantt-chart-common/components";
import { ShiftModalRenderer, ShiftModalRendererHandle } from "./gantt-chart-common/ShiftModalRenderer";
// --- 遅延読み込み（コード分割） ---
// lazy() を使うと、このコンポーネントのコードは「実際に表示される時」まで読み込まれない。
// これにより初期表示のバンドルサイズが小さくなり、ページ読み込みが速くなる。
// .then(module => ({ default: module.名前 })) は、named export を default export に変換する書き方。
// Suspense コンポーネントと組み合わせて使う（読み込み中は fallback の内容を表示）。
const PayrollDetailModal = lazy(() =>
  import("./view-modals/PayrollDetailModal").then(module => ({ default: module.PayrollDetailModal }))
);
const BatchConfirmModal = lazy(() => import("./view-modals/BatchConfirmModal"));
const ShiftHistoryModal = lazy(() =>
  import("./view-modals/ShiftHistoryModal").then(module => ({ default: module.ShiftHistoryModal }))
);
const AutoSchedulePreviewModal = lazy(() =>
  import("./view-modals/AutoSchedulePreviewModal").then(module => ({ default: module.AutoSchedulePreviewModal }))
);

import { MonthSelectorBar } from "./gantt-chart-common/MonthSelectorBar";
import { GanttHeader } from "./gantt-chart-common/GanttHeader";
import { GanttChartBody } from "./gantt-chart-common/GanttChartBody";
import { CalendarView } from "./gantt-chart-common/CalendarView";
import { useGanttShiftActions } from "./gantt-chart-common/useGanttShiftActions";
import { MobileVerticalView } from "./gantt-chart-common/MobileVerticalView";
import { GoogleCalendarView } from "./gantt-chart-common/GoogleCalendarView";
import type { ShiftHistoryEntry } from "@/services/shift-history/shiftHistoryLogger";
import { QuickShiftUrlModal } from "@/modules/master-view/quick-shift-url/QuickShiftUrlModal";
import { useStaffRolesContext } from "@/common/common-context/StaffRolesContext";
import { useShiftTaskAssignmentsContext } from "@/common/common-context/ShiftTaskAssignmentsContext";
import { usePendingShiftBadge } from "@/common/common-context/PendingShiftBadgeContext";
import { computeAutoSchedule, ProposedAssignment } from "@/modules/master-view/auto-scheduling/autoScheduler";

// --- 静的データ（コンポーネント外に定義することで毎レンダーの再生成を防止） ---
// Reactコンポーネントの関数内に定義すると、レンダーのたびに新しいオブジェクトが作られる。
// コンポーネント外に定義すれば、アプリ全体で1回だけ作成される。
const SIMPLIFIED_STATUS_CONFIGS: ShiftStatusConfig[] = [
  { status: "approved", label: "承認済み", color: "#90caf9", canEdit: false, description: "承認されたシフト" },
  { status: "pending", label: "申請中", color: "#FFD700", canEdit: true, description: "新規申請されたシフト" },
  { status: "rejected", label: "却下", color: "#ffcdd2", canEdit: true, description: "却下されたシフト" },
  { status: "deletion_requested", label: "削除申請中", color: "#FF9F0A", canEdit: false, description: "削除申請中のシフト" },
  { status: "deleted", label: "削除済み", color: "#9e9e9e", canEdit: false, description: "削除されたシフト" },
  { status: "completed", label: "完了", color: "#4CAF50", canEdit: false, description: "完了したシフト" },
];

const HOUR_LABELS = Array.from(
  { length: SHIFT_HOURS.END_HOUR_INCLUSIVE - SHIFT_HOURS.START_HOUR_INCLUSIVE + 1 },
  (_, i) => `${SHIFT_HOURS.START_HOUR_INCLUSIVE + i}:00`
);

const HALF_HOUR_LINES = Array.from(
  { length: (SHIFT_HOURS.END_HOUR_INCLUSIVE - SHIFT_HOURS.START_HOUR_INCLUSIVE) * 2 + 1 },
  (_, i) => {
    const hour = SHIFT_HOURS.START_HOUR_INCLUSIVE + Math.floor(i / 2);
    const min = i % 2 === 0 ? "00" : "30";
    return `${hour}:${min}`;
  }
);

// --- メインコンポーネント ---
// React.FC<GanttChartMonthViewProps> は「GanttChartMonthViewProps型のpropsを受け取るReact関数コンポーネント」。
// FC = FunctionComponent の略。
// 分割代入 { shifts, days, ... } でpropsの各プロパティを直接変数として使える。
// classTimes = [] はデフォルト引数。propsにclassTimesが渡されなかった場合、空配列になる。
const GanttChartMonthViewComponent: React.FC<GanttChartMonthViewProps> = ({
  shifts,
  days,
  users,
  selectedDate,
  onShiftPress,
  onShiftUpdate,
  onMonthChange,
  classTimes = [],
  refreshPage,
}) => {
  // useThemedStyles: テーマに応じたスタイルを生成するカスタムフック
  const styles = useThemedStyles(createGanttChartMonthViewStyles);

  // --- State（コンポーネントの状態管理） ---
  // useState は「値」と「値を更新する関数」のペアを返す。
  // useState<型>(初期値) でジェネリクス<型>を指定すると、型安全になる。

  // ステータス設定（承認・却下などの色やラベル）
  const [statusConfigs, setStatusConfigs] = useState<ShiftStatusConfig[]>(
    SIMPLIFIED_STATUS_CONFIGS
  );
  const [showYearMonthPicker, setShowYearMonthPicker] = useState(false); // 年月ピッカーの表示/非表示
  // useRef: 再レンダリングを起こさない値を保持する。ここではモーダルの操作ハンドルを保持。
  // <ShiftModalRendererHandle>(null) → 初期値はnull、型はShiftModalRendererHandle。
  const modalRef = useRef<ShiftModalRendererHandle>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [scrollPosition, setScrollPosition] = useState(0);
  // batchModal: 一括操作モーダルの状態。型をインラインで定義している（{ visible, type }）。
  const [batchModal, setBatchModal] = useState<{
    visible: boolean;
    type: "approve" | "delete" | null; // ユニオン型: この3つのどれかしか入らない
  }>({ visible: false, type: null });
  const [colorMode, setColorMode] = useState<"status" | "user">("status");
  const [showPayrollModal, setShowPayrollModal] = useState(false);
  const [viewMode, setViewMode] = useState<"gantt" | "calendar" | "compact">("gantt");
  const [useGoogleLayout, setUseGoogleLayout] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showQuickUrlModal, setShowQuickUrlModal] = useState(false);
  const [showAutoScheduleModal, setShowAutoScheduleModal] = useState(false);
  const [autoScheduleProposals, setAutoScheduleProposals] = useState<ProposedAssignment[]>([]);
  const [isApplyingAutoSchedule, setIsApplyingAutoSchedule] = useState(false);

  const { roles, tasks, roleAssignments, taskAssignments } = useStaffRolesContext();
  const { assignments: existingAssignments, fetchForMonth, bulkSave } = useShiftTaskAssignmentsContext();
  const { markAsRead } = usePendingShiftBadge();

  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  // --- 派生値（useMemoで計算結果をキャッシュ） ---
  // useMemo は「依存配列が変わらない限り、前回の計算結果を再利用する」フック。
  // 重い計算やオブジェクト生成を毎レンダーで繰り返すのを防ぐ。
  // useMemo<戻り値の型>(() => 計算処理, [依存する値の配列])

  // デバイスタイプ判定: 画面幅からPC/タブレット/モバイルを判定
  const deviceType = useMemo<"desktop" | "tablet" | "mobile">(() => {
    if (windowWidth <= BREAKPOINTS.MOBILE_MAX_WIDTH_INCLUSIVE) return "mobile";
    if (windowWidth < BREAKPOINTS.TABLET_MAX_WIDTH_EXCLUSIVE) return "tablet";
    return "desktop";
  }, [windowWidth]);

  // 画面サイズによる表示モード自動判定（画面分割時用）
  const shouldUseCompactView = useMemo(() => {
    const isCompactWidth =
      windowWidth < BREAKPOINTS.TABLET_MIN_WIDTH_INCLUSIVE &&
      windowWidth >= BREAKPOINTS.COMPACT_VIEW_MIN_WIDTH_INCLUSIVE;
    return isCompactWidth && viewMode === "gantt";
  }, [windowWidth, viewMode]);
  const { user } = useAuth();
  const { saveShift, deleteShift, updateShiftStatus } = useGanttShiftActions({
    user,
    users, // usersパラメータを追加
    ...(onShiftUpdate && { onShiftUpdate }),
    // refreshPageを使わずにstate更新のみで処理
  });

  // 月の自動配置データを取得
  useEffect(() => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth() + 1;
    fetchForMonth(year, month);
  }, [selectedDate, fetchForMonth]);

  // 時間選択オプションを生成（プルダウン用の "09:00", "09:15", ... のリスト）
  const timeOptions = useMemo(() => generateTimeOptions(), []);

  // --- レイアウト幅の計算（windowWidthから導出） ---
  // ガントチャートの横幅を3つのカラムに分割する。
  // 画面幅(windowWidth) = 日付列 + ガントチャート列 + 情報列 + スクロールバー
  const scrollBarWidth = 21;                                          // スクロールバーの幅（固定値）
  const dateColumnWidth = 31;                                         // 日付列の幅（"1日(月)" などを表示する列）
  const infoColumnWidth = Math.max(windowWidth * 0.22, 180);         // 情報列: 画面幅の22%、ただし最小180px
  const ganttColumnWidth = windowWidth - dateColumnWidth - infoColumnWidth - scrollBarWidth; // 残りがガントチャート本体

  useEffect(() => {
    // ステータス設定をリアルタイム取得
    const unsubscribe = ServiceProvider.settings.onShiftStatusConfigChanged(
      (data) => {
        if (data) {
          const updatedConfigs: ShiftStatusConfig[] =
            DEFAULT_SHIFT_STATUS_CONFIG.map((config) => ({
              ...config,
              ...data[config.status],
            }));
          setStatusConfigs(updatedConfigs);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  const getStatusConfig = (status: string): ShiftStatusConfig => {
    const config = statusConfigs.find((config) => config.status === status) || statusConfigs[0];
    return config || {
      status: "pending" as ShiftStatus,
      label: "未定",
      color: "#E5E5E5",
      canEdit: true,
      description: "未定義のステータス"
    };
  };

  // 表示対象のシフト（deleted, purgedは除外）
  const visibleShifts = useMemo(() => {
    return shifts.filter((s) => s.status !== "deleted" && s.status !== "purged");
  }, [shifts]);

  // コンポーネントが期待するroleプロパティを追加したusers配列
  const usersWithRole = useMemo(() => {
    return users.map(user => ({ ...user, role: "staff" as string }));
  }, [users]);

  // 日付ごとにシフトをグループ化（useMemoで安定化）
  const rows = useMemo(() => {
    const result: [string, ShiftItem[]][] = days.flatMap((date) => {
      const dayShifts = visibleShifts.filter((s) => s.date === date);
      if (dayShifts.length === 0) return [[date, []]];
      const groups = groupNonOverlappingShifts(dayShifts);
      // 空のグループを除外
      return groups
        .filter((group) => group.length > 0)
        .map((group) => [date, group] as [string, ShiftItem[]]);
    });
    return result;
  }, [days, visibleShifts]);
  // 授業時間帯のセル判定
  function isClassTime(time: string) {
    return false;
  }

  // 時間セル計算: ガントチャート列の幅を時間ラベル数で割り、さらに2で割る（30分=1セル）
  // 例: ganttColumnWidth=780, HOUR_LABELS=14個 → 780/(14-1)/2 = 30px/セル
  const cellWidth = ganttColumnWidth / (HOUR_LABELS.length - 1) / 2;

  // --- Handlers（イベントハンドラー） ---
  // useCallback は「依存配列が変わらない限り、同じ関数オブジェクトを返す」フック。
  // 子コンポーネントに渡す関数を安定化し、不要な再レンダリングを防ぐ。

  // 前月に移動する関数
  const handlePrevMonth = useCallback(() => {
    const newDate = subMonths(selectedDate, 1);
    if (onMonthChange) {
      onMonthChange(newDate.getFullYear(), newDate.getMonth());
    }
  }, [selectedDate, onMonthChange]);
  // 翌月に移動する関数
  const handleNextMonth = useCallback(() => {
    const newDate = addMonths(selectedDate, 1);
    if (onMonthChange) {
      onMonthChange(newDate.getFullYear(), newDate.getMonth());
    }
  }, [selectedDate, onMonthChange]);
  // DatePickerModalで日付が選択されたときの処理
  const handleDateSelect = useCallback((date: Date) => {
    setShowYearMonthPicker(false);
    if (onMonthChange) {
      onMonthChange(date.getFullYear(), date.getMonth());
    }
  }, [onMonthChange]);

  const handleBatchDelete = async () => {
    const rejectedShifts = shifts.filter(
      (shift) => shift.status === "rejected"
    );
    rejectedShifts.forEach((shift) => {
      updateShiftStatus(shift.id, "deleted"); // 一括削除で削除済みに変更
    });
    // リアルタイムリスナーで自動更新されるため、リフレッシュ不要
  };

  // --- シフトバー・グリッド全体押下時のモーダル表示 ---
  const handleShiftPress = useCallback(
    (shift: ShiftItem) => {
      modalRef.current?.openEdit(shift);
      // モーダル表示後に既読処理（再レンダリングを遅延）
      requestAnimationFrame(() => markAsRead(shift.id));
    },
    [markAsRead]
  );

  const handleHistoryEntryAction = useCallback(
    (entry: ShiftHistoryEntry) => {
      if (!entry) return;

      const existingShift = entry.shiftId
        ? shifts.find((shiftItem) => shiftItem.id === entry.shiftId)
        : undefined;

      if (existingShift) {
        modalRef.current?.openEdit(existingShift);
        setShowHistoryModal(false);
        return;
      }

      const snapshot = entry.nextSnapshot || entry.prevSnapshot;
      if (!snapshot) return;

      modalRef.current?.openAdd({
        date: snapshot.date || entry.date,
        startTime: snapshot.startTime || "09:00",
        endTime: snapshot.endTime || "11:00",
        userId: snapshot.userId || "",
        nickname: snapshot.nickname || "",
        status: (snapshot.status as ShiftStatus) || "pending",
        classes: (snapshot.classes as ClassTimeSlot[] | undefined) || [],
      });
      setShowHistoryModal(false);
    },
    [shifts]
  );

  // 空白セルをクリックした時の処理（シフト追加モーダル表示）
  const handleEmptyCellClick = useCallback(
    (date: string, position: number) => {
      const startTime = positionToTime(position);
      const startHour = Number.parseInt(startTime.split(":")[0] || "0", 10);
      const startMinute = Number.parseInt(startTime.split(":")[1] || "0", 10);
      let endHour = startHour + 1;
      let endMinute = startMinute;
      if (endHour > SHIFT_HOURS.END_HOUR_INCLUSIVE) {
        endHour = SHIFT_HOURS.END_HOUR_INCLUSIVE;
        endMinute = 0;
      }
      const endTime = `${endHour.toString().padStart(2, "0")}:${endMinute
        .toString()
        .padStart(2, "0")}`;

      const isMaster = user?.role === "master";
      const defaultUserId = isMaster ? "" : user?.uid || "";
      const defaultNickname = isMaster
        ? ""
        : users.find((u) => u.uid === user?.uid)?.nickname || "";

      modalRef.current?.openAdd({
        date,
        startTime,
        endTime,
        userId: defaultUserId,
        nickname: defaultNickname,
        status: isMaster ? "approved" : "pending",
        classes: [],
        });
    },
    [positionToTime, user, users]
  );
  // シフト追加
  const handleAddShift = useCallback(() => {
    const isMaster = user?.role === "master";
    const defaultUserId = isMaster ? "" : user?.uid || "";
    const defaultNickname = isMaster
      ? ""
      : users.find((u) => u.uid === user?.uid)?.nickname || "";

    modalRef.current?.openAdd({
      date: format(selectedDate, "yyyy-MM-dd"),
      startTime: "09:00",
      endTime: "11:00",
      userId: defaultUserId,
      nickname: defaultNickname,
      status: isMaster ? "approved" : "pending",
      classes: [],
    });
  }, [selectedDate, user, users]);

  // GanttChartBodyのonMonthChange用コールバック（インライン関数の再生成を防止）
  const handleBodyMonthChange = useCallback((month: { year: number; month: number }) => {
    if (onMonthChange) {
      onMonthChange(month.year, month.month);
    }
  }, [onMonthChange]);

  // 色モード切替
  const handleColorModeToggle = useCallback(() => {
    setColorMode(prev => prev === "status" ? "user" : "status");
  }, []);

  // 給与詳細モーダル表示
  const handlePayrollPress = useCallback(() => {
    setShowPayrollModal(true);
  }, []);

  // ビューモード切替（ガントチャートとカレンダーのみ）
  const handleViewToggle = useCallback(() => {
    setViewMode(prev => prev === "gantt" ? "calendar" : "gantt");
  }, []);

  // ユーザーID→colorマップを作成（募集シフト用の黒色を含む）
  const userColorsMap = React.useMemo(() => {
    const map: Record<string, string> = {};
    users.forEach((u) => {
      if (u.uid && u.color) map[u.uid] = u.color;
    });

    // 募集シフト用の黒色を追加

    return map;
  }, [users]);

  // ユーザーID→ユーザー情報のMapをメモ化（レンダーごとの再生成を防止）
  // 複数箇所で参照されるため、独立したuseMemoで一度だけ構築する
  const userMap = useMemo(() => new Map(users.map(u => [u.uid, u])), [users]);

  // 月の合計金額・時間を計算（useMemoで直接導出、useEffect不要）
  const totalWage = useMemo(() => {
    if (!shifts || shifts.length === 0) return { totalAmount: 0, totalHours: 0 };

    const selectedYear = selectedDate.getFullYear();
    const selectedMonth = selectedDate.getMonth() + 1;

    let totalMinutes = 0;
    let totalAmount = 0;

    for (const shift of shifts) {
      if (shift.status !== "approved" && shift.status !== "completed") continue;
      // 日付文字列から年月を直接取得（new Date不要）
      const shiftYear = Number(shift.date.slice(0, 4));
      const shiftMonth = Number(shift.date.slice(5, 7));
      if (shiftYear !== selectedYear || shiftMonth !== selectedMonth) continue;

      const hourlyWage = userMap.get(shift.userId)?.hourlyWage || 1100;
      const { totalMinutes: workMinutes, totalWage: workWage } = calculateTotalWage(
        { startTime: shift.startTime, endTime: shift.endTime, classes: shift.classes || [] },
        hourlyWage
      );
      totalMinutes += workMinutes;
      totalAmount += workWage;
    }

    return { totalHours: totalMinutes / 60, totalAmount: Math.round(totalAmount) };
  }, [shifts, userMap, selectedDate]);

  // MobileVerticalView / GoogleCalendarView 共通コールバック
  const handleMobileEmptyCellClick = useCallback((date: string, time: string, userId: string) => {
    const targetUser = users.find(u => u.uid === userId);
    const startTime = time;
    const [hour] = time.split(':').map(Number);
    const endTime = `${(hour ?? 0) + 1}:00`;

    modalRef.current?.openAdd({
      date,
      startTime,
      endTime,
      userId,
      nickname: targetUser?.nickname || "",
      status: user?.role === "master" ? "approved" : "pending",
      classes: [],
    });
  }, [users, user]);

  const handleClassAdd = useCallback((shift: ShiftItem) => {
    modalRef.current?.openEdit(shift);
  }, []);

  // 自動配置の実行
  const handleAutoSchedule = useCallback(() => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth() + 1;
    const storeId = user?.storeId || "";

    const userNamesMap: Record<string, string> = {};
    users.forEach((u) => { userNamesMap[u.uid] = u.nickname; });

    const proposals = computeAutoSchedule({
      shifts: shifts.map((s) => ({
        id: s.id,
        userId: s.userId,
        date: s.date,
        startTime: s.startTime,
        endTime: s.endTime,
        status: s.status,
      })),
      roles,
      tasks,
      roleAssignments,
      taskAssignments,
      existingAssignments,
      storeId,
      year,
      month,
      userNames: userNamesMap,
    });

    setAutoScheduleProposals(proposals);
    setShowAutoScheduleModal(true);
  }, [selectedDate, user, users, shifts, roles, tasks, roleAssignments, taskAssignments, existingAssignments]);

  // 自動配置の適用
  const handleApplyAutoSchedule = useCallback(async (proposals: ProposedAssignment[]) => {
    setIsApplyingAutoSchedule(true);
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth() + 1;

    const toSave = proposals.map((p) => ({
      shiftId: p.shiftId,
      taskId: p.taskId,
      roleId: p.roleId,
      storeId: p.storeId,
      userId: p.userId,
      scheduledDate: p.scheduledDate,
      scheduledStartTime: p.scheduledStartTime,
      scheduledEndTime: p.scheduledEndTime,
      source: p.source as "auto" | "manual",
    }));

    await bulkSave(toSave, year, month);
    setIsApplyingAutoSchedule(false);
    setShowAutoScheduleModal(false);
  }, [selectedDate, bulkSave]);

  // --- 本体 ---
  return (
    <ShiftSelectionProvider>
    <View style={styles.container}>
      {/* 月選択バー＋右上ボタン群 - タブレット表示時は非表示 */}
      {deviceType !== "tablet" && (
        <MonthSelectorBar
          selectedDate={selectedDate}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onShowYearMonthPicker={() => setShowYearMonthPicker(true)}
          onReload={() => {
            if (typeof window !== "undefined" && window.location) {
              window.location.reload();
            } else if (Platform.OS !== "web") {
              DevSettings.reload();
            }
          }}
          onBatchApprove={() => setBatchModal({ visible: true, type: "approve" })}
          onBatchDelete={() => setBatchModal({ visible: true, type: "delete" })}
          isLoading={isLoading}
          totalAmount={totalWage.totalAmount}
          totalHours={totalWage.totalHours}
          shifts={shifts}
          users={usersWithRole}
          colorMode={colorMode}
          onColorModeToggle={handleColorModeToggle}
          onPayrollPress={handlePayrollPress}
          viewMode={viewMode === "compact" ? "gantt" : viewMode}
          onViewModeToggle={handleViewToggle}
          isMobileView={deviceType !== "desktop"}
          deviceType={deviceType}
          useGoogleLayout={useGoogleLayout}
          onToggleGoogleLayout={() => setUseGoogleLayout(!useGoogleLayout)}
          onOpenHistory={() => setShowHistoryModal(true)}
          onQuickUrlPress={() => setShowQuickUrlModal(true)}
          storeId={user?.storeId || ""}
          onAutoSchedule={handleAutoSchedule}
        />
      )}
      {/* 年月ピッカーモーダル - タブレット表示時は非表示 */}
      {deviceType !== "tablet" && (
        <DatePickerModal
          isVisible={showYearMonthPicker}
          initialDate={selectedDate}
          onClose={() => setShowYearMonthPicker(false)}
          onSelect={handleDateSelect}
        />
      )}
      {/* バッチ確認モーダル */}
      {batchModal.visible && (
        <Suspense fallback={null}>
          <BatchConfirmModal
            visible={batchModal.visible}
            type={batchModal.type}
            shifts={shifts}
            isLoading={isLoading}
            styles={styles}
            setBatchModal={setBatchModal}
            setIsLoading={setIsLoading}
            {...(refreshPage && { refreshPage })}
          />
        </Suspense>
      )}
      {/* 本体 - ビューモードとデバイスに応じて切り替え */}
      {deviceType === "mobile" ? (
        /* モバイル用縦型ビュー */
        <MobileVerticalView
          shifts={shifts}
          users={usersWithRole}
          selectedDate={selectedDate}
          onShiftPress={handleShiftPress}
          {...(onMonthChange && { onMonthChange })}
          onEmptyCellClick={handleMobileEmptyCellClick}
          onClassAdd={handleClassAdd}
          colorMode={colorMode}
          getStatusConfig={getStatusConfig}
          styles={styles}
        />
      ) : deviceType === "tablet" ? (
        /* タブレット用もモバイル縦型ビューを使用 */
        <MobileVerticalView
          shifts={shifts}
          users={usersWithRole}
          selectedDate={selectedDate}
          onShiftPress={handleShiftPress}
          {...(onMonthChange && { onMonthChange })}
          onEmptyCellClick={handleMobileEmptyCellClick}
          onClassAdd={handleClassAdd}
          colorMode={colorMode}
          getStatusConfig={getStatusConfig}
          styles={styles}
        />
      ) : useGoogleLayout ? (
        /* Googleカレンダー風レイアウト */
        <GoogleCalendarView
          shifts={shifts}
          users={usersWithRole}
          selectedDate={selectedDate}
          onShiftPress={handleShiftPress}
          {...(onMonthChange && { onMonthChange })}
          onEmptyCellClick={handleMobileEmptyCellClick}
          onAddShift={handleAddShift}
          colorMode={colorMode}
          styles={styles}
        />
      ) : viewMode === "gantt" && shouldUseCompactView ? (
        /* 画面分割時はモバイル縦型ビューを使用 */
        <MobileVerticalView
          shifts={shifts}
          users={usersWithRole}
          selectedDate={selectedDate}
          onShiftPress={handleShiftPress}
          {...(onMonthChange && { onMonthChange })}
          onEmptyCellClick={handleMobileEmptyCellClick}
          onClassAdd={handleClassAdd}
          colorMode={colorMode}
          getStatusConfig={getStatusConfig}
          styles={styles}
        />
      ) : viewMode === "gantt" ? (
        /* 横スクロールなしで1画面に収める */
        <View style={{ flex: 1 }}>
          <GanttHeader
            hourLabels={HOUR_LABELS}
            dateColumnWidth={dateColumnWidth}
            ganttColumnWidth={ganttColumnWidth}
            infoColumnWidth={infoColumnWidth}
          />
          <GanttChartBody
            days={days}
            rows={rows}
            dateColumnWidth={dateColumnWidth}
            ganttColumnWidth={ganttColumnWidth}
            infoColumnWidth={infoColumnWidth}
            cellWidth={cellWidth}
            halfHourLines={HALF_HOUR_LINES}
            isClassTime={isClassTime}
            getStatusConfig={getStatusConfig}
            handleShiftPress={handleShiftPress}
            handleEmptyCellClick={handleEmptyCellClick}
            styles={styles}
            userColorsMap={userColorsMap}
            colorMode={colorMode}
            allShifts={shifts}
            selectedDate={selectedDate}
            onDateSelect={(date) => {
              // 日付選択時の処理
            }}
            {...(onMonthChange && { onMonthChange: handleBodyMonthChange })}
            users={usersWithRole}
          />
        </View>
      ) : (
        /* カレンダービューは横スクロール不要 */
        <CalendarView
          shifts={shifts}
          users={usersWithRole}
          selectedDate={selectedDate}
          onShiftPress={handleShiftPress}
          {...(onMonthChange && {
            onMonthChange: (month: { year: number; month: number }) =>
              onMonthChange(month.year, month.month)
          })}
          styles={styles}
        />
      )}
      {/* シフト編集・追加モーダル（独立コンポーネントで状態管理） */}
      <ShiftModalRenderer
        ref={modalRef}
        users={users}
        timeOptions={timeOptions}
        statusConfigs={statusConfigs}
        styles={styles}
        saveShift={saveShift}
        deleteShift={deleteShift}
        updateShiftStatus={updateShiftStatus}
        user={user}
        shifts={shifts}
      />
      {/* 給与詳細モーダル */}
      {showPayrollModal && (
        <Suspense fallback={null}>
          <PayrollDetailModal
            visible={showPayrollModal}
            onClose={() => setShowPayrollModal(false)}
            shifts={shifts}
            users={users}
            selectedDate={selectedDate}
          />
        </Suspense>
      )}
      {/* 履歴モーダル */}
      {showHistoryModal && (
        <Suspense fallback={null}>
          <ShiftHistoryModal
            visible={showHistoryModal}
            onClose={() => setShowHistoryModal(false)}
            storeId={user?.storeId || ""}
            selectedDate={selectedDate}
            onEntryAction={handleHistoryEntryAction}
          />
        </Suspense>
      )}

      {/* クイックURL発行モーダル */}
      {user?.storeId && user?.uid && (
        <QuickShiftUrlModal
          visible={showQuickUrlModal}
          storeId={user.storeId}
          userId={user.uid}
          onClose={() => setShowQuickUrlModal(false)}
        />
      )}

      {/* 自動配置プレビューモーダル */}
      {showAutoScheduleModal && (
        <Suspense fallback={null}>
          <AutoSchedulePreviewModal
            visible={showAutoScheduleModal}
            onClose={() => setShowAutoScheduleModal(false)}
            proposals={autoScheduleProposals}
            onApply={handleApplyAutoSchedule}
            isApplying={isApplyingAutoSchedule}
          />
        </Suspense>
      )}

    </View>
    </ShiftSelectionProvider>
  );
};

// React.memo でラップしてメモ化
// React.memo は「propsが変わらない限り再レンダリングしない」高階コンポーネント（HOC）。
// 親コンポーネントが再レンダリングしても、このコンポーネントのpropsが同じなら描画をスキップできる。
export const GanttChartMonthView = React.memo(GanttChartMonthViewComponent);
