import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  writeBatch,
  increment,
  DocumentSnapshot,
} from "firebase/firestore";
import { db } from "../firebase/firebase-core";
import {
  Folder,
  FileItem,
  FileSearchParams,
  FileSortOptions,
  FileSystemStats,
  BreadcrumbItem,
} from "@/common/common-models/ModelIndex";

const FOLDERS_COLLECTION = "folders";
const FILES_COLLECTION = "files";

/**
 * フォルダ管理サービス
 */
export class FolderService {
  /**
   * フォルダを作成
   */
  static async createFolder(
    name: string,
    parentId: string | undefined,
    storeId: string,
    createdBy: string
  ): Promise<string> {
    try {
      // 親フォルダの情報を取得
      let parentPath = "";
      let level = 0;

      if (parentId) {
        const parentDoc = await getDoc(doc(db, FOLDERS_COLLECTION, parentId));
        if (parentDoc.exists()) {
          const parentData = parentDoc.data() as Folder;
          parentPath = parentData.path;
          level = parentData.level + 1;
        }
      }

      const path = parentPath ? `${parentPath}/${name}` : `/${name}`;

      const folderData: any = {
        name,
        path,
        level,
        storeId,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy,
        isDeleted: false,
        childrenCount: 0,
        filesCount: 0,
      };

      // parentIdがundefinedでない場合のみ追加
      if (parentId !== undefined) {
        folderData.parentId = parentId;
      }

      const docRef = await addDoc(collection(db, FOLDERS_COLLECTION), {
        ...folderData,
        createdAt: Timestamp.fromDate(folderData.createdAt),
        updatedAt: Timestamp.fromDate(folderData.updatedAt),
      });

      // 親フォルダの子フォルダ数を更新
      if (parentId) {
        await updateDoc(doc(db, FOLDERS_COLLECTION, parentId), {
          childrenCount: increment(1),
          updatedAt: Timestamp.now(),
        });
      }

      return docRef.id;
    } catch (error) {
      console.error("フォルダ作成エラー:", error);
      throw error;
    }
  }

  /**
   * フォルダを更新
   */
  static async updateFolder(
    folderId: string,
    updates: Partial<Pick<Folder, "name">>
  ): Promise<void> {
    try {
      await updateDoc(doc(db, FOLDERS_COLLECTION, folderId), {
        ...updates,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error("フォルダ更新エラー:", error);
      throw error;
    }
  }

  /**
   * フォルダを削除（論理削除）
   */
  static async deleteFolder(folderId: string): Promise<void> {
    try {
      const batch = writeBatch(db);

      // フォルダを論理削除
      batch.update(doc(db, FOLDERS_COLLECTION, folderId), {
        isDeleted: true,
        updatedAt: Timestamp.now(),
      });

      // 子フォルダも論理削除
      const childFoldersQuery = query(
        collection(db, FOLDERS_COLLECTION),
        where("parentId", "==", folderId),
        where("isDeleted", "==", false)
      );
      const childFoldersSnapshot = await getDocs(childFoldersQuery);

      childFoldersSnapshot.forEach((doc) => {
        batch.update(doc.ref, {
          isDeleted: true,
          updatedAt: Timestamp.now(),
        });
      });

      // フォルダ内のファイルも論理削除
      const filesQuery = query(
        collection(db, FILES_COLLECTION),
        where("folderId", "==", folderId),
        where("isDeleted", "==", false)
      );
      const filesSnapshot = await getDocs(filesQuery);

      filesSnapshot.forEach((doc) => {
        batch.update(doc.ref, {
          isDeleted: true,
          updatedAt: Timestamp.now(),
        });
      });

      await batch.commit();
    } catch (error) {
      console.error("フォルダ削除エラー:", error);
      throw error;
    }
  }

  /**
   * 店舗のフォルダ一覧を取得
   */
  static async getFoldersByStore(storeId: string): Promise<Folder[]> {
    try {
      const q = query(
        collection(db, FOLDERS_COLLECTION),
        where("storeId", "==", storeId),
        where("isDeleted", "==", false),
        orderBy("level"),
        orderBy("name")
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt.toDate(),
            updatedAt: doc.data().updatedAt.toDate(),
          } as Folder)
      );
    } catch (error) {
      console.error("フォルダ取得エラー:", error);
      throw error;
    }
  }

