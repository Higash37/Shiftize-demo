import React from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/services/auth/useAuth";
import { AntDesign } from "@expo/vector-icons";
import styles from "../GanttChartMonthView.styles";
import { PrintButton } from "../print/PrintButton";
import { ColorToggleButton } from "./ColorToggleButton";
import { ViewToggleButton } from "./ViewToggleButton";
import { getButtonStyle, getButtonTextStyle, UnifiedButtonStyles } from "./UnifiedButtonStyles";

interface MonthSelectorBarProps {
  selectedDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onShowYearMonthPicker: () => void;
  onReload: () => void;
  onBatchApprove: () => void;
  onBatchDelete: () => void;
  isLoading: boolean;
  totalAmount?: number; // 追加：合計金額
  totalHours?: number; // 追加：合計時間
  shifts?: any[]; // 追加：シフトデータ
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
    onBatchDelete,
    isLoading,
    totalAmount = 0,
    totalHours = 0,
    shifts = [],
    users = [],
    colorMode = "status", // デフォルトはステータス色
    onColorModeToggle,
    onPayrollPress,
    viewMode = "gantt", // デフォルトはガントチャート
    onViewModeToggle,
    isMobileView = false,
    deviceType = "desktop",
    useGoogleLayout = false,
    onToggleGoogleLayout,
  } = props;
  return (
    <View style={styles.monthSelector}>
      {/* 金額表示部分 - シフトがなくても表示（タップ可能） */}
      {!isMobileView && (
        <TouchableOpacity
          style={{
            position: "absolute",
            left: 10,
            top: "38%",
            transform: [{ translateY: -24 }],
            backgroundColor: onPayrollPress ? "#f0f8ff" : "#f0f8ff",
            padding: 5,
            borderRadius: 6,
            borderWidth: 1,
            borderColor: onPayrollPress ? "#4A90E2" : "#ddd",
            zIndex: 10,
          }}
        onPress={onPayrollPress}
        disabled={!onPayrollPress}
      >
        <Text style={{ fontWeight: "bold", color: "#333" }}>
          合計: {totalAmount.toLocaleString()}円{" "}
        </Text>
        {totalHours > 0 ? (
          <Text style={{ fontSize: 12, color: "#666" }}>
            ({Math.floor(totalHours)}時間
            {Math.round((totalHours % 1) * 60) > 0
              ? `${Math.round((totalHours % 1) * 60)}分`
              : ""}
            )
          </Text>
        ) : (
          <Text style={{ fontSize: 12, color: "#666" }}>(0時間)</Text>
        )}
        <Text style={{ fontSize: 10, color: "#888", fontStyle: "italic" }}>
          ※授業時間を除く
        </Text>
        </TouchableOpacity>
      )}
      
      {/* 色切替ボタンとビュー切替ボタン - 金額表示の右側 */}
      {!isMobileView && (
        <View
          style={{
            position: "absolute",
            left: 180, // 金額表示の右側
            top: "38%",
            transform: [{ translateY: -18 }], // 高さを統一
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}
        >
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
      )}
      {/* タブレット表示時は年月表示を非表示 */}
      {deviceType !== "tablet" && (
        <View style={styles.monthNavigator}>
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
      )}
      {!isMobileView && (
        <View style={styles.addShiftButtonRow}>
          {Platform.OS === "web" && (
          <PrintButton
            shifts={shifts}
            users={users}
            selectedDate={selectedDate}
          />
        )}
        <TouchableOpacity style={getButtonStyle("secondary")} onPress={onReload}>
          <Ionicons name="refresh" size={16} color="#333" style={UnifiedButtonStyles.buttonIcon} />
          <Text style={getButtonTextStyle("secondary")}>更新</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={getButtonStyle("primary")}
          onPress={onBatchApprove}
          disabled={isLoading}
        >
          <Ionicons name="checkmark-circle" size={16} color="#fff" style={UnifiedButtonStyles.buttonIcon} />
          <Text style={getButtonTextStyle("primary")}>一括承認</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={getButtonStyle("danger")}
          onPress={onBatchDelete}
          disabled={isLoading}
        >
          <Ionicons name="trash" size={16} color="#fff" style={UnifiedButtonStyles.buttonIcon} />
          <Text style={getButtonTextStyle("danger")}>完全削除</Text>
        </TouchableOpacity>
        {props.onOpenHistory && (
          <TouchableOpacity
            style={getButtonStyle("secondary")}
            onPress={props.onOpenHistory}
          >
            <Ionicons name="time-outline" size={16} color="#333" style={UnifiedButtonStyles.buttonIcon} />
            <Text style={getButtonTextStyle("secondary")}>履歴</Text>
          </TouchableOpacity>
        )}
        </View>
      )}
    </View>
  );
};
