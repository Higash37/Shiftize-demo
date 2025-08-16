import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  Alert,
  TouchableOpacity,
  Platform
} from 'react-native';
import { router } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import { useAuth } from '@/services/auth/useAuth';
import { designSystem } from '@/common/common-constants/DesignSystem';
import { colors } from '@/common/common-constants/ColorConstants';
import Box from '@/common/common-ui/ui-base/BoxComponent';

/**
 * ホーム画面の状態管理
 */
interface HomeScreenState {
  isRedirecting: boolean;
  redirectionAttempts: number;
  error: string | null;
}

/**
 * 最大リダイレクト試行回数
 */
const MAX_REDIRECT_ATTEMPTS = 3;

/**
 * リダイレクト待機時間（ミリ秒）
 */
const REDIRECT_DELAY = 1500;

const HomeCommonScreen: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [screenState, setScreenState] = useState<HomeScreenState>({
    isRedirecting: false,
    redirectionAttempts: 0,
    error: null,
  });

  /**
   * セキュアなリダイレクト処理
   * ユーザーロールの検証とエラーハンドリングを含む
   */
  const performRedirect = useCallback(async (userRole: string) => {
    const validRoles = ['master', 'user'] as const;
    
    // ロールの検証
    if (!validRoles.includes(userRole as any)) {
      setScreenState(prev => ({ 
        ...prev, 
        error: '無効なユーザーロールが検出されました' 
      }));
      return;
    }

    setScreenState(prev => ({ 
      ...prev, 
      isRedirecting: true, 
      error: null 
    }));

    try {
      // セキュリティ遅延（UI体験向上とセキュリティ監査）
      await new Promise(resolve => setTimeout(resolve, REDIRECT_DELAY));
      
      const route = userRole === 'master' ? '/(main)/master' : '/(main)/user';
      
      // ナビゲーション実行
      await router.replace(route);
      
    } catch (error) {
      console.error('Redirect failed:', error);
      setScreenState(prev => ({
        ...prev,
        isRedirecting: false,
        redirectionAttempts: prev.redirectionAttempts + 1,
        error: 'ページの読み込みに失敗しました',
      }));
    }
  }, []);

  /**
   * 手動リトライ処理
   */
  const handleRetry = useCallback(() => {
    if (user?.role && screenState.redirectionAttempts < MAX_REDIRECT_ATTEMPTS) {
      performRedirect(user.role);
    } else {
      Alert.alert(
        'エラー',
        'リダイレクトに失敗しました。アプリを再起動してください。',
        [{ text: 'OK' }]
      );
    }
  }, [user?.role, screenState.redirectionAttempts, performRedirect]);

  /**
   * ユーザー認証状態とロールに基づく自動リダイレクト
   */
  useEffect(() => {
    if (!authLoading && user?.role && !screenState.isRedirecting && !screenState.error) {
      performRedirect(user.role);
    }
  }, [user, authLoading, screenState.isRedirecting, screenState.error, performRedirect]);

  /**
   * ローディング状態の表示
   */
  if (authLoading) {
    return (
      <View style={styles.container}>
        <Box variant="primary" style={styles.header}>
          <Text style={styles.title}>認証中</Text>
          <Text style={styles.subtitle}>ユーザー情報を確認しています...</Text>
        </Box>
        
        <View style={styles.content}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.message}>お待ちください...</Text>
        </View>
      </View>
    );
  }

  /**
   * エラー状態の表示
   */
  if (screenState.error) {
    return (
      <View style={styles.container}>
        <Box variant="primary" style={styles.header}>
          <Text style={styles.title}>エラー</Text>
          <Text style={styles.subtitle}>問題が発生しました</Text>
        </Box>
        
        <View style={styles.content}>
          <View style={styles.errorContainer}>
            <AntDesign name="warning" size={48} color={colors.error} />
            <Text style={styles.errorMessage}>{screenState.error}</Text>
            
            {screenState.redirectionAttempts < MAX_REDIRECT_ATTEMPTS && user?.role && (
              <TouchableOpacity 
                style={styles.retryButton} 
                onPress={handleRetry}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="再試行"
              >
                <AntDesign name="reload1" size={20} color="white" />
                <Text style={styles.retryButtonText}>再試行</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  }

  /**
   * ユーザーロールが不明な場合
   */
  if (!user?.role) {
    return (
      <View style={styles.container}>
        <Box variant="primary" style={styles.header}>
          <Text style={styles.title}>設定エラー</Text>
          <Text style={styles.subtitle}>ユーザー設定を確認中</Text>
        </Box>
        
        <View style={styles.content}>
          <View style={styles.errorContainer}>
            <AntDesign name="user" size={48} color={colors.warning} />
            <Text style={styles.message}>ユーザーロールが設定されていません。</Text>
            <Text style={styles.subMessage}>管理者にお問い合わせください。</Text>
          </View>
        </View>
      </View>
    );
  }

  /**
   * リダイレクト中の表示
   */
  return (
    <View style={styles.container}>
      <Box variant="primary" style={styles.header}>
        <Text style={styles.title}>ホーム</Text>
        <Text style={styles.subtitle}>ダッシュボードに移動中...</Text>
      </Box>
      
      <View style={styles.content}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.message}>
            {user.role === 'master' ? 'マスターダッシュボード' : 'ユーザーダッシュボード'}に移動しています...
          </Text>
          <Text style={styles.subMessage}>
            しばらくお待ちください
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    ...designSystem.text.headerTitle,
    color: 'white',
    marginBottom: 8,
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    ...designSystem.text.subtitle,
    color: 'white',
    opacity: 0.9,
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    gap: 16,
  },
  errorContainer: {
    alignItems: 'center',
    gap: 20,
    maxWidth: 300,
  },
  message: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  subMessage: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 20,
  },
  errorMessage: {
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 24,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeCommonScreen;