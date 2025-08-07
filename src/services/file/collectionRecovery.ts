import { collection, getDocs, doc, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../firebase/firebase-core";
import { StorageService } from "./storageService";
import { FileService } from "./fileService";

/**
 * Firestoreコレクション復旧サービス
 */
export class CollectionRecoveryService {
  /**
   * filesコレクションが存在するかチェック
   */
  static async checkFilesCollection(): Promise<{
    exists: boolean;
    fileCount: number;
    files: any[];
  }> {
    try {
      const filesRef = collection(db, "files");
      const snapshot = await getDocs(filesRef);
      
      const files = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      
      return {
        exists: snapshot.size > 0,
        fileCount: snapshot.size,
        files: files
      };
    } catch (error) {
      return {
        exists: false,
        fileCount: 0,
        files: []
      };
    }
  }

  /**
   * foldersコレクションが存在するかチェック
   */
  static async checkFoldersCollection(): Promise<{
    exists: boolean;
    folderCount: number;
    folders: any[];
  }> {
    try {
      const foldersRef = collection(db, "folders");
      const snapshot = await getDocs(foldersRef);
      
      const folders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      
      return {
        exists: snapshot.size > 0,
        folderCount: snapshot.size,
        folders: folders
      };
    } catch (error) {
      return {
        exists: false,
        folderCount: 0,
        folders: []
      };
    }
  }

  /**
   * Storage内のファイルからfilesコレクションを復旧
   */
  static async recoverFilesFromStorage(storeId: string): Promise<{
    recoveredCount: number;
    errors: string[];
  }> {
    try {
      
      // Storage内の全ファイルを取得
      const storageFiles = await StorageService.getAllStorageFiles(storeId);

      let recoveredCount = 0;
      const errors: string[] = [];

      for (const storageFile of storageFiles) {
        try {
          // ファイルメタデータをFirestoreに追加
          const fileData = {
            name: storageFile.name,
            originalName: storageFile.name,
            type: StorageService.getFileType(storageFile.contentType),
            mimeType: storageFile.contentType,
            size: storageFile.size,
            folderId: storageFile.folderId || "", // rootの場合は空文字
            storeId: storeId,
            storageUrl: storageFile.fullPath,
            downloadUrl: storageFile.downloadUrl,
            metadata: {
              description: "Storage から復旧されたファイル",
            },
            createdAt: Timestamp.fromDate(new Date(storageFile.timeCreated)),
            updatedAt: Timestamp.now(),
            createdBy: storeId, // TODO: 実際のユーザーIDを使用
            isDeleted: false,
            downloadCount: 0,
          };

          await addDoc(collection(db, "files"), fileData);
          recoveredCount++;
          
        } catch (error) {
          const errorMsg = `ファイル ${storageFile.name} の復旧エラー: ${error}`;
          errors.push(errorMsg);
        }
      }

      
      return {
        recoveredCount,
        errors
      };
      
    } catch (error) {
      throw error;
    }
  }

  /**
   * 完全な診断レポートを生成
   */
  static async generateDiagnosticReport(storeId: string): Promise<string> {
    try {
      
      const filesCheck = await this.checkFilesCollection();
      const foldersCheck = await this.checkFoldersCollection();
      
      // Storage内のファイル数も確認
      let storageFileCount = 0;
      try {
        const storageFiles = await StorageService.getAllStorageFiles(storeId);
        storageFileCount = storageFiles.length;
      } catch (error) {
      }

      const report = `
=== Firestore コレクション診断レポート ===
生成日時: ${new Date().toLocaleString('ja-JP')}
店舗ID: ${storeId}

== files コレクション ==
存在: ${filesCheck.exists ? 'はい' : 'いいえ'}
ドキュメント数: ${filesCheck.fileCount}個

== folders コレクション ==
存在: ${foldersCheck.exists ? 'はい' : 'いいえ'}
ドキュメント数: ${foldersCheck.folderCount}個

== Firebase Storage ==
ファイル数: ${storageFileCount}個

== 推奨アクション ==
${!filesCheck.exists && storageFileCount > 0 
  ? "⚠️ Storage内にファイルが存在しますが、filesコレクションが空です。復旧をお勧めします。"
  : "問題は検出されませんでした。"
}

== ファイル一覧 ==
${filesCheck.files.map((file, index) => 
  `${index + 1}. ${file.name || file.originalName || file.id} (folderId: ${file.folderId || 'root'})`
).join('\n')}

== フォルダ一覧 ==
${foldersCheck.folders.map((folder, index) => 
  `${index + 1}. ${folder.name || folder.id} (parentId: ${folder.parentId || 'root'})`
).join('\n')}
`;

      return report;
      
    } catch (error) {
      throw error;
    }
  }
}