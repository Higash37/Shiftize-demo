import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  getMetadata,
  updateMetadata,
  listAll,
} from "firebase/storage";
import { storage } from "../firebase/firebase-core";
import {
  FileType,
  FileUploadProgress,
  Folder,
} from "@/common/common-models/ModelIndex";

/**
 * Firebase Storage ファイル管理サービス
 */
export class StorageService {
  /**
   * ファイルタイプを判定
   */
  static getFileType(mimeType: string): FileType {
    if (mimeType.includes("pdf")) return "pdf";
    if (mimeType.startsWith("image/")) return "image";
    if (
      mimeType.includes("document") ||
      mimeType.includes("word") ||
      mimeType.includes("text")
    )
      return "document";
    if (mimeType.startsWith("video/")) return "video";
    if (mimeType.startsWith("audio/")) return "audio";
    return "other";
  }

  /**
   * ファイルサイズをフォーマット
   */
  static formatFileSize(bytes: number): string {
    const sizes = ["Bytes", "KB", "MB", "GB"];
    if (bytes === 0) return "0 Bytes";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  }

  /**
   * ファイルをアップロード
   */
  static async uploadFile(
    file: File,
    folderId: string,
    storeId: string,
    onProgress?: (progress: FileUploadProgress) => void
  ): Promise<{
    storageUrl: string;
    downloadUrl: string;
    size: number;
    mimeType: string;
    type: FileType;
  }> {
    try {
      // ファイル名をサニタイズ
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const timestamp = Date.now();
      const fileName = `${timestamp}_${sanitizedFileName}`;

      // フォルダの階層パスを取得してStorageパスを構築
      const { FolderService } = await import("./fileService");
      let folderPath = "root";
      
      
      if (folderId && folderId !== "root" && folderId !== "") {
        try {
          const folders = await FolderService.getFoldersByStore(storeId);
          folderPath = this.buildStoragePath(folderId, folders);
        } catch (error) {
        }
      }

      // ストレージパスを構築
      const storagePath = `files/${storeId}/${folderPath}/${fileName}`;
      const storageRef = ref(storage, storagePath);


      // アップロードタスクを作成
      const uploadTask = uploadBytesResumable(storageRef, file);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            // アップロード進捗を計算
            const progress = Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            );


            if (onProgress) {
              onProgress({
                fileId: fileName,
                fileName: file.name,
                progress,
                status: "uploading",
              });
            }
          },
          (error) => {
            if (onProgress) {
              onProgress({
                fileId: fileName,
                fileName: file.name,
                progress: 0,
                status: "error",
                error: error.message,
              });
            }
            reject(error);
          },
          async () => {
            try {
              // アップロード完了後にダウンロードURLを取得
              const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
              const fileType = this.getFileType(file.type);


              if (onProgress) {
                onProgress({
                  fileId: fileName,
                  fileName: file.name,
                  progress: 100,
                  status: "completed",
                });
              }

              resolve({
                storageUrl: storagePath,
                downloadUrl,
                size: file.size,
                mimeType: file.type,
                type: fileType,
              });
            } catch (error) {
              reject(error);
            }
          }
        );
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * 複数ファイルを一括アップロード
   */
  static async uploadMultipleFiles(
    files: File[],
    folderId: string,
    storeId: string,
    onProgress?: (progress: FileUploadProgress) => void
  ): Promise<
    Array<{
      storageUrl: string;
      downloadUrl: string;
      size: number;
      mimeType: string;
      type: FileType;
      originalName: string;
      folderId: string;
    }>
  > {
    const results = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file) continue;
      try {
        const result = await this.uploadFile(
          file,
          folderId,
          storeId,
          (progress) => {
            if (onProgress) {
              onProgress({
                ...progress,
                fileId: `${i}_${progress.fileId}`,
              });
            }
          }
        );
        results.push({
          ...result,
          originalName: file!.name,
          folderId: folderId, // folderIdを結果に含める
        });
      } catch (error) {
        // エラーがあっても他のファイルの処理を続行
      }
    }

    return results;
  }

  /**
   * フォルダIDからStorage用のパスを構築
   */
  private static buildStoragePath(folderId: string, folders: Folder[]): string {
    const pathParts: string[] = [];
    let currentFolderId: string | undefined = folderId;
    
    // 親フォルダを辿って階層パスを構築
    while (currentFolderId) {
      const folder = folders.find(f => f.id === currentFolderId);
      if (folder) {
        pathParts.unshift(folder.name); // 先頭に追加
        currentFolderId = folder.parentId;
      } else {
        break;
      }
    }
    
    const result = pathParts.length > 0 ? pathParts.join("/") : "root";
    return result;
  }

  /**
   * ファイルを削除
   */
  static async deleteFile(storageUrl: string): Promise<void> {
    try {
      const fileRef = ref(storage, storageUrl);
      await deleteObject(fileRef);
    } catch (error) {
      throw error;
    }
  }

  /**
   * ファイルのメタデータを取得
   */
  static async getFileMetadata(storageUrl: string): Promise<{
    size: number;
    contentType: string;
    timeCreated: string;
    updated: string;
    downloadTokens?: string;
  }> {
    try {
      const fileRef = ref(storage, storageUrl);
      const metadata = await getMetadata(fileRef);

      const result: {
        size: number;
        contentType: string;
        timeCreated: string;
        updated: string;
        downloadTokens?: string;
      } = {
        size: metadata.size,
        contentType: metadata.contentType || "application/octet-stream",
        timeCreated: metadata.timeCreated,
        updated: metadata.updated,
      };
      
      if (metadata.customMetadata?.['downloadTokens']) {
        result.downloadTokens = metadata.customMetadata['downloadTokens'];
      }
      
      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * ダウンロードURLを更新
   */
  static async refreshDownloadUrl(storageUrl: string): Promise<string> {
    try {
      const fileRef = ref(storage, storageUrl);
      return await getDownloadURL(fileRef);
    } catch (error) {
      throw error;
    }
  }

  /**
   * 全てのStorage内ファイルを取得（既存データ検索用）
   */
  static async getAllStorageFiles(storeId: string): Promise<
    Array<{
      name: string;
      fullPath: string;
      size: number;
      contentType: string;
      timeCreated: string;
      downloadUrl: string;
      folderId: string;
    }>
  > {
    try {

      // ストア全体のファイル一覧を取得
      const storeRef = ref(storage, `files/${storeId}`);
      const result = await listAll(storeRef);

      const files = [];

      // 各プレフィックス（フォルダ）を探索
      for (const folderRef of result.prefixes) {
        const folderResult = await listAll(folderRef);

        for (const itemRef of folderResult.items) {
          try {
            const metadata = await getMetadata(itemRef);
            const downloadUrl = await getDownloadURL(itemRef);

            // パスからフォルダIDを抽出
            const pathParts = itemRef.fullPath.split("/");
            const folderId = pathParts[2] || "root"; // files/storeId/folderId/filename

            files.push({
              name: itemRef.name,
              fullPath: itemRef.fullPath,
              size: metadata.size,
              contentType: metadata.contentType || "application/octet-stream",
              timeCreated: metadata.timeCreated,
              downloadUrl,
              folderId,
            });

          } catch (error) {
          }
        }
      }

      // ルートレベルのファイルもチェック
      for (const itemRef of result.items) {
        try {
          const metadata = await getMetadata(itemRef);
          const downloadUrl = await getDownloadURL(itemRef);

          files.push({
            name: itemRef.name,
            fullPath: itemRef.fullPath,
            size: metadata.size,
            contentType: metadata.contentType || "application/octet-stream",
            timeCreated: metadata.timeCreated,
            downloadUrl,
            folderId: "", // ルートファイルは空文字
          });

        } catch (error) {
        }
      }

      return files;
    } catch (error) {
      throw error;
    }
  }

  /**
   * フォルダ内のファイル一覧を取得（Storage直接）
   */
  static async listFilesInFolder(
    storeId: string,
    folderId: string
  ): Promise<
    Array<{
      name: string;
      fullPath: string;
      size: number;
      contentType: string;
      timeCreated: string;
      downloadUrl: string;
    }>
  > {
    try {
      const folderRef = ref(storage, `files/${storeId}/${folderId}`);
      const result = await listAll(folderRef);

      const files = [];
      for (const itemRef of result.items) {
        try {
          const metadata = await getMetadata(itemRef);
          const downloadUrl = await getDownloadURL(itemRef);

          files.push({
            name: itemRef.name,
            fullPath: itemRef.fullPath,
            size: metadata.size,
            contentType: metadata.contentType || "application/octet-stream",
            timeCreated: metadata.timeCreated,
            downloadUrl,
          });
        } catch (error) {
        }
      }

      return files;
    } catch (error) {
      throw error;
    }
  }

  /**
   * ファイルをダウンロード
   */
  static async downloadFile(
    storageUrl: string,
    fileName: string
  ): Promise<void> {
    try {
      const fileRef = ref(storage, storageUrl);
      const downloadUrl = await getDownloadURL(fileRef);

      // ブラウザでファイルダウンロードを実行
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = fileName;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      throw error;
    }
  }

  /**
   * 画像ファイルのサムネイルURLを生成
   * (Firebase Storage Extensions の Image Resizing を使用する場合)
   */
  static getThumbnailUrl(
    downloadUrl: string,
    size: "thumb" | "small" | "medium" = "thumb"
  ): string {
    // Firebase Extensions Image Resizing を使用している場合の例
    // 実際の実装は使用している拡張機能によって異なります
    const sizeMap = {
      thumb: "150x150",
      small: "300x300",
      medium: "600x600",
    };

    // 元のURLから拡張子を取得してサムネイルパスを生成
    const urlParts = downloadUrl.split("?");
    const basePath = urlParts[0];
    const queryParams = urlParts[1];
    
    if (!basePath) {
      return downloadUrl; // 元のURLを返す
    }

    // ファイル名と拡張子を分離
    const lastSlash = basePath.lastIndexOf("/");
    const fileName = basePath.substring(lastSlash + 1);
    const lastDot = fileName.lastIndexOf(".");
    const nameWithoutExt = fileName.substring(0, lastDot);
    const extension = fileName.substring(lastDot);

    // サムネイルパスを構築
    const thumbnailPath =
      basePath.substring(0, lastSlash + 1) +
      `${nameWithoutExt}_${sizeMap[size]}${extension}`;

    return queryParams ? `${thumbnailPath}?${queryParams}` : thumbnailPath;
  }

  /**
   * ファイル検証
   */
  static validateFile(file: File): { isValid: boolean; error?: string } {
    const maxSize = 50 * 1024 * 1024; // 50MB
    const allowedTypes = [
      "image/",
      "video/",
      "application/pdf",
      "application/",
      "text/",
    ];

    if (file.size > maxSize) {
      return {
        isValid: false,
        error: `ファイルサイズが大きすぎます。${this.formatFileSize(
          maxSize
        )}以下にしてください。`,
      };
    }

    const isAllowedType = allowedTypes.some((type) =>
      file.type.startsWith(type)
    );
    if (!isAllowedType) {
      return {
        isValid: false,
        error: "サポートされていないファイル形式です。",
      };
    }

    return { isValid: true };
  }
}
