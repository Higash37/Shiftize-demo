import React from "react";
import { Text, StyleSheet } from "react-native";
import { colors } from "@/common/common-constants/ColorConstants";
import { typography } from "@/common/common-constants/TypographyConstants";
import { shadows } from "@/common/common-constants/ShadowConstants";
import Box from "@/common/common-ui/ui-base/BoxComponent";

export const CreateGroupHeader: React.FC = () => {
  return (
    <Box variant="primary" padding="large" style={styles.header}>
      <Text style={styles.headerTitle}>新規グループ作成</Text>
    </Box>
  );
};

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    ...shadows.medium,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text.onPrimary,
    textAlign: "center",
  },
});