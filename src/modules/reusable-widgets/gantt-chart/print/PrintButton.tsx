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
