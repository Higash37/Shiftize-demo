import React from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "@/common/common-ui/ui-layout/LayoutHeader";
import { useMD3Theme } from "@/common/common-theme/md3/MD3ThemeContext";
import { InfoDashboard } from "@/modules/master-view";

export default function InfoPage() {
  const theme = useMD3Theme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colorScheme.surfaceContainerLowest }}>
      <Header title="経営ダッシュボード" showBackButton={false} />
      <View style={{ flex: 1 }}>
        <InfoDashboard />
      </View>
    </SafeAreaView>
  );
}
