import React, { useState } from "react";
import {
  ShiftStatusConfig,
  DEFAULT_SHIFT_STATUS_CONFIG,
} from "@/common/common-models/ModelIndex";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/services/firebase/firebase";
import { ShiftStatusSettingsView } from "@/modules/master-view/settings/shiftStatusSettingsView/ShiftStatusSettingsView";

export default function ShiftStatusSettingsScreen() {
  const [statusConfigs, setStatusConfigs] = useState<ShiftStatusConfig[]>(
    DEFAULT_SHIFT_STATUS_CONFIG
  );
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [isColorPickerVisible, setIsColorPickerVisible] = useState(false);

  const handleColorChange = async (status: string, newColor: string) => {
    try {
      const configRef = doc(db, "settings", "shiftStatus");
      await updateDoc(configRef, {
        [status]: {
          ...statusConfigs.find((c) => c.status === status),
          color: newColor,
        },
      });
      setStatusConfigs((prev) =>
        prev.map((config) =>
          config.status === status ? { ...config, color: newColor } : config
        )
      );
    } catch (error) {
    }
  };

  const openColorPicker = (status: string) => {
    setSelectedStatus(status);
    setIsColorPickerVisible(true);
  };

  const closeColorPicker = () => {
    setIsColorPickerVisible(false);
  };

  return (
    <ShiftStatusSettingsView
      statusConfigs={statusConfigs}
      selectedStatus={selectedStatus}
      isColorPickerVisible={isColorPickerVisible}
      onColorChange={handleColorChange}
      onOpenColorPicker={openColorPicker}
      onCloseColorPicker={closeColorPicker}
    />
  );
}
