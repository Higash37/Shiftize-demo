import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import SimpleHeader from "./SimpleHeader";
import { DemoModal } from "./DemoModal";
import { HeroSection } from "./components/hero-section";
import { SocialProofSection } from "./components/social-proof-section";
import { FeaturesSection } from "./components/features-section";
import { SecuritySection } from "./components/security-section";
import { InteractiveDemoSection } from "./components/interactive-demo-section";

// 画像パス（静的アセット） - プレースホルダー対応済み

const SimpleLanding = () => {
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  const [demoModalVisible, setDemoModalVisible] = useState(false);

  // デバイス判定
  const isDesktop = screenWidth >= 1024;
  const isTablet = screenWidth >= 768 && screenWidth < 1024;

  // 更新履歴データ
  const updateHistory = [
    {
      id: "1",
      date: "2024-08-01",
      version: "v3.2.0",
      title: "分割レイアウト実装",
      type: "feature",
      description: "タブレット・モバイル向けカレンダー + 1日ガントチャート",
    },
    {
      id: "2",
      date: "2024-07-30",
      version: "v3.1.5",
      title: "UI/UX改善",
      type: "improvement",
      description: "時間範囲切り替え機能追加",
    },
    {
      id: "3",
      date: "2024-07-25",
      version: "v3.1.0",
      title: "モバイル最適化",
      type: "feature",
      description: "レスポンシブデザイン完全対応",
    },
    {
      id: "4",
      date: "2024-07-20",
      version: "v3.0.8",
      title: "バグ修正",
      type: "fix",
      description: "TypeScriptエラー全修正",
    },
    {
      id: "5",
      date: "2024-07-15",
      version: "v3.0.5",
      title: "募集シフト機能",
      type: "feature",
      description: "募集シフト機能実装完了",
    },
    {
      id: "6",
      date: "2024-07-10",
      version: "v3.0.0",
      title: "セキュリティ強化",
      type: "security",
      description: "AES-256暗号化システム実装",
    },
    {
      id: "7",
      date: "2024-07-05",
      version: "v2.9.0",
      title: "GDPR準拠",
      type: "security",
      description: "データ管理・監査システム実装",
    },
    {
      id: "8",
      date: "2024-07-01",
      version: "v2.8.5",
      title: "パフォーマンス改善",
      type: "improvement",
      description: "Firebase最適化完了",
    },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "feature":
        return "🚀";
      case "improvement":
        return "⚡";
      case "fix":
        return "🐛";
      case "security":
        return "🔒";
      default:
        return "📝";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "feature":
        return "#10B981";
      case "improvement":
        return "#3B82F6";
      case "fix":
        return "#EF4444";
      case "security":
        return "#8B5CF6";
      default:
        return "#6B7280";
    }
  };

  // ナビゲーションメニュー
  const navigationMenu = [
    {
      category: "講師向け機能",
      items: [
        {
          icon: "person",
          title: "ログイン・認証",
          route: "/(landing)/staff/login",
          description: "ログイン画面・認証機能",
        },
        {
          icon: "home",
          title: "ホーム画面",
          route: "/(landing)/staff/home",
          description: "ダッシュボード・通知確認",
        },
        {
          icon: "calendar-today",
          title: "シフト管理",
          route: "/(landing)/staff/shift",
          description: "シフト申請・編集・確認",
        },
        {
          icon: "assignment",
          title: "タスク管理",
          route: "/(landing)/staff/tasks",
          description: "シフト内タスク実行報告",
        },
        {
          icon: "account-circle",
          title: "プロフィール",
          route: "/(landing)/staff/profile",
          description: "プロフィール・設定変更",
        },
      ],
    },
    {
      category: "教室長向け機能",
      items: [
        {
          icon: "admin-panel-settings",
          title: "マスター画面",
          route: "/(landing)/master/dashboard",
          description: "経営ダッシュボード・分析",
        },
        {
          icon: "view-kanban",
          title: "ガントチャート",
          route: "/(landing)/master/gantt",
          description: "全体シフト管理・承認",
        },
        {
          icon: "groups",
          title: "スタッフ管理",
          route: "/(landing)/master/staff",
          description: "スタッフ登録・権限管理",
        },
        {
          icon: "attach-money",
          title: "給与管理",
          route: "/(landing)/master/payroll",
          description: "給与計算・予算管理",
        },
        {
          icon: "business",
          title: "店舗設定",
          route: "/(landing)/master/settings",
          description: "店舗情報・システム設定",
        },
      ],
    },
    {
      category: "システム情報",
      items: [
        {
          icon: "security",
          title: "セキュリティ",
          route: "/(landing)/system/security",
          description: "セキュリティ機能詳細",
        },
        {
          icon: "code",
          title: "技術仕様",
          route: "/(landing)/system/tech",
          description: "アーキテクチャ・技術スタック",
        },
        {
          icon: "help",
          title: "ヘルプ・FAQ",
          route: "/(landing)/system/help",
          description: "よくある質問・サポート",
        },
        {
          icon: "update",
          title: "リリースノート",
          route: "/(landing)/system/releases",
          description: "バージョン履歴・更新情報",
        },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <SimpleHeader />
      <View style={styles.mainLayout}>
        {/* 左側サイドバー - ナビゲーション */}
        {(isDesktop || isTablet) && (
          <View style={styles.leftSidebar}>
            <View style={styles.sidebarHeader}>
              <MaterialIcons name="menu" size={20} color="#3b82f6" />
              <Text style={styles.sidebarTitle}>機能一覧</Text>
            </View>

            <ScrollView
              style={styles.sidebarContent}
              showsVerticalScrollIndicator={false}
            >
              {navigationMenu.map((category) => (
                <View key={category.category} style={styles.navCategory}>
                  <Text style={styles.navCategoryTitle}>
                    {category.category}
                  </Text>
                  {category.items.map((item) => (
                    <View
                      key={item.title}
                      style={[styles.navItem, styles.navItemDisabled]}
                    >
                      <View style={styles.navItemIconContainer}>
                        <MaterialIcons
                          name={item.icon as any}
                          size={18}
                          color="#9ca3af"
                        />
                        <View style={styles.navItemSlash} />
                      </View>
                      <View style={styles.navItemContent}>
                        <Text style={styles.navItemTitleDisabled}>
                          {item.title}
                        </Text>
                        <Text style={styles.navItemDescriptionDisabled}>
                          開発中 - {item.description}
                        </Text>
                      </View>
                      <MaterialIcons name="lock" size={16} color="#d1d5db" />
                    </View>
                  ))}
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* メインコンテンツ */}
        <ScrollView
          style={styles.mainContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Section */}
          <HeroSection onDemoClick={() => setDemoModalVisible(true)} />

          {/* 社会的証明 */}
          <SocialProofSection />

          {/* Features Section */}
          <FeaturesSection />

          {/* 
        信頼感演出セクション - お客様の声（今後追加予定）
        <View style={styles.testimonialSection}>
          <View style={styles.sectionContentWrapper}>
            <Text style={styles.sectionTitle}>
              <Text style={styles.gradientText}>導入企業様の声</Text>
            </Text>
            <Text style={styles.sectionSubtitle}>
              実際にShiftizeを導入いただいた塾・学習塾様からの評価
            </Text>
            
            <View style={styles.testimonialGrid}>
              {[
                {
                  name: '田中 様',
                  position: '個別指導塾 代表',
                  content: 'シフト作成時間が90%削減できました。講師の急な変更にも柔軟に対応でき、運営が格段に楽になりました。',
                  rating: 5,
                  companySize: '講師30名',
                },
                {
                  name: '佐藤 様',
                  position: '大手学習塾 教室長',
                  content: '複数教室の管理が一元化でき、本部からの管理も容易になりました。セキュリティ面も安心です。',
                  rating: 5,
                  companySize: '講師100名以上'
                },
                {
                  name: '鈴木 様',
                  position: '進学塾 オーナー',
                  content: 'スマホで簡単にシフト確認・申請ができるので、講師の満足度が大幅に向上しました。',
                  rating: 5,
                  companySize: '講師50名'
                }
              ].map((testimonial, index) => (
                <View key={index} style={styles.testimonialCard}>
                  <View style={styles.testimonialHeader}>
                    <View style={styles.testimonialUser}>
                      <View style={styles.testimonialAvatar}>
                        <Text style={styles.testimonialAvatarText}>
                          {testimonial.name.charAt(0)}
                        </Text>
                      </View>
                      <View>
                        <Text style={styles.testimonialName}>{testimonial.name}</Text>
                        <Text style={styles.testimonialPosition}>{testimonial.position}</Text>
                      </View>
                    </View>
                    <Text style={styles.testimonialCompanySize}>{testimonial.companySize}</Text>
                  </View>
                  
                  <View style={styles.testimonialRating}>
                    {[...Array(5)].map((_, i) => (
                      <MaterialIcons 
                        key={i} 
                        name="star" 
                        size={16} 
                        color={i < testimonial.rating ? '#f59e0b' : '#e5e7eb'} 
                      />
                    ))}
                  </View>
                  
                  <Text style={styles.testimonialContent}>
                    "{testimonial.content}"
                  </Text>
                </View>
              ))}
            </View>
            
            導入企業ロゴ
            <View style={styles.clientLogosContainer}>
              <Text style={styles.clientLogosTitle}>導入実績</Text>
              <View style={styles.clientLogos}>
                {['学習塾A', '個別指導B', '進学塾C', '総合塾D', 'オンライン塾E'].map((client, index) => (
                  <View key={index} style={styles.clientLogo}>
                    <Text style={styles.clientLogoText}>{client}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>
        */}

          {/* セキュリティ認証バッジ */}
          <SecuritySection />

          {/* Interactive Demo Section */}
          <InteractiveDemoSection
            onDemoClick={() => setDemoModalVisible(true)}
          />

          {/* Final CTA - 最大級のインパクト */}
          <View style={styles.finalCTA}>
            <View style={styles.finalCTAContent}>
              <Text style={styles.finalCTAHeadline}>
                もうシフト管理で悩む必要はありません
              </Text>
              <Text style={styles.finalCTASubheadline}>
                100以上の塾・学習塾が選んだ、のシフト管理システム
              </Text>

              <View style={styles.finalCTAFeatures}>
                <View style={styles.finalCTAFeatureItem}>
                  <MaterialIcons
                    name="check-circle"
                    size={20}
                    color="#10b981"
                  />
                  <Text style={styles.finalCTAFeatureText}>
                    30日間無料トライアル
                  </Text>
                </View>
                <View style={styles.finalCTAFeatureItem}>
                  <MaterialIcons
                    name="check-circle"
                    size={20}
                    color="#10b981"
                  />
                  <Text style={styles.finalCTAFeatureText}>
                    クレジットカード不要
                  </Text>
                </View>
                <View style={styles.finalCTAFeatureItem}>
                  <MaterialIcons
                    name="check-circle"
                    size={20}
                    color="#10b981"
                  />
                  <Text style={styles.finalCTAFeatureText}>
                    いつでも解約可能
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.finalCTAButton}
                onPress={() => router.push("/(auth)")}
              >
                <View style={styles.finalCTAButtonContent}>
                  <Text style={styles.finalCTAButtonText}>無料で始める</Text>
                  <Text style={styles.finalCTAButtonSubtext}>3分で完了</Text>
                </View>
                <View style={styles.finalCTAButtonArrow}>
                  <AntDesign name="arrowright" size={24} color="#ffffff" />
                </View>
              </TouchableOpacity>

              <Text style={styles.finalCTATrust}>
                <MaterialIcons name="shield" size={16} color="#6b7280" />{" "}
                SSL暗号化通信・データは安全に保護されます
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* 右側サイドバー - 更新履歴 */}
        {(isDesktop || isTablet) && (
          <View style={styles.rightSidebar}>
            <View style={styles.sidebarHeader}>
              <MaterialIcons name="timeline" size={20} color="#3b82f6" />
              <Text style={styles.sidebarTitle}>更新履歴</Text>
            </View>

            <ScrollView
              style={styles.sidebarContent}
              showsVerticalScrollIndicator={false}
            >
              {updateHistory.map((update, index) => (
                <View key={update.id} style={styles.updateItem}>
                  {/* GitHubスタイルの接続線 */}
                  <View style={styles.timelineContainer}>
                    <View
                      style={[
                        styles.timelineDot,
                        { backgroundColor: getTypeColor(update.type) },
                      ]}
                    />
                    {index < updateHistory.length - 1 && (
                      <View style={styles.timelineLine} />
                    )}
                  </View>

                  {/* 更新内容 */}
                  <View style={styles.updateContent}>
                    <View style={styles.updateHeader}>
                      <Text style={styles.updateVersion}>{update.version}</Text>
                      <Text style={styles.updateDate}>{update.date}</Text>
                    </View>

                    <View style={styles.updateTitleRow}>
                      <Text style={styles.updateIcon}>
                        {getTypeIcon(update.type)}
                      </Text>
                      <Text style={styles.updateTitle}>{update.title}</Text>
                    </View>

                    <Text style={styles.updateDescription}>
                      {update.description}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* デモモーダル */}
      <DemoModal
        visible={demoModalVisible}
        onClose={() => setDemoModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8faff",
  },

  // メインレイアウト
  mainLayout: {
    flex: 1,
    flexDirection: "row",
  },

  // 左側サイドバー
  leftSidebar: {
    width: 280,
    backgroundColor: "#ffffff",
    borderRightWidth: 1,
    borderRightColor: "#e5e7eb",
    paddingVertical: 20,
    paddingHorizontal: 16,
  },

  // 右側サイドバー
  rightSidebar: {
    width: 280,
    backgroundColor: "#ffffff",
    borderLeftWidth: 1,
    borderLeftColor: "#e5e7eb",
    paddingVertical: 20,
    paddingHorizontal: 16,
  },

  sidebarHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },

  sidebarTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
  },

  sidebarContent: {
    flex: 1,
  },

  // ナビゲーションメニュー
  navCategory: {
    marginBottom: 24,
  },

  navCategoryTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#374151",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
    paddingLeft: 4,
  },

  navItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
    backgroundColor: "transparent",
  },

  navItemContent: {
    flex: 1,
    marginLeft: 12,
  },

  navItemTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 2,
  },

  navItemDescription: {
    fontSize: 11,
    color: "#6b7280",
    lineHeight: 14,
  },

  // 開発中ナビゲーションアイテム用スタイル
  navItemDisabled: {
    opacity: 0.6,
    backgroundColor: "#f9fafb",
  },

  navItemIconContainer: {
    position: "relative",
  },

  navItemSlash: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: "#ef4444",
    transform: [{ rotate: "45deg" }],
    borderRadius: 1,
  },

  navItemTitleDisabled: {
    fontSize: 14,
    fontWeight: "600",
    color: "#9ca3af",
    marginBottom: 2,
  },

  navItemDescriptionDisabled: {
    fontSize: 11,
    color: "#9ca3af",
    lineHeight: 14,
    fontStyle: "italic",
  },

  // 更新履歴アイテム
  updateItem: {
    flexDirection: "row",
    marginBottom: 16,
  },

  timelineContainer: {
    alignItems: "center",
    marginRight: 12,
    position: "relative",
  },

  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "#ffffff",
    zIndex: 1,
  },

  timelineLine: {
    position: "absolute",
    top: 10,
    width: 2,
    height: 40,
    backgroundColor: "#e5e7eb",
  },

  updateContent: {
    flex: 1,
    paddingBottom: 8,
  },

  updateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },

  updateVersion: {
    fontSize: 12,
    fontWeight: "600",
    color: "#3b82f6",
    backgroundColor: "#eff6ff",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },

  updateDate: {
    fontSize: 11,
    color: "#6b7280",
  },

  updateTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },

  updateIcon: {
    fontSize: 14,
  },

  updateTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1f2937",
    flex: 1,
  },

  updateDescription: {
    fontSize: 11,
    color: "#6b7280",
    lineHeight: 16,
  },

  // メインコンテンツ
  mainContent: {
    flex: 1,
    backgroundColor: "#ffffff",
  },

  scrollView: {
    flex: 1,
  },

  // Final CTA
  finalCTA: {
    paddingVertical: 120,
    paddingHorizontal: 40,
    backgroundColor: "#1e293b",
    alignItems: "center",
  },

  finalCTAContent: {
    maxWidth: 800,
    alignItems: "center",
  },

  finalCTAHeadline: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 16,
  },

  finalCTASubheadline: {
    fontSize: 20,
    color: "#cbd5e1",
    textAlign: "center",
    marginBottom: 40,
  },

  finalCTAFeatures: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 24,
    justifyContent: "center",
    marginBottom: 40,
  },

  finalCTAFeatureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  finalCTAFeatureText: {
    fontSize: 16,
    color: "#e2e8f0",
  },

  finalCTAButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#10b981",
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 16,
    gap: 16,
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
    marginBottom: 24,
  },

  finalCTAButtonContent: {
    alignItems: "center",
  },

  finalCTAButtonText: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "bold",
  },

  finalCTAButtonSubtext: {
    color: "#d1fae5",
    fontSize: 14,
  },

  finalCTAButtonArrow: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
    padding: 8,
  },

  finalCTATrust: {
    flexDirection: "row",
    alignItems: "center",
    fontSize: 14,
    color: "#94a3b8",
  },

  // Testimonial Section
  testimonialSection: {
    paddingVertical: 100,
    paddingHorizontal: 40,
    backgroundColor: "#ffffff",
  },

  testimonialGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 32,
    justifyContent: "center",
  },

  testimonialCard: {
    backgroundColor: "#f8faff",
    borderRadius: 16,
    padding: 28,
    width: 340,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  testimonialHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },

  testimonialUser: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  testimonialAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#3b82f6",
    alignItems: "center",
    justifyContent: "center",
  },

  testimonialAvatarText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },

  testimonialName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
  },

  testimonialPosition: {
    fontSize: 14,
    color: "#6b7280",
  },

  testimonialCompanySize: {
    fontSize: 12,
    color: "#9ca3af",
    backgroundColor: "#f3f4f6",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },

  testimonialRating: {
    flexDirection: "row",
    gap: 2,
    marginBottom: 12,
  },

  testimonialContent: {
    fontSize: 15,
    color: "#4b5563",
    lineHeight: 24,
    fontStyle: "italic",
  },

  // Client Logos
  clientLogosContainer: {
    marginTop: 80,
    alignItems: "center",
  },

  clientLogosTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 32,
  },

  clientLogos: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 40,
    justifyContent: "center",
  },

  clientLogo: {
    width: 140,
    height: 60,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  clientLogoText: {
    fontSize: 14,
    color: "#9ca3af",
    fontWeight: "600",
  },

  // 共通スタイル（分割されたコンポーネント用）
  sectionTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1f2937",
    textAlign: "center",
    marginBottom: 24,
  },

  gradientText: {
    color: "#3b82f6",
  },

  sectionSubtitle: {
    fontSize: 18,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 80,
    maxWidth: 800,
    alignSelf: "center",
    lineHeight: 32,
  },

  sectionContentWrapper: {
    maxWidth: 1000,
    width: "100%",
    alignSelf: "center",
  },

  // スクリーンショット用のスタイル
  demoScreenshot: {
    width: "100%",
    height: "100%",
    maxHeight: 400,
  },
});

export default SimpleLanding;
