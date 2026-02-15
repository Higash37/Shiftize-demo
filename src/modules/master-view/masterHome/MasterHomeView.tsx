import React, { useMemo } from "react";
import { View, Text } from "react-native";
import { MasterHeader } from "@/common/common-ui/ui-layout";
import { createMasterHomeViewStyles } from "./MasterHomeView.styles";
import { useMD3Theme } from "@/common/common-theme/md3/MD3ThemeContext";
import { useBreakpoint } from "@/common/common-constants/Breakpoints";
import type { MasterHomeViewProps } from "./MasterHomeView.types";

export const MasterHomeView: React.FC<MasterHomeViewProps> = () => {
  const theme = useMD3Theme();
  const bp = useBreakpoint();
  const styles = useMemo(() => createMasterHomeViewStyles(theme, bp), [theme, bp]);
  return (
    <View style={styles.container}>
      <MasterHeader title="ホーム" />
      <View style={styles.content}>
        <Text style={styles.title}>ようこそ！</Text>
        <Text style={styles.subtitle}>マスター管理画面へ</Text>
      </View>
    </View>
  );
};
