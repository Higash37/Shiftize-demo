import React from "react";
import { View, Text } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { styles } from "../../MasterShiftCreate.styles";
import type { ShiftStatus } from "@/common/common-models/ModelIndex";

interface StatusSelectSectionProps {
  selectedUserId: string;
  selectedStatus: ShiftStatus;
  onStatusChange: (status: ShiftStatus) => void;
}

export const StatusSelectSection: React.FC<StatusSelectSectionProps> = ({
  selectedUserId,
  selectedStatus,
  onStatusChange,
}) => {
  if (selectedUserId === "recruitment") {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ステータス</Text>
        <View style={[styles.pickerContainer, { backgroundColor: "#e3f2fd" }]}>
          <Text style={{ 
            padding: 16, 
            fontSize: 16, 
            color: "#1976d2", 
            fontWeight: "600" 
          }}>
            募集中
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>ステータス設定</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedStatus}
          onValueChange={(itemValue) =>
            onStatusChange(itemValue as ShiftStatus)
          }
          style={styles.picker}
        >
          <Picker.Item label="承認済み" value="approved" />
          <Picker.Item label="申請中" value="pending" />
        </Picker>
      </View>
    </View>
  );
};