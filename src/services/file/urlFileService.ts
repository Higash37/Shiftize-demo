import {
  collection,
  addDoc,
  updateDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  increment,
  doc,
} from "firebase/firestore";
import { db } from "../firebase/firebase-core";
import { FileItem } from "@/common/common-models/ModelIndex";

const FILES_COLLECTION = "files";

/**
 * URL保存方式のファイル管理サービス
 * PDFファイルのURLを直接保存する方式
 */
export class UrlFileService {
  /**
   * URLファイルを保存
   */
  static async createUrlFile(fileData: {
    name: string;
    originalName: string;
    url: string;
    type: "pdf" | "image" | "document" | "video" | "audio" | "other";
    folderId: string;
    storeId: string;
    createdBy: string;
    metadata?: {
      description?: string;
      source?: string; // 元のサイト名など
      tags?: string[];
    };
  }): Promise<string> {
    try {
      const firestoreData = {
        ...fileData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        isDeleted: false,
        downloadCount: 0,
        lastAccessedAt: null,
      };

      const docRef = await addDoc(
        collection(db, FILES_COLLECTION),
        firestoreData
      );
      return docRef.id;
    } catch (error) {
      console.error("Error creating URL file:", error);
      throw error;
    }
  }

  /**
   * URLファイルを更新
   */
  static async updateUrlFile(
    fileId: string,
    updates: Partial<{
      name: string;
      url: string;
      metadata: {
        description?: string;
        source?: string;
        tags?: string[];
      };
    }>
  ): Promise<void> {
    try {
      await updateDoc(doc(db, FILES_COLLECTION, fileId), {
        ...updates,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error("Error creating URL file:", error);
      throw error;
    }
  }

  /**
   * URLファイルを削除
   */
  static async deleteUrlFile(fileId: string): Promise<void> {
    try {
      await updateDoc(doc(db, FILES_COLLECTION, fileId), {
        isDeleted: true,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error("Error creating URL file:", error);
      throw error;
    }
  }

  /**
   * フォルダ内のURLファイル一覧を取得
   */
  static async getUrlFilesByFolder(
    folderId: string,
    storeId: string
  ): Promise<FileItem[]> {
    try {
      const q = query(
        collection(db, FILES_COLLECTION),
        where("folderId", "==", folderId),
        where("storeId", "==", storeId),
        where("isDeleted", "==", false),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data()["createdAt"].toDate(),
            updatedAt: doc.data()["updatedAt"].toDate(),
            lastAccessedAt: doc.data()["lastAccessedAt"]?.toDate(),
            // URL保存方式では、downloadUrl = url
            downloadUrl: doc.data()["url"],
            storageUrl: doc.data()["url"], // 互換性のため
            size: 0, // URL保存ではサイズ不明
            mimeType: this.getMimeTypeFromUrl(doc.data()["url"]),
          } as FileItem)
      );
    } catch (error) {
      console.error("Error creating URL file:", error);
      throw error;
    }
  }

  /**
   * URLからMIMEタイプを推定
   */
  private static getMimeTypeFromUrl(url: string): string {
    const extension = url.split(".").pop()?.toLowerCase();

    switch (extension) {
      case "pdf":
        return "application/pdf";
      case "jpg":
      case "jpeg":
        return "image/jpeg";
      case "png":
        return "image/png";
      case "gif":
        return "image/gif";
      case "mp4":
        return "video/mp4";
      case "mp3":
        return "audio/mpeg";
      default:
        return "application/octet-stream";
    }
  }

  /**
   * ダウンロード回数を増加
   */
  static async incrementDownloadCount(fileId: string): Promise<void> {
    try {
      await updateDoc(doc(db, FILES_COLLECTION, fileId), {
        downloadCount: increment(1),
        lastAccessedAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error("Error creating URL file:", error);
      throw error;
    }
  }

  /**
   * URLの有効性をチェック
   */
  static async validateUrl(url: string): Promise<{
    isValid: boolean;
    error?: string;
  }> {
    try {
      const response = await fetch(url, { method: "HEAD" });

      if (!response.ok) {
        return {
          isValid: false,
          error: `URLが無効です (${response.status})`,
        };
      }

      // Content-Typeをチェック
      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("pdf")) {
        return {
          isValid: false,
          error: "PDFファイルではありません",
        };
      }

      return { isValid: true };
    } catch (error) {
      console.error("Error validating URL:", error);
      return {
        isValid: false,
        error: "URLにアクセスできません",
      };
    }
  }
}
