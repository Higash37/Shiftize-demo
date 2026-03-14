/** @file MonthSelectorBar.tsx
 *  @description ガントチャート上部のツールバー。
 *    年月ナビゲーション、色モード切替、ビュー切替、印刷、一括承認、更新、履歴、
 *    自動配置、期間設定など、マスター画面の操作ボタンを集約する。
 */

// 【このファイルの位置づけ】
// - import元: PrintButton, ColorToggleButton, ViewToggleButton, UnifiedButtonStyles, PeriodSettingModal
// - importされる先: GanttChartMonthView（ガントチャートの親）
// - 役割: ガントチャート上部の「ツールバー」。左ゾーン（金額・時間）、
//   中央ゾーン（年月ナビ）、右ゾーン（アクションボタン）の3分割レイアウト。

import React, { useState, useContext } from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { createGanttChartMonthViewStyles } from "../GanttChartMonthView.styles";
import { useThemedStyles } from "@/common/common-theme/md3/useThemedStyles";
import { PrintButton } from "../print/PrintButton";
import { ColorToggleButton } from "./ColorToggleButton";
import { ViewToggleButton } from "./ViewToggleButton";
import { getButtonStyle, getButtonTextStyle, UnifiedButtonStyles } from "./UnifiedButtonStyles";
import { PeriodSettingModal } from "../modals/PeriodSettingModal";
import { ShiftItem } from "@/common/common-models/ModelIndex";
import { ShiftSelectionContext } from "./components";
import { DateNavigator } from "@/common/common-ui/ui-navigation/DateNavigator";

// MonthSelectorBarProps: ツールバーが受け取る全プロパティ。
// ほとんどが省略可能（?）で、デバイスタイプやビューモードに応じて表示を切り替える。
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
  onAutoSchedule?: () => void; // 追加：自動配置ボタン
}

export const MonthSelectorBar: React.FC<MonthSelectorBarProps> = (props) => {
  const styles = useThemedStyles(createGanttChartMonthViewStyles);
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
    storeId,
  } = props;

  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const { selectedCount } = useContext(ShiftSelectionContext);

  // 金額・時間のコンパクト表示用フォーマット
  const formattedHours = (() => {
    if (totalHours <= 0) return "0h";
    const hours = Math.floor(totalHours);
    const minutes = Math.round((totalHours % 1) * 60);
    return minutes > 0 ? `${hours}h${minutes}m` : `${hours}h`;
  })();

  return (
    <View style={[styles.monthSelector, isMobileView && { paddingHorizontal: 0, justifyContent: "center" }]}>
      {/* 左ゾーン: 金額・時間表示 + 切替ボタン（PC のみ） */}
      {isMobileView ? null : (
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
          <TouchableOpacity
            style={getButtonStyle("toolbar")}
            onPress={() => setShowPeriodModal(true)}
          >
            <Ionicons name="calendar-outline" size={18} color="#2196F3" style={UnifiedButtonStyles.buttonIcon} />
            <Text style={getButtonTextStyle("toolbar")}>期間設定</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 中央ゾーン: 年月ナビゲーション */}
      {deviceType !== "tablet" && (
        isMobileView ? (
          <DateNavigator
            label={`${selectedDate.getFullYear()}年${selectedDate.getMonth() + 1}月`}
            onPrev={onPrevMonth}
            onNext={onNextMonth}
            onLabelPress={onShowYearMonthPicker}
          />
        ) : (
          <View style={{
            position: "absolute",
            left: 0,
            right: 0,
            alignItems: "center",
            pointerEvents: "box-none",
            zIndex: 1,
          }}>
            <View style={{ pointerEvents: "auto" }}>
              <DateNavigator
                label={`${selectedDate.getFullYear()}年${selectedDate.getMonth() + 1}月`}
                onPrev={onPrevMonth}
                onNext={onNextMonth}
                onLabelPress={onShowYearMonthPicker}
              />
            </View>
          </View>
        )
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
          {props.onAutoSchedule && (
            <TouchableOpacity
              style={getButtonStyle("toolbar")}
              onPress={props.onAutoSchedule}
            >
              <MaterialIcons name="auto-fix-high" size={18} color="#4CAF50" style={UnifiedButtonStyles.buttonIcon} />
              <Text style={getButtonTextStyle("toolbar")}>自動配置</Text>
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
          onPeriodCreated={(_period) => {
            // 期間が作成されました
            // 必要に応じて親コンポーネントに通知
          }}
        />
      )}
    </View>
  );
};
