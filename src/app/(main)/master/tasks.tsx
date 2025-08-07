import React from "react";
import { View } from "react-native";
import { MasterHeader } from "@/common/common-ui/ui-layout";
import { TaskManagementView } from "@/modules/master-view/task-management/TaskManagementView";

export default function TaskManagementScreen() {
  return (
    <View style={{ flex: 1 }}>
      <MasterHeader title="タスク管理" />
      <TaskManagementView storeId="default-store" />
    </View>
  );
}
