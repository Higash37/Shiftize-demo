import { useState } from "react";
import {
  Folder,
  FileItem,
  BreadcrumbItem,
  FileSortOptions,
} from "@/common/common-models/ModelIndex";
import { FileManagerState, FileManagerActions } from "./types";

export const useFileManagerState = (): FileManagerState & FileManagerActions => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sortOptions, setSortOptions] = useState<FileSortOptions>({
    field: "name",
    direction: "asc",
  });
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [uploadModalFolderId, setUploadModalFolderId] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  return {
    folders,
    files,
    currentFolderId,
    breadcrumbs,
    isLoading,
    sortOptions,
    showUploadModal,
    showCreateFolderModal,
    uploadModalFolderId,
    selectedItems,
    setFolders,
    setFiles,
    setCurrentFolderId,
    setBreadcrumbs,
    setIsLoading,
    setSortOptions,
    setShowUploadModal,
    setShowCreateFolderModal,
    setUploadModalFolderId,
    setSelectedItems,
  };
};