  /**
   * 親フォルダの子フォルダ一覧を取得
   */
  static async getChildFolders(
    parentId: string | null,
    storeId: string
  ): Promise<Folder[]> {
    try {
      // 単純なクエリに変更（複合インデックス不要）
      const q = query(
        collection(db, FOLDERS_COLLECTION),
        where("storeId", "==", storeId),
        where("isDeleted", "==", false)
      );

      const snapshot = await getDocs(q);

      // JavaScriptでフィルタリングとソート
      const folders = snapshot.docs
        .map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
              createdAt: doc.data().createdAt.toDate(),
              updatedAt: doc.data().updatedAt.toDate(),
            } as Folder)
        )
        .filter((folder) => folder.parentId === parentId)
        .sort((a, b) => a.name.localeCompare(b.name));

      return folders;
    } catch (error) {
      console.error("子フォルダ取得エラー:", error);
      throw error;
    }
  }

  /**
   * パンくずリスト用のフォルダパスを取得
   */
  static async getBreadcrumbs(folderId: string): Promise<BreadcrumbItem[]> {
    try {
      const breadcrumbs: BreadcrumbItem[] = [];
      let currentFolderId: string | undefined = folderId;

      while (currentFolderId) {
        const folderDoc = await getDoc(
          doc(db, FOLDERS_COLLECTION, currentFolderId)
        );
        if (folderDoc.exists()) {
          const folderData = folderDoc.data() as Folder;
          breadcrumbs.unshift({
            id: currentFolderId,
            name: folderData.name,
            path: folderData.path,
          });
          currentFolderId = folderData.parentId;
        } else {
          break;
        }
      }

      return breadcrumbs;
    } catch (error) {
      console.error("パンくずリスト取得エラー:", error);
      throw error;
    }
  }

  /**
   * エクスプローラー風表示用に階層構造でフォルダを取得
   */
  static async getAllFoldersHierarchical(storeId: string): Promise<Folder[]> {
    try {
      // 削除されていないフォルダを全て取得
      const q = query(
        collection(db, FOLDERS_COLLECTION),
        where("storeId", "==", storeId),
        where("isDeleted", "==", false)
      );

      const querySnapshot = await getDocs(q);
      const allFolders = querySnapshot.docs
        .map(
          (doc) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt.toDate(),
            updatedAt: doc.data().updatedAt.toDate(),
          } as Folder)
        );

      // 階層順にソート
      return this.sortFoldersHierarchically(allFolders);
    } catch (error) {
      console.error("階層フォルダ取得エラー:", error);
      throw error;
    }
  }

  /**
   * フォルダを階層順にソート
   */
  private static sortFoldersHierarchically(folders: Folder[]): Folder[] {
    const folderMap = new Map<string, Folder>();
    const rootFolders: Folder[] = [];

    // フォルダマップを作成
    folders.forEach(folder => {
      folderMap.set(folder.id, folder);
      if (!folder.parentId) {
        rootFolders.push(folder);
      }
    });

    const result: Folder[] = [];

    // 階層順に追加する再帰関数
    const addFolderAndChildren = (folder: Folder) => {
      result.push(folder);
      
      // 子フォルダを取得してソート
      const children = folders
        .filter(f => f.parentId === folder.id)
        .sort((a, b) => a.name.localeCompare(b.name));
      
      children.forEach(child => addFolderAndChildren(child));
    };

    // ルートフォルダから開始
    rootFolders
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach(rootFolder => addFolderAndChildren(rootFolder));

    return result;
  }
}

/**
 * ファイル管理サービス
 */
