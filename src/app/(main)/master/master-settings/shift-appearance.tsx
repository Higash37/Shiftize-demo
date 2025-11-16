import React, { useState, useEffect } from "react";
import { Alert, View } from "react-native";
import {
  useSettings,
  validateAppearanceSettings,
} from "@/common/common-utils/util-settings";
import { ShiftAppearanceSettingsView } from "@/modules/master-view/master-view-settings/ShiftAppearanceSettingsView";
import { MasterHeader } from "@/common/common-ui/ui-layout";
import type { ShiftAppearanceSettings } from "@/common/common-utils/util-settings";

export default function ShiftAppearanceSettingsScreen() {
  const { settings, loading, updateAppearanceSettings } = useSettings();
  const [localSettings, setLocalSettings] = useState<ShiftAppearanceSettings>(
    settings.appearance
  );

  // settingsが変更されたときにlocalSettingsを同期
  useEffect(() => {
    if (settings.appearance) {
      setLocalSettings(settings.appearance);
    }
  }, [settings.appearance]);

  // ローカル設定を更新（保存前の一時的な変更）
  const handleSettingsChange = (newSettings: ShiftAppearanceSettings) => {
    setLocalSettings(newSettings);
  };

  // 設定を保存
  const saveSettings = async () => {
    // バリデーション実行
    const validationErrors = validateAppearanceSettings(localSettings);
    if (validationErrors.length > 0) {
      Alert.alert("入力エラー", validationErrors.join("\n"), [{ text: "OK" }]);
      return;
    }

    try {
      await updateAppearanceSettings(localSettings);
      Alert.alert("保存完了", "外観設定を保存しました");
    } catch (error) {
      console.error("Failed to save appearance settings", error);
      Alert.alert("エラー", "設定の保存に失敗しました");
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <MasterHeader title="外観設定" />
      <ShiftAppearanceSettingsView
        settings={localSettings}
        loading={loading}
        onChange={handleSettingsChange}
        onSave={saveSettings}
      />
    </View>
  );
}
