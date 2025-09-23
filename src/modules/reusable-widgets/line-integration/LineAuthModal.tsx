/**
 * LINE連携認証モーダル
 * ユーザーがLINEアカウントを連携するためのUI
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
  TextInput,
  Clipboard
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/services/firebase/firebase-core';
import { useAuth } from '@/services/auth/useAuth';
import { colors } from '@/common/common-constants/ThemeConstants';
import { SecurityLogger } from '@/common/common-utils/security/securityUtils';

interface LineAuthModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface AuthCodeData {
  authCode: string;
  expiresAt: string;
}

export const LineAuthModal: React.FC<LineAuthModalProps> = ({
  visible,
  onClose,
  onSuccess
}) => {
  const { user } = useAuth();
  const [step, setStep] = useState<'guide' | 'generate' | 'waiting'>('guide');
  const [authCode, setAuthCode] = useState<string>('');
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [remainingTime, setRemainingTime] = useState<number>(0);

  // タイマー効果
  useEffect(() => {
    if (!expiresAt) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const expiry = expiresAt.getTime();
      const remaining = Math.max(0, expiry - now);
      
      setRemainingTime(remaining);
      
      if (remaining <= 0) {
        setStep('guide');
        setAuthCode('');
        setExpiresAt(null);
        Alert.alert('認証コードが期限切れになりました', '新しい認証コードを生成してください。');
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAt]);

  // 認証コード生成
  const generateAuthCode = async () => {
    if (!user) return;

    try {
      setIsGenerating(true);
      
      // 認証コード生成（LINE User IDは不要）
      const generateLineAuthCodeFunction = httpsCallable(functions, 'generateLineAuthCode');
      const result = await generateLineAuthCodeFunction({});

      const data = result.data as AuthCodeData;
      
      setAuthCode(data.authCode);
      setExpiresAt(new Date(data.expiresAt));
      setStep('waiting');

      // セキュリティログ
      SecurityLogger.logEvent({
        type: 'system_event',
        details: `User ${user.nickname} requested LINE auth code`,
      });

    } catch (error) {
      Alert.alert('エラー', '認証コードの生成に失敗しました。しばらくしてから再試行してください。');
      
      SecurityLogger.logEvent({
        type: 'system_error',
        details: `Auth code generation failed: ${error}`,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // 認証コードをクリップボードにコピー
  const copyAuthCode = () => {
    Clipboard.setString(authCode);
    Alert.alert('コピー完了', '認証コードをクリップボードにコピーしました');
  };

  // 残り時間を分:秒形式で表示
  const formatRemainingTime = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // モーダルリセット
  const handleClose = () => {
    setStep('guide');
    setAuthCode('');
    setExpiresAt(null);
    setRemainingTime(0);
    onClose();
  };

  const renderGuideStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.header}>
        <AntDesign name="wechat" size={32} color={colors.primary} />
        <Text style={styles.title}>LINE連携</Text>
      </View>
      
      <Text style={styles.description}>
        LINEでシフト管理を行うには、アカウント連携が必要です。
      </Text>
      
      <View style={styles.stepsContainer}>
        <View style={styles.stepItem}>
          <Text style={styles.stepNumber}>1</Text>
          <Text style={styles.stepText}>シフト管理ボットを友だち追加</Text>
        </View>
        
        <View style={styles.stepItem}>
          <Text style={styles.stepNumber}>2</Text>
          <Text style={styles.stepText}>認証コードを生成</Text>
        </View>
        
        <View style={styles.stepItem}>
          <Text style={styles.stepNumber}>3</Text>
          <Text style={styles.stepText}>LINEに認証コードを送信</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => setStep('generate')}
      >
        <Text style={styles.primaryButtonText}>次へ</Text>
      </TouchableOpacity>
    </View>
  );

  const renderGenerateStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.header}>
        <AntDesign name="key" size={32} color={colors.primary} />
        <Text style={styles.title}>認証コード生成</Text>
      </View>
      
      <Text style={styles.description}>
        LINEボットに送信する認証コードを生成します。
      </Text>
      
      <View style={styles.warningContainer}>
        <AntDesign name="warning" size={20} color="#ff9800" />
        <Text style={styles.warningText}>
          認証コードは5分間有効です。期限内にLINEに送信してください。
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, isGenerating && styles.disabledButton]}
        onPress={generateAuthCode}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.primaryButtonText}>認証コードを生成</Text>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => setStep('guide')}
      >
        <Text style={styles.secondaryButtonText}>戻る</Text>
      </TouchableOpacity>
    </View>
  );

  const renderWaitingStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.header}>
        <AntDesign name="clockcircle" size={32} color={colors.primary} />
        <Text style={styles.title}>認証コード送信</Text>
      </View>
      
      <Text style={styles.description}>
        以下の認証コードをLINEボットに送信してください。
      </Text>
      
      <View style={styles.authCodeContainer}>
        <Text style={styles.authCodeText}>{authCode}</Text>
        <TouchableOpacity
          style={styles.copyButton}
          onPress={copyAuthCode}
        >
          <AntDesign name="copy1" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.timerContainer}>
        <AntDesign name="hourglass" size={16} color="#ff9800" />
        <Text style={styles.timerText}>
          残り時間: {formatRemainingTime(remainingTime)}
        </Text>
      </View>
      
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionTitle}>送信手順:</Text>
        <Text style={styles.instructionText}>
          1. LINEで「シフト管理ボット」を開く{'\n'}
          2. 上記の6桁の数字を入力して送信{'\n'}
          3. 「認証が完了しました」メッセージを確認
        </Text>
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => {
          handleClose();
          onSuccess?.();
        }}
      >
        <Text style={styles.primaryButtonText}>完了</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => setStep('generate')}
      >
        <Text style={styles.secondaryButtonText}>新しいコードを生成</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={handleClose}>
            <AntDesign name="close" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.modalContent}>
          {step === 'guide' && renderGuideStep()}
          {step === 'generate' && renderGenerateStep()}
          {step === 'waiting' && renderWaitingStep()}
        </View>
      </View>
    </Modal>
  );
};

const styles = {
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'flex-end' as const,
    alignItems: 'center' as const,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  stepContainer: {
    flex: 1,
  },
  header: {
    alignItems: 'center' as const,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: colors.text.primary,
    marginTop: 8,
  },
  description: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center' as const,
    marginBottom: 32,
    lineHeight: 24,
  },
  stepsContainer: {
    marginBottom: 32,
  },
  stepItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold' as const,
    textAlign: 'center' as const,
    lineHeight: 32,
    marginRight: 16,
  },
  stepText: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary,
  },
  authCodeContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  authCodeText: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    color: colors.primary,
    letterSpacing: 4,
    marginRight: 16,
  },
  copyButton: {
    padding: 8,
  },
  timerContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 24,
  },
  timerText: {
    fontSize: 16,
    color: '#ff9800',
    marginLeft: 8,
    fontWeight: '600' as const,
  },
  instructionContainer: {
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 32,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: colors.text.primary,
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  warningContainer: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#856404',
    marginLeft: 8,
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center' as const,
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center' as const,
  },
  secondaryButtonText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  disabledButton: {
    backgroundColor: colors.text.disabled,
  },
};

export default LineAuthModal;