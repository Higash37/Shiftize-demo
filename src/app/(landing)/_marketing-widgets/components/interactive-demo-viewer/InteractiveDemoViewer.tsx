import React, { useState, type ComponentProps } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { styles } from './InteractiveDemoViewer.styles';

interface InteractiveDemoViewerProps {
  onDemoClick: () => void;
}

type MaterialIconName = ComponentProps<typeof MaterialIcons>["name"];

type ViewType = {
  id: "desktop" | "mobile" | "calendar" | "tablet" | "google";
  name: string;
  icon: MaterialIconName;
  description: string;
  features: string[];
};

export const InteractiveDemoViewer: React.FC<InteractiveDemoViewerProps> = ({
  onDemoClick,
}) => {
  const [selectedView, setSelectedView] = useState<ViewType["id"]>("desktop");

  const viewTypes: ViewType[] = [
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

  const getMockupContent = (viewId: ViewType["id"]) => {
    switch (viewId) {
      case "desktop":
        return (
          <View style={styles.demoMockupDesktop}>
            <View style={[styles.demoScreenshot, { backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' }]}>
              <MaterialIcons name="desktop-mac" size={60} color="#6b7280" />
              <Text style={{ color: '#6b7280', fontSize: 14, marginTop: 12 }}>デスクトップ版ガントチャート</Text>
            </View>
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
            <View style={[styles.demoScreenshot, { backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' }]}>
              <MaterialIcons name="phone-iphone" size={60} color="#6b7280" />
              <Text style={{ color: '#6b7280', fontSize: 14, marginTop: 12 }}>モバイル版ホーム画面</Text>
            </View>
          </View>
        );
      case "calendar":
        return (
          <View style={styles.demoMockupCalendar}>
            <View style={[styles.demoScreenshot, { backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' }]}>
              <MaterialIcons name="calendar-today" size={60} color="#6b7280" />
              <Text style={{ color: '#6b7280', fontSize: 14, marginTop: 12 }}>カレンダー版表示</Text>
            </View>
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
              name={view.icon}
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
        onPress={onDemoClick}
      >
        <MaterialIcons name="play-arrow" size={20} color="#ffffff" />
        <Text style={styles.demoExperienceButtonText}>
          実際に体験してみる
        </Text>
      </TouchableOpacity>
    </View>
  );
};export default function ComponentPage() { return null; }
