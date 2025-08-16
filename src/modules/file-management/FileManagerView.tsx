import React, { useEffect, useCallback } from "react";
import { View, Alert } from "react-native";
import { useAuth } from "@/services/auth/useAuth";

// Components
import { FileManagerHeader } from "./components/FileManagerHeader";
import { FileExplorer } from "./file-browser-ui/FileExplorer/FileExplorer";
import { FileManagerModals } from "./components/FileManagerModals";

// Hooks
import { useFileManagerState } from "./components/useFileManagerState";
import { useStorageSync } from "./components/useStorageSync";
import { useFileOperations } from "./components/useFileOperations";

// Types
import { FileManagerViewProps } from "./components/types";

export function FileManagerView({
  hideHeader = false,
  showBreadcrumbs = true,
}: FileManagerViewProps) {
  const { user } = useAuth();
  const {
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
  } = useFileManagerState();

  const { syncStorageFiles } = useStorageSync();
  const {
    loadFolderContents,
    buildBreadcrumbs,
    handleFolderNavigation,
    handleCreateFolder,
    handleDeleteSelected,
  } = useFileOperations();

  // 初期化とストレージ同期
  useEffect(() => {
    if (user?.storeId && user?.uid) {
      const initializeFileManager = async () => {
        await syncStorageFiles(user.storeId, user.uid);
        await loadFolderContents(
          user.storeId,
          currentFolderId,
          sortOptions,
          setFolders,
          setFiles,
          setIsLoading
        );
        await buildBreadcrumbs(user.storeId, currentFolderId, setBreadcrumbs);
      };

      initializeFileManager();
    }
  }, [
    user?.storeId,
    user?.uid,
    currentFolderId,
    sortOptions,
    syncStorageFiles,
    loadFolderContents,
    buildBreadcrumbs,
  ]);

  const onFolderSelect = useCallback(
    (folderId: string | null) => {
      if (!user?.storeId) return;
      handleFolderNavigation(
        folderId,
        user.storeId,
        sortOptions,
        setCurrentFolderId,
        setFolders,
        setFiles,
        setIsLoading,
        setBreadcrumbs
      );
    },
    [user?.storeId, sortOptions, handleFolderNavigation]
  );

  const onUploadRequest = useCallback((folderId: string | null) => {
    setUploadModalFolderId(folderId);
    setShowUploadModal(true);
  }, []);

  const onUploadComplete = useCallback(async () => {
    if (!user?.storeId) return;
    await loadFolderContents(
      user.storeId,
      currentFolderId,
      sortOptions,
      setFolders,
      setFiles,
      setIsLoading
    );
  }, [user?.storeId, currentFolderId, sortOptions, loadFolderContents]);

  const onFolderCreate = useCallback(
    async (folderName: string) => {
      if (!user?.storeId || !user?.uid) return;
      await handleCreateFolder(
        folderName,
        currentFolderId,
        user.storeId,
        user.uid,
        sortOptions,
        setFolders,
        setFiles,
        setIsLoading,
        setShowCreateFolderModal
      );
    },
    [user?.storeId, user?.uid, currentFolderId, sortOptions, handleCreateFolder]
  );

  const onDeleteSelected = useCallback(async () => {
    if (!user?.storeId) return;
    await handleDeleteSelected(
      selectedItems,
      folders,
      files,
      user.storeId,
      currentFolderId,
      sortOptions,
      setFolders,
      setFiles,
      setIsLoading,
      setSelectedItems
    );
  }, [
    user?.storeId,
    selectedItems,
    folders,
    files,
    currentFolderId,
    sortOptions,
    handleDeleteSelected,
  ]);

  const onSortChange = useCallback(
    async (newSortOptions: typeof sortOptions) => {
      if (!user?.storeId) return;
      setSortOptions(newSortOptions);
      await loadFolderContents(
        user.storeId,
        currentFolderId,
        newSortOptions,
        setFolders,
        setFiles,
        setIsLoading
      );
    },
    [user?.storeId, currentFolderId, loadFolderContents]
  );

  return (
    <View style={{ flex: 1 }}>
      <FileManagerHeader hideHeader={hideHeader} />

      <FileExplorer
        folders={folders}
        files={files}
        breadcrumbs={breadcrumbs}
        showBreadcrumbs={showBreadcrumbs}
        sortOptions={sortOptions}
        selectedItems={selectedItems}
        isLoading={isLoading}
        onFolderSelect={onFolderSelect}
        onUploadRequest={onUploadRequest}
        onCreateFolderRequest={() => setShowCreateFolderModal(true)}
        onDeleteSelected={onDeleteSelected}
        onSortChange={onSortChange}
        onSelectionChange={setSelectedItems}
      />

      <FileManagerModals
        showUploadModal={showUploadModal}
        showCreateFolderModal={showCreateFolderModal}
        uploadModalFolderId={uploadModalFolderId}
        currentFolderId={currentFolderId}
        onUploadComplete={onUploadComplete}
        onFolderCreate={onFolderCreate}
        setShowUploadModal={setShowUploadModal}
        setShowCreateFolderModal={setShowCreateFolderModal}
      />
    </View>
  );
}