import React from "react";
import { FileUploadModal } from "../file-browser-ui/FileUploadModal/FileUploadModal";
import { CreateFolderModal } from "../file-browser-ui/CreateFolderModal/CreateFolderModal";

interface FileManagerModalsProps {
  showUploadModal: boolean;
  showCreateFolderModal: boolean;
  uploadModalFolderId: string | null;
  currentFolderId: string | null;
  onUploadComplete: () => void;
  onFolderCreate: (folderName: string) => void;
  setShowUploadModal: (show: boolean) => void;
  setShowCreateFolderModal: (show: boolean) => void;
}

export const FileManagerModals: React.FC<FileManagerModalsProps> = ({
  showUploadModal,
  showCreateFolderModal,
  uploadModalFolderId,
  currentFolderId,
  onUploadComplete,
  onFolderCreate,
  setShowUploadModal,
  setShowCreateFolderModal,
}) => {
  return (
    <>
      <FileUploadModal
        visible={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        folderId={uploadModalFolderId || currentFolderId || ""}
        onUploadComplete={onUploadComplete}
      />

      <CreateFolderModal
        visible={showCreateFolderModal}
        onClose={() => setShowCreateFolderModal(false)}
        onCreateFolder={onFolderCreate}
      />
    </>
  );
};