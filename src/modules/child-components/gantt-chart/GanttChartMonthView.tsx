import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { RecruitmentShiftService } from "@/services/recruitment-shift/recruitmentShiftService";
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
} from "react-native";
import {
  Shift,
  ShiftItem,
  ShiftStatus,
  ClassTimeSlot,
  TimeSlot,
  ShiftType,
} from "@/common/common-models/ModelIndex";
import {
  doc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/services/firebase/firebase";
import { format, addMonths, subMonths } from "date-fns";
import { ja } from "date-fns/locale";
import { Ionicons } from "@expo/vector-icons";
import CustomScrollView from "@/common/common-ui/ui-scroll/ScrollViewComponent";
import { DatePickerModal } from "@/modules/child-components/calendar/calendar-components/calendar-modal/datePickerModal/DatePickerModal";
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
import styles from "./gantt-chart-styles/GanttChartMonthView.styles";
import { GanttChartMonthViewProps } from "./gantt-chart-types/GanttChartProps";
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
} from "./gantt-chart-common/components";
import { EditShiftModalView } from "./view-modals/EditShiftModalView";
import { AddShiftModalView } from "./view-modals/AddShiftModalView";
import { PayrollDetailModal } from "./view-modals/PayrollDetailModal";
import { MonthSelectorBar } from "./gantt-chart-common/MonthSelectorBar";
import { GanttHeader } from "./gantt-chart-common/GanttHeader";
import { GanttChartBody } from "./gantt-chart-common/GanttChartBody";
import { CalendarView } from "./gantt-chart-common/CalendarView";
import { useGanttShiftActions } from "./gantt-chart-common/useGanttShiftActions";
import BatchConfirmModal from "./view-modals/BatchConfirmModal";
import { MobileVerticalView } from "./gantt-chart-common/MobileVerticalView";
import { TabletCompactView } from "./gantt-chart-common/TabletCompactView";
import { GoogleCalendarView } from "./gantt-chart-common/GoogleCalendarView";

