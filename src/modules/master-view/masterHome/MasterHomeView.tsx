import React from "react";
import { View, Text } from "react-native";
import { MasterHeader } from "@/common/common-ui/ui-layout";
import { masterHomeViewStyles as styles } from "./MasterHomeView.styles";
import type { MasterHomeViewProps } from "./MasterHomeView.types";

export const MasterHomeView: React.FC<MasterHomeViewProps> = () => {
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
