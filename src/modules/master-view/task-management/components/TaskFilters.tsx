import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  TaskType,
  TaskTag,
} from "@/common/common-models/model-shift/shiftTypes";
import { useTaskFiltersStyles } from "./styles/TaskFilters.styles";

interface TaskFiltersProps {
  filters: {
    type: TaskType | "all";
    tag: TaskTag | "all";
    active: boolean;
    searchText: string;
  };
  onFiltersChange: (filters: {
    type: TaskType | "all";
    tag: TaskTag | "all";
    active: boolean;
    searchText: string;
  }) => void;
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({
  filters,
  onFiltersChange,
}) => {
  const styles = useTaskFiltersStyles();

  const taskTypes: Array<{ value: TaskType | "all"; label: string }> = [
    { value: "all", label: "すべて" },
    { value: "standard", label: "通常" },
    { value: "time_specific", label: "時間指定" },
    { value: "custom", label: "独自設定" },
  ];

  const taskTags: Array<{ value: TaskTag | "all"; label: string }> = [
    { value: "all", label: "すべて" },
    { value: "limited_time", label: "期間限定" },
    { value: "staff_only", label: "スタッフ限定" },
    { value: "high_priority", label: "高優先度" },
    { value: "training", label: "研修" },
    { value: "event", label: "イベント" },
  ];

  const updateFilter = (key: string, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  return (
    <View style={styles.container}>
      {/* 検索バー */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="タスクを検索..."
          placeholderTextColor="#999"
          value={filters.searchText}
          onChangeText={(text) => updateFilter("searchText", text)}
        />
        {filters.searchText ? (
          <TouchableOpacity
            onPress={() => updateFilter("searchText", "")}
            style={styles.clearButton}
          >
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* タイプフィルター */}
      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>タイプ</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterRow}>
            {taskTypes.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.filterChip,
                  filters.type === type.value && styles.filterChipActive,
                ]}
                onPress={() => updateFilter("type", type.value)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filters.type === type.value && styles.filterChipTextActive,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* タグフィルター */}
      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>タグ</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterRow}>
            {taskTags.map((tag) => (
              <TouchableOpacity
                key={tag.value}
                style={[
                  styles.filterChip,
                  filters.tag === tag.value && styles.filterChipActive,
                ]}
                onPress={() => updateFilter("tag", tag.value)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filters.tag === tag.value && styles.filterChipTextActive,
                  ]}
                >
                  {tag.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* 状態フィルター */}
      <View style={styles.statusFilterContainer}>
        <TouchableOpacity
          style={[
            styles.statusFilter,
            filters.active && styles.statusFilterActive,
          ]}
          onPress={() => updateFilter("active", true)}
        >
          <Text
            style={[
              styles.statusFilterText,
              filters.active && styles.statusFilterTextActive,
            ]}
          >
            有効
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.statusFilter,
            !filters.active && styles.statusFilterActive,
          ]}
          onPress={() => updateFilter("active", false)}
        >
          <Text
            style={[
              styles.statusFilterText,
              !filters.active && styles.statusFilterTextActive,
            ]}
          >
            無効
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
