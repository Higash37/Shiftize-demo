import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import { responsive, responsiveStyles } from './utils/responsive';

export default function DevelopmentStoryPage() {
  const router = useRouter();

  // 開発フェーズ（タイムライン）
  const developmentPhases = [
    {
      phase: '1',
      title: '問題発見・要件定義',
      duration: '2週間',
      icon: 'target',
      color: '#3B82F6',
      bgColor: '#EBF8FF',
      description: 'アルバイト先でのシフト管理の課題を発見し、解決策を検討',
      achievements: [
        '複雑なシフト管理の課題分析',
        '既存ツールの限界点の特定',
        'ユーザーニーズの深掘り',
        '技術要件の策定',
      ],
      challenges: '手作業によるシフト管理の非効率性と権限管理の複雑さ',
      status: 'completed',
    },
    {
      phase: '2',
      title: '技術選定・設計',
      duration: '3週間',
      icon: 'lightbulb-outline',
      color: '#10B981',
      bgColor: '#F0FDF4',
      description: '最適な技術スタックの選定とシステム設計',
      achievements: [
        'React Native + Firebase の技術選定',
        'コンポーネント設計・状態管理設計',
        'データベース構造の設計',
        'セキュリティ要件の実装計画',
      ],
      challenges: '複雑な権限管理とリアルタイム同期の実装方針決定',
      status: 'completed',
    },
    {
      phase: '3',
      title: 'コア機能開発',
      duration: '8週間',
      icon: 'code',
      color: '#8B5CF6',
      bgColor: '#FAF5FF',
      description: 'ガントチャート、権限管理、給与計算などの中核機能を実装',
      achievements: [
        'ドラッグ&ドロップガントチャート実装',
        'Firebase Authentication連携',
        '複雑な給与計算ロジック構築',
        'リアルタイム同期機能実装',
      ],
      challenges: 'パフォーマンス最適化とUX向上の両立',
      status: 'completed',
    },
    {
      phase: '4',
      title: 'テスト・最適化',
      duration: '3週間',
      icon: 'science',
      color: '#F59E0B',
      bgColor: '#FFFBEB',
      description: '品質保証とパフォーマンス最適化',
      achievements: [
        '包括的なテストケース作成',
        'パフォーマンス最適化',
        'セキュリティ監査',
        'ユーザビリティテスト',
      ],
      challenges: '多様なデバイス・環境での動作保証',
      status: 'completed',
    },
    {
      phase: '5',
      title: 'デプロイ・運用',
      duration: '2週間',
      icon: 'rocket',
      color: '#6366F1',
      bgColor: '#EEF2FF',
      description: 'アプリのデプロイと実際の運用開始',
      achievements: [
        'PWA対応による配布',
        'CI/CDパイプライン構築',
        '監視・ログ機能実装',
        'ユーザーサポート体制構築',
      ],
      challenges: '実運用での予期しない課題への対応',
      status: 'completed',
    },
  ];

  // 学習スキル成長
  const learningCurve = [
    { skill: 'React Native', before: 20, after: 95, description: 'モバイルアプリ開発' },
    { skill: 'TypeScript', before: 30, after: 90, description: '型安全な開発' },
    { skill: 'Firebase', before: 10, after: 88, description: 'バックエンド構築' },
    { skill: 'UI/UX Design', before: 25, after: 85, description: 'ユーザー体験設計' },
    { skill: 'System Design', before: 15, after: 80, description: 'システム設計' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <AntDesign name="left" size={24} color="#3b82f6" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>開発ストーリー</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Page Title */}
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>開発ストーリー</Text>
          <Text style={styles.pageSubtitle}>
            アルバイト先の課題から始まった、18週間にわたる本格的なアプリ開発の軌跡
          </Text>
        </View>

        {/* Development Timeline */}
        <View style={styles.timelineSection}>
          <Text style={styles.sectionTitle}>開発タイムライン</Text>
          
          {developmentPhases.map((phase, index) => (
            <View key={phase.phase} style={styles.timelineItem}>
              {/* Phase Number & Icon */}
              <View style={styles.phaseHeader}>
                <View style={[styles.phaseNumber, { backgroundColor: phase.color }]}>
                  <Text style={styles.phaseNumberText}>{phase.phase}</Text>
                </View>
                <View style={styles.phaseInfo}>
                  <Text style={styles.phaseTitle}>{phase.title}</Text>
                  <View style={styles.phaseDuration}>
                    <MaterialIcons name="access-time" size={16} color="#6b7280" />
                    <Text style={styles.phaseDurationText}>{phase.duration}</Text>
                  </View>
                </View>
              </View>

              {/* Phase Content */}
              <View style={[styles.phaseContent, { backgroundColor: phase.bgColor }]}>
                <MaterialIcons name={phase.icon as any} size={24} color={phase.color} />
                <Text style={styles.phaseDescription}>{phase.description}</Text>
                
                {/* Achievements */}
                <View style={styles.achievementsSection}>
                  <Text style={styles.achievementsTitle}>主な成果</Text>
                  {phase.achievements.map((achievement) => (
                    <View key={achievement} style={styles.achievementItem}>
                      <View style={[styles.achievementDot, { backgroundColor: phase.color }]} />
                      <Text style={styles.achievementText}>{achievement}</Text>
                    </View>
                  ))}
                </View>

                {/* Challenges */}
                <View style={styles.challengesSection}>
                  <Text style={styles.challengesTitle}>課題</Text>
                  <Text style={styles.challengesText}>{phase.challenges}</Text>
                </View>
              </View>

              {/* Timeline Connector */}
              {index < developmentPhases.length - 1 && (
                <View style={styles.timelineConnector} />
              )}
            </View>
          ))}
        </View>

        {/* Learning Curve Section */}
        <View style={styles.learningSection}>
          <Text style={styles.sectionTitle}>学習・スキル成長曲線</Text>
          <Text style={styles.sectionSubtitle}>
            開発期間中の技術スキル向上を数値化。大学生レベルから実務レベルへの成長
          </Text>
          
          <View style={styles.skillsContainer}>
            {learningCurve.map((skill) => (
              <View key={skill.skill} style={styles.skillItem}>
                <View style={styles.skillHeader}>
                  <Text style={styles.skillName}>{skill.skill}</Text>
                  <Text style={styles.skillGrowth}>
                    {skill.before}% → {skill.after}%
                  </Text>
                </View>
                <Text style={styles.skillDescription}>{skill.description}</Text>
                
                {/* Progress Bars */}
                <View style={styles.progressBars}>
                  <View style={styles.progressBarRow}>
                    <Text style={styles.progressLabel}>開始時</Text>
                    <View style={styles.progressBarBg}>
                      <View style={[styles.progressBar, { width: `${skill.before}%`, backgroundColor: '#9CA3AF' }]} />
                    </View>
                  </View>
                  <View style={styles.progressBarRow}>
                    <Text style={styles.progressLabel}>現在</Text>
                    <View style={styles.progressBarBg}>
                      <View style={[styles.progressBar, { width: `${skill.after}%`, backgroundColor: '#3B82F6' }]} />
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Key Insights */}
        <View style={styles.insightsSection}>
          <Text style={styles.sectionTitle}>重要な学び</Text>
          
          <View style={styles.insightsGrid}>
            {[
              {
                icon: 'book',
                title: '継続的学習',
                description: '新技術への積極的なキャッチアップと実践的な適用',
              },
              {
                icon: 'target',
                title: '問題解決力',
                description: '実際の課題から始まり、技術で解決する思考プロセス',
              },
              {
                icon: 'trending-up',
                title: '成長マインド',
                description: '失敗を恐れず、改善を重ねる継続的な成長姿勢',
              },
            ].map((insight) => (
              <View key={insight.title} style={styles.insightCard}>
                <MaterialIcons name={insight.icon as any} size={32} color="#3B82F6" />
                <Text style={styles.insightTitle}>{insight.title}</Text>
                <Text style={styles.insightDescription}>{insight.description}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8faff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  scrollView: {
    flex: 1,
  },
  
  titleSection: {
    paddingVertical: responsiveStyles.padding(40),
    paddingHorizontal: responsiveStyles.padding(20),
    alignItems: 'center',
    maxWidth: responsiveStyles.maxWidth(),
    alignSelf: 'center',
    width: '100%',
  },
  pageTitle: {
    fontSize: responsiveStyles.fontSize(32),
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  pageSubtitle: {
    fontSize: responsiveStyles.fontSize(18),
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 26,
    maxWidth: responsive({
      mobile: '100%',
      tablet: '600px',
      desktop: '800px',
      default: '100%',
    }) as any,
  },

  timelineSection: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  
  timelineItem: {
    marginBottom: 24,
  },
  phaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  phaseNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  phaseNumberText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  phaseInfo: {
    flex: 1,
  },
  phaseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  phaseDuration: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phaseDurationText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 4,
  },
  
  phaseContent: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  phaseDescription: {
    fontSize: 16,
    color: '#374151',
    marginTop: 12,
    marginBottom: 16,
    lineHeight: 22,
  },
  
  achievementsSection: {
    marginBottom: 16,
  },
  achievementsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  achievementDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 10,
  },
  achievementText: {
    fontSize: 13,
    color: '#374151',
    flex: 1,
  },
  
  challengesSection: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    paddingTop: 16,
  },
  challengesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  challengesText: {
    fontSize: 13,
    color: '#6b7280',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  
  timelineConnector: {
    width: 2,
    height: 20,
    backgroundColor: '#d1d5db',
    marginLeft: 19,
    marginVertical: 8,
  },

  learningSection: {
    backgroundColor: '#ffffff',
    paddingVertical: 40,
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  skillsContainer: {
    gap: 20,
  },
  skillItem: {
    backgroundColor: '#f8faff',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  skillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  skillName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  skillGrowth: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  skillDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  
  progressBars: {
    gap: 8,
  },
  progressBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressLabel: {
    fontSize: 12,
    color: '#6b7280',
    width: 40,
  },
  progressBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },

  insightsSection: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  insightsGrid: {
    gap: 16,
  },
  insightCard: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  insightDescription: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 18,
  },
});