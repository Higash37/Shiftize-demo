import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TaskFormData } from "./types";

interface AppearanceSectionProps {
  formData: TaskFormData;
  onUpdateFormData: (field: keyof TaskFormData, value: any) => void;
  styles: any;
}

export const AppearanceSection: React.FC<AppearanceSectionProps> = ({
  formData,
  onUpdateFormData,
  styles,
}) => {
  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#2196F3",
    "#9C27B0",
    "#FF9800",
    "#8BC34A",
    "#607D8B",
  ];

  const icons = [
    "checkbox-outline",
    "time-outline",
    "people-outline",
    "cart-outline",
    "document-text-outline",
    "stats-chart-outline",
    "build-outline",
    "alert-circle-outline",
  ];

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>外観</Text>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>色</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.colorPicker}
        >
          {colors.map((color) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorOption,
                { backgroundColor: color },
                formData.color === color && styles.colorOptionActive,
              ]}
              onPress={() => onUpdateFormData("color", color)}
            />
          ))}
        </ScrollView>
      </View>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>アイコン</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.iconPicker}
        >
          {icons.map((icon) => (
            <TouchableOpacity
              key={icon}
              style={[
                styles.iconOption,
                formData.icon === icon && styles.iconOptionActive,
              ]}
              onPress={() => onUpdateFormData("icon", icon)}
            >
              <Ionicons
                name={icon as any}
                size={24}
                color={formData.icon === icon ? "#2196F3" : "#666"}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};