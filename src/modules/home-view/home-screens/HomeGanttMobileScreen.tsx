import React, { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, useWindowDimensions, Alert, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styles } from "../home-styles/home-view-styles";
import type { SampleScheduleColumn } from "../home-types/home-view-types";
import { GanttHeaderRow } from "../home-components/home-gantt/GanttHeaderRow";
import { GanttRowMobile } from "../home-components/home-gantt/GanttRowMobile";
import { ShiftItem, ShiftStatus, ClassTimeSlot, ShiftTaskSlot } from "@/common/common-models/model-shift/shiftTypes";
import { User } from "@/common/common-models/model-user/UserModel";
import { useAuth } from "@/services/auth/useAuth";
import { MobileShiftModal } from "@/modules/reusable-widgets/gantt-chart/view-modals/MobileShiftModal";
import { useGanttShiftActions } from "@/modules/reusable-widgets/gantt-chart/gantt-chart-common/useGanttShiftActions";
import { generateTimeOptions } from "@/modules/reusable-widgets/gantt-chart/gantt-chart-common/utils";
import { DEFAULT_SHIFT_STATUS_CONFIG } from "@/common/common-models/model-shift/shiftTypes";
import BatchConfirmModal from "@/modules/reusable-widgets/gantt-chart/view-modals/BatchConfirmModal";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/common/common-constants/ThemeConstants";

interface Props {
  namesFirst: string[];
  namesSecond: string[];
  timesFirst: string[];
  timesSecond: string[];
  sampleSchedule: SampleScheduleColumn[];
  CELL_WIDTH: number;
  showFirst: boolean;
  onCellPress?: (userName: string) => void;
  // PC版機能用の新しいプロプス
  shifts?: ShiftItem[];
  users?: User[];
  selectedDate?: Date;
  onShiftUpdate?: () => void;
  refreshPage?: () => void;
  userColorsMap?: Record<string, string>;
  onMonthChange?: (year: number, month: number) => void;
}

// レイアウト用定数
const HEADER_HEIGHT = 160; // ヘッダーの高さ（推定）
const FOOTER_HEIGHT = 100; // フッターの高さ
const TABBAR_HEIGHT = 56; // 下部ナビゲーションバーの高さ
const VERTICAL_MARGIN = 5; // 上下マージン
const MIN_CELL_WIDTH = 70;
const MIN_CELL_HEIGHT = 20;

