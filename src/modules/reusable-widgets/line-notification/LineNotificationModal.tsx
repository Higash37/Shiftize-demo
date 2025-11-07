import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { colors } from '@/common/common-constants/ThemeConstants';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db } from '@/services/firebase/firebase';
import { functions } from '@/services/firebase/firebase-core';
import { RecruitmentShift } from '@/common/common-models/model-shift/shiftTypes';
import { useAuth } from '@/services/auth/useAuth';
import { styles } from './LineNotificationModal.styles';

interface LineNotificationModalProps {
  visible: boolean;
  onClose: () => void;
  storeId: string;
  recruitmentCount: number;
}

export function LineNotificationModal({
  visible,
  onClose,
  storeId,
  recruitmentCount,
}: LineNotificationModalProps) {
  const { user } = useAuth();
  const [comment, setComment] = useState('');
  const [recruitmentShifts, setRecruitmentShifts] = useState<RecruitmentShift[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  // 募集シフト一覧を取得
  useEffect(() => {
    if (visible && storeId) {
      fetchRecruitmentShifts();
    }
  }, [visible, storeId]);

  const fetchRecruitmentShifts = async () => {
    if (!storeId) return;

    try {
      setLoading(true);
      const q = query(
        collection(db, 'recruitmentShifts'),
        where('storeId', '==', storeId),
        where('status', '==', 'open')
      );

      const snapshot = await getDocs(q);
      const shifts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as RecruitmentShift[];

      setRecruitmentShifts(shifts);
    } catch (error) {
      Alert.alert('エラー', '募集シフトの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotification = async () => {
    if (recruitmentShifts.length === 0) {
      Alert.alert('通知なし', '送信する募集シフトがありません');
      return;
    }

    try {
      setSending(true);

      // 複数募集シフト通知用のCloud Function呼び出し
      const sendBulkNotification = httpsCallable(functions, 'sendBulkRecruitmentNotification');

      await sendBulkNotification({
        storeId: storeId,
        recruitmentShifts: recruitmentShifts,
        comment: comment.trim(),
        masterName: user?.nickname || '教室長',
      });

      Alert.alert(
        '送信完了',
        `${recruitmentShifts.length}件の募集シフトをLINEで通知しました`,
        [
          {
            text: 'OK',
            onPress: () => {
              setComment('');
              onClose();
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        '送信失敗',
        error.message || 'LINE通知の送信に失敗しました'
      );
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ja-JP', {
      month: 'numeric',
      day: 'numeric',
      weekday: 'short'
    });
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* ヘッダー */}
          <View style={styles.header}>
            <Text style={styles.title}>LINE通知送信</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <AntDesign name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          {/* 募集シフト数表示 */}
          <View style={styles.countContainer}>
            <AntDesign name="bell" size={20} color={colors.primary} />
            <Text style={styles.countText}>
              現在の募集シフト: {recruitmentCount}件
            </Text>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* 募集シフト一覧 */}
            <View style={styles.shiftsList}>
              <Text style={styles.sectionTitle}>送信する募集シフト:</Text>

              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={styles.loadingText}>読み込み中...</Text>
                </View>
              ) : recruitmentShifts.length > 0 ? (
                recruitmentShifts.map((shift) => (
                  <View key={shift.id} style={styles.shiftItem}>
                    <View style={styles.shiftInfo}>
                      <Text style={styles.shiftDate}>
                        📅 {formatDate(shift.date)}
                      </Text>
                      <Text style={styles.shiftTime}>
                        🕒 {shift.startTime} - {shift.endTime}
                      </Text>
                      {shift.notes && (
                        <Text style={styles.shiftDescription}>
                          📝 {shift.notes}
                        </Text>
                      )}
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.noShiftsContainer}>
                  <Text style={styles.noShiftsText}>送信する募集シフトがありません</Text>
                </View>
              )}
            </View>

            {/* コメント入力 */}
            <View style={styles.commentSection}>
              <Text style={styles.sectionTitle}>追加メッセージ (任意):</Text>
              <TextInput
                style={styles.commentInput}
                multiline
                numberOfLines={3}
                placeholder="スタッフへの追加メッセージがあれば入力してください"
                value={comment}
                onChangeText={setComment}
                maxLength={200}
              />
              <Text style={styles.characterCount}>
                {comment.length}/200文字
              </Text>
            </View>
          </ScrollView>

          {/* フッター */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={sending}
            >
              <Text style={styles.cancelButtonText}>キャンセル</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.sendButton,
                (sending || recruitmentShifts.length === 0) && styles.sendButtonDisabled,
              ]}
              onPress={handleSendNotification}
              disabled={sending || recruitmentShifts.length === 0}
            >
              {sending ? (
                <ActivityIndicator size="small" color={colors.text.white} />
              ) : (
                <Text style={styles.sendButtonText}>
                  LINE通知を送信 ({recruitmentShifts.length}件)
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}