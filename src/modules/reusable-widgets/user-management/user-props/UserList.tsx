/**
 * @file UserList.tsx
 * @description ユーザー一覧表示コンポーネント。検索・ソート・編集・削除を提供。
 *
 * 【このファイルの位置づけ】
 *   reusable-widgets > user-management > user-props 配下のリスト。
 *   UserManagement コンポーネントのデフォルト表示。
 *
 * 主な内部ロジック:
 *   - 検索: ニックネームまたはUIDで絞り込み
 *   - ソート: 名前順 / 権限順 / 登録順
 *   - FlatList のレスポンシブ numColumns（モバイル1列、タブレット3列、デスクトップ5列）
 *   - 削除確認モーダル付き
 *
 * 主要Props:
 *   - userList: ユーザー配列
 *   - onEdit: 編集コールバック
 *   - onDelete: 削除コールバック
 *   - onAdd: 追加ボタンコールバック
 */
import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { User } from "@/common/common-models/model-user/UserModel";
import Button from "@/common/common-ui/ui-forms/FormButton";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "@/common/common-constants/ColorConstants";
import { styles } from "./UserList.styles";
import { UserListProps } from "../user-types/components";
import { getOptimizedFlatListProps } from "@/common/common-utils/performance/webOptimization";
import { useExtendedFonts } from "@/common/common-utils/performance/fontLoader";
import { useMD3Theme } from "@/common/common-theme/md3/MD3ThemeContext";

type SortKey = "name" | "role" | "joined";
const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "name", label: "名前順" },
  { key: "role", label: "権限順" },
  { key: "joined", label: "登録順" },
];

/**
 * ユーザー一覧表示コンポーネント
 * ユーザーの検索、編集、削除機能を提供
 */
export const UserList: React.FC<UserListProps> = ({
  userList,
  onEdit,
  onDelete,
  onAdd,
  loading = false,
  userPasswords = {},
}) => {
  const { width } = useWindowDimensions();
  const theme = useMD3Theme();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // MaterialCommunityIconsフォントを遅延読み込み
  const [fontsLoaded] = useExtendedFonts();

  // レスポンシブ設定
  const isTablet = width >= 768;
  const isDesktop = width >= 1024;
  const numColumns = isDesktop ? 5 : isTablet ? 3 : 1;

  const filteredUserList = useMemo(() => {
    const filtered = userList?.filter((user) => {
      if (!user) return false;
      const query = searchQuery.toLowerCase();
      return (
        (user.nickname?.toLowerCase() ?? "").includes(query) ||
        user.uid.toLowerCase().includes(query)
      );
    }) ?? [];

    const sorted = [...filtered];
    switch (sortKey) {
      case "name":
        sorted.sort((a, b) =>
          (a.furigana || a.nickname || "").localeCompare(b.furigana || b.nickname || "", "ja")
        );
        break;
      case "role":
        sorted.sort((a, b) => {
          const order: Record<string, number> = { master: 0, user: 1 };
          return (order[a.role] ?? 2) - (order[b.role] ?? 2);
        });
        break;
      case "joined":
        // デフォルト順（登録順）なのでそのまま
        break;
    }
    return sorted;
  }, [userList, searchQuery, sortKey]);

  if (loading) {
    return null;
  }

  const handleDeletePress = (user: User) => {
    setDeleteTarget(user);
    setShowDeleteModal(true);
  };
  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      onDelete(deleteTarget.uid);
    }
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };
  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  const renderItem = ({ item }: { item: User }) => {
    const userColor = item.color || theme.colorScheme.primary;
    return (
      <TouchableOpacity
        style={{
          flex: 1,
          backgroundColor: theme.colorScheme.surface,
          borderRadius: theme.shape.small,
          padding: theme.spacing.sm,
          borderWidth: 1,
          borderColor: theme.colorScheme.outlineVariant,
        }}
        activeOpacity={0.7}
        onPress={() => onEdit(item)}
      >
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: theme.spacing.xs }}>
          <View
            style={{ backgroundColor: userColor + "22", width: 28, height: 28, borderRadius: 14, justifyContent: "center", alignItems: "center", marginRight: theme.spacing.xs }}
          >
            <MaterialIcons name="person" size={16} color={userColor} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ ...theme.typography.labelLarge, color: theme.colorScheme.onSurface }} numberOfLines={1}>
              {item.nickname || "名前なし"}{item.furigana ? <Text style={{ ...theme.typography.bodySmall, color: theme.colorScheme.onSurfaceVariant }}>（{item.furigana}）</Text> : null}
            </Text>
            <Text style={{ ...theme.typography.bodySmall, color: theme.colorScheme.onSurfaceVariant }}>
              {item.role === "master" ? "マスター" : "一般ユーザー"}
            </Text>
          </View>
        </View>

        <View style={styles.cardActions}>
          <Button
            title="削除"
            onPress={() => handleDeletePress(item)}
            variant="outline"
            size="small"
            style={styles.deleteButton}
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.header,
          isTablet && styles.headerTablet,
          isDesktop && styles.headerDesktop,
        ]}
      >
        <TextInput
          style={[styles.searchInput, isTablet && styles.searchInputTablet]}
          placeholder="ユーザーを検索..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <View style={{
          borderWidth: 1,
          borderColor: theme.colorScheme.outlineVariant,
          borderRadius: theme.shape.small,
          backgroundColor: theme.colorScheme.surface,
          height: 44,
          justifyContent: "center",
          minWidth: 110,
        }}>
          <Picker
            selectedValue={sortKey}
            onValueChange={(v) => setSortKey(v as SortKey)}
            style={{ height: 44, color: theme.colorScheme.onSurface, border: "none", outline: "none", backgroundColor: "transparent" } as any}
          >
            {SORT_OPTIONS.map((opt) => (
              <Picker.Item key={opt.key} label={opt.label} value={opt.key} />
            ))}
          </Picker>
        </View>
        <Button
          title={isTablet ? "ユーザーを追加" : "追加"}
          onPress={onAdd}
          variant="primary"
          size={isTablet ? "medium" : "small"}
          style={[styles.addButton, isTablet && styles.addButtonTablet]}
        />
      </View>
      <FlatList
        data={filteredUserList}
        renderItem={renderItem}
        keyExtractor={(user: User) => user.uid}
        contentContainerStyle={styles.list}
        numColumns={numColumns}
        columnWrapperStyle={
          numColumns > 1
            ? isDesktop
              ? styles.columnWrapperDesktop
              : styles.columnWrapper
            : undefined
        }
        key={numColumns} // numColumnsが変わった時の再レンダリング用
        ListEmptyComponent={
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>
              {searchQuery
                ? "検索結果が見つかりません"
                : "ユーザーが登録されていません"}
            </Text>
          </View>
        }
        {...getOptimizedFlatListProps()}
      />
      {showDeleteModal && deleteTarget && (
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, isTablet && styles.modalContentTablet]}
          >
            <Text style={styles.modalTitle}>ユーザーを削除しますか？</Text>
            <Text style={styles.modalMessage}>
              {deleteTarget.nickname} を削除します。この操作は取り消せません。
            </Text>
            <View style={styles.modalActions}>
              <Button
                title="キャンセル"
                onPress={handleDeleteCancel}
                variant="outline"
                style={styles.modalButton}
              />
              <Button
                title="削除"
                onPress={handleDeleteConfirm}
                variant="primary"
                style={[styles.modalButton, styles.deleteButtonModal]}
              />
            </View>
          </View>
        </View>
      )}
    </View>
  );
};
