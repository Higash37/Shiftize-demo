import React from "react";
import { View } from "react-native";
import { MasterHeader } from "@/common/common-ui/ui-layout/LayoutHeader";
import { FileManagerView } from "@/modules/file-management/FileManagerView";

export default function MasterFilesScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <MasterHeader title="ファイル管理" />
      <FileManagerView hideHeader={true} showBreadcrumbs={true} />
    </View>
  );
}