export const GanttChartMonthView: React.FC<GanttChartMonthViewProps> = ({
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
  const [editingShift, setEditingShift] = useState<ShiftItem | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newShiftData, setNewShiftData] = useState<{
    date: string;
    startTime: string;
    endTime: string;
    userId: string;
    nickname: string;
    status: ShiftStatus;
    classes: ClassTimeSlot[];
    extendedTasks?: any[]; // 拡張タスク配列を追加
  }>({
    date: "",
    startTime: "09:00",
    endTime: "11:00",
    userId: "",
    nickname: "",
    status: "approved",
    classes: [], // 授業時間の初期値
    extendedTasks: [], // 拡張タスクの初期値
  });
  const [selectedUserId, setSelectedUserId] = useState("");
  const [isLoading, setIsLoading] = useState(false); // モーダルのローディング状態用（オーバーレイなし）
  const [refreshKey, setRefreshKey] = useState(0); // 強制再レンダリング用
  const [scrollPosition, setScrollPosition] = useState(0); // スクロール位置保存用
  const [batchModal, setBatchModal] = useState<{
    visible: boolean;
    type: "approve" | "delete" | null;
  }>({ visible: false, type: null });
  const [colorMode, setColorMode] = useState<"status" | "user">("status"); // デフォルトはステータス色
  const [showPayrollModal, setShowPayrollModal] = useState(false); // 給与詳細モーダル表示状態
  const [viewMode, setViewMode] = useState<"gantt" | "calendar">("gantt"); // ビューモード（デフォルトはガントチャート）
  const [deviceType, setDeviceType] = useState<"desktop" | "tablet" | "mobile">("desktop"); // デバイスタイプ
  const [useGoogleLayout, setUseGoogleLayout] = useState(false); // Googleカレンダーレイアウトを使用するか
  const { user } = useAuth();
  const { saveShift, deleteShift, updateShiftStatus } = useGanttShiftActions({
    user,
    users, // usersパラメータを追加
    onShiftUpdate,
    // refreshPageを使わずにstate更新のみで処理
  });

  // 時間選択オプションを生成
  const timeOptions = generateTimeOptions();

  const screenWidth = Dimensions.get("window").width;
  const dateColumnWidth = 50;
  const infoColumnWidth = Math.max(screenWidth * 0.18, 150);
  const ganttColumnWidth = screenWidth - dateColumnWidth - infoColumnWidth;
  
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
    // Firestoreからステータス設定を取得
    const configRef = doc(db, "settings", "shiftStatus");
    const unsubscribe = onSnapshot(
      configRef, 
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          const updatedConfigs: ShiftStatusConfig[] =
            DEFAULT_SHIFT_STATUS_CONFIG.map((config) => ({
              ...config,
              ...data[config.status],
            }));
          setStatusConfigs(updatedConfigs);
        }
      },
      (error) => {
        // 認証エラーの場合は無視（ログアウト時の正常な動作）
        if (error.code === 'permission-denied') {
          return;
        }
        console.error("GanttChartMonthView settings realtime error:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  const getStatusConfig = (status: string) => {
    return (
      statusConfigs.find((config) => config.status === status) ||
      statusConfigs[0]
    );
  };

  // 表示対象のシフト（deleted, purgedは除外）
  const visibleShifts = useMemo(() => 
    shifts.filter((s) => s.status !== "deleted" && s.status !== "purged"),
    [shifts]
  );

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
  const handlePrevMonth = () => {
    const newDate = subMonths(selectedDate, 1);
    if (onMonthChange) {
      onMonthChange(newDate.getFullYear(), newDate.getMonth());
    }
  };
  // 翌月に移動する関数
  const handleNextMonth = () => {
    const newDate = addMonths(selectedDate, 1);
    if (onMonthChange) {
      onMonthChange(newDate.getFullYear(), newDate.getMonth());
    }
  };
  // DatePickerModalで日付が選択されたときの処理
  const handleDateSelect = (date: Date) => {
    setShowYearMonthPicker(false);
    if (onMonthChange) {
      onMonthChange(date.getFullYear(), date.getMonth());
    }
  };

  // シフト編集
  const handleEditShift = useCallback((shift: ShiftItem) => {
    setEditingShift(shift);
    setNewShiftData({
      date: shift.date,
      startTime: shift.startTime,
      endTime: shift.endTime,
      userId: shift.userId,
      nickname: shift.nickname,
      status: shift.status,
      classes: shift.classes || [],
      extendedTasks: shift.extendedTasks || [], // 拡張タスクも含める
    });
    setShowEditModal(true);
  }, []);

  // シフト削除
  const handleDeleteShift = async (shiftId: string) => {
    
    // 編集中のシフトの情報を取得
    const targetShift = editingShift || shifts.find(s => s.id === shiftId);
    
    if (targetShift) {
      // 通知対忌の削除機能を使用
      await deleteShift(targetShift);
    } else {
      // フォールバック: 従来の方法
      const newStatus: ShiftStatus = "deleted";
      await updateShiftStatus(shiftId, newStatus);
    }
    
    setShowEditModal(false); // モーダルを閉じる

    // リアルタイムリスナーで自動更新されるため、リフレッシュ不要
  };

  const handleBatchDelete = async () => {
    const rejectedShifts = shifts.filter(
      (shift) => shift.status === "rejected"
    );
    rejectedShifts.forEach((shift) => {
      updateShiftStatus(shift.id, "deleted"); // 一括削除で削除済みに変更
    });
    // リアルタイムリスナーで自動更新されるため、リフレッシュ不要
  };

  // シフト保存
  const handleSaveShift = useCallback(async () => {
    if (
      !newShiftData.date ||
      !newShiftData.startTime ||
      !newShiftData.endTime
    ) {
      Alert.alert("エラー", "日付と時間を正しく入力してください。");
      return;
    }
    
    // ユーザー選択チェック
    if (!newShiftData.userId) {
      Alert.alert("エラー", "ユーザーまたは募集を選択してください。");
      return;
    }
    
    try {
      // 募集シフトの場合は専用のサービスを使用
      if (newShiftData.userId === "recruitment") {
        const recruitmentShiftData = {
          storeId: user?.storeId || "",
          date: newShiftData.date,
          startTime: newShiftData.startTime,
          endTime: newShiftData.endTime,
          subject: "", // 必要に応じて件名を追加
          notes: "", // 必要に応じてメモを追加
          createdBy: user?.uid || "", // 必須フィールドを追加
          status: "open" as const, // 必須フィールドを追加
          // オプショナルフィールドは省略（undefinedを避ける）
        };
        
        try {
          const shiftId = await RecruitmentShiftService.createRecruitmentShift(recruitmentShiftData);
          Alert.alert("成功", "募集シフトを作成しました。");
        } catch (recruitmentError: any) {
          console.error("募集シフト作成エラー詳細:", recruitmentError);
          console.error("エラーメッセージ:", recruitmentError?.message);
          console.error("エラーコード:", recruitmentError?.code);
          
          // Firebase エラーの詳細を表示
          if (recruitmentError?.code) {
            Alert.alert("エラー", `募集シフトの作成に失敗しました。\nエラーコード: ${recruitmentError.code}\nメッセージ: ${recruitmentError.message}`);
          } else {
            Alert.alert("エラー", `募集シフトの作成に失敗しました。\n${recruitmentError?.message || "不明なエラーが発生しました。"}`);
          }
          
          throw recruitmentError; // エラーを再スロー
        }
      } else {
        // 通常のシフト保存
        // 編集モーダルが開いている場合のみeditingShiftを渡す
        const shiftToUpdate = showEditModal ? editingShift : null;
        await saveShift(shiftToUpdate, newShiftData);
      }
      
      // 状態をクリア（順番を守る）
      setShowEditModal(false);
      setShowAddModal(false);
      setEditingShift(null);
      setNewShiftData({
        date: "",
        startTime: "09:00",
        endTime: "11:00",
        userId: "",
        nickname: "",
        status: "approved",
        classes: [],
        extendedTasks: [], // 拡張タスクもリセット
      });

          
      // リアルタイムリスナーで自動更新されるため、リフレッシュ不要
      
    } catch (error) {
      console.error("シフト保存エラー:", error);
      Alert.alert("エラー", "シフトの保存に失敗しました。");
    }
  }, [editingShift, newShiftData, saveShift, user]);

  // --- シフトバー・グリッド全体押下時のモーダル表示 ---
  const handleShiftPress = useCallback(
    (shift: ShiftItem) => {
      const userObj = users.find((u) => u.uid === shift.userId);
      setEditingShift(shift);
      setNewShiftData({
        date: shift.date,
        startTime: shift.startTime,
        endTime: shift.endTime,
        userId: shift.userId,
        nickname: userObj ? userObj.nickname : "",
        status: shift.status,
        classes: shift.classes || [],
        extendedTasks: shift.extendedTasks || [], // 拡張タスクも含める
      });
      setShowEditModal(true);
    },
    [users]
  );

  // 空白セルをクリックした時の処理
  const handleEmptyCellClick = useCallback(
    (date: string, position: number) => {
      const startTime = positionToTime(position);
      const startHour = parseInt(startTime.split(":")[0]);
      const startMinute = parseInt(startTime.split(":")[1]);
      let endHour = startHour + 1;
      let endMinute = startMinute;
      if (endHour > 22) {
        endHour = 22;
        endMinute = 0;
      }
      const endTime = `${endHour.toString().padStart(2, "0")}:${endMinute
        .toString()
        .padStart(2, "0")}`;

      // マスター権限の場合はユーザーIDをクリアして選択できるようにする
      // 一般ユーザーの場合は自分自身のIDを設定
      const isMaster = user?.role === "master";
      const defaultUserId = isMaster ? "" : user?.uid || "";
      const defaultNickname = isMaster
        ? ""
        : users.find((u) => u.uid === user?.uid)?.nickname || "";
      setNewShiftData({
        date,
        startTime,
        endTime,
        userId: defaultUserId,
        nickname: defaultNickname,
        status: isMaster ? "approved" : "pending", // マスター権限の場合は直接承認済みに
        classes: [],
        extendedTasks: [], // 拡張タスクを初期化
      });
      setShowAddModal(true);
    },
    [positionToTime]
  );
  // シフト追加
  const handleAddShift = useCallback(() => {
    // マスター権限の場合はユーザーIDをクリアして選択できるようにする
    // 一般ユーザーの場合は自分自身のIDを設定
    const isMaster = user?.role === "master";
    const defaultUserId = isMaster ? "" : user?.uid || "";
    const defaultNickname = isMaster
      ? ""
      : users.find((u) => u.uid === user?.uid)?.nickname || "";

    setNewShiftData({
      date: format(selectedDate, "yyyy-MM-dd"),
      startTime: "09:00",
      endTime: "11:00",
      userId: defaultUserId,
      nickname: defaultNickname,
      status: isMaster ? "approved" : "pending",
      classes: [],
      extendedTasks: [], // 拡張タスクを初期化
    });
    setShowAddModal(true);
  }, [selectedDate, user, users]);

  // 色モード切替
  const handleColorModeToggle = useCallback(() => {
    setColorMode(prev => prev === "status" ? "user" : "status");
  }, []);

  // 給与詳細モーダル表示
  const handlePayrollPress = useCallback(() => {
    setShowPayrollModal(true);
  }, []);

  // ビューモード切替
  const handleViewToggle = useCallback(() => {
    setViewMode(prev => prev === "gantt" ? "calendar" : "gantt");
  }, []);

  // ユーザーID→colorマップを作成
  const userColorsMap = React.useMemo(() => {
    const map: Record<string, string> = {};
    users.forEach((u) => {
      if (u.uid && u.color) map[u.uid] = u.color;
    });
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
  

  // --- 本体 ---
  return (
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
              try {
                const { AppRegistry } = require("react-native");
                if (AppRegistry && AppRegistry.reload) {
                  AppRegistry.reload();
                }
              } catch (e) {}
            }
          }}
          onBatchApprove={() => setBatchModal({ visible: true, type: "approve" })}
          onBatchDelete={() => setBatchModal({ visible: true, type: "delete" })}
          isLoading={isLoading}
          totalAmount={totalWage.totalAmount}
          totalHours={totalWage.totalHours}
          shifts={shifts}
          users={users}
          colorMode={colorMode}
          onColorModeToggle={handleColorModeToggle}
          onPayrollPress={handlePayrollPress}
          viewMode={viewMode}
          onViewModeToggle={handleViewToggle}
          isMobileView={deviceType !== "desktop"}
          deviceType={deviceType}
          useGoogleLayout={useGoogleLayout}
          onToggleGoogleLayout={() => setUseGoogleLayout(!useGoogleLayout)}
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
      <BatchConfirmModal
        visible={batchModal.visible}
        type={batchModal.type}
        shifts={shifts}
        isLoading={isLoading}
        styles={styles}
        setBatchModal={setBatchModal}
        setIsLoading={setIsLoading}
        refreshPage={refreshPage}
      />
      {/* 本体 - ビューモードとデバイスに応じて切り替え */}
      {deviceType === "mobile" ? (
        /* モバイル用縦型ビュー */
        <MobileVerticalView
          shifts={shifts}
          users={users}
          selectedDate={selectedDate}
          onShiftPress={handleShiftPress}
          onMonthChange={onMonthChange}
          onEmptyCellClick={(date, time, userId) => {
            const targetUser = users.find(u => u.uid === userId);
            const startTime = time;
            const [hour] = time.split(':').map(Number);
            const endTime = `${hour + 1}:00`;
            
            setNewShiftData({
              date,
              startTime,
              endTime,
              userId,
              nickname: targetUser?.nickname || "",
              status: user?.role === "master" ? "approved" : "pending",
              classes: [],
              extendedTasks: [],
            });
            setShowAddModal(true);
          }}
          colorMode={colorMode}
          styles={styles}
        />
      ) : deviceType === "tablet" ? (
        /* タブレット用週間ビュー */
        <TabletCompactView
          shifts={shifts}
          users={users}
          selectedDate={selectedDate}
          onShiftPress={handleShiftPress}
          onMonthChange={onMonthChange}
          onEmptyCellClick={(date, time, userId) => {
            const startTime = time;
            const [hour] = time.split(':').map(Number);
            const endTime = `${hour + 1}:00`;
            
            // マスター権限の場合はユーザーIDをクリアして選択できるようにする
            // 一般ユーザーの場合は自分自身のIDを設定
            const isMaster = user?.role === "master";
            const finalUserId = userId && userId !== "" ? userId : (isMaster ? "" : user?.uid || "");
            const targetUser = finalUserId ? users.find(u => u.uid === finalUserId) : null;
            const finalNickname = targetUser?.nickname || "";
            
            setNewShiftData({
              date,
              startTime,
              endTime,
              userId: finalUserId,
              nickname: finalNickname,
              status: user?.role === "master" ? "approved" : "pending",
              classes: [],
              extendedTasks: [],
            });
            setShowAddModal(true);
          }}
          onAddShift={handleAddShift}
          colorMode={colorMode}
          styles={styles}
        />
      ) : useGoogleLayout ? (
        /* Googleカレンダー風レイアウト */
        <GoogleCalendarView
          shifts={shifts}
          users={users}
          selectedDate={selectedDate}
          onShiftPress={handleShiftPress}
          onMonthChange={onMonthChange}
          onEmptyCellClick={(date, time, userId) => {
            const targetUser = users.find(u => u.uid === userId);
            const startTime = time;
            const [hour] = time.split(':').map(Number);
            const endTime = `${hour + 1}:00`;
            
            setNewShiftData({
              date,
              startTime,
              endTime,
              userId,
              nickname: targetUser?.nickname || "",
              status: user?.role === "master" ? "approved" : "pending",
              classes: [],
              extendedTasks: [],
            });
            setShowAddModal(true);
          }}
          onAddShift={handleAddShift}
          colorMode={colorMode}
          styles={styles}
        />
      ) : viewMode === "gantt" ? (
        /* 横スクロール全体をCustomScrollViewでラップ（ガントチャートのみ） */
        <CustomScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          onScroll={(event) => {
            // スクロール位置を保存
            setScrollPosition(event.nativeEvent.contentOffset.x);
          }}
          scrollEventThrottle={16}
        >
          <View>
            <GanttHeader
              hourLabels={hourLabels}
              dateColumnWidth={dateColumnWidth}
              ganttColumnWidth={ganttColumnWidth}
              infoColumnWidth={infoColumnWidth}
            />
            <GanttChartBody
              // keyを削除して不要な再マウントを防ぐ
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
            />
          </View>
        </CustomScrollView>
      ) : (
        /* カレンダービューは横スクロール不要 */
        <CalendarView
          shifts={shifts}
          users={users}
          selectedDate={selectedDate}
          onShiftPress={handleShiftPress}
          onMonthChange={onMonthChange}
          styles={styles}
        />
      )}
      {/* シフト編集モーダル */}
      <EditShiftModalView
        visible={showEditModal}
        newShiftData={newShiftData}
        users={users}
        timeOptions={timeOptions}
        statusConfigs={statusConfigs}
        isLoading={isLoading}
        styles={styles}
        extendedTasks={[]} // 拡張タスクのテンプレート（必要に応じて実際のデータに置き換え）
        onChange={(field, value) =>
          setNewShiftData({ ...newShiftData, [field]: value })
        }
        onClose={() => setShowEditModal(false)}
        onSave={handleSaveShift}
        onDelete={async () => {
          if (editingShift) {
            await handleDeleteShift(editingShift.id); // 非同期処理に対応
          }
        }}
      />
      {/* シフト追加モーダル */}
      <AddShiftModalView
        visible={showAddModal}
        newShiftData={newShiftData}
        users={users}
        timeOptions={timeOptions}
        statusConfigs={statusConfigs}
        isLoading={isLoading}
        styles={styles}
        extendedTasks={[]} // 拡張タスクのテンプレート
        onChange={(field, value) => {
          if (field === "userData") {
            setNewShiftData({
              ...newShiftData,
              userId: value.userId,
              nickname: value.nickname,
            });
          } else {
            setNewShiftData({ ...newShiftData, [field]: value });
          }
        }}
        onClose={() => setShowAddModal(false)}
        onSave={handleSaveShift}
      />
      {/* 給与詳細モーダル */}
      <PayrollDetailModal
        visible={showPayrollModal}
        onClose={() => setShowPayrollModal(false)}
        shifts={shifts}
        users={users}
        selectedDate={selectedDate}
      />
    </View>
  );
};
