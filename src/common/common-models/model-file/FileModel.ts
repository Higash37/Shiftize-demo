/**
 * ファイル管理システムの型定義
 */

export type FileType =
  | "pdf"
  | "image"
  | "document"
  | "video"
  | "audio"
  | "other";

export interface Folder {
  id: string;
  name: string;
  parentId?: string; // ルートフォルダの場合はundefined
  path: string; // "/数学/1年生/代数" のような階層パス
  level: number; // 階層レベル（ルート = 0）
  storeId: string; // 店舗ID（マルチテナント対応）
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // ユーザーUID
  isDeleted: boolean;
  childrenCount: number; // 子フォルダ数
  filesCount: number; // 直下のファイル数
}

export interface FileItem {
  id: string;
  name: string;
  originalName: string; // 元のファイル名
  type: FileType;
  mimeType: string;
  size: number; // バイト数
  folderId: string;
  folderPath?: string; // フォルダの階層パス（例: "/英語/文法"）
  storeId: string;
  storageUrl: string; // Firebase Storage URL
  downloadUrl?: string; // 公開ダウンロードURL
  thumbnailUrl?: string; // サムネイルURL（画像・PDF用）
  metadata: FileMetadata;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  isDeleted: boolean;
  downloadCount: number; // ダウンロード回数
  lastAccessedAt?: Date;
}

export interface FileMetadata {
  width?: number; // 画像の幅
  height?: number; // 画像の高さ
  duration?: number; // 動画・音声の長さ（秒）
  pageCount?: number; // PDFのページ数
  description?: string; // ファイル説明
  tags?: string[]; // タグ
  subject?: string; // 教科
  grade?: string; // 学年
  category?: string; // カテゴリ
}

export interface FolderTreeItem {
  folder: Folder;
  children: FolderTreeItem[];
  isExpanded: boolean;
  isSelected: boolean;
}

export interface FileUploadProgress {
  fileId: string;
  fileName: string;
  progress: number; // 0-100
  status: "uploading" | "processing" | "completed" | "error";
  error?: string;
}

export interface BreadcrumbItem {
  id: string;
  name: string;
  path: string;
}

// 検索・フィルタ用
export interface FileSearchParams {
  query?: string;
  type?: FileType[];
  folderId?: string;
  createdBy?: string;
  dateFrom?: Date;
  dateTo?: Date;
  tags?: string[];
  subject?: string;
  grade?: string;
}

export interface FileSortOptions {
  field: "name" | "createdAt" | "updatedAt" | "size" | "downloadCount";
  direction: "asc" | "desc";
}

// 統計情報
export interface FileSystemStats {
  totalFolders: number;
  totalFiles: number;
  totalSize: number; // バイト数
  filesByType: Record<FileType, number>;
  recentUploads: FileItem[];
  popularFiles: FileItem[];
}
