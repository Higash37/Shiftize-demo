import React, { useState, useEffect } from "react";
import { Alert, View } from "react-native";
import { db } from "@/services/firebase/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ShiftRuleSettingsView } from "@/modules/master-view/master-view-settings/ShiftRuleSettingsView";
import { MasterHeader } from "@/common/common-ui/ui-layout";
import type { ShiftRuleSettings } from "@/modules/master-view/master-view-settings/ShiftRuleSettingsView.types";

const DEFAULT_SETTINGS: ShiftRuleSettings = {
  maxWorkHours: 8,
  minBreakMinutes: 60,
  maxConsecutiveDays: 5,
  weekStartDay: 0, // 日曜日
  shiftTimeUnit: 30, // 30分単位
  allowOvertime: false,
  maxOvertimeHours: 2,
  minShiftHours: 4,
  maxShiftGap: 2, // シフト間の最大間隔（時間）
};

export default function ShiftRuleSettingsScreen() {
  const [settings, setSettings] = useState<ShiftRuleSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [picker, setPicker] = useState<
    | null
    | "maxWorkHours"
    | "minBreakMinutes"
    | "maxConsecutiveDays"
    | "weekStartDay"
    | "shiftTimeUnit"
    | "maxOvertimeHours"
    | "minShiftHours"
  >(null);

  useEffect(() => {
    (async () => {
      const ref = doc(db, "settings", "shiftApp");
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setSettings((prev) => ({ ...prev, ...snap.data() }));
      }
      setLoading(false);
    })();
  }, []);

  const saveSettings = async () => {
    setLoading(true);
    const ref = doc(db, "settings", "shiftApp");
    await setDoc(ref, settings, { merge: true });
    setLoading(false);
    Alert.alert("保存しました");
  };

  return (
    <View style={{ flex: 1 }}>
      <MasterHeader title="シフトルール" />
      <ShiftRuleSettingsView
        settings={settings}
        loading={loading}
        onChange={setSettings}
        onSave={saveSettings}
        picker={picker}
        setPicker={setPicker}
      />
    </View>
  );
}
