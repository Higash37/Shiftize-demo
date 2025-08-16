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
import { ErrorHandler, FirebaseErrorHandler } from "@/common/common-utils/error-handling/ErrorHandler";

/**
 * Firebase Storage ファイル管理サービス
 * Production-ready file upload validation and error handling
 */
export class StorageService {
  /**
   * ファイルタイプを判定
   * @param mimeType - MIME type string
   * @returns FileType enum value
   */
  static getFileType(mimeType: string): FileType {
    if (!mimeType || typeof mimeType !== 'string') {
      return "other";
    }
    
    const normalizedType = mimeType.toLowerCase().trim();
    
    if (normalizedType.includes("pdf")) return "pdf";
    if (normalizedType.startsWith("image/")) return "image";
    if (
      normalizedType.includes("document") ||
      normalizedType.includes("word") ||
      normalizedType.includes("text")
    ) {
      return "document";
    }
    if (normalizedType.startsWith("video/")) return "video";
    if (normalizedType.startsWith("audio/")) return "audio";
    
    return "other";
  }

  /**
   * ファイルサイズをフォーマット
   * @param bytes - File size in bytes
   * @returns Formatted file size string
   */
  static formatFileSize(bytes: number): string {
    if (!Number.isFinite(bytes) || bytes < 0) {
      return "0 Bytes";
    }
    
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"] as const;
    
    if (bytes === 0) return "0 Bytes";
    
    const i = Math.min(
      Math.floor(Math.log(bytes) / Math.log(1024)),
      sizes.length - 1
    );
    
    const formattedSize = Math.round((bytes / Math.pow(1024, i)) * 100) / 100;
    return `${formattedSize} ${sizes[i]}`;
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
      // 包括的なファイル検証
      this.validateFileObject(file);
      
      // ファイル名を安全にサニタイズ
      const sanitizedFileName = this.sanitizeFileName(file.name);
      const timestamp = Date.now();
      const fileName = `${timestamp}_${sanitizedFileName}`;

      // フォルダの階層パスを取得してStorageパスを構築
      const { FolderService } = await import("./fileService");
      let folderPath = "root";
      
      if (this.isValidFolderId(folderId)) {
        try {
          const folders = await FolderService.getFoldersByStore(storeId);
          folderPath = this.buildStoragePath(folderId, folders);
        } catch (error) {
          console.warn(`Failed to build folder path for ${folderId}:`, error);
          // Continue with default "root" path
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
      const errorMessage = FirebaseErrorHandler.getFirebaseErrorMessage(error);
      if (__DEV__) {
        console.error('StorageService uploadFile failed:', error);
      }
      throw new Error(errorMessage);
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
          originalName: file.name,
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
   * @param folderId - Target folder ID
   * @param folders - Array of all available folders
   * @returns Sanitized storage path
   */
  private static buildStoragePath(folderId: string, folders: Folder[]): string {
    if (!Array.isArray(folders) || folders.length === 0) {
      return "root";
    }
    
    const pathParts: string[] = [];
    let currentFolderId: string | undefined = folderId;
    const visitedIds = new Set<string>(); // Prevent infinite loops
    
    // 親フォルダを辿って階層パスを構築
    while (currentFolderId && !visitedIds.has(currentFolderId)) {
      visitedIds.add(currentFolderId);
      
      const folder = folders.find(f => f?.id === currentFolderId);
      if (folder?.name) {
        const sanitizedName = this.sanitizePathComponent(folder.name);
        pathParts.unshift(sanitizedName); // 先頭に追加
        currentFolderId = folder.parentId;
      } else {
        break;
      }
    }
    
    return pathParts.length > 0 ? pathParts.join("/") : "root";
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

      return {
        size: metadata.size,
        contentType: metadata.contentType || "application/octet-stream",
        timeCreated: metadata.timeCreated,
        updated: metadata.updated,
        downloadTokens: metadata.customMetadata?.downloadTokens,
      };
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
    // URLの厳密な検証
    if (!this.isValidUrl(downloadUrl)) {
      return '';
    }

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
   * ファイル検証（包括的なセキュリティチェック付き）
   * @param file - File object to validate
   * @returns Validation result with detailed error information
   */
  static validateFile(file: File): { isValid: boolean; error?: string } {
    // ファイルオブジェクトの基本検証
    try {
      this.validateFileObject(file);
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : "無効なファイルです",
      };
    }

    // ファイルサイズ制限（50MB）
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: `ファイルサイズが大きすぎます。${this.formatFileSize(
          maxSize
        )}以下にしてください。`,
      };
    }

    // 最小ファイルサイズチェック（1バイト以上）
    if (file.size === 0) {
      return {
        isValid: false,
        error: "空のファイルはアップロードできません。",
      };
    }

    // 許可されたファイルタイプ
    const allowedTypes = [
      "image/",
      "video/",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument",
      "text/",
    ] as const;

    const normalizedType = file.type.toLowerCase();
    const isAllowedType = allowedTypes.some((type) =>
      normalizedType.startsWith(type)
    );
    
    if (!isAllowedType) {
      return {
        isValid: false,
        error: "サポートされていないファイル形式です。画像、PDF、文書ファイルのみアップロード可能です。",
      };
    }

    // 危険なファイル拡張子チェック
    if (this.isDangerousFileExtension(file.name)) {
      return {
        isValid: false,
        error: "セキュリティ上の理由により、このファイル形式はサポートされていません。",
      };
    }

    return { isValid: true };
  }

  /**
   * ファイルオブジェクトの基本検証
   * @private
   */
  private static validateFileObject(file: File): void {
    if (!file) {
      throw new Error("ファイルが選択されていません");
    }
    
    if (!(file instanceof File)) {
      throw new Error("無効なファイルオブジェクトです");
    }
    
    if (!file.name || typeof file.name !== 'string') {
      throw new Error("ファイル名が不正です");
    }
    
    if (!Number.isFinite(file.size) || file.size < 0) {
      throw new Error("ファイルサイズが不正です");
    }
    
    if (typeof file.type !== 'string') {
      throw new Error("ファイルタイプが不正です");
    }
  }

  /**
   * ファイル名の安全なサニタイズ
   * @private
   */
  private static sanitizeFileName(fileName: string): string {
    if (!fileName || typeof fileName !== 'string') {
      return 'unknown_file';
    }
    
    // 危険な文字を除去し、安全な文字のみを残す
    const sanitized = fileName
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/_{2,}/g, '_') // 連続するアンダースコアを1つに
      .replace(/^_+|_+$/g, '') // 先頭・末尾のアンダースコアを除去
      .substring(0, 100); // 最大100文字に制限
    
    return sanitized || 'file';
  }

