import React, { useState, useEffect, useCallback, Fragment } from "react";
import {
  View,
  Alert,
  Platform,
  Text,
  TouchableOpacity,
  FlatList,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { useAuth } from "@/services/auth/useAuth";
import { MasterHeader, Header } from "@/common/common-ui/ui-layout";
import { MaterialIcons } from "@expo/vector-icons";
import {
  Folder,
  FileItem,
  BreadcrumbItem,
  FileSortOptions,
} from "@/common/common-models/ModelIndex";
import { FolderService, FileService } from "@/services/file/fileService";
import { StorageService } from "@/services/file/storageService";
import { CollectionRecoveryService } from "@/services/file/collectionRecovery";
import { FileExplorer } from "./file-browser-ui/FileExplorer/FileExplorer";
import { FileUploadModal } from "./file-browser-ui/FileUploadModal/FileUploadModal";
import { CreateFolderModal } from "./file-browser-ui/CreateFolderModal/CreateFolderModal";
import { colors } from "@/common/common-constants/ThemeConstants";

interface FileManagerViewProps {
  hideHeader?: boolean;
  showBreadcrumbs?: boolean;
}

export function FileManagerView({
  hideHeader = false,
  showBreadcrumbs = true,
}: FileManagerViewProps) {
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
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
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // 既存Storageファイルとの同期
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
                } catch {
                  Alert.alert("エラー", "復旧処理に失敗しました。");
                }
              },
            },
          ]
        );
      } else {
        Alert.alert("診断結果", `コレクションは正常です。\n\n${report}`);
      }
    } catch {
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

        // フォルダ一覧を階層構造で取得
        const hierarchicalFolders =
          await FolderService.getAllFoldersHierarchical(user.storeId);
        setFolders(hierarchicalFolders);

        // ファイル一覧を取得
        if (folderId) {
          const folderFiles = await FileService.getFilesByFolder(
            folderId,
            user?.storeId || "",
            sortOptions
          );
          setFiles(folderFiles);
        } else {
          // ルートフォルダの場合はfolderIdが空文字のファイルのみを表示
          const rootFiles = await FileService.getFilesByFolder("", user?.storeId || "", sortOptions);
          setFiles(rootFiles);
        }

        // パンくずリストを更新
        if (folderId) {
          const breadcrumbList = await FolderService.getBreadcrumbs(folderId);
          setBreadcrumbs(breadcrumbList);
        } else {
          setBreadcrumbs([]);
        }
      } catch {
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
      await loadData(currentFolderId);
    };

    initializeData();
  }, [loadData, currentFolderId]);

  // フォルダクリック処理
  const handleFolderPress = useCallback((folder: Folder) => {
    setCurrentFolderId(folder.id);
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
    } catch {
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
        } catch {
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
        } catch {
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

  // 選択ハンドラー
  const handleSelectItem = (id: string, type: "folder" | "file") => {
    const itemId = `${type}-${id}`;
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  // 全選択/全解除
  const handleSelectAll = () => {
    const currentFolders = folders.filter(
      (folder) => currentFolderId ? folder.parentId === currentFolderId : !folder.parentId
    );
    
    if (selectedItems.size > 0) {
      setSelectedItems(new Set());
    } else {
      const allItems = new Set<string>();
      currentFolders.forEach((folder) => allItems.add(`folder-${folder.id}`));
      files.forEach((file) => allItems.add(`file-${file.id}`));
      setSelectedItems(allItems);
    }
  };

  // 選択されたファイルの印刷
  const handlePrintSelected = async () => {
    const selectedFiles = files.filter((file) =>
      selectedItems.has(`file-${file.id}`)
    );

    if (selectedFiles.length === 0) {
      Alert.alert("エラー", "印刷するファイルを選択してください。");
      return;
    }

    let printedCount = 0;

    for (const file of selectedFiles) {
      try {
        if (Platform.OS === "web") {
          let printUrl = file.downloadUrl;

          if (!printUrl) {
            printUrl = await StorageService.refreshDownloadUrl(file.storageUrl);
          }

          if (printUrl) {
            if (file.type === "pdf") {
              const printWindow = window.open(printUrl, "_blank");
              if (printWindow) {
                printWindow.onload = () => {
                  setTimeout(() => {
                    printWindow.print();
                  }, 1000);
                };
                printedCount++;
              }
            } else {
              window.open(printUrl, "_blank");
              printedCount++;
            }
          }
        } else {
          await StorageService.downloadFile(file.storageUrl, file.originalName);
          printedCount++;
        }
      } catch {
      }
    }

    if (printedCount > 0) {
      const message =
        Platform.OS === "web"
          ? `${printedCount}個のファイルを印刷用に開きました。PDFファイルは自動で印刷ダイアログが表示されます。`
          : `${printedCount}個のファイルをダウンロードしました。`;
      Alert.alert("印刷", message);
      setSelectedItems(new Set());
    } else {
      Alert.alert("エラー", "ファイルの印刷に失敗しました。");
    }
  };

  // レンダリング関数
  const renderFileList = () => {
    const currentFolders = folders.filter(
      (folder) => currentFolderId ? folder.parentId === currentFolderId : !folder.parentId
    );
    
    const allItems = [...currentFolders, ...files];
    
    if (allItems.length === 0) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <MaterialIcons name="folder-open" size={64} color="#6c757d" />
          <Text style={{ fontSize: 20, color: "#1a1a1a", marginTop: 16, marginBottom: 8 }}>
            {currentFolderId ? "このフォルダは空です" : "ファイルがありません"}
          </Text>
          <Text style={{ fontSize: 16, color: "#6c757d", textAlign: 'center', paddingHorizontal: 32 }}>
            {currentFolderId 
              ? "このフォルダにファイルをアップロードするか、新しいフォルダを作成してください"
              : "新しいフォルダを作成するか、ファイルをアップロードして開始してください"}
          </Text>
        </View>
      );
    }
    
    return (
      <FlatList
        data={allItems}
        renderItem={({ item }) => {
          const isFolder = 'filesCount' in item;
          return (
            <TouchableOpacity
              style={{ 
                paddingHorizontal: 16,
                paddingVertical: 20,
                borderBottomWidth: 1, 
                borderBottomColor: '#f0f0f0',
                flexDirection: 'row',
                alignItems: 'flex-start',
                backgroundColor: selectedItems.has(`${isFolder ? 'folder' : 'file'}-${item.id}`) ? '#e3f2fd' : '#fff',
              }}
              onPress={() => {
                if (isFolder) {
                  handleFolderPress(item as Folder);
                } else {
                  handleFilePress(item as FileItem);
                }
              }}
              onLongPress={() => {
                if (isFolder) {
                  handleFolderLongPress?.(item as Folder);
                } else {
                  handleFileLongPress?.(item as FileItem);
                }
              }}
            >
              {/* チェックボックス */}
              <TouchableOpacity 
                style={{ marginRight: 12, padding: 4 }}
                onPress={() => handleSelectItem(item.id, isFolder ? 'folder' : 'file')}
              >
                <MaterialIcons 
                  name={selectedItems.has(`${isFolder ? 'folder' : 'file'}-${item.id}`) ? "check-box" : "check-box-outline-blank"} 
                  size={20} 
                  color={selectedItems.has(`${isFolder ? 'folder' : 'file'}-${item.id}`) ? "#007bff" : "#6c757d"} 
                />
              </TouchableOpacity>
              
              {/* アイコン */}
              <View style={{ width: 32, alignItems: 'center', marginRight: 12 }}>
                {isFolder ? (
                  <MaterialIcons name="folder" size={24} color="#007bff" />
                ) : (
                  <MaterialIcons name="insert-drive-file" size={24} color="#6c757d" />
                )}
              </View>
              
              {/* コンテンツ */}
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '500', color: '#1a1a1a', marginBottom: 2 }}>
                  {item.name}
                </Text>
                <Text style={{ fontSize: 12, color: '#6c757d' }}>
                  {isFolder 
                    ? `${(item as Folder).filesCount} ファイル` 
                    : `${Math.round((item as FileItem).size / 1024)} KB`}
                </Text>
              </View>
              
              {/* 日付 */}
              <Text style={{ fontSize: 12, color: '#6c757d', width: 60, textAlign: 'right' }}>
                {new Date(item.updatedAt).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
              </Text>
            </TouchableOpacity>
          );
        }}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={true}
      />
    );
  };

  if (!user?.storeId) {
    return null;
  }

  if (isMobile) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.surface }}>
        {!hideHeader && (user?.role === "master" ? (
          <MasterHeader title="ファイル管理" />
        ) : (
          <Header title="ファイル管理" />
        ))}

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
            setUploadModalFolderId(currentFolderId);
            setShowUploadModal(true);
          }}
          onSortChange={setSortOptions}
          onFolderLongPress={handleFolderLongPress}
          onFileLongPress={handleFileLongPress}
          onDiagnosisAndRecover={diagnosisAndRecover}
          hideHeader={!showBreadcrumbs}
          showBreadcrumbs={showBreadcrumbs}
        />

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

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      {!hideHeader && (user?.role === "master" ? (
        <MasterHeader title="ファイル管理" />
      ) : (
        <Header title="ファイル管理" />
      ))}
      
      {/* パンくずリスト */}
      <View style={{ 
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: "#ffffff",
        borderBottomWidth: 1,
        borderBottomColor: "#e9ecef",
      }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              onPress={() => handleBreadcrumbPress({ id: "", name: "ルート", path: "/" })}
              style={{ paddingHorizontal: 6, paddingVertical: 2 }}
            >
              <Text style={{ fontSize: 14, color: "#007bff" }}>ホーム</Text>
            </TouchableOpacity>
            
            {breadcrumbs.map((breadcrumb, index) => (
              <Fragment key={breadcrumb.id}>
                <Text style={{ fontSize: 14, color: "#6c757d", marginHorizontal: 2 }}> / </Text>
                <TouchableOpacity
                  onPress={() => handleBreadcrumbPress(breadcrumb)}
                  style={{ paddingHorizontal: 6, paddingVertical: 2 }}
                >
                  <Text style={{ 
                    fontSize: 14, 
                    color: index === breadcrumbs.length - 1 ? "#1a1a1a" : "#007bff",
                    fontWeight: index === breadcrumbs.length - 1 ? "600" : "normal"
                  }}>
                    {breadcrumb.name}
                  </Text>
                </TouchableOpacity>
              </Fragment>
            ))}
          </View>
        </ScrollView>
      </View>
      
      {/* ツールバー */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: "#ffffff",
        borderBottomWidth: 1,
        borderBottomColor: "#e9ecef",
      }}>
        <TouchableOpacity 
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 12,
            paddingVertical: 8,
            marginRight: 12,
            borderRadius: 6,
            backgroundColor: "#f8f9fa",
          }}
          onPress={() => setShowCreateFolderModal(true)}
        >
          <MaterialIcons name="create-new-folder" size={20} color="#007bff" />
          <Text style={{ fontSize: 14, color: "#007bff", fontWeight: "500", marginLeft: 4 }}>
            フォルダ
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 12,
            paddingVertical: 8,
            marginRight: 12,
            borderRadius: 6,
            backgroundColor: "#f8f9fa",
          }}
          onPress={() => {
            setUploadModalFolderId(currentFolderId);
            setShowUploadModal(true);
          }}
        >
          <MaterialIcons name="file-upload" size={20} color="#007bff" />
          <Text style={{ fontSize: 14, color: "#007bff", fontWeight: "500", marginLeft: 4 }}>
            アップロード
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 12,
            paddingVertical: 8,
            marginRight: 12,
            borderRadius: 6,
            backgroundColor: "#f8f9fa",
          }}
          onPress={handleSelectAll}
        >
          <MaterialIcons 
            name={selectedItems.size > 0 ? "deselect" : "select-all"} 
            size={20} 
            color="#007bff" 
          />
          <Text style={{ fontSize: 14, color: "#007bff", fontWeight: "500", marginLeft: 4 }}>
            {selectedItems.size > 0 ? "全解除" : "全選択"}
          </Text>
        </TouchableOpacity>
        
        {selectedItems.size > 0 && (
          <TouchableOpacity 
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 12,
              paddingVertical: 8,
              marginRight: 12,
              borderRadius: 6,
              backgroundColor: "#28a745",
            }}
            onPress={handlePrintSelected}
          >
            <MaterialIcons name="print" size={20} color="white" />
            <Text style={{ fontSize: 14, color: "white", fontWeight: "500", marginLeft: 4 }}>
              印刷 ({Array.from(selectedItems).filter(id => id.startsWith('file-')).length})
            </Text>
          </TouchableOpacity>
        )}
        
        {diagnosisAndRecover && (
          <TouchableOpacity 
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 6,
              backgroundColor: "#f8f9fa",
            }}
            onPress={diagnosisAndRecover}
          >
            <MaterialIcons name="healing" size={20} color="#FF9800" />
            <Text style={{ fontSize: 14, color: "#FF9800", fontWeight: "500", marginLeft: 4 }}>
              診断
            </Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* スクロール可能なリスト部分 */}
      <View style={{ flex: 1, backgroundColor: "#fff" }}>
        {renderFileList()}
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
