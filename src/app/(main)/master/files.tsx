import React from "react";
import { FileManagerView } from "@/modules/file-management/FileManagerView";

export default function MasterFilesScreen() {
  return <FileManagerView hideHeader={false} showBreadcrumbs={true} />;
}
