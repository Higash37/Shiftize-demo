import React, { useState, useContext } from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "@/services/auth/useAuth";
import { AntDesign } from "@expo/vector-icons";
import styles from "../GanttChartMonthView.styles";
import { PrintButton } from "../print/PrintButton";
import { ColorToggleButton } from "./ColorToggleButton";
import { ViewToggleButton } from "./ViewToggleButton";
import { getButtonStyle, getButtonTextStyle, UnifiedButtonStyles } from "./UnifiedButtonStyles";
import { PeriodSettingModal } from "../modals/PeriodSettingModal";
import { ShiftItem } from "@/common/common-models/ModelIndex";
import { ShiftSelectionContext } from "./components";

interface MonthSelectorBarProps {
  selectedDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onShowYearMonthPicker: () => void;
  onReload: () => void;
  onBatchApprove: () => void;
  onBatchDelete?: () => void;
  isLoading: boolean;
  totalAmount?: number; // 追加：合計金額
  totalHours?: number; // 追加：合計時間
  shifts?: ShiftItem[]; // 追加：シフトデータ
  users?: Array<{ uid: string; nickname: string; color?: string; hourlyWage?: number }>; // 追加：ユーザーデータ
  colorMode?: "status" | "user"; // 追加：色表示モード
  onColorModeToggle?: () => void; // 追加：色モード切替
  onPayrollPress?: () => void; // 追加：給与詳細モーダル表示
  viewMode?: "gantt" | "calendar"; // 追加：ビューモード
  onViewModeToggle?: () => void; // 追加：ビューモード切替
  isMobileView?: boolean; // 追加：モバイルビューかどうか
  deviceType?: "desktop" | "tablet" | "mobile"; // 追加：デバイスタイプ
  useGoogleLayout?: boolean; // 追加：Googleレイアウトを使用するか
  onToggleGoogleLayout?: () => void; // 追加：Googleレイアウト切替
  onOpenHistory?: () => void; // 追加：履歴モーダル表示
  storeId?: string; // 追加：店舗ID（期間設定モーダル用）
  onQuickUrlPress?: () => void; // 追加：クイックURL発行ボタン
}

export const MonthSelectorBar: React.FC<MonthSelectorBarProps> = (props) => {
  const { signOut } = useAuth();
  const {
    selectedDate,
    onPrevMonth,
    onNextMonth,
    onShowYearMonthPicker,
    onReload,
    onBatchApprove,
    isLoading,
    totalAmount = 0,
    totalHours = 0,
    shifts = [],
    users = [],
    colorMode = "status",
    onColorModeToggle,
    onPayrollPress,
    viewMode = "gantt",
    onViewModeToggle,
    isMobileView = false,
    deviceType = "desktop",
    useGoogleLayout = false,
    onToggleGoogleLayout,
    storeId,
  } = props;

  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const { selectedCount } = useContext(ShiftSelectionContext);

  // 金額・時間のコンパクト表示用フォーマット
  const formattedHours = totalHours > 0
    ? `${Math.floor(totalHours)}h${Math.round((totalHours % 1) * 60) > 0 ? `${Math.round((totalHours % 1) * 60)}m` : ""}`
    : "0h";

  return (
    <View style={styles.monthSelector}>
      {/* 左ゾーン: 金額・時間表示 + 切替ボタン */}
      {!isMobileView ? (
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
            onPress={onPayrollPress}
            disabled={!onPayrollPress}
          >
            <Text style={{ fontWeight: "bold", color: "#333333", fontSize: 12 }}>
              ¥{totalAmount.toLocaleString()} / {formattedHours}
            </Text>
          </TouchableOpacity>
          {onColorModeToggle && (
            <ColorToggleButton
              colorMode={colorMode}
              onToggle={onColorModeToggle}
            />
          )}
          {onViewModeToggle && (
            <ViewToggleButton
              viewMode={viewMode}
              onToggle={onViewModeToggle}
            />
          )}
        </View>
      ) : (
        <View style={{ flex: 1 }} />
      )}

      {/* 中央ゾーン: 年月ナビゲーション（画面中央に固定） */}
      {deviceType !== "tablet" && (
        <View style={{
          position: "absolute",
          left: 0,
          right: 0,
          alignItems: "center",
          pointerEvents: "box-none",
          zIndex: 1,
        }}>
          <View style={[styles.monthNavigator, { pointerEvents: "auto" }]}>
            <TouchableOpacity style={styles.monthNavButton} onPress={onPrevMonth}>
              <Text style={styles.monthNavButtonText}>＜</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.monthButton}
              onPress={onShowYearMonthPicker}
            >
              <Text style={styles.monthText}>
                {selectedDate.getFullYear()}年{selectedDate.getMonth() + 1}月
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.monthNavButton} onPress={onNextMonth}>
              <Text style={styles.monthNavButtonText}>＞</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 右ゾーン: アクションボタン群 */}
      {!isMobileView && (
        <View style={[styles.addShiftButtonRow, { zIndex: 2 }]}>
          {Platform.OS === "web" && (
            <PrintButton
              shifts={shifts}
              users={users}
              selectedDate={selectedDate}
            />
          )}
          <TouchableOpacity
            style={getButtonStyle("toolbar")}
            onPress={() => setShowPeriodModal(true)}
          >
            <Ionicons name="calendar-outline" size={18} color="#2196F3" style={UnifiedButtonStyles.buttonIcon} />
            <Text style={getButtonTextStyle("toolbar")}>期間設定</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={getButtonStyle("toolbar")}
            onPress={onBatchApprove}
            disabled={isLoading}
          >
            <Ionicons name="checkmark-circle" size={18} color="#2196F3" style={UnifiedButtonStyles.buttonIcon} />
            <Text style={getButtonTextStyle("toolbar")}>
              {selectedCount > 0 ? `一括承認 (${selectedCount})` : "一括承認"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={getButtonStyle("toolbar")} onPress={onReload}>
            <Ionicons name="refresh" size={18} color="#2196F3" style={UnifiedButtonStyles.buttonIcon} />
            <Text style={getButtonTextStyle("toolbar")}>更新</Text>
          </TouchableOpacity>
          {props.onOpenHistory && (
            <TouchableOpacity
              style={getButtonStyle("toolbar")}
              onPress={props.onOpenHistory}
            >
              <Ionicons name="time-outline" size={18} color="#2196F3" style={UnifiedButtonStyles.buttonIcon} />
              <Text style={getButtonTextStyle("toolbar")}>履歴</Text>
            </TouchableOpacity>
          )}
          {props.onQuickUrlPress && (
            <TouchableOpacity
              style={getButtonStyle("toolbar")}
              onPress={props.onQuickUrlPress}
            >
              <MaterialIcons name="link" size={18} color="#2196F3" style={UnifiedButtonStyles.buttonIcon} />
              <Text style={getButtonTextStyle("toolbar")}>URL発行</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* 期間設定モーダル */}
      {storeId && (
        <PeriodSettingModal
          visible={showPeriodModal}
          onClose={() => setShowPeriodModal(false)}
          storeId={storeId}
          users={props.users || []}
          shifts={props.shifts || []}
          onPeriodCreated={(period) => {
            // 期間が作成されました
            // 必要に応じて親コンポーネントに通知
          }}
        />
      )}
    </View>
  );
};
