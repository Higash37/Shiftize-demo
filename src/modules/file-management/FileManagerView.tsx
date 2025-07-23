import React, { useState, useEffect, useCallback } from "react";
import { View, Alert, Platform } from "react-native";
import { useAuth } from "@/services/auth/useAuth";
import {
  Folder,
  FileItem,
  BreadcrumbItem,
  FileSortOptions,
} from "@/common/common-models/ModelIndex";
import { FolderService, FileService } from "@/services/file/fileService";
import { StorageService } from "@/services/file/storageService";
import { CollectionRecoveryService } from "@/services/file/collectionRecovery";
import { FileExplorer } from "./components/FileExplorer/FileExplorer";
import { FileUploadModal } from "./components/FileUploadModal/FileUploadModal";
import { CreateFolderModal } from "./components/CreateFolderModal/CreateFolderModal";

interface FileManagerViewProps {
  hideHeader?: boolean;
  showBreadcrumbs?: boolean;
}

export function FileManagerView({
  hideHeader = false,
  showBreadcrumbs = true,
}: FileManagerViewProps) {
  const { user } = useAuth();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sortOptions, setSortOptions] = useState<FileSortOptions>({
    field: "name",
    direction: "asc",
  });

  // モーダルの状態
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [uploadModalFolderId, setUploadModalFolderId] = useState<string | null>(
    null
  );

  // 既存Storageファイルとの同期
  const syncStorageFiles = useCallback(async () => {
    if (!user?.storeId) return;

    try {
      console.log("既存Storageファイルとの同期を開始...");

      // Storage内の全ファイルを取得
      const storageFiles = await StorageService.getAllStorageFiles(
        user.storeId
      );

      if (storageFiles.length === 0) {
        console.log("Storage内にファイルが見つかりませんでした");
        return;
      }

      console.log(`${storageFiles.length}個のファイルを発見しました`);

      // 各ファイルをFirestoreに同期
      for (const storageFile of storageFiles) {
        try {
          // 既存のFileItemを確認
          const existingFiles = await FileService.searchFiles(user.storeId, {
            query: storageFile.name,
          });

          const existingFile = existingFiles.find(
            (f) => f.storageUrl === storageFile.fullPath
          );

          if (!existingFile) {
            // 新しいファイルとしてFirestoreに登録
            console.log(`新しいファイルを登録: ${storageFile.name}`);

            // フォルダIDに対応するフォルダを確認/作成
            let targetFolderId = storageFile.folderId;
            if (
              targetFolderId &&
              targetFolderId !== "root" &&
              targetFolderId !== ""
            ) {
              const folderExists = await FolderService.getFoldersByStore(
                user.storeId
              ).then((folders) => folders.find((f) => f.id === targetFolderId));

              if (!folderExists) {
                // フォルダが存在しない場合は「既存ファイル」フォルダを作成
                targetFolderId = await FolderService.createFolder(
                  "既存ファイル",
                  undefined,
                  user.storeId,
                  user.uid
                );
              }
            } else {
              // root または空文字の場合はルートファイルとして扱う
              targetFolderId = "";
            }

            await FileService.createFile({
              name: storageFile.name,
              originalName: storageFile.name,
              type: StorageService.getFileType(storageFile.contentType),
              mimeType: storageFile.contentType,
              size: storageFile.size,
              folderId: targetFolderId,
              storeId: user.storeId,
              storageUrl: storageFile.fullPath,
              downloadUrl: storageFile.downloadUrl,
              metadata: {
                description: "既存ファイルから同期",
              },
              createdAt: new Date(storageFile.timeCreated),
              updatedAt: new Date(),
              createdBy: user.uid,
              isDeleted: false,
              downloadCount: 0,
            });
          }
        } catch (error) {
          console.error(`ファイル ${storageFile.name} の同期エラー:`, error);
        }
      }

      console.log("Storage同期完了");
    } catch (error) {
      console.error("Storage同期エラー:", error);
    }
  }, [user?.storeId, user?.uid]);

  // コレクション診断と復旧
  const diagnosisAndRecover = useCallback(async () => {
    if (!user?.storeId) return;

    try {
      setIsLoading(true);

      // 診断レポートを生成
      const report = await CollectionRecoveryService.generateDiagnosticReport(
        user.storeId
      );

      // filesコレクションをチェック
      const filesCheck = await CollectionRecoveryService.checkFilesCollection();

      if (!filesCheck.exists || filesCheck.fileCount === 0) {
        Alert.alert(
          "コレクション復旧",
          `filesコレクションが空です。\nStorage内のファイルから復旧しますか？\n\n${report}`,
          [
            { text: "キャンセル", style: "cancel" },
            {
              text: "復旧実行",
              onPress: async () => {
                try {
                  const result =
                    await CollectionRecoveryService.recoverFilesFromStorage(
                      user.storeId!
                    );
                  Alert.alert(
                    "復旧完了",
                    `${result.recoveredCount}個のファイルを復旧しました。\n${
                      result.errors.length > 0
                        ? `エラー: ${result.errors.length}件`
                        : ""
                    }`
                  );
                  await loadData(currentFolderId);
                } catch (error) {
                  console.error("復旧エラー:", error);
                  Alert.alert("エラー", "復旧処理に失敗しました。");
                }
              },
            },
          ]
        );
      } else {
        Alert.alert("診断結果", `コレクションは正常です。\n\n${report}`);
      }
    } catch (error) {
      console.error("診断エラー:", error);
      Alert.alert("エラー", "診断処理に失敗しました。");
    } finally {
      setIsLoading(false);
    }
  }, [user?.storeId, currentFolderId]);

  // データ読み込み
  const loadData = useCallback(
    async (folderId: string | null = null) => {
      if (!user?.storeId) return;

      setIsLoading(true);
      try {
        console.log("データ読み込み開始:", { folderId, storeId: user.storeId });

        // フォルダ一覧を階層構造で取得
        const hierarchicalFolders =
          await FolderService.getAllFoldersHierarchical(user.storeId);
        console.log("取得されたフォルダ数:", hierarchicalFolders.length);
        setFolders(hierarchicalFolders);

        // ファイル一覧を取得
        if (folderId) {
          console.log("フォルダ内ファイル取得:", folderId);
          const folderFiles = await FileService.getFilesByFolder(
            folderId,
            sortOptions
          );
          console.log("取得されたフォルダ内ファイル数:", folderFiles.length);
          setFiles(folderFiles);
        } else {
          console.log("ルートファイル取得開始");
          // ルートフォルダの場合はfolderIdが空文字のファイルのみを表示
          const rootFiles = await FileService.getFilesByFolder("", sortOptions);
          console.log("取得されたルートファイル数:", rootFiles.length);
          setFiles(rootFiles);
        }

        // パンくずリストを更新
        if (folderId) {
          console.log("パンくずリスト取得中:", folderId);
          const breadcrumbList = await FolderService.getBreadcrumbs(folderId);
          console.log("パンくずリスト取得結果:", breadcrumbList);
          setBreadcrumbs(breadcrumbList);
        } else {
          setBreadcrumbs([]);
        }
      } catch (error) {
        console.error("データ読み込みエラー:", error);
        Alert.alert("エラー", "データの読み込みに失敗しました。");
      } finally {
        setIsLoading(false);
      }
    },
    [user?.storeId, sortOptions]
  );

  // 初期データ読み込み
  useEffect(() => {
    const initializeData = async () => {
      // Storage同期は無効化（手動でのみ実行）
      // if (currentFolderId === null) {
      //   await syncStorageFiles();
      // }
      await loadData(currentFolderId);
    };

    initializeData();
  }, [loadData, currentFolderId]);

  // フォルダクリック処理
  const handleFolderPress = useCallback((folder: Folder) => {
    console.log("=== フォルダクリック ===");
    console.log("クリックされたフォルダ:", folder.name, "ID:", folder.id);
    setCurrentFolderId(folder.id);
    console.log("currentFolderIdを設定:", folder.id);
  }, []);

  // ファイルクリック処理（プレビュー・ダウンロード）
  const handleFilePress = useCallback(async (file: FileItem) => {
    try {
      // ダウンロード回数を増加
      await FileService.incrementDownloadCount(file.id);

      // ブラウザでファイルを開く
      if (Platform.OS === "web") {
        if (file.downloadUrl) {
          window.open(file.downloadUrl, "_blank");
        } else {
          // ダウンロードURLを再生成
          const url = await StorageService.refreshDownloadUrl(file.storageUrl);
          window.open(url, "_blank");
        }
      } else {
        // モバイルの場合はダウンロード
        await StorageService.downloadFile(file.storageUrl, file.originalName);
      }
    } catch (error) {
      console.error("ファイル表示エラー:", error);
      Alert.alert("エラー", "ファイルを開けませんでした。");
    }
  }, []);

  // パンくずリストクリック処理
  const handleBreadcrumbPress = useCallback((breadcrumb: BreadcrumbItem) => {
    if (breadcrumb.id === "") {
      // ルートフォルダに戻る
      setCurrentFolderId(null);
    } else {
      setCurrentFolderId(breadcrumb.id);
    }
  }, []);

  // フォルダ作成処理
  const handleCreateFolder = useCallback(
    async (name: string) => {
      if (!user?.storeId || !user.uid) return;

      try {
        await FolderService.createFolder(
          name,
          currentFolderId || undefined,
          user.storeId,
          user.uid
        );
        await loadData(currentFolderId);
        Alert.alert("成功", "フォルダを作成しました。");
      } catch (error) {
        console.error("フォルダ作成エラー:", error);
        throw error;
      }
    },
    [user?.storeId, user?.uid, currentFolderId, loadData]
  );

  // アップロード完了処理
  const handleUploadComplete = useCallback(() => {
    loadData(currentFolderId);
  }, [loadData, currentFolderId]);

  // ソート変更処理
  const handleSortChange = useCallback((newSortOptions: FileSortOptions) => {
    setSortOptions(newSortOptions);
  }, []);

  // フォルダ長押し処理（コンテキストメニュー）
  const handleFolderLongPress = useCallback(
    (folder: Folder) => {
      Alert.alert(folder.name, "このフォルダに対する操作を選択してください", [
        { text: "開く", onPress: () => handleFolderPress(folder) },
        {
          text: "名前を変更",
          onPress: () => {
            // TODO: 名前変更モーダルを実装
            Alert.alert("未実装", "名前変更機能は今後実装予定です。");
          },
        },
        {
          text: "削除",
          onPress: () => {
            Alert.alert(
              "削除確認",
              `フォルダ「${folder.name}」を削除しますか？\n※フォルダ内のファイルも全て削除されます。`,
              [
                { text: "キャンセル", style: "cancel" },
                {
                  text: "削除",
                  style: "destructive",
                  onPress: async () => {
                    try {
                      await FolderService.deleteFolder(folder.id);
                      await loadData(currentFolderId);
                      Alert.alert("成功", "フォルダを削除しました。");
                    } catch (error) {
                      console.error("フォルダ削除エラー:", error);
                      Alert.alert("エラー", "フォルダの削除に失敗しました。");
                    }
                  },
                },
              ]
            );
          },
        },
        { text: "キャンセル", style: "cancel" },
      ]);
    },
    [handleFolderPress, loadData, currentFolderId]
  );

  // ファイル長押し処理（コンテキストメニュー）
  const handleFileLongPress = useCallback(
    (file: FileItem) => {
      Alert.alert(file.name, "このファイルに対する操作を選択してください", [
        { text: "開く", onPress: () => handleFilePress(file) },
        {
          text: "ダウンロード",
          onPress: () => {
            StorageService.downloadFile(file.storageUrl, file.originalName);
          },
        },
        {
          text: "名前を変更",
          onPress: () => {
            // TODO: 名前変更モーダルを実装
            Alert.alert("未実装", "名前変更機能は今後実装予定です。");
          },
        },
        {
          text: "削除",
          onPress: () => {
            Alert.alert(
              "削除確認",
              `ファイル「${file.name}」を削除しますか？`,
              [
                { text: "キャンセル", style: "cancel" },
                {
                  text: "削除",
                  style: "destructive",
                  onPress: async () => {
                    try {
                      await FileService.deleteFile(file.id, file.folderId);
                      await StorageService.deleteFile(file.storageUrl);
                      await loadData(currentFolderId);
                      Alert.alert("成功", "ファイルを削除しました。");
                    } catch (error) {
                      console.error("ファイル削除エラー:", error);
                      Alert.alert("エラー", "ファイルの削除に失敗しました。");
                    }
                  },
                },
              ]
            );
          },
        },
        { text: "キャンセル", style: "cancel" },
      ]);
    },
    [handleFilePress, loadData, currentFolderId]
  );

  if (!user?.storeId) {
    return null;
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <View style={{ flex: 1, overflow: "hidden", backgroundColor: "#FFFFFF" }}>
        <FileExplorer
          folders={folders}
          files={files}
          breadcrumbs={breadcrumbs}
          currentFolderId={currentFolderId}
          isLoading={isLoading}
          sortOptions={sortOptions}
          onFolderPress={handleFolderPress}
          onFilePress={handleFilePress}
          onBreadcrumbPress={handleBreadcrumbPress}
          onCreateFolder={() => setShowCreateFolderModal(true)}
          onUploadFiles={() => {
            console.log("=== アップロードモーダル表示 ===");
            console.log(
              "currentFolderId:",
              currentFolderId,
              "型:",
              typeof currentFolderId
            );
            console.log("currentFolderIdがnull?:", currentFolderId === null);
            console.log(
              "currentFolderIdがundefined?:",
              currentFolderId === undefined
            );
            console.log("モーダルに渡すfolderId (||):", currentFolderId || "");
            console.log("モーダルに渡すfolderId (??):", currentFolderId ?? "");

            // 現在のフォルダIDを固定してモーダルに渡す
            setUploadModalFolderId(currentFolderId);
            setShowUploadModal(true);
          }}
          onSortChange={handleSortChange}
          onFolderLongPress={handleFolderLongPress}
          onFileLongPress={handleFileLongPress}
          onDiagnosisAndRecover={diagnosisAndRecover}
          hideHeader={hideHeader}
          showBreadcrumbs={showBreadcrumbs}
        />
      </View>

      <FileUploadModal
        visible={showUploadModal}
        folderId={uploadModalFolderId ?? ""}
        storeId={user.storeId}
        onClose={() => {
          setShowUploadModal(false);
          setUploadModalFolderId(null);
        }}
        onUploadComplete={handleUploadComplete}
      />

      <CreateFolderModal
        visible={showCreateFolderModal}
        onClose={() => setShowCreateFolderModal(false)}
        onCreateFolder={handleCreateFolder}
      />
    </View>
  );
}