export class FileService {
  /**
   * ファイルメタデータを保存
   */
  static async createFile(fileData: Omit<FileItem, "id">): Promise<string> {
    try {
      // フォルダパス情報を取得して設定
      let folderPath = "";
      if (fileData.folderId) {
        try {
          const folders = await FolderService.getFoldersByStore(fileData.storeId);
          folderPath = this.buildFolderPath(fileData.folderId, folders);
        } catch (error) {
          console.warn("フォルダパス取得失敗:", error);
        }
      }

      // Firestoreに保存するデータを準備
      const firestoreData: any = {
        ...fileData,
        createdAt: Timestamp.fromDate(fileData.createdAt),
        updatedAt: Timestamp.fromDate(fileData.updatedAt),
        lastAccessedAt: fileData.lastAccessedAt
          ? Timestamp.fromDate(fileData.lastAccessedAt)
          : null,
      };

      // folderPathが空でない場合のみ追加
      if (folderPath) {
        firestoreData.folderPath = folderPath;
      }

      const docRef = await addDoc(collection(db, FILES_COLLECTION), firestoreData);

      // フォルダのファイル数を更新（rootの場合はスキップ）
      if (fileData.folderId && fileData.folderId !== "root") {
        await updateDoc(doc(db, FOLDERS_COLLECTION, fileData.folderId), {
          filesCount: increment(1),
          updatedAt: Timestamp.now(),
        });
      }

      return docRef.id;
    } catch (error) {
      console.error("ファイル作成エラー:", error);
      throw error;
    }
  }

  /**
   * ファイルを更新
   */
  static async updateFile(
    fileId: string,
    updates: Partial<Omit<FileItem, "id" | "createdAt">>
  ): Promise<void> {
    try {
      const updateData: any = {
        ...updates,
        updatedAt: Timestamp.now(),
      };

      if (updates.lastAccessedAt) {
        updateData.lastAccessedAt = Timestamp.fromDate(updates.lastAccessedAt);
      }

      await updateDoc(doc(db, FILES_COLLECTION, fileId), updateData);
    } catch (error) {
      console.error("ファイル更新エラー:", error);
      throw error;
    }
  }

  /**
   * ファイルを削除（論理削除）
   */
  static async deleteFile(fileId: string, folderId: string): Promise<void> {
    try {
      await updateDoc(doc(db, FILES_COLLECTION, fileId), {
        isDeleted: true,
        updatedAt: Timestamp.now(),
      });

      // フォルダのファイル数を更新（rootの場合はスキップ）
      if (folderId && folderId !== "root") {
        await updateDoc(doc(db, FOLDERS_COLLECTION, folderId), {
          filesCount: increment(-1),
          updatedAt: Timestamp.now(),
        });
      }
    } catch (error) {
      console.error("ファイル削除エラー:", error);
      throw error;
    }
  }

