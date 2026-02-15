/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef, useCallback, useMemo, Suspense, lazy } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
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
import {
  DateCell,
  GanttChartGrid,
  GanttChartInfo,
  EmptyCell,
  ShiftSelectionProvider,
} from "./gantt-chart-common/components";
import { ShiftModalRenderer, ShiftModalRendererHandle } from "./gantt-chart-common/ShiftModalRenderer";
// モーダルコンポーネントを遅延読み込み
const PayrollDetailModal = lazy(() =>
  import("./view-modals/PayrollDetailModal").then(module => ({ default: module.PayrollDetailModal }))
);
const BatchConfirmModal = lazy(() => import("./view-modals/BatchConfirmModal"));
const ShiftHistoryModal = lazy(() =>
  import("./view-modals/ShiftHistoryModal").then(module => ({ default: module.ShiftHistoryModal }))
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
  const styles = useThemedStyles(createGanttChartMonthViewStyles);
  // 簡略化されたステータス設定（承認済み、申請中、却下、削除済み、完了のみ）
  const simplifiedStatusConfigs: ShiftStatusConfig[] = [
    {
      status: "approved",
      label: "承認済み",
      color: "#90caf9",
      canEdit: false,
      description: "承認されたシフト",
    },
    {
      status: "pending",
      label: "申請中",
      color: "#FFD700",
      canEdit: true,
      description: "新規申請されたシフト",
    },
    {
      status: "rejected",
      label: "却下",
      color: "#ffcdd2",
      canEdit: true,
      description: "却下されたシフト",
    },
    {
      status: "deleted",
      label: "削除済み",
      color: "#9e9e9e",
      canEdit: false,
      description: "削除されたシフト",
    },
    {
      status: "completed",
      label: "完了",
      color: "#4CAF50",
      canEdit: false,
      description: "完了したシフト",
    },
  ];

  const [statusConfigs, setStatusConfigs] = useState<ShiftStatusConfig[]>(
    simplifiedStatusConfigs
  );
  const [showYearMonthPicker, setShowYearMonthPicker] = useState(false);
  const modalRef = useRef<ShiftModalRendererHandle>(null);
  const [isLoading, setIsLoading] = useState(false); // モーダルのローディング状態用（オーバーレイなし）
  const [refreshKey, setRefreshKey] = useState(0); // 強制再レンダリング用
  const [scrollPosition, setScrollPosition] = useState(0); // スクロール位置保存用
  const [batchModal, setBatchModal] = useState<{
    visible: boolean;
    type: "approve" | "delete" | null;
  }>({ visible: false, type: null });
  const [colorMode, setColorMode] = useState<"status" | "user">("status"); // デフォルトはステータス色
  const [showPayrollModal, setShowPayrollModal] = useState(false); // 給与詳細モーダル表示状態
  const [viewMode, setViewMode] = useState<"gantt" | "calendar" | "compact">("gantt"); // ビューモード（デフォルトはガントチャート）
  const [deviceType, setDeviceType] = useState<"desktop" | "tablet" | "mobile">("desktop"); // デバイスタイプ
  const [useGoogleLayout, setUseGoogleLayout] = useState(false); // Googleカレンダーレイアウトを使用するか
  const [showHistoryModal, setShowHistoryModal] = useState(false); // 履歴モーダル表示状態
  const [showQuickUrlModal, setShowQuickUrlModal] = useState(false); // URL発行モーダル表示状態

  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  // 画面サイズによる表示モード自動判定（画面分割時用）
  const shouldUseCompactView = useMemo(() => {
    return windowWidth < 768 && windowWidth >= 500 && viewMode === "gantt"; // 500px〜768pxの狭い幅でガントチャートモードの場合は分割表示
  }, [windowWidth, viewMode]);
  const { user } = useAuth();
  const { saveShift, deleteShift, updateShiftStatus } = useGanttShiftActions({
    user,
    users, // usersパラメータを追加
    ...(onShiftUpdate && { onShiftUpdate }),
    // refreshPageを使わずにstate更新のみで処理
  });

  // 時間選択オプションを生成
  const timeOptions = generateTimeOptions();

  const screenWidth = Dimensions.get("window").width;
  const scrollBarWidth = 21; // スクロールバーの幅（余白含む）
  const dateColumnWidth = 31; // 日付列の幅
  const infoColumnWidth = Math.max(screenWidth * 0.22, 180); // カレンダー列の幅を広げる
  const ganttColumnWidth = screenWidth - dateColumnWidth - infoColumnWidth - scrollBarWidth; // ガントチャート列
  
  // デバイスタイプの判定
  useEffect(() => {
    const checkDeviceType = () => {
      const width = Dimensions.get("window").width;
      if (width <= 600) {
        setDeviceType("mobile");
      } else if (width <= 1024) {
        setDeviceType("tablet");
      } else {
        setDeviceType("desktop");
      }
    };
    
    checkDeviceType();
    
    // ウィンドウサイズ変更の監視
    const subscription = Dimensions.addEventListener('change', checkDeviceType);
    
    return () => subscription?.remove();
  }, []);

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
    // Viewモードでは縦線を一切表示しない
    return false;
  }

  // 1時間ごとのラベル
  const hourLabels = Array.from({ length: 22 - 9 + 1 }, (_, i) => {
    const hour = 9 + i;
    return `${hour}:00`;
  });

  // 30分ごとの線
  const halfHourLines = Array.from({ length: (22 - 9) * 2 + 1 }, (_, i) => {
    const hour = 9 + Math.floor(i / 2);
    const min = i % 2 === 0 ? "00" : "30";
    return `${hour}:${min}`;
  });

  // 時間セル計算
  const cellWidth = ganttColumnWidth / (hourLabels.length - 1) / 2;
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
    },
    []
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
      const startHour = parseInt(startTime.split(":")[0] || "0");
      const startMinute = parseInt(startTime.split(":")[1] || "0");
      let endHour = startHour + 1;
      let endMinute = startMinute;
      if (endHour > 22) {
        endHour = 22;
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

  // 月の全シフトから金額と時間を計算（選択された月のシフトのみ）
  const calculateMonthlyTotals = useCallback(() => {
    let totalMinutes = 0;
    let totalAmount = 0;

    // シフトがない場合は0を返す
    if (!shifts || shifts.length === 0) {
      return {
        totalHours: 0,
        totalAmount: 0,
      };
    }

    // 選択中の年月を取得
    const selectedYear = selectedDate.getFullYear();
    const selectedMonth = selectedDate.getMonth() + 1; // JavaScriptは0から始まるため+1

    // 選択された月に含まれる承認済みと承認待ちシフトを対象に計算
    const targetShifts = shifts.filter((shift) => {
      // シフトの日付から年月を抽出
      const shiftDate = new Date(shift.date);
      const shiftYear = shiftDate.getFullYear();
      const shiftMonth = shiftDate.getMonth() + 1;

      // 選択された月のシフトかつ承認済みまたは完了済みシフトをフィルタリング
      return (
        shiftYear === selectedYear &&
        shiftMonth === selectedMonth &&
        (shift.status === "approved" ||
          shift.status === "completed")
      );
    });

    targetShifts.forEach((shift) => {
      // ユーザーの時給を取得（未設定の場合は1,100円を自動適用）
      const user = users.find((u) => u.uid === shift.userId);
      // 時給が設定されていない場合は1,100円をデフォルト値として使用
      const hourlyWage = user?.hourlyWage || 1100;

      // 授業時間を除外したシフト時間の計算
      const classes = shift.classes || [];
      const { totalMinutes: workMinutes, totalWage: workWage } =
        calculateTotalWage(
          {
            startTime: shift.startTime,
            endTime: shift.endTime,
            classes: classes,
          },
          hourlyWage
        );

      totalMinutes += workMinutes;
      totalAmount += workWage;
    });

    return {
      totalHours: totalMinutes / 60,
      totalAmount: Math.round(totalAmount),
    };
  }, [shifts, users]); // 合計金額と時間を保持するstate
  // 初期値は空のシフトセットだと金額を表示しないように
  const [totalWage, setTotalWage] = useState({ totalAmount: 0, totalHours: 0 });

  // シフトまたはユーザーが変更されたら再計算
  useEffect(() => {
    // シフトがない場合は何もしない
    if (!shifts || shifts.length === 0) {
      setTotalWage({ totalAmount: 0, totalHours: 0 });
      return;
    }

    const { totalAmount, totalHours } = calculateMonthlyTotals();
    setTotalWage({ totalAmount, totalHours });
  }, [shifts, users, calculateMonthlyTotals]);

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
            hourLabels={hourLabels}
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
            halfHourLines={halfHourLines}
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
            {...(onMonthChange && { onMonthChange: (month: any) => onMonthChange(month.getFullYear(), month.getMonth()) })}
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

    </View>
    </ShiftSelectionProvider>
  );
};

// React.memoでラップしてメモ化
export const GanttChartMonthView = React.memo(GanttChartMonthViewComponent);
