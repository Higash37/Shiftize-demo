/**
 * @file FileModel.ts
 * @description ファイル管理システムの型定義（フォルダ・ファイル・検索・統計）
 */

/** ファイルの種別 */
export type FileType =
  | "pdf"
  | "image"
  | "document"
  | "video"
  | "audio"
  | "other";

/** フォルダ情報。DBのfoldersテーブルに対応 */
export interface Folder {
  /** UUID */
  id: string;
  /** フォルダ名 */
  name: string;
  /** 親フォルダID。ルートフォルダはundefined */
  parentId?: string;
  /** 階層パス（例: "/数学/1年生/代数"） */
  path: string;
  /** 階層レベル（ルート = 0） */
  level: number;
  /** 店舗ID（マルチテナント対応） */
  storeId: string;
  /** 作成日時 */
  createdAt: Date;
  /** 更新日時 */
  updatedAt: Date;
  /** 作成者のユーザーUID */
  createdBy: string;
  /** 論理削除フラグ */
  isDeleted: boolean;
  /** 子フォルダ数 */
  childrenCount: number;
  /** 直下のファイル数 */
  filesCount: number;
}

/** ファイル情報。DBのfilesテーブルに対応 */
export interface FileItem {
  /** UUID */
  id: string;
  /** 表示用ファイル名 */
  name: string;
  /** アップロード時の元ファイル名 */
  originalName: string;
  /** ファイル種別 */
  type: FileType;
  /** MIMEタイプ */
  mimeType: string;
  /** ファイルサイズ（バイト） */
  size: number;
  /** 所属フォルダのID */
  folderId: string;
  /** フォルダの階層パス（例: "/英語/文法"） */
  folderPath?: string;
  /** 店舗ID */
  storeId: string;
  /** Supabase Storage URL */
  storageUrl: string;
  /** 公開ダウンロードURL */
  downloadUrl?: string;
  /** サムネイルURL（画像・PDF用） */
  thumbnailUrl?: string;
  /** メタデータ */
  metadata: FileMetadata;
  /** 作成日時 */
  createdAt: Date;
  /** 更新日時 */
  updatedAt: Date;
  /** 作成者のUID */
  createdBy: string;
  /** 論理削除フラグ */
  isDeleted: boolean;
  /** ダウンロード回数 */
  downloadCount: number;
  /** 最終アクセス日時 */
  lastAccessedAt?: Date;
}

/** ファイルに付随するメタデータ */
export interface FileMetadata {
  /** 画像の幅（px） */
  width?: number;
  /** 画像の高さ（px） */
  height?: number;
  /** 動画・音声の長さ（秒） */
  duration?: number;
  /** PDFのページ数 */
  pageCount?: number;
  /** ファイル説明 */
  description?: string;
  /** タグ */
  tags?: string[];
  /** 教科 */
  subject?: string;
  /** 学年 */
  grade?: string;
  /** カテゴリ */
  category?: string;
}

/** フォルダツリーの1ノード */
export interface FolderTreeItem {
  /** フォルダ本体 */
  folder: Folder;
  /** 子ノード */
  children: FolderTreeItem[];
  /** 展開状態 */
  isExpanded: boolean;
  /** 選択状態 */
  isSelected: boolean;
}

/** ファイルアップロードの進捗状態 */
export interface FileUploadProgress {
  /** 対象ファイルのID */
  fileId: string;
  /** ファイル名 */
  fileName: string;
  /** 進捗率（0-100） */
  progress: number;
  /** アップロード状態 */
  status: "uploading" | "processing" | "completed" | "error";
  /** エラーメッセージ */
  error?: string;
}

/** パンくずリストの1アイテム */
export interface BreadcrumbItem {
  /** フォルダID */
  id: string;
  /** 表示名 */
  name: string;
  /** フォルダパス */
  path: string;
}

/** ファイル検索・フィルタの条件 */
export interface FileSearchParams {
  /** キーワード */
  query?: string;
  /** ファイル種別フィルタ */
  type?: FileType[];
  /** フォルダID */
  folderId?: string;
  /** 作成者ID */
  createdBy?: string;
  /** 作成日の開始 */
  dateFrom?: Date;
  /** 作成日の終了 */
  dateTo?: Date;
  /** タグフィルタ */
  tags?: string[];
  /** 教科フィルタ */
  subject?: string;
  /** 学年フィルタ */
  grade?: string;
}

/** ファイル一覧のソート条件 */
export interface FileSortOptions {
  /** ソートキー */
  field: "name" | "createdAt" | "updatedAt" | "size" | "downloadCount";
  /** 昇順/降順 */
  direction: "asc" | "desc";
}

/** ファイルシステム全体の統計情報 */
export interface FileSystemStats {
  /** フォルダ総数 */
  totalFolders: number;
  /** ファイル総数 */
  totalFiles: number;
  /** 全ファイルの合計サイズ（バイト） */
  totalSize: number;
  /** 種別ごとのファイル数 */
  filesByType: Record<FileType, number>;
  /** 最近アップロードされたファイル */
  recentUploads: FileItem[];
  /** よくダウンロードされるファイル */
  popularFiles: FileItem[];
}
