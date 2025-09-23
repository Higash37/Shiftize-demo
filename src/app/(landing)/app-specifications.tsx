import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import SimpleHeader from "./_marketing-widgets/SimpleHeader";
import { responsiveStyles } from "./utils/responsive";

const AppSpecifications = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("architecture");

  // タブデータ
  const tabs = [
    { id: "architecture", label: "システム構成", icon: "architecture" },
    { id: "features", label: "機能仕様", icon: "features" },
    { id: "security", label: "セキュリティ", icon: "security" },
    { id: "technical", label: "技術詳細", icon: "code" },
  ];

  // システム構成情報
  const architectureData = {
    frontend: {
      title: "フロントエンド",
      items: [
        {
          name: "React Native",
          version: "0.74+",
          description: "クロスプラットフォーム開発フレームワーク",
        },
        {
          name: "Expo Router",
          version: "v3",
          description: "ファイルベースルーティングシステム",
        },
        {
          name: "TypeScript",
          version: "5.0+",
          description: "型安全性を提供する静的型付けJavaScript",
        },
        {
          name: "React Native Web",
          version: "latest",
          description: "Web対応のクロスプラットフォーム機能",
        },
      ],
    },
    backend: {
      title: "バックエンド・データベース",
      items: [
        {
          name: "Firebase Firestore",
          version: "v10",
          description: "リアルタイムNoSQLデータベース",
        },
        {
          name: "Firebase Auth",
          version: "v10",
          description: "認証・ユーザー管理システム",
        },
        {
          name: "Firebase Storage",
          version: "v10",
          description: "ファイル・画像ストレージサービス",
        },
        {
          name: "Firebase Functions",
          version: "v4",
          description: "サーバーレス関数実行環境",
        },
      ],
    },
    tools: {
      title: "開発ツール・ライブラリ",
      items: [
        {
          name: "React Native Vector Icons",
          version: "latest",
          description: "アイコンライブラリ",
        },
        {
          name: "React Hook Form",
          version: "v7",
          description: "フォーム管理ライブラリ",
        },
        {
          name: "Crypto-JS",
          version: "v4",
          description: "AES-256暗号化ライブラリ",
        },
        {
          name: "date-fns",
          version: "v2",
          description: "日付操作ユーティリティ",
        },
      ],
    },
  };

  // 機能仕様データ
  const featuresData = [
    {
      category: "シフト管理機能",
      description: "ガントチャートによる視覚的シフト管理",
      specifications: [
        "時間範囲: 9:00-22:00 または 13:00-22:00 (切り替え可能)",
        "最小単位: 15分刻みでの時間設定",
        "重複チェック: 同一ユーザーの重複シフト自動検出",
        "ステータス管理: 基本3段階のシフトステータス (申請中→承認済み→完了)",
        "ドラッグ&ドロップ: 直感的なシフト編集操作",
      ],
    },
    {
      category: "権限管理システム",
      description: "ロールベースアクセス制御 (RBAC)",
      specifications: [
        "Master権限: 全機能アクセス・ユーザー管理・シフト承認",
        "User権限: 自分のシフト管理・タスク報告のみ",
        "セッション管理: 自動ログアウト・セッション有効期限",
        "アクセス制御: 画面・API レベルでの権限チェック",
        "データ分離: 店舗別データの完全分離",
      ],
    },
    {
      category: "給与計算機能",
      description: "塾特化の複雑な給与計算システム",
      specifications: [
        "授業時間除外: シフト時間から授業時間を自動除外",
        "時給設定: ユーザー別時給設定 (デフォルト1,100円)",
        "月間予算: 月間50万円のデフォルト予算設定",
        "計算精度: 分単位での正確な給与計算",
        "レポート出力: CSV・Excel形式でのデータエクスポート",
      ],
    },
    {
      category: "リアルタイム機能",
      description: "Firebase連携による即時データ同期",
      specifications: [
        "リアルタイム更新: Firestoreリスナーによる即時データ反映",
        "オフライン対応: ネットワーク断絶時のローカルキャッシュ",
        "プッシュ通知: シフト変更・承認・却下の即時通知",
        "同期制御: 複数ユーザー同時編集時の競合解決",
        "データ整合性: トランザクション処理による整合性保証",
      ],
    },
  ];

  // セキュリティ仕様データ
  const securityData = [
    {
      category: "データ暗号化",
      level: "最高レベル",
      specifications: [
        "AES-256暗号化: 個人情報の完全暗号化",
        "データベース暗号化: Firestore保存時暗号化",
        "通信暗号化: HTTPS/TLS 1.3による通信保護",
        "キー管理: 暗号化キーの安全な管理システム",
      ],
    },
    {
      category: "GDPR準拠",
      level: "完全対応",
      specifications: [
        "データ削除権: ユーザーデータの完全削除機能",
        "同意管理: データ処理に対する明示的同意取得",
        "監査ログ: 7年間保存対応の包括的監査システム",
        "データポータビリティ: データエクスポート機能",
      ],
    },
    {
      category: "アクセスセキュリティ",
      level: "エンタープライズ級",
      specifications: [
        "Firebase Security Rules: 店舗分離＋ロールベースアクセス制御",
        "入力値検証: XSS・SQLインジェクション対策",
        "CSRF保護: クロスサイトリクエスト偽造対策",
        "セッション管理: 安全なセッション管理・自動無効化",
      ],
    },
  ];

  // 技術詳細データ
  const technicalData = [
    {
      category: "アーキテクチャパターン",
      description: "モジュラー設計による保守性の高いアーキテクチャ",
      details: [
        "レイヤードアーキテクチャ: プレゼンテーション・ビジネスロジック・データアクセス層の分離",
        "モジュール分割: 機能別モジュール設計 (user-view, master-view, common)",
        "コンポーネント設計: 再利用可能なUIコンポーネントライブラリ",
        "カスタムフック: ビジネスロジックの抽象化とテスタビリティ向上",
      ],
    },
    {
      category: "データモデル設計",
      description: "スケーラブルなFirestoreデータモデル",
      details: [
        "コレクション構造: users, shifts, stores, tasks, auditLogs",
        "インデックス最適化: クエリパフォーマンス向上のための複合インデックス",
        "データ正規化: 重複データ最小化と整合性確保",
        "サブコレクション活用: 階層構造による効率的データ管理",
      ],
    },
    {
      category: "パフォーマンス最適化",
      description: "エンタープライズレベルのパフォーマンス",
      details: [
        "レンダリング最適化: React.memo・useMemo・useCallbackによる最適化",
        "バンドルサイズ最適化: Code Splitting・Tree Shakingによるサイズ削減",
        "キャッシュ戦略: Firestore キャッシュ・クライアントサイドキャッシュ",
        "レスポンシブ対応: デバイス別最適化とブレークポイント管理",
      ],
    },
    {
      category: "テスト・品質管理",
      description: "高品質なコード品質管理",
      details: [
        "TypeScript強化: Strict モード・型安全性の徹底",
        "ESLint・Prettier: コード品質・スタイル統一",
        "エラーハンドリング: 包括的なエラー処理・ユーザーフレンドリーなエラー表示",
        "ログ管理: 開発・本番環境対応のログシステム",
      ],
    },
  ];

  const renderArchitecture = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabDescription}>
        Shiftizeは最新のクロスプラットフォーム技術とクラウドサービスを組み合わせた、
        スケーラブルで保守性の高いアーキテクチャを採用しています。
      </Text>

      {Object.entries(architectureData).map(([key, section]) => (
        <View key={key} style={styles.architectureSection}>
          <Text style={styles.architectureSectionTitle}>{section.title}</Text>
          {section.items.map((item) => (
            <View key={item.name} style={styles.architectureItem}>
              <View style={styles.architectureItemHeader}>
                <Text style={styles.architectureItemName}>{item.name}</Text>
                <Text style={styles.architectureItemVersion}>
                  {item.version}
                </Text>
              </View>
              <Text style={styles.architectureItemDescription}>
                {item.description}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );

  const renderFeatures = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabDescription}>
        各機能の詳細な仕様とビジネスロジックをご紹介します。
        塾・学習塾に特化した機能設計により、実際の運用に即した機能を提供しています。
      </Text>

      {featuresData.map((feature) => (
        <View key={feature.category} style={styles.featureSection}>
          <Text style={styles.featureSectionTitle}>{feature.category}</Text>
          <Text style={styles.featureSectionDescription}>
            {feature.description}
          </Text>
          <View style={styles.specificationsList}>
            {feature.specifications.map((spec) => (
              <View key={spec} style={styles.specificationItem}>
                <View style={styles.specificationDot} />
                <Text style={styles.specificationText}>{spec}</Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );

  const renderSecurity = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabDescription}>
        エンタープライズレベルのセキュリティ対策を実装。
        GDPR準拠、AES-256暗号化、包括的な監査システムにより、最高水準のデータ保護を実現しています。
      </Text>

      {securityData.map((security) => (
        <View key={security.category} style={styles.securitySection}>
          <View style={styles.securityHeader}>
            <Text style={styles.securityTitle}>{security.category}</Text>
            <View
              style={[
                styles.securityLevel,
                (() => {
                  if (security.level === "最高レベル") {
                    return { backgroundColor: "#DC2626" };
                  } else if (security.level === "完全対応") {
                    return { backgroundColor: "#10B981" };
                  } else {
                    return { backgroundColor: "#3B82F6" };
                  }
                })(),
              ]}
            >
              <Text style={styles.securityLevelText}>{security.level}</Text>
            </View>
          </View>
          <View style={styles.securitySpecs}>
            {security.specifications.map((spec) => (
              <View key={spec} style={styles.securitySpecItem}>
                <MaterialIcons name="verified" size={16} color="#10B981" />
                <Text style={styles.securitySpecText}>{spec}</Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );

  const renderTechnical = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabDescription}>
        モダンな開発手法とベストプラクティスを採用した技術実装の詳細。
        保守性・拡張性・パフォーマンスを重視した設計思想をご紹介します。
      </Text>

      {technicalData.map((tech) => (
        <View key={tech.category} style={styles.technicalSection}>
          <Text style={styles.technicalTitle}>{tech.category}</Text>
          <Text style={styles.technicalDescription}>{tech.description}</Text>
          <View style={styles.technicalDetails}>
            {tech.details.map((detail) => (
              <View key={detail} style={styles.technicalDetailItem}>
                <View style={styles.technicalDetailDot} />
                <Text style={styles.technicalDetailText}>{detail}</Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <SimpleHeader />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <AntDesign name="left" size={20} color="#6b7280" />
            <Text style={styles.backButtonText}>戻る</Text>
          </TouchableOpacity>

          <Text style={styles.pageTitle}>アプリケーション仕様書</Text>
          <Text style={styles.pageSubtitle}>
            Shiftizeの技術仕様と機能詳細を包括的にご紹介
          </Text>
        </View>

        {/* Tabs */}
        <View style={[styles.tabsContainer, styles.containerMax]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsScrollContent}
          >
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tab, activeTab === tab.id && styles.activeTab]}
                onPress={() => setActiveTab(tab.id)}
              >
                <MaterialIcons
                  name={tab.icon as any}
                  size={20}
                  color={activeTab === tab.id ? "#3b82f6" : "#6b7280"}
                />
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab.id && styles.activeTabText,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Tab Content */}
        <View style={[styles.contentContainer, styles.containerMax]}>
          {activeTab === "architecture" && renderArchitecture()}
          {activeTab === "features" && renderFeatures()}
          {activeTab === "security" && renderSecurity()}
          {activeTab === "technical" && renderTechnical()}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8faff",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingVertical: responsiveStyles.padding(40),
    paddingHorizontal: responsiveStyles.padding(20),
    alignItems: "center",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginBottom: 20,
    gap: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: "#6b7280",
  },
  pageTitle: {
    fontSize: responsiveStyles.fontSize(32),
    fontWeight: "bold",
    color: "#1f2937",
    textAlign: "center",
    marginBottom: 8,
  },
  pageSubtitle: {
    fontSize: responsiveStyles.fontSize(16),
    color: "#6b7280",
    textAlign: "center",
    maxWidth: 600,
  },

  // Tabs
  tabsContainer: {
    paddingHorizontal: responsiveStyles.padding(20),
    marginBottom: 20,
  },
  tabsScrollContent: {
    paddingHorizontal: 0,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
    gap: 8,
  },
  activeTab: {
    backgroundColor: "#EBF8FF",
    borderColor: "#3b82f6",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6b7280",
  },
  activeTabText: {
    color: "#3b82f6",
  },

  // Content
  contentContainer: {
    paddingHorizontal: responsiveStyles.padding(20),
    paddingBottom: 40,
  },
  tabContent: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: responsiveStyles.padding(24),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tabDescription: {
    fontSize: responsiveStyles.fontSize(16),
    color: "#6b7280",
    lineHeight: 24,
    marginBottom: 32,
  },

  // Architecture
  architectureSection: {
    marginBottom: 32,
  },
  architectureSectionTitle: {
    fontSize: responsiveStyles.fontSize(20),
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 16,
  },
  architectureItem: {
    backgroundColor: "#f9fafb",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#3b82f6",
  },
  architectureItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  architectureItemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  architectureItemVersion: {
    fontSize: 12,
    color: "#3b82f6",
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  architectureItemDescription: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 18,
  },

  // Features
  featureSection: {
    marginBottom: 32,
  },
  featureSectionTitle: {
    fontSize: responsiveStyles.fontSize(18),
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
  },
  featureSectionDescription: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 16,
    lineHeight: 20,
  },
  specificationsList: {
    gap: 8,
  },
  specificationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  specificationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10B981",
    marginTop: 6,
    marginRight: 12,
  },
  specificationText: {
    fontSize: 14,
    color: "#374151",
    flex: 1,
    lineHeight: 20,
  },

  // Security
  securitySection: {
    marginBottom: 32,
    backgroundColor: "#f9fafb",
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  securityHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  securityTitle: {
    fontSize: responsiveStyles.fontSize(18),
    fontWeight: "bold",
    color: "#1f2937",
  },
  securityLevel: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  securityLevelText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ffffff",
  },
  securitySpecs: {
    gap: 12,
  },
  securitySpecItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  securitySpecText: {
    fontSize: 14,
    color: "#374151",
    flex: 1,
    lineHeight: 20,
  },

  // Technical
  technicalSection: {
    marginBottom: 32,
  },
  technicalTitle: {
    fontSize: responsiveStyles.fontSize(18),
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
  },
  technicalDescription: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 16,
    lineHeight: 20,
    fontStyle: "italic",
  },
  technicalDetails: {
    gap: 10,
  },
  technicalDetailItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  technicalDetailDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#8b5cf6",
    marginTop: 8,
    marginRight: 12,
  },
  technicalDetailText: {
    fontSize: 14,
    color: "#374151",
    flex: 1,
    lineHeight: 20,
  },

  // Common Container
  containerMax: {
    maxWidth: responsiveStyles.maxWidth(),
    alignSelf: "center",
    width: responsiveStyles.pcWidth() as any,
  },
});

export default AppSpecifications;
