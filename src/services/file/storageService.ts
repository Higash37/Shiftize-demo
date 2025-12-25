/**
 * ⚠️ このファイルは凍結中です ⚠️
 *
 * 理由: ファイル機能の使用率が低いため凍結
 * 将来の移行予定: Firebase Storage → Supabase Storage
 *
 * このファイル全体がFirebase Storageに依存しているため、
 * すべての機能を無効化しています。
 *
 * 将来的にSupabase Storageへの移行時に再実装する予定です。
 */

/*
// 以下のコードは凍結中（Firebase Storage使用）

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

export class StorageService {
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

  static formatFileSize(bytes: number): string {
    const sizes = ["Bytes", "KB", "MB", "GB"];
    if (bytes === 0) return "0 Bytes";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  }

  // ... その他のメソッドも凍結中
}
*/

// ダミーエクスポート（importエラーを防ぐため）
export class StorageService {
  static getFileType(_mimeType: string): string {
    throw new Error("StorageService is currently disabled. Migration to Supabase Storage is planned.");
  }

  static formatFileSize(_bytes: number): string {
    throw new Error("StorageService is currently disabled. Migration to Supabase Storage is planned.");
  }

  static async uploadFile(): Promise<never> {
    throw new Error("StorageService is currently disabled. Migration to Supabase Storage is planned.");
  }

  static async uploadMultipleFiles(): Promise<never> {
    throw new Error("StorageService is currently disabled. Migration to Supabase Storage is planned.");
  }

  static async deleteFile(): Promise<never> {
    throw new Error("StorageService is currently disabled. Migration to Supabase Storage is planned.");
  }

  static async getFileMetadata(): Promise<never> {
    throw new Error("StorageService is currently disabled. Migration to Supabase Storage is planned.");
  }

  static async refreshDownloadUrl(): Promise<never> {
    throw new Error("StorageService is currently disabled. Migration to Supabase Storage is planned.");
  }

  static async getAllStorageFiles(): Promise<never> {
    throw new Error("StorageService is currently disabled. Migration to Supabase Storage is planned.");
  }

  static async listFilesInFolder(): Promise<never> {
    throw new Error("StorageService is currently disabled. Migration to Supabase Storage is planned.");
  }

  static async downloadFile(): Promise<never> {
    throw new Error("StorageService is currently disabled. Migration to Supabase Storage is planned.");
  }

  static getThumbnailUrl(): string {
    throw new Error("StorageService is currently disabled. Migration to Supabase Storage is planned.");
  }

  static validateFile(): { isValid: boolean; error?: string } {
    throw new Error("StorageService is currently disabled. Migration to Supabase Storage is planned.");
  }
}
