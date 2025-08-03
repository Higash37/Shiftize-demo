import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  Dimensions,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import SimpleHeader from "./SimpleHeader";
import { DemoModal } from "./DemoModal";

// 画像インポート（プロジェクトルートからの相対パス）
const desktopGanttFull = require("../../../../assets/images/landing/screenshots/desktop-gantt-full.png");
const mobileHomeCards = require("../../../../assets/images/landing/screenshots/mobile-home-cards.png");
const mobileCalendarMonth = require("../../../../assets/images/landing/screenshots/mobile-calendar-month.png");

const SimpleLanding = () => {
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  const [demoModalVisible, setDemoModalVisible] = useState(false);

  // デバイス判定
  const isDesktop = screenWidth >= 1024;
  const isTablet = screenWidth >= 768 && screenWidth < 1024;
  const isMobile = screenWidth < 768;

  // 動的スタイル
  const dynamicStyles = {
    heroPhoneFrame: {
      width: isTablet ? 200 : 260,
      height: isTablet ? 344 : 447,
      borderRadius: isTablet ? 16 : 22,
    },
    featureBox: {
      width: isMobile ? "100%" : isTablet ? "46%" : "43%",
      minWidth: isMobile ? 280 : 300,
    },
    heroMainTitle: {
      fontSize: isMobile ? 25 : isTablet ? 32 : 38,
      textAlign: (isDesktop || isTablet ? "left" : "center") as
        | "left"
        | "center",
    },
    heroSubtitle: {
      textAlign: (isDesktop || isTablet ? "left" : "center") as
        | "left"
        | "center",
    },
  };

  // 技術スタック
  const techStack = [
    { name: "React Native", color: "#61DAFB" },
    { name: "TypeScript", color: "#3178C6" },
    { name: "Firebase", color: "#FF6F00" },
    { name: "Expo", color: "#000020" },
  ];

  // 授業・シフト両対応機能
  const enterpriseFeatures = [
    {
      icon: "calendar",
      title: "シフト管理機能",
      description: "直感的なガントチャート表示でシフトを効率的に管理",
      details: [
        "ガントチャート表示",
        "モーダルで簡単編集",
        "月次・週次ビュー",
        "シフト重複チェック",
      ],
      color: "#3B82F6",
      bgColor: "#EBF8FF",
    },
    {
      icon: "people",
      title: "権限管理システム",
      description: "Master/User権限による適切なアクセス制御",
      details: [
        "マスター/ユーザー権限分離",
        "承認フロー機能",
        "セキュアな認証",
        "監査ログ",
      ],
      color: "#10B981",
      bgColor: "#F0FDF4",
    },
    {
      icon: "attach-money",
      title: "給与計算機能",
      description: "複雑な給与体系にも対応した自動計算システム",
      details: [
        "自動計算システム",
        "税込み/税抜き切り替え",
        "CSV出力機能",
        "月次集計レポート",
      ],
      color: "#8B5CF6",
      bgColor: "#FAF5FF",
    },
    {
      icon: "flash-on",
      title: "リアルタイム同期",
      description: "Firebase連携による即座のデータ反映",
      details: [
        "Firebase連携",
        "即時データ反映",
        "オフライン対応",
        "リアルタイム通知",
      ],
      color: "#F59E0B",
      bgColor: "#FFFBEB",
    },
  ];

  const stats = [
    { number: "100+", label: "コンポーネント数", icon: "description" },
    { number: "500+h", label: "開発時間", icon: "access-time" },
    { number: "3種類", label: "対応デバイス", icon: "devices" },
    { number: "5層", label: "セキュリティ機能", icon: "security" },
  ];

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

  // Interactive Demo Viewer Component
  const InteractiveDemoViewer = () => {
    const [selectedView, setSelectedView] = useState("desktop");

    const viewTypes = [
      {
        id: "desktop",
        name: "デスクトップ版",
        icon: "desktop-mac",
        description: "横スクロール対応の本格ガントチャート",
        features: [
          "横スクロール",
          "クリックで編集",
          "時間軸表示",
          "複数シフト同時表示",
        ],
      },
      {
        id: "mobile",
        name: "モバイル版",
        icon: "phone-iphone",
        description: "縦スクロール最適化でスマホでも快適",
        features: [
          "縦スクロール",
          "カード表示",
          "ワンタップ編集",
          "日付ナビゲーション",
        ],
      },
      {
        id: "calendar",
        name: "カレンダー版",
        icon: "calendar-today",
        description: "見慣れたカレンダー形式での直感操作",
        features: ["月間表示", "イベント表示", "シンプル操作", "予定確認"],
      },
    ];

    const getMockupContent = (viewId: string) => {
      switch (viewId) {
        case "desktop":
          return (
            <View style={styles.demoMockupDesktop}>
              <Image
                source={desktopGanttFull}
                style={styles.demoScreenshot}
                resizeMode="contain"
              />
            </View>
          );
        case "tablet":
          return (
            <View style={styles.demoMockupTablet}>
              <View style={styles.demoTabletHeader}>
                <Text style={styles.demoHeaderText}>週間ビュー</Text>
              </View>
              <View style={styles.demoTabletGrid}>
                {["月", "火", "水", "木", "金"].map((day) => (
                  <View key={day} style={styles.demoTabletColumn}>
                    <Text style={styles.demoDayText}>{day}</Text>
                    <View style={styles.demoTabletShift} />
                    <View
                      style={[
                        styles.demoTabletShift,
                        { backgroundColor: "#8B5CF6" },
                      ]}
                    />
                  </View>
                ))}
              </View>
            </View>
          );
        case "mobile":
          return (
            <View style={styles.demoMockupMobile}>
              <Image
                source={mobileHomeCards}
                style={styles.demoScreenshot}
                resizeMode="contain"
              />
            </View>
          );
        case "calendar":
          return (
            <View style={styles.demoMockupCalendar}>
              <Image
                source={mobileCalendarMonth}
                style={styles.demoScreenshot}
                resizeMode="contain"
              />
            </View>
          );
        case "google":
          return (
            <View style={styles.demoMockupGoogle}>
              <View style={styles.demoGoogleHeader}>
                <Text style={styles.demoHeaderText}>週間表示</Text>
              </View>
              <View style={styles.demoGoogleBody}>
                <View style={styles.demoGoogleTimeAxis}>
                  {["9:00", "10:00", "11:00", "12:00"].map((time) => (
                    <Text key={time} style={styles.demoGoogleTime}>
                      {time}
                    </Text>
                  ))}
                </View>
                <View style={styles.demoGoogleEvents}>
                  <View style={[styles.demoGoogleEvent, { top: 0 }]} />
                  <View
                    style={[
                      styles.demoGoogleEvent,
                      { top: 40, backgroundColor: "#F59E0B" },
                    ]}
                  />
                </View>
              </View>
            </View>
          );
        default:
          return null;
      }
    };

    return (
      <View style={styles.demoContainer}>
        {/* View Type Selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.demoSelector}
          contentContainerStyle={styles.demoSelectorContent}
        >
          {viewTypes.map((view) => (
            <TouchableOpacity
              key={view.id}
              style={[
                styles.demoViewButton,
                selectedView === view.id && styles.demoViewButtonActive,
              ]}
              onPress={() => setSelectedView(view.id)}
            >
              <MaterialIcons
                name={view.icon as any}
                size={24}
                color={selectedView === view.id ? "#ffffff" : "#3b82f6"}
              />
              <Text
                style={[
                  styles.demoViewButtonText,
                  selectedView === view.id && styles.demoViewButtonTextActive,
                ]}
              >
                {view.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Selected View Details */}
        <View style={styles.demoViewDetails}>
          {(() => {
            const currentView = viewTypes.find((v) => v.id === selectedView);
            return currentView ? (
              <>
                <Text style={styles.demoViewTitle}>{currentView.name}</Text>
                <Text style={styles.demoViewDescription}>
                  {currentView.description}
                </Text>

                <View style={styles.demoFeatureList}>
                  {currentView.features.map((feature, index) => (
                    <View key={index} style={styles.demoFeatureItem}>
                      <View style={styles.demoFeatureDot} />
                      <Text style={styles.demoFeatureText}>{feature}</Text>
                    </View>
                  ))}
                </View>
              </>
            ) : null;
          })()}
        </View>

        {/* Mock-up Display */}
        <View style={styles.demoMockupContainer}>
          {getMockupContent(selectedView)}
        </View>

        {/* Experience Button */}
        <TouchableOpacity
          style={styles.demoExperienceButton}
          onPress={() => setDemoModalVisible(true)}
        >
          <MaterialIcons name="play-arrow" size={20} color="#ffffff" />
          <Text style={styles.demoExperienceButtonText}>
            実際に体験してみる
          </Text>
        </TouchableOpacity>
      </View>
    );
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
              {navigationMenu.map((category, categoryIndex) => (
                <View key={categoryIndex} style={styles.navCategory}>
                  <Text style={styles.navCategoryTitle}>
                    {category.category}
                  </Text>
                  {category.items.map((item, itemIndex) => (
                    <View
                      key={itemIndex}
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
          <View
            style={[
              styles.heroSection,
              isDesktop
                ? styles.heroDesktop
                : isTablet
                ? styles.heroTablet
                : styles.heroMobile,
            ]}
          >
            {/* 左側：テキストコンテンツ */}
            <View
              style={[
                styles.heroLeft,
                isDesktop
                  ? styles.heroLeftDesktop
                  : isTablet
                  ? styles.heroLeftTablet
                  : styles.heroLeftMobile,
              ]}
            >
              <Text style={styles.heroBadge}>
                ✨ 授業時間とシフト時間両方組める
              </Text>

              <Text style={[styles.heroMainTitle, dynamicStyles.heroMainTitle]}>
                シフト作成、{"\n"}
                <Text style={styles.heroAccentText}>もう悩まない。</Text>
              </Text>

              <Text style={[styles.heroSubtitle, dynamicStyles.heroSubtitle]}>
                3分で完了するシフト管理。{"\n"}
                塾・学習塾に特化した本格SaaSソリューション。
              </Text>

              {/* 価値提案 */}
              <View style={styles.valueProposition}>
                <View style={styles.valueItem}>
                  <MaterialIcons name="schedule" size={20} color="#10B981" />
                  <Text style={styles.valueText}>作業時間 90%短縮</Text>
                </View>
                <View style={styles.valueItem}>
                  <MaterialIcons name="people" size={20} color="#3B82F6" />
                  <Text style={styles.valueText}>複数デバイス対応</Text>
                </View>
                <View style={styles.valueItem}>
                  <MaterialIcons name="schedule" size={20} color="#8B5CF6" />
                  <Text style={styles.valueText}>授業・シフト両対応</Text>
                </View>
              </View>

              {/* CTA */}
              <View
                style={[
                  styles.heroCTAContainer,
                  isDesktop
                    ? styles.heroCTADesktop
                    : isTablet
                    ? styles.heroCTATablet
                    : styles.heroCTAMobile,
                ]}
              >
                <TouchableOpacity
                  style={styles.heroPrimaryButton}
                  onPress={() => router.push("/(auth)")}
                >
                  <Text style={styles.heroPrimaryButtonText}>
                    今すぐ無料で始める
                  </Text>
                  <AntDesign name="arrowright" size={16} color="#ffffff" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.heroSecondaryButton}
                  onPress={() => setDemoModalVisible(true)}
                >
                  <AntDesign name="playcircleo" size={16} color="#3b82f6" />
                  <Text style={styles.heroSecondaryButtonText}>デモを見る</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 右側：ビジュアル（デスクトップ・タブレット） */}
            {(isDesktop || isTablet) && (
              <View style={styles.heroRight}>
                <View style={styles.heroVisualContainer}>
                  {/* メインビジュアル */}
                  <View style={styles.heroDeviceMockup}>
                    <View
                      style={[
                        styles.heroPhoneFrame,
                        dynamicStyles.heroPhoneFrame,
                      ]}
                    >
                      <Image
                        source={mobileHomeCards}
                        style={styles.heroPhoneScreenImage}
                        resizeMode="contain"
                      />
                    </View>
                  </View>

                  {/* 技術スタック */}
                  <View style={styles.heroTechStack}>
                    <Text style={styles.heroTechLabel}>Powered by</Text>
                    <View style={styles.heroTechItems}>
                      {techStack.map((tech, index) => (
                        <View
                          key={index}
                          style={[
                            styles.heroTechItem,
                            { borderColor: tech.color },
                          ]}
                        >
                          <View
                            style={[
                              styles.heroTechDot,
                              { backgroundColor: tech.color },
                            ]}
                          />
                          <Text style={styles.heroTechText}>{tech.name}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* 社会的証明 */}
          <View style={styles.heroSocialProof}>
            <Text style={styles.heroStatsLabel}>導入実績</Text>
            <View style={styles.heroStats}>
              {stats.map((stat, index) => (
                <View key={index} style={styles.heroStatItem}>
                  <Text style={styles.heroStatNumber}>{stat.number}</Text>
                  <Text style={styles.heroStatLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>

            {/* ミニCTA - 社会的証明の後 */}
            <TouchableOpacity
              style={styles.miniCTA}
              onPress={() => router.push("/(auth)")}
            >
              <Text style={styles.miniCTAText}>実績を見て始めてみる</Text>
              <AntDesign name="arrowright" size={14} color="#3b82f6" />
            </TouchableOpacity>
          </View>

          {/* Features Section */}
          <View style={styles.featuresSection}>
            <View style={styles.sectionContentWrapper}>
              <Text style={styles.sectionTitle}>
                <Text style={styles.gradientText}>
                  授業とシフト、両方に対応した機能
                </Text>
              </Text>
              <Text style={styles.sectionSubtitle}>
                学習塾特有の「授業時間」と「シフト時間」の違いを理解した、専用設計のシステムです。
              </Text>

              {/* 左右交互レイアウトの機能紹介 */}
              {enterpriseFeatures.map((feature, index) => (
                <View
                  key={index}
                  style={[
                    styles.featureRow,
                    index % 2 === 1 && styles.featureRowReverse,
                    isMobile && styles.featureRowMobile,
                  ]}
                >
                  {/* コンテンツ側 */}
                  <View style={styles.featureContent}>
                    <View style={styles.featureIconWrapper}>
                      <MaterialIcons
                        name={feature.icon as any}
                        size={40}
                        color={feature.color}
                      />
                    </View>
                    <Text style={styles.featureTitle}>{feature.title}</Text>
                    <Text style={styles.featureDescription}>
                      {feature.description}
                    </Text>

                    <View style={styles.featureDetailsList}>
                      {feature.details.map((detail, detailIndex) => (
                        <View
                          key={detailIndex}
                          style={styles.featureDetailItem}
                        >
                          <View
                            style={[
                              styles.featureDetailDot,
                              { backgroundColor: feature.color },
                            ]}
                          />
                          <Text style={styles.featureDetailText}>{detail}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* ビジュアル側 */}
                  {!isMobile && (
                    <View
                      style={[
                        styles.featureVisual,
                        { backgroundColor: feature.bgColor },
                      ]}
                    >
                      <View style={styles.featureVisualContent}>
                        <MaterialIcons
                          name={feature.icon as any}
                          size={80}
                          color={feature.color}
                        />
                      </View>
                    </View>
                  )}
                </View>
              ))}

              {/* 機能紹介後のCTA - 緊急性を演出 */}
              <View style={styles.urgencyCTAContainer}>
                <View style={styles.urgencyBadge}>
                  <MaterialIcons
                    name="local-fire-department"
                    size={20}
                    color="#ef4444"
                  />
                  <Text style={styles.urgencyBadgeText}>期間限定</Text>
                </View>
                <Text style={styles.urgencyCTATitle}>
                  今なら初月無料でお試しいただけます
                </Text>
                <Text style={styles.urgencyCTASubtitle}>
                  授業・シフト両対応の全機能を30日間無料で体験
                </Text>
                <TouchableOpacity
                  style={styles.urgencyCTAButton}
                  onPress={() => router.push("/(auth)")}
                >
                  <Text style={styles.urgencyCTAButtonText}>無料で始める</Text>
                  <View style={styles.urgencyCTAArrow}>
                    <AntDesign name="arrowright" size={18} color="#ffffff" />
                  </View>
                </TouchableOpacity>
                <Text style={styles.urgencyCTANote}>
                  ※ クレジットカード不要・いつでも解約可能
                </Text>
              </View>
            </View>
          </View>

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
          <View style={styles.securitySection}>
            <View style={styles.securityBadges}>
              <View style={styles.securityBadge}>
                <MaterialIcons name="security" size={32} color="#3b82f6" />
                <Text style={styles.securityBadgeTitle}>SSL暗号化</Text>
                <Text style={styles.securityBadgeText}>通信は全て暗号化</Text>
              </View>
              <View style={styles.securityBadge}>
                <MaterialIcons name="verified-user" size={32} color="#10b981" />
                <Text style={styles.securityBadgeTitle}>GDPR準拠</Text>
                <Text style={styles.securityBadgeText}>個人情報保護対応</Text>
              </View>
              <View style={styles.securityBadge}>
                <MaterialIcons name="lock" size={32} color="#8b5cf6" />
                <Text style={styles.securityBadgeTitle}>ISO27001</Text>
                <Text style={styles.securityBadgeText}>
                  情報セキュリティ認証
                </Text>
              </View>
              <View style={styles.securityBadge}>
                <MaterialIcons name="cloud-done" size={32} color="#ef4444" />
                <Text style={styles.securityBadgeTitle}>99.9% 稼働率</Text>
                <Text style={styles.securityBadgeText}>
                  安定したサービス提供
                </Text>
              </View>
            </View>
          </View>

          {/* Interactive Demo Section */}
          <View style={styles.demoSection}>
            <View style={styles.sectionContentWrapper}>
              <Text style={styles.sectionTitle}>
                <Text style={styles.gradientText}>3つの表示形式を体験</Text>
              </Text>
              <Text style={styles.sectionSubtitle}>
                デバイスに最適化された表示モードで、どんな環境でもシフト管理が快適です。
              </Text>

              <InteractiveDemoViewer />

              {/* デモ後のソフトCTA */}
              <View style={styles.softCTAContainer}>
                <Text style={styles.softCTATitle}>
                  実際のアプリでもっと詳しく
                </Text>
                <View style={styles.softCTAButtons}>
                  <TouchableOpacity
                    style={styles.softCTAPrimary}
                    onPress={() => router.push("/(auth)")}
                  >
                    <MaterialIcons
                      name="rocket-launch"
                      size={20}
                      color="#ffffff"
                    />
                    <Text style={styles.softCTAPrimaryText}>
                      アプリを始める
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.softCTASecondary}
                    onPress={() => setDemoModalVisible(true)}
                  >
                    <MaterialIcons
                      name="play-circle-outline"
                      size={20}
                      color="#3b82f6"
                    />
                    <Text style={styles.softCTASecondaryText}>
                      デモ環境で試す
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

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

  // Hero Section
  heroSection: {
    paddingTop: 20,
    paddingBottom: 80,
    paddingHorizontal: 40,
    backgroundColor: "#ffffff",
  },
  heroDesktop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 40,
    maxWidth: 1200,
    alignSelf: "center",
  },
  heroTablet: {
    flexDirection: "row",
    alignItems: "center",
    gap: 30,
    maxWidth: 900,
    alignSelf: "center",
  },
  heroMobile: {
    flexDirection: "column",
    alignItems: "center",
  },

  // Hero Left
  heroLeft: {
    alignItems: "center",
  },
  heroLeftDesktop: {
    flex: 1,
    alignItems: "flex-start",
  },
  heroLeftTablet: {
    flex: 1,
    alignItems: "flex-start",
  },
  heroLeftMobile: {
    alignItems: "center",
  },

  heroBadge: {
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    color: "#3b82f6",
    fontSize: 14,
    fontWeight: "600",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 40,
    textAlign: "center",
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.2)",
  },

  heroMainTitle: {
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 24,
    lineHeight: 48,
  },

  heroAccentText: {
    color: "#3b82f6",
  },

  heroSubtitle: {
    fontSize: 16,
    color: "#6b7280",
    lineHeight: 28,
    marginBottom: 48,
    maxWidth: 480,
  },

  // 価値提案
  valueProposition: {
    flexDirection: "column",
    gap: 16,
    marginBottom: 48,
    width: "100%",
  },

  valueItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    justifyContent: "center",
  },

  valueText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },

  // CTA Container
  heroCTAContainer: {
    gap: 16,
    width: "100%",
  },
  heroCTADesktop: {
    flexDirection: "row",
  },
  heroCTATablet: {
    flexDirection: "row",
  },
  heroCTAMobile: {
    flexDirection: "column",
  },

  heroPrimaryButton: {
    backgroundColor: "#3b82f6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    gap: 6,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
    flex: 1,
  },

  heroPrimaryButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
  },

  heroSecondaryButton: {
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: "#3b82f6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    gap: 6,
    flex: 1,
  },

  heroSecondaryButtonText: {
    color: "#3b82f6",
    fontSize: 14,
    fontWeight: "600",
  },

  // Hero Right
  heroRight: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  heroVisualContainer: {
    alignItems: "center",
    gap: 24,
  },

  heroDeviceMockup: {
    alignItems: "center",
    justifyContent: "center",
  },

  heroPhoneFrame: {
    backgroundColor: "#1f2937",
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },

  heroPhoneScreen: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 22,
    overflow: "hidden",
    position: "relative",
  },

  heroMockHeader: {
    backgroundColor: "#3b82f6",
    padding: 12,
    alignItems: "center",
  },

  heroMockTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },

  heroMockContent: {
    flex: 1,
    padding: 16,
    gap: 12,
  },

  heroMockCard: {
    backgroundColor: "#f8faff",
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#3b82f6",
  },

  heroMockCardTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 3,
  },

  heroMockCardValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
  },

  heroMockNotification: {
    backgroundColor: "#fef3c7",
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#f59e0b",
  },

  heroMockNotificationText: {
    fontSize: 12,
    color: "#92400e",
    textAlign: "center",
    fontWeight: "500",
  },

  // 技術スタック
  heroTechStack: {
    alignItems: "center",
    gap: 8,
  },

  heroTechLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: "#6b7280",
  },

  heroTechItems: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 6,
  },

  heroTechItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  heroTechDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginRight: 4,
  },

  heroTechText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#374151",
  },

  // 社会的証明
  heroSocialProof: {
    paddingVertical: 80,
    paddingHorizontal: 40,
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.05)",
  },

  heroStatsLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 16,
  },

  heroStats: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 80,
  },

  heroStatItem: {
    alignItems: "center",
    minWidth: 80,
  },

  heroStatNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#3b82f6",
    marginBottom: 4,
  },

  heroStatLabel: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
    fontWeight: "500",
  },

  // Features
  featuresSection: {
    paddingVertical: 100,
    paddingHorizontal: 40,
    backgroundColor: "#f8faff",
  },

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

  // 左右交互レイアウトのスタイル
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 80,
    gap: 60,
  },

  featureRowReverse: {
    flexDirection: "row-reverse",
  },

  featureRowMobile: {
    flexDirection: "column",
    gap: 24,
  },

  featureContent: {
    flex: 1,
  },

  featureIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },

  featureTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 16,
  },

  featureDescription: {
    fontSize: 18,
    color: "#6b7280",
    lineHeight: 28,
    marginBottom: 32,
  },

  featureDetailsList: {
    gap: 16,
  },

  featureVisual: {
    flex: 1,
    height: 400,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },

  featureVisualContent: {
    alignItems: "center",
    justifyContent: "center",
  },

  featureDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  featureDetailDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  featureDetailText: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "500",
    flex: 1,
  },

  // CTA Styles
  miniCTA: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 32,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "#ffffff",
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#3b82f6",
  },

  miniCTAText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3b82f6",
  },

  // Urgency CTA
  urgencyCTAContainer: {
    backgroundColor: "#fff7ed",
    borderRadius: 20,
    padding: 40,
    marginTop: 60,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fed7aa",
  },

  urgencyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fef3c7",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginBottom: 20,
  },

  urgencyBadgeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#dc2626",
  },

  urgencyCTATitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1f2937",
    textAlign: "center",
    marginBottom: 12,
  },

  urgencyCTASubtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 32,
  },

  urgencyCTAButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ef4444",
    paddingVertical: 18,
    paddingHorizontal: 36,
    borderRadius: 12,
    gap: 12,
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },

  urgencyCTAButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },

  urgencyCTAArrow: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
    padding: 4,
  },

  urgencyCTANote: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 16,
  },

  // Soft CTA
  softCTAContainer: {
    marginTop: 60,
    alignItems: "center",
  },

  softCTATitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 24,
  },

  softCTAButtons: {
    flexDirection: "row",
    gap: 16,
  },

  softCTAPrimary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#3b82f6",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },

  softCTAPrimaryText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },

  softCTASecondary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#ffffff",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#3b82f6",
  },

  softCTASecondaryText: {
    color: "#3b82f6",
    fontSize: 16,
    fontWeight: "600",
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

  // Security Section
  securitySection: {
    paddingVertical: 60,
    paddingHorizontal: 40,
    backgroundColor: "#f8faff",
  },

  securityBadges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 32,
    justifyContent: "center",
    maxWidth: 1000,
    alignSelf: "center",
  },

  securityBadge: {
    alignItems: "center",
    width: 200,
  },

  securityBadgeTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
    marginTop: 12,
    marginBottom: 4,
  },

  securityBadgeText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },

  // Demo Section Styles
  demoSection: {
    paddingVertical: 100,
    paddingHorizontal: 40,
    backgroundColor: "#ffffff",
  },

  demoContainer: {
    maxWidth: 1200,
    alignSelf: "center",
    width: "100%",
  },

  demoSelector: {
    marginBottom: 30,
  },

  demoSelectorContent: {
    paddingHorizontal: 10,
    gap: 12,
  },

  demoViewButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 25,
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: "#3b82f6",
    gap: 8,
    minWidth: 120,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  demoViewButtonActive: {
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6",
  },

  demoViewButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3b82f6",
  },

  demoViewButtonTextActive: {
    color: "#ffffff",
  },

  demoViewDetails: {
    backgroundColor: "#ffffff",
    padding: 32,
    borderRadius: 16,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  demoViewTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
  },

  demoViewDescription: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 16,
    lineHeight: 24,
  },

  demoFeatureList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  demoFeatureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minWidth: "45%",
    marginBottom: 8,
  },

  demoFeatureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#3b82f6",
  },

  demoFeatureText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },

  demoMockupContainer: {
    backgroundColor: "#36393f",
    borderRadius: 20,
    padding: 40,
    marginBottom: 40,
    minHeight: 400,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },

  // Desktop Mockup
  demoMockupDesktop: {
    flex: 1,
  },

  demoGanttHeader: {
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 12,
    marginBottom: 16,
  },

  demoHeaderText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
    textAlign: "center",
  },

  demoGanttGrid: {
    gap: 12,
  },

  demoGanttRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  demoDateText: {
    fontSize: 12,
    color: "#6b7280",
    width: 30,
  },

  demoShiftBar: {
    height: 20,
    width: 80,
    backgroundColor: "#3b82f6",
    borderRadius: 4,
  },

  // Tablet Mockup
  demoMockupTablet: {
    flex: 1,
  },

  demoTabletHeader: {
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 12,
    marginBottom: 16,
  },

  demoTabletGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },

  demoTabletColumn: {
    flex: 1,
    alignItems: "center",
    gap: 8,
  },

  demoDayText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1f2937",
  },

  demoTabletShift: {
    width: "100%",
    height: 16,
    backgroundColor: "#3b82f6",
    borderRadius: 3,
    marginBottom: 4,
  },

  // Mobile Mockup
  demoMockupMobile: {
    flex: 1,
  },

  demoMobileHeader: {
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 12,
    marginBottom: 16,
  },

  demoMobileCard: {
    flexDirection: "row",
    backgroundColor: "#f8faff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#3b82f6",
  },

  demoMobileTime: {
    justifyContent: "center",
    marginRight: 12,
  },

  demoTimeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#3b82f6",
  },

  demoMobileInfo: {
    flex: 1,
  },

  demoMobileTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },

  demoMobileStatus: {
    fontSize: 12,
    color: "#10b981",
    fontWeight: "500",
  },

  // Calendar Mockup
  demoMockupCalendar: {
    flex: 1,
  },

  demoCalendarHeader: {
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 12,
    marginBottom: 16,
  },

  demoCalendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 2,
  },

  demoCalendarCell: {
    width: "13%",
    aspectRatio: 1,
    backgroundColor: "#f9fafb",
    borderRadius: 4,
    padding: 4,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  demoCalendarDate: {
    fontSize: 10,
    color: "#374151",
    fontWeight: "500",
  },

  demoCalendarEvent: {
    position: "absolute",
    bottom: 2,
    width: 6,
    height: 6,
    backgroundColor: "#3b82f6",
    borderRadius: 3,
  },

  // Google Calendar Mockup
  demoMockupGoogle: {
    flex: 1,
  },

  demoGoogleHeader: {
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 12,
    marginBottom: 16,
  },

  demoGoogleBody: {
    flexDirection: "row",
    flex: 1,
  },

  demoGoogleTimeAxis: {
    width: 50,
    justifyContent: "space-between",
    paddingRight: 8,
  },

  demoGoogleTime: {
    fontSize: 10,
    color: "#6b7280",
    textAlign: "right",
  },

  demoGoogleEvents: {
    flex: 1,
    position: "relative",
    backgroundColor: "#f9fafb",
    borderRadius: 4,
  },

  demoGoogleEvent: {
    position: "absolute",
    left: 4,
    right: 4,
    height: 32,
    backgroundColor: "#3b82f6",
    borderRadius: 4,
  },

  demoExperienceButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10b981",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    gap: 8,
    alignSelf: "center",
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },

  demoExperienceButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },

  // スクリーンショット用のスタイル
  demoScreenshot: {
    width: "100%",
    height: "100%",
    maxHeight: 400,
  },

  heroPhoneScreenImage: {
    width: "100%",
    height: "100%",
    borderRadius: 18,
  },
});

export default SimpleLanding;
