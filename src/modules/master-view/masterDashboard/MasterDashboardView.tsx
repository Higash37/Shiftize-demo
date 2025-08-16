import React, { useMemo, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl,
  Alert
} from 'react-native';
import { router } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import { User } from '@/common/common-models/ModelIndex';
import { colors } from '@/common/common-constants/ColorConstants';
import { designSystem } from '@/common/common-constants/DesignSystem';
import Box from '@/common/common-ui/ui-base/BoxComponent';

/**
 * ダッシュボードアイテムの型定義
 */
interface DashboardItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  route: string;
  color: string;
  requiresPermission?: boolean;
}

/**
 * 統計情報の型定義
 */
interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
}

interface MasterDashboardViewProps {
  /** ユーザー一覧 */
  users: User[];
  /** ローディング状態 */
  loading: boolean;
  /** エラーメッセージ */
  error: string | null;
  /** リフレッシュ中フラグ */
  refreshing?: boolean;
  /** リフレッシュコールバック */
  onRefresh?: () => void;
  /** 現在のユーザー（権限チェック用） */
  currentUser?: User | null;
  /** テストID */
  testID?: string;
}

export const MasterDashboardView: React.FC<MasterDashboardViewProps> = ({
  users,
  loading,
  error,
  refreshing = false,
  onRefresh,
  currentUser,
  testID = 'master-dashboard',
}) => {
  /**
   * ダッシュボードアイテムの定義（メモ化）
   * パフォーマンス最適化のため、プロパティ変更時のみ再計算
   */
  const dashboardItems = useMemo<DashboardItem[]>(() => [
    {
      id: 'shift-management',
      title: 'シフト管理',
      description: 'シフトの表示・編集・ガントチャート',
      icon: 'calendar',
      route: '/(main)/master/gantt-view',
      color: colors.primary,
      requiresPermission: false,
    },
    {
      id: 'user-management',
      title: 'ユーザー管理',
      description: 'スタッフの管理・権限設定',
      icon: 'team',
      route: '/(main)/master/users',
      color: colors.secondary,
      requiresPermission: true,
    },
    {
      id: 'task-management',
      title: 'タスク管理',
      description: '業務タスクの管理・追跡',
      icon: 'checkcircle',
      route: '/(main)/master/taskManagement',
      color: colors.warning,
      requiresPermission: false,
    },
    {
      id: 'settings',
      title: '設定',
      description: 'アプリの設定・セキュリティ',
      icon: 'setting',
      route: '/(main)/master/settings',
      color: colors.info || colors.primary,
      requiresPermission: true,
    },
  ], []);

  /**
   * 統計情報の計算（メモ化）
   * ユーザー配列が変更された時のみ再計算
   */
  const dashboardStats = useMemo<DashboardStats>(() => {
    if (!Array.isArray(users)) {
      return { totalUsers: 0, activeUsers: 0, inactiveUsers: 0 };
    }

    const activeUsers = users.filter(user => user.isActive !== false).length;
    return {
      totalUsers: users.length,
      activeUsers,
      inactiveUsers: users.length - activeUsers,
    };
  }, [users]);

  /**
   * セキュアなナビゲーション処理
   * ルート検証とエラーハンドリングを含む
   */
  const handleNavigation = useCallback((item: DashboardItem) => {
    try {
      // 権限チェック
      if (item.requiresPermission && currentUser?.role !== 'master') {
        Alert.alert(
          'アクセス拒否',
          'この機能にアクセスする権限がありません。',
          [{ text: 'OK' }]
        );
        return;
      }

      // ルート検証
      if (!item.route || typeof item.route !== 'string') {
        throw new Error('無効なルートが指定されました');
      }

      // ナビゲーション実行
      router.push(item.route as any);
    } catch (navigationError) {
      console.error('Navigation error:', navigationError);
      Alert.alert(
        'ナビゲーションエラー',
        'ページの読み込みに失敗しました。もう一度お試しください。',
        [{ text: 'OK' }]
      );
    }
  }, [currentUser?.role]);

  /**
   * リフレッシュ処理
   */
  const handleRefresh = useCallback(() => {
    if (typeof onRefresh === 'function') {
      onRefresh();
    }
  }, [onRefresh]);

  /**
   * ローディング状態の表示
   */
  if (loading) {
    return (
      <View style={styles.container} testID={`${testID}-loading`}>
        <Box variant="primary" style={styles.header}>
          <Text style={styles.title}>マスターダッシュボード</Text>
          <Text style={styles.subtitle}>データを読み込み中...</Text>
        </Box>
        <View style={styles.loadingContainer}>
          <AntDesign name="loading1" size={48} color={colors.primary} />
          <Text style={styles.loadingText}>読み込み中...</Text>
        </View>
      </View>
    );
  }

  /**
   * エラー状態の表示
   */
  if (error) {
    return (
      <View style={styles.container} testID={`${testID}-error`}>
        <Box variant="primary" style={styles.header}>
          <Text style={styles.title}>マスターダッシュボード</Text>
          <Text style={styles.subtitle}>エラーが発生しました</Text>
        </Box>
        <View style={styles.errorContainer}>
          <AntDesign name="warning" size={48} color={colors.error} />
          <Text style={styles.errorText}>エラー: {error}</Text>
          {onRefresh && (
            <TouchableOpacity 
              style={styles.retryButton} 
              onPress={handleRefresh}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="再読み込み"
            >
              <AntDesign name="reload1" size={20} color="white" />
              <Text style={styles.retryButtonText}>再読み込み</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  /**
   * メインダッシュボードの表示
   */
  return (
    <ScrollView 
      style={styles.container}
      testID={testID}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        ) : undefined
      }
      showsVerticalScrollIndicator={false}
    >
      <Box variant="primary" style={styles.header}>
        <Text 
          style={styles.title}
          accessible={true}
          accessibilityRole="header"
        >
          マスターダッシュボード
        </Text>
        <Text style={styles.subtitle}>システム管理・監督者用画面</Text>
      </Box>

      <View style={styles.content}>
        {/* 統計情報カード */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>ユーザー統計</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{dashboardStats.totalUsers}</Text>
              <Text style={styles.statLabel}>総ユーザー数</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.success || colors.primary }]}>
                {dashboardStats.activeUsers}
              </Text>
              <Text style={styles.statLabel}>アクティブ</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.warning }]}>
                {dashboardStats.inactiveUsers}
              </Text>
              <Text style={styles.statLabel}>非アクティブ</Text>
            </View>
          </View>
        </View>

        {/* 機能カードグリッド */}
        <View style={styles.grid}>
          {dashboardItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.card, { borderLeftColor: item.color }]}
              onPress={() => handleNavigation(item)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`${item.title}: ${item.description}`}
              testID={`${testID}-${item.id}`}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
                  <AntDesign name={item.icon as any} size={24} color={item.color} />
                </View>
                <Text style={styles.cardTitle}>{item.title}</Text>
                {item.requiresPermission && (
                  <AntDesign name="lock" size={16} color={colors.text.secondary} />
                )}
              </View>
              <Text style={styles.cardDescription}>{item.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    ...designSystem.text.headerTitle,
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    ...designSystem.text.subtitle,
    color: 'white',
    opacity: 0.9,
  },
  content: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 20,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  statsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 4,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
  },
  grid: {
    gap: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    flex: 1,
  },
  cardDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    marginTop: 4,
  },
});