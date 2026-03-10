/** @file PrintButton.tsx
 *  @description 印刷ボタンとシフト印刷モーダルの表示制御。
 *    ボタンをタップすると ShiftPrintModal を表示する。Web版のみ表示。
 */

// 【このファイルの位置づけ】
// - import元: UnifiedButtonStyles, ShiftPrintModal
// - importされる先: MonthSelectorBar（ツールバーの右ゾーン）
// - 役割: 「印刷」ボタン + モーダルの表示/非表示を useState で管理する。

import React, { useState } from "react";
import { TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getButtonStyle, getButtonTextStyle, UnifiedButtonStyles } from "../gantt-chart-common/UnifiedButtonStyles";
import { ShiftPrintModal } from "./ShiftPrintModal";

interface PrintButtonProps {
  shifts?: any[];
  users?: Array<{ uid: string; nickname: string; color?: string }>;
  selectedDate?: Date;
}

export const PrintButton: React.FC<PrintButtonProps> = ({
  shifts = [],
  users = [],
  selectedDate = new Date(),
}) => {
  const [showPrintModal, setShowPrintModal] = useState(false);

  const handlePrint = () => {
    setShowPrintModal(true);
  };

  return (
    <>
      <TouchableOpacity onPress={handlePrint} style={getButtonStyle("toolbar")}>
        <Ionicons name="print-outline" size={18} color="#2196F3" style={UnifiedButtonStyles.buttonIcon} />
        <Text style={getButtonTextStyle("toolbar")}>印刷</Text>
      </TouchableOpacity>

      <ShiftPrintModal
        visible={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        shifts={shifts}
        users={users}
        selectedDate={selectedDate}
      />
    </>
  );
};
