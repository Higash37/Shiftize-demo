import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "@/common/common-constants/ThemeConstants";
import { layout } from "@/common/common-constants/LayoutConstants";
// import { FileManagerView } from "@/modules/file-management/FileManagerView";

/**
 * ファイル機能は現在凍結中です
 * 理由: 使用率が低いため
 * 将来的な予定: Supabase Storageで再実装
 *
 * ファイル・フォルダ構造は保持されており、将来の再開に備えています
 */
export default function UserFilesScreen() {
  // ファイル機能凍結中
  // return <FileManagerView hideHeader={false} showBreadcrumbs={true} />;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <MaterialIcons name="folder-off" size={80} color={colors.text.disabled} />
        <Text style={styles.title}>ファイル機能は現在ご利用いただけません</Text>
        <Text style={styles.message}>
          この機能は使用率が低いため、一時的に無効化されています。
        </Text>
        <Text style={styles.message}>
          将来的にSupabase Storageへの移行を予定しています。
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    padding: layout.padding.large,
  },
  content: {
    alignItems: "center",
    maxWidth: 400,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.text.primary,
    marginTop: layout.padding.large,
    marginBottom: layout.padding.medium,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: "center",
    marginBottom: layout.padding.small,
    lineHeight: 24,
  },
});
