import React, { useState } from "react";
import {
  ShiftStatusConfig,
  DEFAULT_SHIFT_STATUS_CONFIG,
} from "@/common/common-models/ModelIndex";
import { ServiceProvider } from "@/services/ServiceProvider";
import { ShiftStatusSettingsView } from "@/modules/master-view/master-view-settings/ShiftStatusSettingsView";

export default function ShiftStatusSettingsScreen() {
  const [statusConfigs, setStatusConfigs] = useState<ShiftStatusConfig[]>(
    DEFAULT_SHIFT_STATUS_CONFIG
  );
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [isColorPickerVisible, setIsColorPickerVisible] = useState(false);

  const handleColorChange = async (status: string, newColor: string) => {
    try {
      const updatedConfig = statusConfigs.find((c) => c.status === status);
      await ServiceProvider.settings.saveSettings({
        shiftStatus: {
          [status]: {
            ...updatedConfig,
            color: newColor,
          },
        },
      } as any);
      setStatusConfigs((prev) =>
        prev.map((config) =>
          config.status === status ? { ...config, color: newColor } : config
        )
      );
    } catch (error) {
      console.error("Failed to update shift status color", error);
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
