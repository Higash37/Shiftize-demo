import React from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TaskMemo } from "../../types";
import { formatTimeAgo } from "@/common/common-utils/timeUtils";
import { styles } from "../../TaskActionModal.styles";

interface TaskMemosProps {
  memos: TaskMemo[];
  memoText: string;
  currentUser: { uid: string; nickname: string } | null;
  onMemoTextChange: (text: string) => void;
  onAddMemo: () => void;
}

export const TaskMemos: React.FC<TaskMemosProps> = ({
  memos,
  memoText,
  currentUser,
  onMemoTextChange,
  onAddMemo,
}) => {
  return (
    <TouchableOpacity
      style={styles.memoSection}
      activeOpacity={1}
      onPress={() => {}} // タップイベントを停止
    >
      <Text style={styles.sectionTitle}>メモ</Text>

      {/* メモ一覧 */}
      <ScrollView style={styles.memoList}>
        {memos.length === 0 ? (
          <View style={styles.emptyMemoContainer}>
            <Ionicons
              name="chatbubble-outline"
              size={24}
              color="#ccc"
            />
            <Text style={styles.emptyMemoText}>メモがありません</Text>
            <Text style={styles.emptyMemoSubText}>
              このタスクに関するメモを追加しましょう
            </Text>
          </View>
        ) : (
          memos.map((memo) => (
            <View key={memo.id} style={styles.memoItem}>
              <View style={styles.memoAvatar}>
                <Text style={styles.memoAvatarText}>
                  {memo.createdByName.charAt(0)}
                </Text>
              </View>
              <View style={styles.memoContent}>
                <View style={styles.memoHeader}>
                  <Text style={styles.memoAuthor}>
                    {memo.createdByName}
                  </Text>
                  <Text style={styles.memoTime}>
                    {formatTimeAgo(memo.createdAt)}
                  </Text>
                </View>
                <Text style={styles.memoText}>{memo.text}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* メモ投稿欄 */}
      <TouchableOpacity
        style={styles.memoInput}
        activeOpacity={1}
        onPress={() => {}} // タップイベントを停止
      >
        <View style={styles.memoInputAvatar}>
          <Text style={styles.memoInputAvatarText}>
            {currentUser?.nickname.charAt(0) || "U"}
          </Text>
        </View>
        <View style={styles.memoInputContent}>
          <TextInput
            style={styles.memoTextInput}
            value={memoText}
            onChangeText={onMemoTextChange}
            placeholder="メモを追加..."
            multiline
            maxLength={200}
          />
          <View style={styles.memoInputFooter}>
            <Text style={styles.memoCharCount}>
              {memoText.length}/200
            </Text>
            <TouchableOpacity
              style={[
                styles.sendButton,
                {
                  backgroundColor: memoText.trim()
                    ? "#007AFF"
                    : "#e0e0e0",
                },
              ]}
              onPress={onAddMemo}
              disabled={!memoText.trim()}
            >
              <Ionicons
                name="send"
                size={16}
                color="#fff"
              />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};