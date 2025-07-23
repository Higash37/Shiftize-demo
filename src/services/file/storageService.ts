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
      
      console.log("アップロード開始 - folderId:", folderId);
      
      if (folderId && folderId !== "root" && folderId !== "") {
        try {
          const folders = await FolderService.getFoldersByStore(storeId);
          console.log("取得したフォルダ一覧:", folders.map(f => ({ id: f.id, name: f.name, path: f.path, parentId: f.parentId })));
          folderPath = this.buildStoragePath(folderId, folders);
          console.log("生成されたfolderPath:", folderPath);
        } catch (error) {
          console.warn("フォルダ情報の取得に失敗、rootを使用:", error);
        }
      }

      // ストレージパスを構築
      const storagePath = `files/${storeId}/${folderPath}/${fileName}`;
      console.log("最終ストレージパス:", storagePath);
      const storageRef = ref(storage, storagePath);

      console.log("アップロード開始:", {
        storagePath,
        fileSize: file.size,
        fileType: file.type,
      });

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

            console.log(`アップロード進捗: ${progress}%`);

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
            console.error("ファイルアップロードエラー:", error);
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

              console.log("アップロード完了:", { downloadUrl, fileType });

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
              console.error("ダウンロードURL取得エラー:", error);
              reject(error);
            }
          }
        );
      });
    } catch (error) {
      console.error("アップロード準備エラー:", error);
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
    console.log("uploadMultipleFiles開始 - 受信folderId:", folderId);
    const results = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        console.log(`ファイル${i}のアップロード開始 - folderId:`, folderId);
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
          originalName: file.name,
          folderId: folderId, // folderIdを結果に含める
        });
      } catch (error) {
        console.error(`ファイル ${file.name} のアップロードに失敗:`, error);
        // エラーがあっても他のファイルの処理を続行
      }
    }

    console.log("uploadMultipleFiles完了 - results:", results.map(r => ({name: r.originalName, folderId: r.folderId})));
    return results;
  }

  /**
   * フォルダIDからStorage用のパスを構築
   */
  private static buildStoragePath(folderId: string, folders: Folder[]): string {
    console.log("buildStoragePath開始 - folderId:", folderId);
    const pathParts: string[] = [];
    let currentFolderId: string | undefined = folderId;
    
    // 親フォルダを辿って階層パスを構築
    while (currentFolderId) {
      const folder = folders.find(f => f.id === currentFolderId);
      console.log("検索中のフォルダID:", currentFolderId, "見つかったフォルダ:", folder);
      if (folder) {
        pathParts.unshift(folder.name); // 先頭に追加
        console.log("パス部分追加:", folder.name, "現在のpathParts:", pathParts);
        currentFolderId = folder.parentId;
      } else {
        console.log("フォルダが見つからない:", currentFolderId);
        break;
      }
    }
    
    const result = pathParts.length > 0 ? pathParts.join("/") : "root";
    console.log("最終的なStorageパス:", result);
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
      console.error("ファイル削除エラー:", error);
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

      return {
        size: metadata.size,
        contentType: metadata.contentType || "application/octet-stream",
        timeCreated: metadata.timeCreated,
        updated: metadata.updated,
        downloadTokens: metadata.customMetadata?.downloadTokens,
      };
    } catch (error) {
      console.error("メタデータ取得エラー:", error);
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
      console.error("ダウンロードURL更新エラー:", error);
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
      console.log(`Storage内のファイルを検索中: store=${storeId}`);

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

            console.log(
              `ファイル発見: ${itemRef.name} (${this.formatFileSize(
                metadata.size
              )})`
            );
          } catch (error) {
            console.error(`ファイル ${itemRef.name} の情報取得エラー:`, error);
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

          console.log(`ルートファイル発見: ${itemRef.name}`);
        } catch (error) {
          console.error(`ファイル ${itemRef.name} の情報取得エラー:`, error);
        }
      }

      console.log(`Storage検索完了: ${files.length}個のファイルを発見`);
      return files;
    } catch (error) {
      console.error("Storage内ファイル一覧取得エラー:", error);
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
          console.error(`ファイル ${itemRef.name} の情報取得エラー:`, error);
        }
      }

      return files;
    } catch (error) {
      console.error("フォルダ内ファイル一覧取得エラー:", error);
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
      console.error("ファイルダウンロードエラー:", error);
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