  /**
   * パスコンポーネントのサニタイズ
   * @private
   */
  private static sanitizePathComponent(pathComponent: string): string {
    if (!pathComponent || typeof pathComponent !== 'string') {
      return 'folder';
    }
    
    return pathComponent
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/_{2,}/g, '_')
      .replace(/^_+|_+$/g, '')
      .substring(0, 50) || 'folder';
  }

  /**
   * 有効なフォルダIDかチェック
   * @private
   */
  private static isValidFolderId(folderId?: string): boolean {
    return Boolean(
      folderId && 
      typeof folderId === 'string' && 
      folderId.trim() !== '' && 
      folderId !== 'root'
    );
  }

  /**
   * 危険なファイル拡張子かチェック
   * @private
   */
  private static isDangerousFileExtension(fileName: string): boolean {
    if (!fileName || typeof fileName !== 'string') {
      return true;
    }
    
    const dangerousExtensions = [
      '.exe', '.bat', '.cmd', '.scr', '.pif', '.com',
      '.vbs', '.vbe', '.js', '.jse', '.ws', '.wsf',
      '.msi', '.msp', '.reg', '.scf', '.lnk',
      '.inf', '.dll', '.sys', '.ocx'
    ];
    
    const lowerFileName = fileName.toLowerCase();
    return dangerousExtensions.some(ext => lowerFileName.endsWith(ext));
  }

  /**
   * 有効なURLかチェック
   * @private
   */
  private static isValidUrl(url: string): boolean {
    if (!url || typeof url !== 'string') {
      return false;
    }
    
    try {
      new URL(url);
      return url.startsWith('https://') || url.startsWith('http://');
    } catch {
      return false;
    }
  }
}
