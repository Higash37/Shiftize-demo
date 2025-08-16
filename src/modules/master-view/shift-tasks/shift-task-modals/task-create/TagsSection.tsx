import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { TaskTag } from "@/common/common-models/model-shift/shiftTypes";
import { TaskFormData } from "./types";

interface TagsSectionProps {
  formData: TaskFormData;
  onToggleTag: (tag: TaskTag) => void;
  styles: any;
}

export const TagsSection: React.FC<TagsSectionProps> = ({
  formData,
  onToggleTag,
  styles,
}) => {
  const availableTags: TaskTag[] = [
    "high_workload",
    "customer_service",
    "administrative",
    "inventory",
    "training",
    "special_event",
  ];

  const tagLabels: Record<TaskTag, string> = {
    high_workload: "高負荷",
    customer_service: "接客",
    administrative: "管理業務",
    inventory: "在庫管理",
    training: "研修",
    special_event: "特別イベント",
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>タグ</Text>
      <View style={styles.tagGrid}>
        {availableTags.map((tag) => (
          <TouchableOpacity
            key={tag}
            style={[
              styles.tagButton,
              formData.tags.includes(tag) && styles.tagButtonActive,
            ]}
            onPress={() => onToggleTag(tag)}
          >
            <Text
              style={[
                styles.tagButtonText,
                formData.tags.includes(tag) && styles.tagButtonTextActive,
              ]}
            >
              {tagLabels[tag]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};