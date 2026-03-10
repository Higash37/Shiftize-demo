/**
 * @file master/info.tsx
 * @description 業務管理（InfoDashboard）画面。タスク管理やチェックリストを表示する。
 *
 * Header + InfoDashboard の組み合わせで構成される。
 * SafeAreaView で安全領域を確保し、テーマカラーで背景色を設定する。
 */

import React from "react";
import { View } from "react-native";
// SafeAreaView: iPhoneのノッチ等を避けて安全な領域にコンテンツを配置
import { SafeAreaView } from "react-native-safe-area-context";
// Header: 画面上部のヘッダーコンポーネント
import { Header } from "@/common/common-ui/ui-layout/LayoutHeader";
import { useMD3Theme } from "@/common/common-theme/md3/MD3ThemeContext";
// InfoDashboard: 業務管理ダッシュボードのメインコンポーネント
import { InfoDashboard } from "@/modules/master-view";

/**
 * InfoPage: 業務管理画面。
 */
export default function InfoPage() {
  const theme = useMD3Theme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colorScheme.surfaceContainerLowest }}>
      {/* showBackButton: false でヘッダーの「戻る」ボタンを非表示 */}
      <Header title="業務" showBackButton={false} />
      <View style={{ flex: 1 }}>
        <InfoDashboard />
      </View>
    </SafeAreaView>
  );
}
