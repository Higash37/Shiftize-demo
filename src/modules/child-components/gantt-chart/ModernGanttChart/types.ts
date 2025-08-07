import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { format, addMonths, subMonths, startOfWeek, addDays } from "date-fns";
import { ja } from "date-fns/locale";
import { colors } from "@/common/common-constants/ColorConstants";
import { layout } from "@/common/common-constants/LayoutConstants";
import { shadows } from "@/common/common-constants/ShadowConstants";
import Box from "@/common/common-ui/ui-base/BaseBox/BoxComponent";

// シフトタイプの定義
export interface ShiftTypeConfig {
  id: string;
  name: string;
  color: string;
  backgroundColor: string;
  priority: number; // 表示優先度（高いほど前面）
  allowOverlap: boolean; // 重複許可
}

// 標準シフトタイプ
export const DEFAULT_SHIFT_TYPES: ShiftTypeConfig[] = [
  {
    id: "work",
    name: "勤務",
    color: "#FFFFFF",
    backgroundColor: "#1565C0",
    priority: 1,
    allowOverlap: false,
  },
  {
    id: "break",
    name: "休憩",
    color: "#FFFFFF",
    backgroundColor: "#FF9800",
    priority: 2,
    allowOverlap: true,
  },
  {
    id: "class",
    name: "授業",
    color: "#FFFFFF",
    backgroundColor: "#4CAF50",
    priority: 3,
    allowOverlap: true,
  },
  {
    id: "meeting",
    name: "会議",
    color: "#FFFFFF",
    backgroundColor: "#9C27B0",
    priority: 4,
    allowOverlap: true,
  },
  {
    id: "training",
    name: "研修",
    color: "#FFFFFF",
    backgroundColor: "#F44336",
    priority: 5,
    allowOverlap: true,
  },
  {
    id: "overtime",
    name: "残業",
    color: "#FFFFFF",
    backgroundColor: "#795548",
    priority: 6,
    allowOverlap: true,
  },
];