export const HomeGanttMobileScreen: React.FC<Props> = ({
  namesFirst,
  namesSecond,
  timesFirst,
  timesSecond,
  sampleSchedule,
  CELL_WIDTH,
  showFirst,
  onCellPress,
  shifts = [],
  users = [],
  selectedDate = new Date(),
  onShiftUpdate,
  refreshPage,
  userColorsMap = {},
  onMonthChange,
}) => {
  const { user } = useAuth();
  const [editingShift, setEditingShift] = useState<ShiftItem | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const scrollViewRef = React.useRef<ScrollView>(null);
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 });
  const [newShiftData, setNewShiftData] = useState({
    date: "",
    startTime: "09:00",
    endTime: "11:00",
    userId: "",
    nickname: "",
    status: "approved" as ShiftStatus,
    classes: [] as ClassTimeSlot[],
    extendedTasks: [] as ShiftTaskSlot[],
    subject: "",
    notes: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [batchModal, setBatchModal] = useState<{
    visible: boolean;
    type: "approve" | "delete" | null;
  }>({ visible: false, type: null });
  
  // スクロール位置を保持する関数
  const handleScroll = (event: any) => {
    const { contentOffset } = event.nativeEvent;
    setScrollPosition({ x: contentOffset.x, y: contentOffset.y });
  };
  
  // スクロール位置を復元する関数
  const restoreScrollPosition = () => {
    setTimeout(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({
          x: scrollPosition.x,
          y: scrollPosition.y,
          animated: false,
        });
      }
    }, 100); // データ更新後に少し遅延して実行
  };
  
  const { saveShift, deleteShift, updateShiftStatus } = useGanttShiftActions({
    user,
    users,
    onShiftUpdate: onShiftUpdate || (() => {}),
    refreshPage: refreshPage || (() => {}),
  });
  
  const timeOptions = generateTimeOptions();
  const statusConfigs = DEFAULT_SHIFT_STATUS_CONFIG;
  
  const getStatusConfig = (status: string) => {
    return statusConfigs.find((config) => config.status === status) || statusConfigs[0];
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
      extendedTasks: shift.extendedTasks || [],
      subject: shift.subject || "",
      notes: shift.notes || "",
    });
    setShowEditModal(true);
  }, []);
  
  // 空白セルクリック
  const handleEmptyCellClick = useCallback((date: string, time: string, userId: string) => {
    const timeParts = time.split(":");
    const startHour = parseInt(timeParts[0] ?? "9");
    const startMinute = parseInt(timeParts[1] ?? "0");
    let endHour = startHour + 1;
    let endMinute = startMinute;
    if (endHour > 22) {
      endHour = 22;
      endMinute = 0;
    }
    const endTime = `${endHour.toString().padStart(2, "0")}:${endMinute.toString().padStart(2, "0")}`;
    
    const selectedUser = users.find(u => u.uid === userId);
    const isMaster = user?.role === "master";
    
    setNewShiftData({
      date,
      startTime: time,
      endTime,
      userId: isMaster ? "" : userId,
      nickname: isMaster ? "" : (selectedUser?.nickname || ""),
      status: isMaster ? "approved" : "pending",
      classes: [],
      extendedTasks: [],
      subject: "",
      notes: "",
    });
    setShowAddModal(true);
  }, [user, users]);
  
  // シフト保存
  const handleSaveShift = useCallback(async () => {
    if (!newShiftData.date || !newShiftData.startTime || !newShiftData.endTime) {
      Alert.alert("エラー", "日付と時間を正しく入力してください。");
      return;
    }
    
    if (!newShiftData.userId) {
      Alert.alert("エラー", "ユーザーを選択してください。");
      return;
    }
    
    setIsLoading(true);
    try {
      await saveShift(editingShift, newShiftData);
      setEditingShift(null);
      setNewShiftData({
        date: "",
        startTime: "09:00",
        endTime: "11:00",
        userId: "",
        nickname: "",
        status: "approved" as ShiftStatus,
        classes: [] as ClassTimeSlot[],
        extendedTasks: [] as ShiftTaskSlot[],
        subject: "",
        notes: "",
      });
      setShowEditModal(false);
      setShowAddModal(false);
      // リアルタイムリスナーで自動更新されるため、リフレッシュ不要
    } catch (error) {
      Alert.alert("エラー", "シフトの保存に失敗しました。");
    } finally {
      setIsLoading(false);
    }
  }, [editingShift, newShiftData, saveShift, refreshPage]);
  
  // シフト削除
  const handleDeleteShift = async (shiftId: string) => {
    setIsLoading(true);
    const targetShift = editingShift || shifts.find(s => s.id === shiftId);
    if (targetShift) {
      await deleteShift(targetShift);
    }
    setShowEditModal(false);
    // リアルタイムリスナーで自動更新されるため、リフレッシュ不要
    setIsLoading(false);
  };
  
  // 一括操作ボタン用のスタイル
  const buttonStyle = {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginHorizontal: 4,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  };
  
  const buttonTextStyle = {
    color: 'white',
    fontSize: 12,
    fontWeight: '600' as const,
    marginLeft: 4,
  };
  
  
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const cellWidth = Math.max(CELL_WIDTH, MIN_CELL_WIDTH);
  const timeRowCount = timesFirst.length;
  const cellHeight = Math.max(
    MIN_CELL_HEIGHT,
    Math.floor(
      (windowWidth < 768
        ? windowHeight -
          HEADER_HEIGHT -
          FOOTER_HEIGHT -
          insets.bottom -
          TABBAR_HEIGHT -
          VERTICAL_MARGIN
        : 400) / timeRowCount
    )
  );
  const names = showFirst ? namesFirst : namesSecond;
  const times = showFirst ? timesFirst : timesSecond;
  
  // シフトデータがある場合は日付を生成
  const dateString = selectedDate.toISOString().split('T')[0];

  return (
    <View style={{ flex: 1, paddingBottom: insets.bottom }}>
      
      {/* 一括操作ボタン（マスターのみ） */}
      {user?.role === "master" && shifts.length > 0 && (
        <View style={{
          flexDirection: 'row',
          justifyContent: 'center',
          paddingVertical: 8,
          paddingHorizontal: 16,
          backgroundColor: '#f5f5f5',
          borderBottomWidth: 1,
          borderBottomColor: '#e0e0e0',
        }}>
          <TouchableOpacity
            style={[buttonStyle, { backgroundColor: '#4CAF50' }]}
            onPress={() => setBatchModal({ visible: true, type: "approve" })}
          >
            <Ionicons name="checkmark-circle-outline" size={16} color="white" />
            <Text style={buttonTextStyle}>一括承認</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[buttonStyle, { backgroundColor: '#f44336' }]}
            onPress={() => setBatchModal({ visible: true, type: "delete" })}
          >
            <Ionicons name="trash-outline" size={16} color="white" />
            <Text style={buttonTextStyle}>一括削除</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <ScrollView
        ref={scrollViewRef}
        horizontal
        style={{ flex: 1 }}
        contentContainerStyle={{ flex: 1 }}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View style={{ minWidth: windowWidth }}>
          <GanttHeaderRow
            names={names}
            cellWidth={cellWidth}
            cellHeight={cellHeight}
          />
          {times.map((time) => (
            <GanttRowMobile
              key={time}
              time={time}
              names={names}
              sampleSchedule={sampleSchedule}
              cellWidth={cellWidth}
              cellHeight={cellHeight}
              onCellPress={onCellPress || (() => {})}
              shifts={shifts}
              users={users}
              date={dateString ?? ""}
              onShiftPress={handleEditShift}
              onEmptyCellPress={handleEmptyCellClick}
              userColorsMap={userColorsMap}
              getStatusConfig={getStatusConfig}
            />
          ))}
        </View>
      </ScrollView>
      
      {/* モバイルシフトモーダル（編集・追加共用） */}
      <MobileShiftModal
        visible={showEditModal || showAddModal}
        isEdit={showEditModal}
        shiftData={{
          date: newShiftData.date,
          startTime: newShiftData.startTime,
          endTime: newShiftData.endTime,
          userId: newShiftData.userId,
          nickname: newShiftData.nickname,
          status: newShiftData.status,
          subject: newShiftData.subject,
          notes: newShiftData.notes,
        }}
        users={users}
        timeOptions={timeOptions}
        statusConfigs={statusConfigs}
        isLoading={isLoading}
        onChange={(field, value) => {
          setNewShiftData({ ...newShiftData, [field]: value });
        }}
        onClose={() => {
          setShowEditModal(false);
          setShowAddModal(false);
        }}
        onSave={handleSaveShift}
        onDelete={showEditModal && editingShift ? () => {
          handleDeleteShift(editingShift.id);
        } : () => {}}
      />
      
      {/* バッチ確認モーダル */}
      <BatchConfirmModal
        visible={batchModal.visible}
        type={batchModal.type}
        shifts={shifts}
        isLoading={isLoading}
        styles={styles}
        setBatchModal={setBatchModal}
        setIsLoading={setIsLoading}
        refreshPage={() => {
          // リアルタイムリスナーで自動更新されるため、リフレッシュ不要
          // 互換性のためダミー関数を残す
        }}
      />
      
    </View>
  );
};
