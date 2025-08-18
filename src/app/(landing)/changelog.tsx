import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";

export default function ChangelogPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("all");

  // カテゴリー
  const categories = [
    { id: "all", label: "全て", color: "#6b7280" },
    { id: "feature", label: "新機能", color: "#10B981" },
    { id: "improvement", label: "改善", color: "#3B82F6" },
    { id: "bugfix", label: "バグ修正", color: "#F59E0B" },
    { id: "security", label: "セキュリティ", color: "#EF4444" },
  ];

  // 更新履歴データ
  const changelog = [
    {
      version: "v1.3.0",
      date: "2025-08-01",
      category: "feature",
      type: "major",
      title: "分割レイアウト実装完了",
      description:
        "タブレット・モバイル向けカレンダー + 1日ガントチャート分割表示を実装",
      changes: [
        "カレンダー画面と1日ガントチャートの分割レイアウト",
        "時間範囲切り替え機能（9:00-22:00 ⇔ 13:00-22:00）",
        "日付ナビゲーション機能（前日・翌日移動）",
        "列詰めロジックによる効率的シフト表示",
        "空白部分タップでのシフト追加最適化",
      ],
      impact: "モバイル・タブレットでの操作性が大幅向上",
      status: "released",
    },
    {
      version: "v1.2.5",
      date: "2025-01-30",
      category: "improvement",
      type: "minor",
      title: "Firebase最適化完了",
      description:
        "アーキテクチャ決定によりFirebase継続、パフォーマンス最適化を実施",
      changes: [
        "Firebase最適化路線の決定",
        "バックエンド移行計画の中止",
        "現行システムの改善・拡張に注力",
        "コスト効率の改善",
      ],
      impact: "開発工数削減とシステム安定性向上",
      status: "released",
    },
    {
      version: "v1.2.0",
      date: "2025-01-27",
      category: "security",
      type: "major",
      title: "セキュリティ強化完了",
      description: "AES-256暗号化とGDPR準拠システムの完全実装",
      changes: [
        "AES-256暗号化による個人情報の完全暗号化",
        "Firebase Security Rules見直し（店舗分離＋ロールベース）",
        "GDPR準拠データ管理システム実装",
        "入力値検証・XSS/CSRF対策実装",
        "7年保存対応の監査ログシステム",
      ],
      impact: "エンタープライズレベルのセキュリティ達成",
      status: "released",
    },
    {
      version: "v1.1.8",
      date: "2024-12-15",
      category: "bugfix",
      type: "patch",
      title: "TypeScriptエラー修正",
      description: "型エラーとReact Native警告の完全解決",
      changes: [
        "TypeScriptエラー全修正",
        "React Native警告の完全解決",
        "コードの型安全性向上",
        "パフォーマンス最適化",
      ],
      impact: "開発効率とアプリ安定性の向上",
      status: "released",
    },
    {
      version: "v1.1.5",
      date: "2024-11-20",
      category: "feature",
      type: "minor",
      title: "募集シフト機能実装",
      description: "講師不足時の募集システムを完全実装",
      changes: [
        "募集シフト作成・管理機能",
        "応募システムの実装",
        "承認フローの追加",
        "通知機能との連携",
      ],
      impact: "急な講師不足への対応力向上",
      status: "released",
    },
    {
      version: "v1.1.0",
      date: "2024-10-30",
      category: "feature",
      type: "major",
      title: "モバイル版ガントチャート統合",
      description: "PC版機能をモバイル版に完全統合",
      changes: [
        "モバイル版ガントチャートの機能拡張",
        "PC版との機能統一",
        "タッチ操作の最適化",
        "レスポンシブデザインの改良",
      ],
      impact: "デバイス間での一貫した操作体験",
      status: "released",
    },
    {
      version: "v1.4.0",
      date: "2025-08-15",
      category: "feature",
      type: "major",
      title: "AI自動シフト作成（予定）",
      description: "過去データを学習したAIによる自動シフト生成機能",
      changes: [
        "AIアルゴリズムによるシフト最適化",
        "過去データ学習機能",
        "制約条件の自動考慮",
        "手動調整との併用",
      ],
      impact: "シフト作成時間の更なる短縮",
      status: "planned",
    },
    {
      version: "v1.3.5",
      date: "2025-08-10",
      category: "improvement",
      type: "minor",
      title: "パフォーマンス最適化（進行中）",
      description: "大量データ処理の高速化とメモリ使用量削減",
      changes: [
        "データベースクエリの最適化",
        "メモリ使用量の削減",
        "レンダリング処理の高速化",
        "キャッシュ機能の強化",
      ],
      impact: "大規模店舗での応答性向上",
      status: "in-progress",
    },
  ];

  // フィルタリング
  const filteredChangelog =
    selectedCategory === "all"
      ? changelog
      : changelog.filter((item) => item.category === selectedCategory);

  // ステータス表示
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "released":
        return { icon: "check-circle", color: "#10B981" };
      case "in-progress":
        return { icon: "hourglass-empty", color: "#F59E0B" };
      case "planned":
        return { icon: "schedule", color: "#6B7280" };
      default:
        return { icon: "help", color: "#6B7280" };
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "released":
        return "リリース済み";
      case "in-progress":
        return "開発中";
      case "planned":
        return "計画中";
      default:
        return "未定";
    }
  };

  const getCategoryInfo = (categoryId: string) => {
    return categories.find((cat) => cat.id === categoryId) || categories[0];
  };

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
        <Text style={styles.headerTitle}>更新履歴</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Page Title */}
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>更新履歴・ロードマップ</Text>
          <Text style={styles.pageSubtitle}>
            継続的な改善と新機能追加の記録。開発進捗を透明性を持って公開
          </Text>
        </View>

        {/* Category Filter */}
        <View style={styles.filterSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.filterButton,
                  selectedCategory === category.id && [
                    styles.filterButtonActive,
                    { borderColor: category.color },
                  ],
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    selectedCategory === category.id && {
                      color: category.color,
                    },
                  ]}
                >
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Changelog Items */}
        <View style={styles.changelogSection}>
          {filteredChangelog.map((item, index) => {
            const categoryInfo = getCategoryInfo(item.category);
            const statusInfo = getStatusIcon(item.status);

            return (
              <View key={item.version} style={styles.changelogItem}>
                {/* Header */}
                <View style={styles.changelogHeader}>
                  <View style={styles.versionInfo}>
                    <Text style={styles.version}>{item.version}</Text>
                    <View
                      style={[
                        styles.categoryBadge,
                        { backgroundColor: categoryInfo?.color || "#6b7280" },
                      ]}
                    >
                      <Text style={styles.categoryBadgeText}>
                        {categoryInfo?.label || "その他"}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.statusInfo}>
                    <MaterialIcons
                      name={statusInfo.icon as any}
                      size={16}
                      color={statusInfo.color}
                    />
                    <Text
                      style={[styles.statusText, { color: statusInfo.color }]}
                    >
                      {getStatusText(item.status)}
                    </Text>
                  </View>
                </View>

                {/* Date */}
                <Text style={styles.date}>{item.date}</Text>

                {/* Title & Description */}
                <Text style={styles.changelogTitle}>{item.title}</Text>
                <Text style={styles.changelogDescription}>
                  {item.description}
                </Text>

                {/* Changes List */}
                <View style={styles.changesList}>
                  <Text style={styles.changesTitle}>変更内容:</Text>
                  {item.changes.map((change) => (
                    <View key={change} style={styles.changeItem}>
                      <View
                        style={[
                          styles.changeDot,
                          { backgroundColor: categoryInfo?.color || "#6b7280" },
                        ]}
                      />
                      <Text style={styles.changeText}>{change}</Text>
                    </View>
                  ))}
                </View>

                {/* Impact */}
                <View style={styles.impactSection}>
                  <MaterialIcons name="trending-up" size={16} color="#10B981" />
                  <Text style={styles.impactText}>{item.impact}</Text>
                </View>

                {/* Timeline Connector */}
                {index < filteredChangelog.length - 1 && (
                  <View style={styles.timelineConnector} />
                )}
              </View>
            );
          })}
        </View>

        {/* Future Plans */}
        <View style={styles.futurePlansSection}>
          <Text style={styles.sectionTitle}>今後の予定</Text>
          <View style={styles.futurePlanCard}>
            <MaterialIcons name="rocket-launch" size={32} color="#3B82F6" />
            <Text style={styles.futurePlanTitle}>継続的な改善</Text>
            <Text style={styles.futurePlanText}>
              ユーザーフィードバックを基に、毎月新機能の追加とパフォーマンス改善を実施。
              次期メジャーアップデートでは多店舗管理機能の本格実装を予定。
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8faff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
  },
  scrollView: {
    flex: 1,
  },

  titleSection: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 16,
    textAlign: "center",
  },
  pageSubtitle: {
    fontSize: 18,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 26,
  },

  filterSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  filterScroll: {
    flexGrow: 0,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#d1d5db",
    marginRight: 12,
    backgroundColor: "#ffffff",
  },
  filterButtonActive: {
    borderWidth: 2,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },

  changelogSection: {
    paddingHorizontal: 20,
  },
  changelogItem: {
    backgroundColor: "#ffffff",
    padding: 24,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  changelogHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  versionInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  version: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
  statusInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  date: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 12,
  },
  changelogTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
  },
  changelogDescription: {
    fontSize: 16,
    color: "#374151",
    lineHeight: 22,
    marginBottom: 16,
  },
  changesList: {
    marginBottom: 16,
  },
  changesTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
  },
  changeItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  changeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 10,
    marginTop: 6,
  },
  changeText: {
    fontSize: 14,
    color: "#374151",
    flex: 1,
    lineHeight: 20,
  },
  impactSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  impactText: {
    fontSize: 14,
    color: "#166534",
    fontWeight: "500",
    flex: 1,
  },
  timelineConnector: {
    position: "absolute",
    left: -10,
    top: "100%",
    width: 2,
    height: 20,
    backgroundColor: "#d1d5db",
  },

  futurePlansSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 20,
    textAlign: "center",
  },
  futurePlanCard: {
    backgroundColor: "#ffffff",
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  futurePlanTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginTop: 12,
    marginBottom: 12,
    textAlign: "center",
  },
  futurePlanText: {
    fontSize: 15,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 22,
  },
});
