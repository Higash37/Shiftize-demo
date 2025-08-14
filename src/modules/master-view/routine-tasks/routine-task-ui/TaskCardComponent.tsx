import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Box from "@/common/common-ui/ui-base/BoxComponent";
import { designSystem } from "@/common/common-constants/DesignSystem";
import { colors } from "@/common/common-constants/ColorConstants";
import { typography } from "@/common/common-constants/TypographyConstants";

interface TaskCardProps {
  title: string;
  frequency: string;
  timePerTask: string;
  onPress: () => void;
}

const TaskCardComponent: React.FC<TaskCardProps> = ({
  title,
  frequency,
  timePerTask,
  onPress,
}) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.touchable}>
      <Box
        variant="card"
        padding="large"
        margin="small"
        shadow="medium"
        style={styles.taskCard}
      >
        <Text style={styles.titleText}>{title}</Text>
        <Text style={styles.taskText}>
          {frequency} | {timePerTask}
        </Text>
      </Box>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchable: {
    width: "70%",
    alignSelf: "center",
  },
  taskCard: {
    // Boxコンポーネントのスタイルを使用するため、重複を避ける
  },
  titleText: {
    fontSize: typography.fontSize.large,
    fontWeight: typography.fontWeight.bold as any,
    color: colors.text.primary,
    marginBottom: 8,
    textAlign: "left",
  },
  taskText: {
    fontSize: typography.fontSize.medium,
    fontWeight: typography.fontWeight.medium as any,
    color: colors.text.secondary,
  },
});

export default TaskCardComponent;
