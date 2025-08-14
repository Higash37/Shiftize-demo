import React from "react";
import { useRouter } from "expo-router";
import { SettingsIndexView } from "@/modules/master-view/master-view-settings/SettingsIndexView";
import { MasterHeader } from "@/common/common-ui/ui-layout";
import { View } from "react-native";

export default function MasterSettingsIndex() {
  const router = useRouter();
  return (
    <View style={{ flex: 1 }}>
      <MasterHeader title="設定" />
      <SettingsIndexView
        onNavigate={(path) => {
          if (path === "taskManagement") {
            router.push("/master/taskManagement");
          } else {
            router.push(path);
          }
        }}
      />
    </View>
  );
}
