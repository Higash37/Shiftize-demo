import {
  Folder,
  FileItem,
  BreadcrumbItem,
  FileSortOptions,
} from "@/common/common-models/ModelIndex";

export interface FileManagerViewProps {
  hideHeader?: boolean;
  showBreadcrumbs?: boolean;
}

export interface FileManagerState {
  folders: Folder[];
  files: FileItem[];
  currentFolderId: string | null;
  breadcrumbs: BreadcrumbItem[];
  isLoading: boolean;
  sortOptions: FileSortOptions;
  showUploadModal: boolean;
  showCreateFolderModal: boolean;
  uploadModalFolderId: string | null;
  selectedItems: Set<string>;
}

export interface FileManagerActions {
  setFolders: (folders: Folder[]) => void;
  setFiles: (files: FileItem[]) => void;
  setCurrentFolderId: (id: string | null) => void;
  setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void;
  setIsLoading: (loading: boolean) => void;
  setSortOptions: (options: FileSortOptions) => void;
  setShowUploadModal: (show: boolean) => void;
  setShowCreateFolderModal: (show: boolean) => void;
  setUploadModalFolderId: (id: string | null) => void;
  setSelectedItems: (items: Set<string>) => void;
}

export interface StorageFile {
  name: string;
  fullPath: string;
  folderId?: string;
  size: number;
  timeCreated: string;
  updated: string;
}