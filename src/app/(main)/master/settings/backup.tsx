import React, { useState } from "react";
import { Alert, Share, Platform, View } from "react-native";
import { useSettings } from "@/common/common-utils/settings";
import { SettingsBackupView } from "@/modules/master-view/settings/settingsBackupView/SettingsBackupView";
import { MasterHeader } from "@/common/common-ui/ui-layout";

export default function SettingsBackupScreen() {
  const { loading, resetSettings, exportSettings, importSettings } =
    useSettings();
  const [isProcessing, setIsProcessing] = useState(false);

  // 設定をエクスポート
  const handleExportSettings = async () => {
    try {
      setIsProcessing(true);
      const settingsJson = exportSettings();
      const fileName = `shift-settings-${
        new Date().toISOString().split("T")[0]
      }.json`;

      if (Platform.OS === "web") {
        // Web環境での処理
        const blob = new Blob([settingsJson], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        Alert.alert("エクスポート完了", "設定ファイルをダウンロードしました");
      } else {
        // モバイル環境では基本的なシェア機能を使用
        await Share.share({
          message: settingsJson,
          title: "シフト設定をエクスポート",
        });
      }
    } catch (error) {
      console.error("エクスポートエラー:", error);
      Alert.alert("エラー", "設定のエクスポートに失敗しました");
    } finally {
      setIsProcessing(false);
    }
  };

  // 設定をインポート
  const handleImportSettings = async () => {
    Alert.alert(
      "設定インポート",
      "設定をインポートするには、エクスポートしたJSONファイルの内容をテキストとして入力してください。",
      [
        { text: "キャンセル", style: "cancel" },
        {
          text: "入力",
          onPress: () => {
            // 簡単な入力プロンプトを使用
            if (Platform.OS === "web") {
              const settingsJson = prompt("設定JSONを入力してください:");
              if (settingsJson) {
                handleImportFromText(settingsJson);
              }
            } else {
              Alert.alert("注意", "Web版をご利用ください");
            }
          },
        },
      ]
    );
  };

  const handleImportFromText = async (settingsJson: string) => {
    try {
      setIsProcessing(true);
      await importSettings(settingsJson);
      Alert.alert("インポート完了", "設定を正常にインポートしました");
    } catch (error) {
      console.error("インポートエラー:", error);
      Alert.alert("エラー", "設定のインポートに失敗しました");
    } finally {
      setIsProcessing(false);
    }
  };

  // 設定をリセット
  const handleResetSettings = () => {
    Alert.alert(
      "設定リセット",
      "全ての設定を初期値にリセットしますか？この操作は元に戻せません。",
      [
        { text: "キャンセル", style: "cancel" },
        {
          text: "リセット",
          style: "destructive",
          onPress: async () => {
            try {
              setIsProcessing(true);
              await resetSettings();
              Alert.alert("リセット完了", "設定を初期値にリセットしました");
            } catch (error) {
              console.error("リセットエラー:", error);
              Alert.alert("エラー", "設定のリセットに失敗しました");
            } finally {
              setIsProcessing(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <MasterHeader title="バックアップ・復元" />
      <SettingsBackupView
        loading={loading || isProcessing}
        onExport={handleExportSettings}
        onImport={handleImportSettings}
        onReset={handleResetSettings}
      />
    </View>
  );
}
