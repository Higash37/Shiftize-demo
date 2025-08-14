import React from "react";
import { FlatList } from "react-native";
import { 
  Folder, 
  FileItem,
  FileSortOptions 
} from "@/common/common-models/ModelIndex";

interface FileListProps {
  folders: Folder[];
  files: FileItem[];
  currentFolderId: string | null;
  sortOptions: FileSortOptions;
  onFolderPress: (folder: Folder) => void;
  onFilePress: (file: FileItem) => void;
  onFolderLongPress?: (folder: Folder) => void;
  onFileLongPress?: (file: FileItem) => void;
  renderListItem: (item: Folder | FileItem, type: "folder" | "file") => React.ReactNode;
  renderEmptyState: () => React.ReactNode;
}

export function FileList({
  folders,
  files,
  currentFolderId,
  renderListItem,
  renderEmptyState,
}: FileListProps) {
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
      <FlatList
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        data={folderItems}
        renderItem={({ item }) => {
          const renderedItem = renderListItem(
            item as Folder | FileItem,
            item.itemType === "folder" ? "folder" : "file"
          );
          return renderedItem as React.ReactElement;
        }}
        keyExtractor={(item) => `${item.itemType}-${item.id}`}
        showsVerticalScrollIndicator={true}
        removeClippedSubviews={false}
        initialNumToRender={20}
        maxToRenderPerBatch={10}
        windowSize={10}
      />
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
    <FlatList
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      data={allItems}
      renderItem={({ item }) => {
        const renderedItem = renderListItem(
          item as Folder | FileItem,
          item.itemType === "folder" ? "folder" : "file"
        );
        return renderedItem as React.ReactElement;
      }}
      keyExtractor={(item) => `${item.itemType}-${item.id}`}
      showsVerticalScrollIndicator={true}
      removeClippedSubviews={false}
      initialNumToRender={20}
      maxToRenderPerBatch={10}
      windowSize={10}
    />
  );
}