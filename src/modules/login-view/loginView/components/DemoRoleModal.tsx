import React from 'react';
import { Modal, View, Text, TouchableOpacity, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface DemoRoleModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectRole: (role: 'master' | 'user') => void;
}

export const DemoRoleModal: React.FC<DemoRoleModalProps> = ({
  visible,
  onClose,
  onSelectRole,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable 
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 16,
        }}
        onPress={onClose}
      >
        <Pressable 
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 16,
            padding: 24,
            width: '100%',
            maxWidth: 400,
          }}
          onPress={(e) => e.stopPropagation()}
        >
          {/* ヘッダー */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 20,
          }}>
            <MaterialIcons name="person" size={24} color="#3b82f6" />
            <Text style={{
              flex: 1,
              fontSize: 18,
              fontWeight: 'bold',
              color: '#1f2937',
              marginLeft: 12,
            }}>
              デモアカウントを選択
            </Text>
            <TouchableOpacity 
              onPress={onClose}
              style={{ padding: 4 }}
            >
              <MaterialIcons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* 説明 */}
          <Text style={{
            fontSize: 14,
            color: '#6b7280',
            marginBottom: 24,
            textAlign: 'center',
            lineHeight: 20,
          }}>
            体験したい役割を選択してください。{'\n'}
            自動でログイン情報が入力されます。
          </Text>

          {/* 役割選択ボタン */}
          <View style={{ gap: 12 }}>
            {/* 教室長用 */}
            <TouchableOpacity
              style={{
                backgroundColor: '#f8faff',
                borderWidth: 2,
                borderColor: '#3b82f6',
                borderRadius: 12,
                padding: 16,
                alignItems: 'center',
              }}
              onPress={() => onSelectRole('master')}
            >
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 8,
              }}>
                <MaterialIcons name="admin-panel-settings" size={24} color="#3b82f6" />
                <Text style={{
                  fontSize: 16,
                  fontWeight: 'bold',
                  color: '#1f2937',
                  marginLeft: 8,
                }}>
                  教室長（管理者）
                </Text>
              </View>
              <Text style={{
                fontSize: 12,
                color: '#6b7280',
                textAlign: 'center',
                lineHeight: 16,
              }}>
                全機能へのアクセス権限{'\n'}
                シフト管理・承認・レポート閲覧
              </Text>
            </TouchableOpacity>

            {/* 講師用 */}
            <TouchableOpacity
              style={{
                backgroundColor: '#fff8f1',
                borderWidth: 2,
                borderColor: '#f59e0b',
                borderRadius: 12,
                padding: 16,
                alignItems: 'center',
              }}
              onPress={() => onSelectRole('user')}
            >
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 8,
              }}>
                <MaterialIcons name="school" size={24} color="#f59e0b" />
                <Text style={{
                  fontSize: 16,
                  fontWeight: 'bold',
                  color: '#1f2937',
                  marginLeft: 8,
                }}>
                  講師（一般ユーザー）
                </Text>
              </View>
              <Text style={{
                fontSize: 12,
                color: '#6b7280',
                textAlign: 'center',
                lineHeight: 16,
              }}>
                自分のシフト管理{'\n'}
                タスク報告・シフト申請
              </Text>
            </TouchableOpacity>
          </View>

          {/* 注意事項 */}
          <View style={{
            marginTop: 20,
            padding: 12,
            backgroundColor: '#f3f4f6',
            borderRadius: 8,
          }}>
            <Text style={{
              fontSize: 11,
              color: '#6b7280',
              textAlign: 'center',
              lineHeight: 16,
            }}>
              デモデータは定期的にリセットされます{'\n'}
              実際の業務でのご利用は避けてください
            </Text>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};