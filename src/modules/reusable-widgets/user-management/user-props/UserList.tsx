import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { User } from "@/common/common-models/model-user/UserModel";
import Button from "@/common/common-ui/ui-forms/FormButton";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "@/common/common-constants/ColorConstants";
import { layout } from "@/common/common-constants/LayoutConstants";
import { shadows } from "@/common/common-constants/ShadowConstants";
import { styles } from "./UserList.styles";
import { UserListProps } from "../user-types/components";
import { getOptimizedFlatListProps } from "@/common/common-utils/performance/webOptimization";
import { useExtendedFonts } from "@/common/common-utils/performance/fontLoader";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // MaterialCommunityIconsフォントを遅延読み込み
  const [fontsLoaded] = useExtendedFonts();

  // レスポンシブ設定
  const isTablet = width >= 768;
  const isDesktop = width >= 1024;
  const numColumns = isDesktop ? 4 : isTablet ? 2 : 1;

  const filteredUserList =
    userList?.filter((user) => {
      if (!user) return false;
      const query = searchQuery.toLowerCase();
      return (
        (user.nickname?.toLowerCase() ?? "").includes(query) ||
        user.uid.toLowerCase().includes(query)
      );
    }) ?? [];

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
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

  const renderItem = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={[
        styles.userCard,
        isTablet && styles.userCardTablet,
        isDesktop && styles.userCardDesktop,
      ]}
      activeOpacity={0.8}
      onPress={() => onEdit(item)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name="account-circle"
            size={isTablet ? 36 : 32}
            color={item.role === "master" ? colors.secondary : colors.primary}
          />
        </View>
        <View style={styles.userInfo}>
          <View style={styles.nameContainer}>
            <Text style={[styles.userName, isTablet && styles.userNameLarge]}>
              {item.nickname || "名前なし"}
            </Text>
            <View
              style={[
                styles.colorMark,
                { backgroundColor: item.color || colors.text.disabled },
              ]}
            />
          </View>
          <Text style={styles.userRole}>
            {item.role === "master" ? "マスター" : "一般ユーザー"}
          </Text>
          {item.email && (
            <Text style={styles.userEmail}>📧 {item.email}</Text>
          )}
          {item.storeId && (
            <Text style={styles.storeId}>店舗ID: {item.storeId}</Text>
          )}
        </View>
      </View>

      {userPasswords[item.uid] && (
        <View style={styles.passwordSection}>
          <Text style={styles.passwordLabel}>パスワード</Text>
          <Text style={styles.passwordValue}>{userPasswords[item.uid]}</Text>
        </View>
      )}

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

// エクスポートは上部で直接行うように修正
