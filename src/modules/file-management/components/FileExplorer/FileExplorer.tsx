import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Alert,
  Platform,
  Dimensions,
} from "react-native";
import { MaterialIcons, Ionicons, AntDesign } from "@expo/vector-icons";
import { colors } from "@/common/common-constants/ThemeConstants";
import {
  Folder,
  FileItem,
  BreadcrumbItem,
  FileSortOptions,
} from "@/common/common-models/ModelIndex";
import { styles } from "./FileExplorer.styles";
import { FileSidebar } from "../FileSidebar/FileSidebar";
import { StorageService } from "@/services/file/storageService";

interface FileExplorerProps {
  folders: Folder[];
  files: FileItem[];
  breadcrumbs: BreadcrumbItem[];
  currentFolderId: string | null;
  isLoading: boolean;
  sortOptions: FileSortOptions;
  onFolderPress: (folder: Folder) => void;
  onFilePress: (file: FileItem) => void;
  onBreadcrumbPress: (breadcrumb: BreadcrumbItem) => void;
  onCreateFolder: () => void;
  onUploadFiles: () => void;
  onSortChange: (sortOptions: FileSortOptions) => void;
  onFolderLongPress?: (folder: Folder) => void;
  onFileLongPress?: (file: FileItem) => void;
  onDiagnosisAndRecover?: () => void;
  hideHeader?: boolean;
  showBreadcrumbs?: boolean;
}

