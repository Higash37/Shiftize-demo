import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

export type PrintFormat = "list" | "calendar" | "unified-calendar" | "all";

interface PrintFormatSelectorProps {
  selectedFormat: PrintFormat;
  onFormatChange: (format: PrintFormat) => void;
}

export const PrintFormatSelector: React.FC<PrintFormatSelectorProps> = ({
  selectedFormat,
  onFormatChange,
}) => {
  const formats: Array<{ value: PrintFormat; label: string; description: string }> = [
    {
      value: "list",
      label: "リスト形式",
      description: "スタッフごとに勤務日を一覧表示",
    },
    {
      value: "calendar",
      label: "カレンダー形式",
      description: "スタッフ別のカレンダー表示",
    },
    {
      value: "unified-calendar",
      label: "統合カレンダー",
      description: "全スタッフを1つのカレンダーに表示",
    },
    {
      value: "all",
      label: "全形式",
      description: "すべての形式で印刷・共有",
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>印刷形式</Text>
      <View style={styles.formatList}>
        {formats.map((format) => (
          <TouchableOpacity
            key={format.value}
            style={[
              styles.formatItem,
              selectedFormat === format.value && styles.formatItemSelected,
            ]}
            onPress={() => onFormatChange(format.value)}
          >
            <View style={styles.radioButton}>
              {selectedFormat === format.value && (
                <View style={styles.radioButtonInner} />
              )}
            </View>
            <View style={styles.formatInfo}>
              <Text style={styles.formatLabel}>{format.label}</Text>
              <Text style={styles.formatDescription}>{format.description}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  formatList: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    overflow: "hidden",
  },
  formatItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  formatItemSelected: {
    backgroundColor: "#eff6ff",
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#6b7280",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#2563eb",
  },
  formatInfo: {
    flex: 1,
  },
  formatLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 2,
  },
  formatDescription: {
    fontSize: 12,
    color: "#6b7280",
  },
});