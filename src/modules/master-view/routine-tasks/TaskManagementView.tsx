import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { colors } from '@/common/common-constants/ColorConstants';
import { designSystem } from '@/common/common-constants/DesignSystem';
import Box from '@/common/common-ui/ui-base/BoxComponent';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
}

const TaskManagementView: React.FC = () => {
  const [tasks] = useState<Task[]>([
    {
      id: '1',
      title: 'シフト確認',
      description: '今週のシフトスケジュールを確認する',
      status: 'pending',
      priority: 'high',
      dueDate: '2025-08-17',
    },
    {
      id: '2',
      title: 'スタッフミーティング',
      description: '月次スタッフミーティングの準備',
      status: 'in_progress',
      priority: 'medium',
      dueDate: '2025-08-20',
    },
    {
      id: '3',
      title: 'システムメンテナンス',
      description: 'シフト管理システムの定期メンテナンス',
      status: 'completed',
      priority: 'low',
      dueDate: '2025-08-15',
    },
  ]);

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'pending':
        return colors.warning;
      case 'in_progress':
        return colors.primary;
      case 'completed':
        return colors.success;
      default:
        return colors.text.secondary;
    }
  };

  const getStatusText = (status: Task['status']) => {
    switch (status) {
      case 'pending':
        return '未着手';
      case 'in_progress':
        return '進行中';
      case 'completed':
        return '完了';
      default:
        return '不明';
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return colors.error;
      case 'medium':
        return colors.warning;
      case 'low':
        return colors.success;
      default:
        return colors.text.secondary;
    }
  };

  const getPriorityText = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return '高';
      case 'medium':
        return '中';
      case 'low':
        return '低';
      default:
        return '不明';
    }
  };

  return (
    <View style={styles.container}>
      <Box variant="primary" style={styles.header}>
        <Text style={styles.title}>タスク管理</Text>
        <Text style={styles.subtitle}>業務タスクの管理・追跡</Text>
      </Box>

      <ScrollView style={styles.content}>
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>タスク概要</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>
                {tasks.filter(t => t.status === 'pending').length}
              </Text>
              <Text style={styles.summaryLabel}>未着手</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>
                {tasks.filter(t => t.status === 'in_progress').length}
              </Text>
              <Text style={styles.summaryLabel}>進行中</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>
                {tasks.filter(t => t.status === 'completed').length}
              </Text>
              <Text style={styles.summaryLabel}>完了</Text>
            </View>
          </View>
        </View>

        <View style={styles.taskList}>
          <Text style={styles.taskListTitle}>タスク一覧</Text>
          {tasks.map((task) => (
            <TouchableOpacity key={task.id} style={styles.taskCard}>
              <View style={styles.taskHeader}>
                <Text style={styles.taskTitle}>{task.title}</Text>
                <View style={styles.taskBadges}>
                  <View style={[styles.badge, { backgroundColor: getPriorityColor(task.priority) }]}>
                    <Text style={styles.badgeText}>{getPriorityText(task.priority)}</Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: getStatusColor(task.status) }]}>
                    <Text style={styles.badgeText}>{getStatusText(task.status)}</Text>
                  </View>
                </View>
              </View>
              
              <Text style={styles.taskDescription}>{task.description}</Text>
              
              {task.dueDate && (
                <View style={styles.taskFooter}>
                  <AntDesign name="calendar" size={16} color={colors.text.secondary} />
                  <Text style={styles.dueDate}>期限: {task.dueDate}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.addButton}>
          <AntDesign name="plus" size={24} color="white" />
          <Text style={styles.addButtonText}>新しいタスクを追加</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
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
    flex: 1,
    padding: 20,
  },
  summary: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  taskList: {
    marginBottom: 20,
  },
  taskListTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 16,
  },
  taskCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    flex: 1,
    marginRight: 12,
  },
  taskBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  taskDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  taskFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dueDate: {
    fontSize: 14,
    color: colors.text.secondary,
    marginLeft: 6,
  },
  addButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginTop: 10,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default TaskManagementView;