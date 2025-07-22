import React from "react";
import {
  View,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "@/common/common-ui/ui-layout/LayoutHeader";
import { colors } from "@/common/common-constants/ColorConstants";

import { InfoDashboard } from "@/modules/master-view";

export default function InfoPage() {

  return (
    <SafeAreaView style={styles.container}>
      <Header title="経営ダッシュボード" showBackButton={false} />
      <View style={styles.content}>
        <InfoDashboard />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
});