export function FileExplorer({
  folders,
  files,
  breadcrumbs,
  currentFolderId,
  isLoading,
  sortOptions,
  onFolderPress,
  onFilePress,
  onBreadcrumbPress,
  onCreateFolder,
  onUploadFiles,
  onSortChange,
  onFolderLongPress,
  onFileLongPress,
  onDiagnosisAndRecover,
  hideHeader = false,
  showBreadcrumbs = true,
}: FileExplorerProps) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const { width } = Dimensions.get("window");
  const isMobile = width < 768;

  // 選択状態の管理
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
    if (selectedItems.size > 0) {
      setSelectedItems(new Set());
    } else {
      const allItems = new Set<string>();
      folders.forEach((folder) => allItems.add(`folder-${folder.id}`));
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

    // 印刷処理（ブラウザで直接印刷）
    let printedCount = 0;

    for (const file of selectedFiles) {
      try {
        if (Platform.OS === "web") {
          let printUrl = file.downloadUrl;

          // ダウンロードURLがない場合は再生成
          if (!printUrl) {
            printUrl = await StorageService.refreshDownloadUrl(file.storageUrl);
          }

          if (printUrl) {
            // PDFファイルの場合は印刷ダイアログを直接開く
            if (file.type === "pdf") {
              // 新しいウィンドウでPDFを開き、印刷ダイアログを表示
              const printWindow = window.open(printUrl, "_blank");
              if (printWindow) {
                printWindow.onload = () => {
                  setTimeout(() => {
                    printWindow.print();
                  }, 1000); // PDFの読み込みを待つ
                };
                printedCount++;
              }
            } else {
              // PDF以外のファイルは新しいタブで開く
              window.open(printUrl, "_blank");
              printedCount++;
            }
          }
        } else {
          // モバイルの場合は従来通りダウンロード
          await StorageService.downloadFile(file.storageUrl, file.originalName);
          printedCount++;
        }
      } catch (error) {
      }
    }

    if (printedCount > 0) {
      const message =
        Platform.OS === "web"
          ? `${printedCount}個のファイルを印刷用に開きました。PDFファイルは自動で印刷ダイアログが表示されます。`
          : `${printedCount}個のファイルをダウンロードしました。`;
      Alert.alert("印刷", message);
    } else {
      Alert.alert("エラー", "ファイルの印刷に失敗しました。");
    }
  };

  // ファイルサイズをフォーマット
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  // ファイルタイプのアイコンを取得
  const getFileIcon = (file: FileItem) => {
    const iconSize = width < 768 ? 18 : width < 1024 ? 30 : 36;
    const iconProps = { size: iconSize, color: colors.text.secondary };

    switch (file.type) {
      case "pdf":
        return (
          <MaterialIcons name="picture-as-pdf" {...iconProps} color="#FF5722" />
        );
      case "image":
        return <MaterialIcons name="image" {...iconProps} color="#4CAF50" />;
      case "document":
        return (
          <MaterialIcons name="description" {...iconProps} color="#2196F3" />
        );
      case "video":
        return (
          <MaterialIcons name="video-file" {...iconProps} color="#9C27B0" />
        );
      case "audio":
        return (
          <MaterialIcons name="audio-file" {...iconProps} color="#FF9800" />
        );
      default:
        return <MaterialIcons name="insert-drive-file" {...iconProps} />;
    }
  };

  // 日付をフォーマット
  const formatDate = (date: Date): string => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "今日";
    if (diffDays === 2) return "昨日";
    if (diffDays <= 7) return `${diffDays - 1}日前`;

    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // パンくずリストのレンダリング（エクスプローラー風パス表示）
  const renderBreadcrumbs = () => {
    const selectedFileCount = files.filter((file) =>
      selectedItems.has(`file-${file.id}`)
    ).length;

    return (
      <View style={styles.breadcrumbContainer}>
        <ScrollView
          style={styles.pathDisplay}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pathScrollContent}
        >
          {/* クリック可能なパス部分 */}
          <View style={styles.pathSegments}>
            {/* ホーム */}
            <TouchableOpacity
              style={styles.pathSegment}
              onPress={() =>
                onBreadcrumbPress({ id: "", name: "ルート", path: "/" })
              }
            >
              <Text style={styles.pathSegmentText} numberOfLines={1}>
                ホーム
              </Text>
            </TouchableOpacity>

            {/* 各階層 */}
            {breadcrumbs.map((breadcrumb, index) => (
              <React.Fragment key={breadcrumb.id}>
                <Text style={styles.pathSeparator}> / </Text>
                <TouchableOpacity
                  style={[
                    styles.pathSegment,
                    index === breadcrumbs.length - 1 &&
                      styles.currentPathSegment,
                  ]}
                  onPress={() => onBreadcrumbPress(breadcrumb)}
                >
                  <Text
                    style={[
                      styles.pathSegmentText,
                      index === breadcrumbs.length - 1 &&
                        styles.currentPathText,
                    ]}
                    numberOfLines={1}
                  >
                    {breadcrumb.name}
                  </Text>
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </View>
        </ScrollView>

        {/* 印刷ボタン（選択されたファイルがある時のみ表示） */}
        {selectedFileCount > 0 && (
          <TouchableOpacity
            style={styles.printButton}
            onPress={handlePrintSelected}
          >
            <MaterialIcons name="print" size={18} color="white" />
            <Text style={styles.printButtonText}>{selectedFileCount}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // ツールバーのレンダリング
  const renderToolbar = () => (
    <View style={styles.toolbar}>
      <View style={styles.toolbarLeft}>
        <TouchableOpacity style={styles.toolbarButton} onPress={onCreateFolder}>
          <MaterialIcons
            name="create-new-folder"
            size={20}
            color={colors.primary}
          />
          <Text style={styles.toolbarButtonText}>フォルダ</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.toolbarButton} onPress={onUploadFiles}>
          <MaterialIcons name="file-upload" size={20} color={colors.primary} />
          <Text style={styles.toolbarButtonText}>アップロード</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={handleSelectAll}
        >
          <MaterialIcons
            name={selectedItems.size > 0 ? "deselect" : "select-all"}
            size={20}
            color={colors.primary}
          />
          <Text style={styles.toolbarButtonText}>
            {selectedItems.size > 0 ? "全解除" : "全選択"}
          </Text>
        </TouchableOpacity>

        {onDiagnosisAndRecover && (
          <TouchableOpacity
            style={styles.toolbarButton}
            onPress={onDiagnosisAndRecover}
          >
            <MaterialIcons name="healing" size={20} color="#FF9800" />
            <Text style={styles.toolbarButtonText}>診断</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.toolbarRight}></View>
    </View>
  );

  // リスト項目のレンダリング
  const renderListItem = (item: Folder | FileItem, type: "folder" | "file") => {
    const itemId = `${type}-${item.id}`;
    const isSelected = selectedItems.has(itemId);

    return (
      <TouchableOpacity
        key={itemId}
        style={[styles.listItem, isSelected && styles.selectedListItem]}
        onPress={() => {
          if (type === "folder") {
            onFolderPress(item as Folder);
          } else {
            onFilePress(item as FileItem);
          }
        }}
      >
        {/* チェックボックス */}
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => handleSelectItem(item.id, type)}
        >
          <MaterialIcons
            name={isSelected ? "check-box" : "check-box-outline-blank"}
            size={20}
            color={isSelected ? colors.primary : colors.text.secondary}
          />
        </TouchableOpacity>

        {/* アイコン */}
        <View style={styles.listIcon}>
          {type === "folder" ? (
            <MaterialIcons name="folder" size={24} color={colors.primary} />
          ) : (
            getFileIcon(item as FileItem)
          )}
        </View>

        {/* ファイル/フォルダ情報 */}
        <View style={styles.listContent}>
          <Text style={styles.listTitle} numberOfLines={4} ellipsizeMode="tail">
            {item.name}
          </Text>
          <Text style={styles.listSubtitle}>
            {type === "folder"
              ? `${(item as Folder).filesCount} ファイル`
              : formatFileSize((item as FileItem).size)}
          </Text>
        </View>

        {/* 日付 */}
        <Text style={styles.listDate}>{formatDate(item.updatedAt)}</Text>

        {/* ファイルタイプ（ファイルの場合のみ） */}
        {type === "file" && (
          <Text style={styles.listType}>
            {(item as FileItem).type.toUpperCase()}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  // フォルダカードのレンダリング（廃止予定）
  const renderFolderCard = (item: Folder) => {
    return (
      <TouchableOpacity
        style={styles.folderCard}
        onPress={() => onFolderPress(item)}
        onLongPress={() => onFolderLongPress?.(item)}
        delayLongPress={500}
      >
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <MaterialIcons
              name="folder"
              size={width < 768 ? 24 : width < 1024 ? 40 : 48}
              color={colors.primary}
            />
          </View>

          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle} numberOfLines={1} ellipsizeMode="tail">
              {item.name}
            </Text>
            <Text style={styles.cardSubtitle}>{item.filesCount} ファイル</Text>
            <Text style={styles.cardDate}>{formatDate(item.updatedAt)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // ファイルカードのレンダリング
  const renderFileCard = (item: FileItem) => {
    return (
      <TouchableOpacity
        style={styles.fileCard}
        onPress={() => onFilePress(item)}
        onLongPress={() => onFileLongPress?.(item)}
        delayLongPress={500}
      >
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={styles.fileIconContainer}>{getFileIcon(item)}</View>
          </View>

          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle} numberOfLines={1} ellipsizeMode="tail">
              {item.name}
            </Text>
            <Text style={styles.cardSubtitle}>{formatFileSize(item.size)}</Text>
            <Text style={styles.cardDate}>{formatDate(item.updatedAt)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // 空の状態のレンダリング
  const renderEmptyState = () => {
    const isInFolder = currentFolderId !== null;
    const title = isInFolder ? "このフォルダは空です" : "ファイルがありません";
    const subtitle = isInFolder
      ? "このフォルダにファイルをアップロードするか、新しいフォルダを作成してください"
      : "新しいフォルダを作成するか、ファイルをアップロードして開始してください";

    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons
          name={isInFolder ? "folder-open" : "folder"}
          size={64}
          color={colors.text.secondary}
        />
        <Text style={styles.emptyTitle}>{title}</Text>
        <Text style={styles.emptySubtitle}>{subtitle}</Text>

        <View style={styles.emptyActions}>
          <TouchableOpacity
            style={styles.emptyActionButton}
            onPress={onCreateFolder}
          >
            <MaterialIcons name="create-new-folder" size={24} color="white" />
            <Text style={styles.emptyActionText}>フォルダ作成</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.emptyActionButton,
              styles.emptyActionButtonSecondary,
            ]}
            onPress={onUploadFiles}
          >
            <MaterialIcons
              name="file-upload"
              size={24}
              color={colors.primary}
            />
            <Text
              style={[styles.emptyActionText, styles.emptyActionTextSecondary]}
            >
              ファイルアップロード
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // メインコンテンツのレンダリング
  const renderContent = () => {
    // フォルダ内を表示している場合は子フォルダとファイルを両方チェック
    if (currentFolderId !== null) {
      // 現在のフォルダの子フォルダを取得
      const childFolders = folders.filter(
        (folder) => folder.parentId === currentFolderId
      );

      // 特定フォルダ内表示：子フォルダとファイルの両方が空の場合
      if (childFolders.length === 0 && files.length === 0) {
        return renderEmptyState();
      }

      // 子フォルダとファイルを結合して表示
      const folderItems = [
        ...childFolders.map((folder) => ({
          ...folder,
          itemType: "folder" as const,
        })),
        ...files.map((file) => ({ ...file, itemType: "file" as const })),
      ];

      return (
        <ScrollView
          style={styles.fileAreaContent}
          showsVerticalScrollIndicator={false}
        >
          {folderItems.map((item) =>
            renderListItem(
              item as Folder | FileItem,
              item.itemType === "folder" ? "folder" : "file"
            )
          )}
        </ScrollView>
      );
    }

    // ルート表示：ルートレベルのフォルダとファイルのみを表示
    const rootFolders = folders.filter(
      (folder) =>
        folder.parentId === null ||
        folder.parentId === undefined ||
        folder.parentId === ""
    );

    if (rootFolders.length === 0 && files.length === 0) {
      return renderEmptyState();
    }

    const allItems = [
      ...rootFolders.map((folder) => ({
        ...folder,
        itemType: "folder" as const,
      })),
      ...files.map((file) => ({ ...file, itemType: "file" as const })),
    ];

    return (
      <ScrollView
        style={styles.fileAreaContent}
        showsVerticalScrollIndicator={false}
      >
        {allItems.map((item) =>
          renderListItem(
            item as Folder | FileItem,
            item.itemType === "folder" ? "folder" : "file"
          )
        )}
      </ScrollView>
    );
  };


  return (
    <View style={styles.container}>
      {!hideHeader && (
        <View style={styles.fixedHeader}>
          <View style={styles.titleContainer}>
            <Text style={styles.pageTitle}>ファイル管理</Text>
          </View>
          {renderBreadcrumbs()}
          {renderToolbar()}
        </View>
      )}
      {hideHeader && showBreadcrumbs && (
        <View style={styles.breadcrumbOnlyHeader}>{renderBreadcrumbs()}</View>
      )}

      {/* メインコンテンツ */}
      <View style={styles.mainContent}>
        {/* デスクトップ用サイドバー */}
        {!isMobile && (
          <FileSidebar
            folders={folders}
            currentFolderId={currentFolderId}
            breadcrumbs={breadcrumbs}
            onFolderPress={onFolderPress}
            onHomePress={() =>
              onBreadcrumbPress({ id: "", name: "ルート", path: "/" })
            }
            onCreateFolder={onCreateFolder}
            onUploadFiles={onUploadFiles}
            isMobile={isMobile}
          />
        )}

        <View style={styles.fileArea}>
          {renderContent()}
        </View>
      </View>
    </View>
  );
}
