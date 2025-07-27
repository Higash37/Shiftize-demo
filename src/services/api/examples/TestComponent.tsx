/**
 * APIサービス移行テスト用コンポーネント
 * 
 * このコンポーネントは移行後のShiftAPIServiceをテストするために作成されました。
 * 実際のアプリには組み込まず、開発者のテスト用として使用します。
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useShift } from '@/common/common-utils/util-shift/useShiftActions';
import { useAuth } from '@/services/auth/useAuth';

const TestComponent: React.FC = () => {
  const { user, role } = useAuth();
  const { shifts, loading, error, debugInfo, fetchShifts } = useShift();
  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    if (user) {
      addTestResult(`✅ ユーザー認証済み: ${user.email} (${role})`);
      addTestResult(`🔄 デバッグ情報: ${JSON.stringify(debugInfo)}`);
    } else {
      addTestResult('❌ ユーザー未認証');
    }
  }, [user, role, debugInfo]);

  useEffect(() => {
    if (shifts.length > 0) {
      addTestResult(`✅ シフト取得成功: ${shifts.length}件`);
    } else if (!loading && shifts.length === 0) {
      addTestResult('ℹ️ シフトが0件、または取得中');
    }
  }, [shifts, loading]);

  useEffect(() => {
    if (error) {
      addTestResult(`❌ エラー発生: ${error}`);
    }
  }, [error]);

  const handleRefreshShifts = async () => {
    addTestResult('🔄 シフト再取得開始...');
    try {
      await fetchShifts();
      addTestResult('✅ シフト再取得完了');
    } catch (err: any) {
      addTestResult(`❌ シフト再取得失敗: ${err.message}`);
    }
  };

  const handleShowDebugInfo = () => {
    Alert.alert(
      'デバッグ情報',
      JSON.stringify(debugInfo, null, 2),
      [{ text: 'OK' }]
    );
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>APIサービステスト</Text>
        <Text style={styles.error}>認証が必要です</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔄 API移行テスト</Text>
      
      {/* ユーザー情報 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ユーザー情報</Text>
        <Text>Email: {user.email}</Text>
        <Text>Role: {role}</Text>
        <Text>Store ID: {user.storeId}</Text>
      </View>

      {/* デバッグ情報 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>API状態</Text>
        <Text>API使用: {debugInfo.useApiEndpoints ? 'Yes' : 'No (Firebase直接)'}</Text>
        <Text>サービス: {debugInfo.service}</Text>
        <TouchableOpacity style={styles.button} onPress={handleShowDebugInfo}>
          <Text style={styles.buttonText}>詳細デバッグ情報</Text>
        </TouchableOpacity>
      </View>

      {/* シフト情報 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>シフト状態</Text>
        <Text>読み込み中: {loading ? 'Yes' : 'No'}</Text>
        <Text>シフト数: {shifts.length}件</Text>
        {error && <Text style={styles.error}>エラー: {error}</Text>}
        
        <TouchableOpacity style={styles.button} onPress={handleRefreshShifts}>
          <Text style={styles.buttonText}>シフト再取得</Text>
        </TouchableOpacity>
      </View>

      {/* シフト一覧 */}
      {shifts.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>シフト一覧 (最大5件)</Text>
          {shifts.slice(0, 5).map((shift, index) => (
            <View key={shift.id} style={styles.shiftItem}>
              <Text style={styles.shiftText}>
                {index + 1}. {shift.nickname || 'No Name'} - {shift.date}
              </Text>
              <Text style={styles.shiftSubText}>
                {shift.startTime}〜{shift.endTime} [{shift.status}]
              </Text>
            </View>
          ))}
          {shifts.length > 5 && (
            <Text style={styles.moreText}>...他{shifts.length - 5}件</Text>
          )}
        </View>
      )}

      {/* テスト結果ログ */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>テストログ</Text>
        <ScrollView style={styles.logContainer} showsVerticalScrollIndicator={false}>
          {testResults.map((result, index) => (
            <Text key={index} style={styles.logText}>
              {result}
            </Text>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  section: {
    backgroundColor: 'white',
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#444',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 6,
    marginTop: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    fontWeight: 'bold',
  },
  shiftItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 8,
  },
  shiftText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  shiftSubText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  moreText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  logContainer: {
    maxHeight: 150,
    backgroundColor: '#f8f8f8',
    padding: 8,
    borderRadius: 4,
  },
  logText: {
    fontSize: 11,
    color: '#666',
    marginBottom: 2,
    fontFamily: 'monospace',
  },
});

export default TestComponent;