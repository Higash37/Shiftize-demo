import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Dimensions,
} from "react-native";
import { MaterialIcons, AntDesign } from "@expo/vector-icons";
import { colors } from "@/common/common-constants/ThemeConstants";
import { Folder, BreadcrumbItem } from "@/common/common-models/ModelIndex";
import { styles } from "./FileSidebar.styles";

interface FileSidebarProps {
  folders: Folder[];
  currentFolderId: string | null;
  breadcrumbs: BreadcrumbItem[];
  onFolderPress: (folder: Folder) => void;
  onHomePress: () => void;
  onCreateFolder: () => void;
  onUploadFiles: () => void;
  isMobile?: boolean;
  isOverlay?: boolean;
  onClose?: () => void;
}

export function FileSidebar({
  folders,
  currentFolderId,
  breadcrumbs,
  onFolderPress,
  onHomePress,
  onCreateFolder,
  onUploadFiles,
  isMobile = false,
  isOverlay = false,
  onClose,
}: FileSidebarProps) {
  const { width } = Dimensions.get("window");

  // フォルダを階層構造で整理
  const buildFolderTree = () => {
    const folderMap = new Map<string, Folder[]>();

    // 親IDでグループ化
    folders.forEach((folder) => {
      const parentId = folder.parentId || "root";
      if (!folderMap.has(parentId)) {
        folderMap.set(parentId, []);
      }
      folderMap.get(parentId)!.push(folder);
    });

    return folderMap;
  };

  const folderTree = buildFolderTree();

  // クイックナビゲーション用の親フォルダ名を取得
  const getParentFolderName = () => {
    if (!currentFolderId || breadcrumbs.length === 0) {
      return "ルート";
    }

    // 現在のフォルダの親フォルダ名を取得
    if (breadcrumbs.length === 1) {
      return "ルート";
    }

    const parentBreadcrumb = breadcrumbs[breadcrumbs.length - 2];
    return parentBreadcrumb ? parentBreadcrumb.name : "ルート";
  };

  // 現在の階層にあるフォルダとファイルを取得
  const getCurrentLevelItems = () => {
    return folderTree.get(currentFolderId || "root") || [];
  };

  const parentFolderName = getParentFolderName();
  const currentLevelFolders = getCurrentLevelItems();

  return (
    <View style={styles.container}>
      {/* ヘッダー部分 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.homeButton} onPress={onHomePress}>
          <MaterialIcons name="home" size={20} color={colors.primary} />
          <Text style={styles.homeText}>ホーム</Text>
        </TouchableOpacity>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onCreateFolder}
          >
            <MaterialIcons
              name="create-new-folder"
              size={isMobile ? 14 : 16}
              color={colors.primary}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={onUploadFiles}>
            <MaterialIcons
              name="file-upload"
              size={isMobile ? 14 : 16}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 親フォルダ表示 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>上位フォルダ</Text>
          <TouchableOpacity style={styles.quickNavItem} onPress={onHomePress}>
            <MaterialIcons
              name="folder-open"
              size={16}
              color={colors.text.secondary}
            />
            <Text style={styles.quickNavText} numberOfLines={1}>
              {parentFolderName}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 現在の階層のフォルダ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>フォルダ</Text>
          {currentLevelFolders.map((folder) => (
            <TouchableOpacity
              key={folder.id}
              style={[
                styles.folderItem,
                folder.id === currentFolderId && styles.activeFolderItem,
              ]}
              onPress={() => onFolderPress(folder)}
            >
              <MaterialIcons
                name="folder"
                size={16}
                color={
                  folder.id === currentFolderId
                    ? colors.primary
                    : colors.text.secondary
                }
              />
              <Text
                style={[
                  styles.folderText,
                  folder.id === currentFolderId && styles.activeFolderText,
                ]}
                numberOfLines={1}
              >
                {folder.name}
              </Text>
              {folder.childrenCount > 0 && (
                <Text style={styles.folderCount}>({folder.childrenCount})</Text>
              )}
            </TouchableOpacity>
          ))}
          {currentLevelFolders.length === 0 && (
            <Text style={styles.emptyText}>フォルダがありません</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
