import React from "react";
import { useAuth } from "@/services/auth/useAuth";
import { MasterHeader, Header } from "@/common/common-ui/ui-layout";

interface FileManagerHeaderProps {
  hideHeader?: boolean;
}

export const FileManagerHeader: React.FC<FileManagerHeaderProps> = ({
  hideHeader = false,
}) => {
  const { role } = useAuth();

  if (hideHeader) {
    return null;
  }

  return role === "master" ? (
    <MasterHeader title="ファイル管理" />
  ) : (
    <Header title="ファイル管理" />
  );
};