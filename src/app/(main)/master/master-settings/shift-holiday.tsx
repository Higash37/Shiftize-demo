import React, { useState, useEffect } from "react";
import { Alert, View } from "react-native";
import { db } from "@/services/firebase/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ShiftHolidaySettingsView } from "@/modules/master-view/master-view-settings/ShiftHolidaySettingsView";
import { MasterHeader } from "@/common/common-ui/ui-layout";
import type { ShiftHolidaySettings } from "@/modules/master-view/master-view-settings/ShiftHolidaySettingsView.types";

const DEFAULT_SETTINGS: ShiftHolidaySettings = {
  holidays: [],
  specialDays: [],
};

export default function ShiftHolidaySettingsScreen() {
  const [settings, setSettings] =
    useState<ShiftHolidaySettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

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
      <MasterHeader title="祝日・特別日" />
      <ShiftHolidaySettingsView
        settings={settings}
        loading={loading}
        onChange={setSettings}
        onSave={saveSettings}
      />
    </View>
  );
}
