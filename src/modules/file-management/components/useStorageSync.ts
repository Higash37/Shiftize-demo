import { useCallback } from "react";
import { Alert } from "react-native";
import { FolderService, FileService } from "@/services/file/fileService";
import { StorageService } from "@/services/file/storageService";
import { CollectionRecoveryService } from "@/services/file/collectionRecovery";
import { StorageFile } from "./types";

export const useStorageSync = () => {
  const syncStorageFiles = useCallback(async (storeId: string, userId: string) => {
    try {
      const storageFiles = await StorageService.getAllStorageFiles(storeId);

      if (storageFiles.length === 0) {
        return;
      }

      for (const storageFile of storageFiles) {
        try {
          const existingFiles = await FileService.searchFiles(storeId, {
            query: storageFile.name,
          });

          const existingFile = existingFiles.find(
            (f) => f.storageUrl === storageFile.fullPath
          );

          if (!existingFile) {
            let targetFolderId = storageFile.folderId;
            
            if (targetFolderId && targetFolderId !== "root" && targetFolderId !== "") {
              const folderExists = await FolderService.getFoldersByStore(storeId)
                .then((folders) => folders.find((f) => f.id === targetFolderId));

              if (!folderExists) {
                targetFolderId = await FolderService.createFolder(
                  "既存ファイル",
                  undefined,
                  storeId,
                  userId
                );
              }
            } else {
              targetFolderId = "";
            }

            await FileService.createFileMetadata({
              name: storageFile.name,
              size: storageFile.size,
              type: getFileTypeFromName(storageFile.name),
              storageUrl: storageFile.fullPath,
              folderId: targetFolderId || "",
              storeId,
              uploadedBy: userId,
              createdAt: new Date(storageFile.timeCreated),
              updatedAt: new Date(storageFile.updated),
            });
          }
        } catch (fileError) {
          console.error(`Error syncing file ${storageFile.name}:`, fileError);
        }
      }
    } catch (error) {
      console.error("Error syncing storage files:", error);
      Alert.alert("エラー", "ファイル同期中にエラーが発生しました");
    }
  }, []);

  const getFileTypeFromName = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const typeMap: { [key: string]: string } = {
      pdf: "application/pdf",
      doc: "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      xls: "application/vnd.ms-excel",
      xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      txt: "text/plain",
    };
    return typeMap[extension || ""] || "application/octet-stream";
  };

  return { syncStorageFiles };
};