import { useCallback } from "react";
import { Alert } from "react-native";
import { FolderService, FileService } from "@/services/file/fileService";
import { CollectionRecoveryService } from "@/services/file/collectionRecovery";
import {
  Folder,
  FileItem,
  BreadcrumbItem,
  FileSortOptions,
} from "@/common/common-models/ModelIndex";

export const useFileOperations = () => {
  const loadFolderContents = useCallback(async (
    storeId: string,
    folderId: string | null,
    sortOptions: FileSortOptions,
    setFolders: (folders: Folder[]) => void,
    setFiles: (files: FileItem[]) => void,
    setIsLoading: (loading: boolean) => void
  ) => {
    if (!storeId) return;

    setIsLoading(true);
    try {
      const [foldersData, filesData] = await Promise.all([
        FolderService.getFoldersByParent(storeId, folderId),
        FileService.getFilesByFolder(storeId, folderId || ""),
      ]);

      const sortedFolders = sortFolders(foldersData, sortOptions);
      const sortedFiles = sortFiles(filesData, sortOptions);

      setFolders(sortedFolders);
      setFiles(sortedFiles);
    } catch (error) {
      console.error("Error loading folder contents:", error);
      Alert.alert("エラー", "フォルダ内容の読み込みに失敗しました");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const buildBreadcrumbs = useCallback(async (
    storeId: string,
    folderId: string | null,
    setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void
  ) => {
    if (!storeId) return;

    try {
      const breadcrumbsData = await FolderService.getBreadcrumbs(storeId, folderId);
      setBreadcrumbs(breadcrumbsData);
    } catch (error) {
      console.error("Error building breadcrumbs:", error);
      setBreadcrumbs([]);
    }
  }, []);

  const handleFolderNavigation = useCallback((
    folderId: string | null,
    storeId: string,
    sortOptions: FileSortOptions,
    setCurrentFolderId: (id: string | null) => void,
    setFolders: (folders: Folder[]) => void,
    setFiles: (files: FileItem[]) => void,
    setIsLoading: (loading: boolean) => void,
    setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void
  ) => {
    setCurrentFolderId(folderId);
    loadFolderContents(storeId, folderId, sortOptions, setFolders, setFiles, setIsLoading);
    buildBreadcrumbs(storeId, folderId, setBreadcrumbs);
  }, [loadFolderContents, buildBreadcrumbs]);

  const handleCreateFolder = useCallback(async (
    folderName: string,
    currentFolderId: string | null,
    storeId: string,
    userId: string,
    sortOptions: FileSortOptions,
    setFolders: (folders: Folder[]) => void,
    setFiles: (files: FileItem[]) => void,
    setIsLoading: (loading: boolean) => void,
    setShowCreateFolderModal: (show: boolean) => void
  ) => {
    try {
      await FolderService.createFolder(folderName, currentFolderId, storeId, userId);
      await loadFolderContents(storeId, currentFolderId, sortOptions, setFolders, setFiles, setIsLoading);
      setShowCreateFolderModal(false);
    } catch (error) {
      console.error("Error creating folder:", error);
      Alert.alert("エラー", "フォルダの作成に失敗しました");
    }
  }, [loadFolderContents]);

  const handleDeleteSelected = useCallback(async (
    selectedItems: Set<string>,
    folders: Folder[],
    files: FileItem[],
    storeId: string,
    currentFolderId: string | null,
    sortOptions: FileSortOptions,
    setFolders: (folders: Folder[]) => void,
    setFiles: (files: FileItem[]) => void,
    setIsLoading: (loading: boolean) => void,
    setSelectedItems: (items: Set<string>) => void
  ) => {
    if (selectedItems.size === 0) return;

    Alert.alert(
      "削除確認",
      `選択された${selectedItems.size}個のアイテムを削除しますか？`,
      [
        { text: "キャンセル", style: "cancel" },
        {
          text: "削除",
          style: "destructive",
          onPress: async () => {
            try {
              setIsLoading(true);

              for (const itemId of selectedItems) {
                const folder = folders.find((f) => f.id === itemId);
                const file = files.find((f) => f.id === itemId);

                if (folder) {
                  await FolderService.deleteFolder(itemId, storeId);
                } else if (file) {
                  await FileService.deleteFile(itemId, storeId);
                }
              }

              await loadFolderContents(storeId, currentFolderId, sortOptions, setFolders, setFiles, setIsLoading);
              setSelectedItems(new Set());
            } catch (error) {
              console.error("Error deleting items:", error);
              Alert.alert("エラー", "アイテムの削除に失敗しました");
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  }, [loadFolderContents]);

  const sortFolders = (folders: Folder[], sortOptions: FileSortOptions): Folder[] => {
    return [...folders].sort((a, b) => {
      const direction = sortOptions.direction === "asc" ? 1 : -1;
      switch (sortOptions.field) {
        case "name":
          return a.name.localeCompare(b.name) * direction;
        case "date":
          return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * direction;
        default:
          return 0;
      }
    });
  };

  const sortFiles = (files: FileItem[], sortOptions: FileSortOptions): FileItem[] => {
    return [...files].sort((a, b) => {
      const direction = sortOptions.direction === "asc" ? 1 : -1;
      switch (sortOptions.field) {
        case "name":
          return a.name.localeCompare(b.name) * direction;
        case "date":
          return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * direction;
        case "size":
          return (a.size - b.size) * direction;
        default:
          return 0;
      }
    });
  };

  return {
    loadFolderContents,
    buildBreadcrumbs,
    handleFolderNavigation,
    handleCreateFolder,
    handleDeleteSelected,
  };
};