  /**
   * フォルダ内のファイル一覧を取得
   */
  static async getFilesByFolder(
    folderId: string,
    sortOptions?: FileSortOptions,
    limitCount?: number
  ): Promise<FileItem[]> {
    try {
      // 簡単なクエリにしてインデックスエラーを回避
      const q = query(
        collection(db, FILES_COLLECTION),
        where("folderId", "==", folderId),
        where("isDeleted", "==", false)
      );

      const snapshot = await getDocs(q);
      let files = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt.toDate(),
            updatedAt: doc.data().updatedAt.toDate(),
            lastAccessedAt: doc.data().lastAccessedAt?.toDate(),
          } as FileItem)
      );

      // JavaScriptでソート
      if (sortOptions) {
        files.sort((a, b) => {
          const aValue = a[sortOptions.field as keyof FileItem];
          const bValue = b[sortOptions.field as keyof FileItem];
          
          if (aValue < bValue) return sortOptions.direction === "asc" ? -1 : 1;
          if (aValue > bValue) return sortOptions.direction === "asc" ? 1 : -1;
          return 0;
        });
      } else {
        files.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }

      // JavaScriptで制限
      if (limitCount) {
        files = files.slice(0, limitCount);
      }

      return files;
    } catch (error) {
      console.error("ファイル取得エラー:", error);
      throw error;
    }
  }

  /**
   * フォルダIDからフォルダパスを構築
   */
  private static buildFolderPath(folderId: string, folders: Folder[]): string {
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
    
    return pathParts.length > 0 ? "/" + pathParts.join("/") : "";
  }

  /**
   * ファイルを検索
   */
  static async searchFiles(
    storeId: string,
    searchParams: FileSearchParams,
    sortOptions?: FileSortOptions,
    limitCount: number = 50
  ): Promise<FileItem[]> {
    try {
      let q = query(
        collection(db, FILES_COLLECTION),
        where("storeId", "==", storeId),
        where("isDeleted", "==", false)
      );

      if (searchParams.folderId !== undefined) {
        q = query(q, where("folderId", "==", searchParams.folderId));
      }

      if (searchParams.type && searchParams.type.length > 0) {
        q = query(q, where("type", "in", searchParams.type));
      }

      if (searchParams.createdBy) {
        q = query(q, where("createdBy", "==", searchParams.createdBy));
      }

      if (sortOptions) {
        q = query(q, orderBy(sortOptions.field, sortOptions.direction));
      } else {
        q = query(q, orderBy("createdAt", "desc"));
      }

      q = query(q, limit(limitCount));

      const snapshot = await getDocs(q);

      let files = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt.toDate(),
            updatedAt: doc.data().updatedAt.toDate(),
            lastAccessedAt: doc.data().lastAccessedAt?.toDate(),
          } as FileItem)
      );

      // クライアントサイドでのテキスト検索
      if (searchParams.query) {
        const query = searchParams.query.toLowerCase();
        files = files.filter(
          (file) =>
            file.name.toLowerCase().includes(query) ||
            file.originalName.toLowerCase().includes(query) ||
            file.metadata.description?.toLowerCase().includes(query)
        );
      }

      return files;
    } catch (error) {
      console.error("ファイル検索エラー:", error);
      throw error;
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
      console.error("ダウンロード回数更新エラー:", error);
      throw error;
    }
  }
}

/**
 * ファイルシステム統計サービス
 */
export class FileSystemStatsService {
  /**
   * 店舗のファイルシステム統計を取得
   */
  static async getStats(storeId: string): Promise<FileSystemStats> {
    try {
      // フォルダ数を取得
      const foldersQuery = query(
        collection(db, FOLDERS_COLLECTION),
        where("storeId", "==", storeId),
        where("isDeleted", "==", false)
      );
      const foldersSnapshot = await getDocs(foldersQuery);
      const totalFolders = foldersSnapshot.size;

      // ファイル数とサイズを取得
      const filesQuery = query(
        collection(db, FILES_COLLECTION),
        where("storeId", "==", storeId),
        where("isDeleted", "==", false)
      );
      const filesSnapshot = await getDocs(filesQuery);

      let totalSize = 0;
      const filesByType: Record<string, number> = {};
      const files: FileItem[] = [];

      filesSnapshot.forEach((doc) => {
        const fileData = {
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt.toDate(),
          updatedAt: doc.data().updatedAt.toDate(),
          lastAccessedAt: doc.data().lastAccessedAt?.toDate(),
        } as FileItem;

        files.push(fileData);
        totalSize += fileData.size;
        filesByType[fileData.type] = (filesByType[fileData.type] || 0) + 1;
      });

      // 最近のアップロード（7日以内）
      const recentUploads = files
        .filter((file) => {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return file.createdAt > weekAgo;
        })
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 10);

      // 人気ファイル（ダウンロード数順）
      const popularFiles = files
        .filter((file) => file.downloadCount > 0)
        .sort((a, b) => b.downloadCount - a.downloadCount)
        .slice(0, 10);

      return {
        totalFolders,
        totalFiles: files.length,
        totalSize,
        filesByType: filesByType as Record<any, number>,
        recentUploads,
        popularFiles,
      };
    } catch (error) {
      console.error("統計取得エラー:", error);
      throw error;
    }
  }
}
