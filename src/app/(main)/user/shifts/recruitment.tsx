import React from "react";
import { View, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { RecruitmentShiftApplicationForm } from "@/modules/user-view/user-shift-forms/recruitmentApplication";
import { colors } from "@/common/common-constants/ThemeConstants";

export default function RecruitmentShiftApplicationScreen() {
  const {
    storeId,
    shiftIds,
  } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <RecruitmentShiftApplicationForm
        storeId={storeId as string}
        shiftIds={shiftIds as string}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});