import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import { colors } from '@/common/common-constants/ColorConstants';
import { designSystem } from '@/common/common-constants/DesignSystem';
import Box from '@/common/common-ui/ui-base/BoxComponent';

export const AddEmailScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleAddEmail = async () => {
    if (!email.trim()) {
      Alert.alert('エラー', 'メールアドレスを入力してください');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('エラー', '正しいメールアドレスの形式で入力してください');
      return;
    }

    setLoading(true);
    
    try {
      // TODO: Implement email addition logic with Firebase
      // await updateUserEmail(email);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert(
        '成功',
        'メールアドレスが正常に追加されました',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('エラー', 'メールアドレスの追加に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Box variant="primary" style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <AntDesign name="arrowleft" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>メールアドレス追加</Text>
            <Text style={styles.subtitle}>通知用メールアドレスを設定</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>
      </Box>

      <View style={styles.content}>
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>メールアドレス追加</Text>
          <Text style={styles.formDescription}>
            通知やアップデート情報を受け取るためのメールアドレスを追加してください。
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>メールアドレス</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="example@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          </View>

          <TouchableOpacity
            style={[styles.addButton, loading && styles.addButtonDisabled]}
            onPress={handleAddEmail}
            disabled={loading}
          >
            {loading ? (
              <Text style={styles.addButtonText}>処理中...</Text>
            ) : (
              <>
                <AntDesign name="plus" size={20} color="white" />
                <Text style={styles.addButtonText}>メールアドレスを追加</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <AntDesign name="infocirlce" size={20} color={colors.primary} />
            <Text style={styles.infoTitle}>ご注意</Text>
          </View>
          <Text style={styles.infoText}>
            • 追加されたメールアドレスには確認メールが送信されます{'\n'}
            • メールアドレスの確認が完了するまで通知は送信されません{'\n'}
            • 既に登録済みのメールアドレスは追加できません
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
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  title: {
    ...designSystem.text.headerTitle,
    color: 'white',
    fontSize: 18,
    marginBottom: 2,
  },
  subtitle: {
    ...designSystem.text.subtitle,
    color: 'white',
    opacity: 0.9,
    fontSize: 14,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  formCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  formDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 32,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border.primary,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text.primary,
    backgroundColor: colors.background.secondary,
  },
  addButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: colors.primary + '10',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
});

export default AddEmailScreen;