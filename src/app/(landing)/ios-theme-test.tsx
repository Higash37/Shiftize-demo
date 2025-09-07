/**
 * iOS風テーマテストページ
 * 
 * 新しいiOS風コンポーネントの見た目を確認するためのテストページ
 * 段階的移行の参考として使用
 */

import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import { IOSButton, IOSCard, IOSListItem } from '@/common/common-ui/ios-components';
import { iosTheme } from '@/common/common-constants/IOSTheme';

export default function IOSThemeTestPage() {
  const [loading, setLoading] = useState(false);

  const handleButtonPress = (buttonName: string) => {
    Alert.alert('テスト', `${buttonName}が押されました`);
  };

  const handleLoadingTest = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>iOS風テーマテスト</Text>
        <Text style={styles.headerSubtitle}>
          新しいiOS風コンポーネントの見た目確認
        </Text>
      </View>

      {/* Buttons Section */}
      <IOSCard>
        <Text style={styles.sectionTitle}>ボタンバリエーション</Text>
        
        <IOSButton
          title="プライマリボタン"
          onPress={() => handleButtonPress('プライマリ')}
          variant="primary"
          style={styles.buttonSpacing}
        />
        
        <IOSButton
          title="セカンダリボタン"
          onPress={() => handleButtonPress('セカンダリ')}
          variant="secondary"
          style={styles.buttonSpacing}
        />
        
        <IOSButton
          title="テキストボタン"
          onPress={() => handleButtonPress('テキスト')}
          variant="tertiary"
          style={styles.buttonSpacing}
        />
        
        <IOSButton
          title="削除ボタン"
          onPress={() => handleButtonPress('削除')}
          variant="destructive"
          style={styles.buttonSpacing}
        />
        
        <IOSButton
          title="無効化ボタン"
          onPress={() => handleButtonPress('無効')}
          disabled
          style={styles.buttonSpacing}
        />
        
        <IOSButton
          title="ローディングテスト"
          onPress={handleLoadingTest}
          loading={loading}
          style={styles.buttonSpacing}
        />
      </IOSCard>

      {/* Button Sizes */}
      <IOSCard>
        <Text style={styles.sectionTitle}>ボタンサイズ</Text>
        
        <IOSButton
          title="小サイズ"
          onPress={() => handleButtonPress('小')}
          size="small"
          style={styles.buttonSpacing}
        />
        
        <IOSButton
          title="中サイズ（標準）"
          onPress={() => handleButtonPress('中')}
          size="medium"
          style={styles.buttonSpacing}
        />
        
        <IOSButton
          title="大サイズ"
          onPress={() => handleButtonPress('大')}
          size="large"
          style={styles.buttonSpacing}
        />
        
        <IOSButton
          title="フルワイドボタン"
          onPress={() => handleButtonPress('フルワイド')}
          fullWidth
          style={styles.buttonSpacing}
        />
      </IOSCard>

      {/* List Items */}
      <IOSCard variant="grouped">
        <Text style={styles.sectionTitle}>リストアイテム</Text>
        
        <IOSListItem
          title="基本リストアイテム"
          onPress={() => Alert.alert('タップ', '基本リストアイテム')}
        />
        
        <IOSListItem
          title="サブタイトル付き"
          subtitle="詳細情報がここに表示されます"
          onPress={() => Alert.alert('タップ', 'サブタイトル付きアイテム')}
        />
        
        <IOSListItem
          title="アイコン付き"
          subtitle="左側にアイコンが表示されます"
          leftIcon="person-circle"
          onPress={() => Alert.alert('タップ', 'アイコン付きアイテム')}
        />
        
        <IOSListItem
          title="チェックマーク"
          rightAccessory="checkmark"
          onPress={() => Alert.alert('タップ', 'チェックマークアイテム')}
        />
        
        <IOSListItem
          title="情報ボタン"
          rightAccessory="info"
          onPress={() => Alert.alert('タップ', '情報ボタンアイテム')}
        />
        
        <IOSListItem
          title="セパレーターなし"
          showSeparator={false}
          onPress={() => Alert.alert('タップ', 'セパレーターなしアイテム')}
        />
      </IOSCard>

      {/* Color Palette */}
      <IOSCard>
        <Text style={styles.sectionTitle}>iOSシステムカラー</Text>
        <View style={styles.colorGrid}>
          {Object.entries(iosTheme.colors).map(([key, value]) => {
            if (key === 'shift') return null; // skip object
            
            return (
              <View key={key} style={styles.colorItem}>
                <View style={[styles.colorSwatch, { backgroundColor: value }]} />
                <Text style={styles.colorLabel}>{key}</Text>
                <Text style={styles.colorValue}>{value}</Text>
              </View>
            );
          })}
        </View>
      </IOSCard>

      {/* Typography */}
      <IOSCard>
        <Text style={styles.sectionTitle}>iOSタイポグラフィ</Text>
        
        <Text style={[styles.typographyItem, {
          fontSize: iosTheme.typography.largeTitle.fontSize,
          fontWeight: iosTheme.typography.largeTitle.fontWeight,
        }]}>
          Large Title (34pt)
        </Text>
        
        <Text style={[styles.typographyItem, {
          fontSize: iosTheme.typography.title1.fontSize,
          fontWeight: iosTheme.typography.title1.fontWeight,
        }]}>
          Title 1 (28pt)
        </Text>
        
        <Text style={[styles.typographyItem, {
          fontSize: iosTheme.typography.title2.fontSize,
          fontWeight: iosTheme.typography.title2.fontWeight,
        }]}>
          Title 2 (22pt)
        </Text>
        
        <Text style={[styles.typographyItem, {
          fontSize: iosTheme.typography.headline.fontSize,
          fontWeight: iosTheme.typography.headline.fontWeight,
        }]}>
          Headline (17pt Bold)
        </Text>
        
        <Text style={[styles.typographyItem, {
          fontSize: iosTheme.typography.body.fontSize,
          fontWeight: iosTheme.typography.body.fontWeight,
        }]}>
          Body (17pt Regular)
        </Text>
        
        <Text style={[styles.typographyItem, {
          fontSize: iosTheme.typography.footnote.fontSize,
          fontWeight: iosTheme.typography.footnote.fontWeight,
        }]}>
          Footnote (13pt)
        </Text>
      </IOSCard>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: iosTheme.colors.systemGroupedBackground,
  },
  
  header: {
    paddingTop: 60,
    paddingHorizontal: iosTheme.spacing.md,
    paddingBottom: iosTheme.spacing.lg,
    backgroundColor: iosTheme.colors.systemBackground,
  },
  
  headerTitle: {
    fontSize: iosTheme.typography.largeTitle.fontSize,
    fontWeight: iosTheme.typography.largeTitle.fontWeight,
    color: iosTheme.colors.label,
    marginBottom: iosTheme.spacing.xs,
  },
  
  headerSubtitle: {
    fontSize: iosTheme.typography.subhead.fontSize,
    color: iosTheme.colors.secondaryLabel,
  },
  
  sectionTitle: {
    fontSize: iosTheme.typography.headline.fontSize,
    fontWeight: iosTheme.typography.headline.fontWeight,
    color: iosTheme.colors.label,
    marginBottom: iosTheme.spacing.md,
  },
  
  buttonSpacing: {
    marginBottom: iosTheme.spacing.sm,
  },
  
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  
  colorItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: iosTheme.spacing.md,
  },
  
  colorSwatch: {
    width: 60,
    height: 60,
    borderRadius: iosTheme.borderRadius.sm,
    borderWidth: 1,
    borderColor: iosTheme.colors.separator,
    marginBottom: iosTheme.spacing.xs,
  },
  
  colorLabel: {
    fontSize: iosTheme.typography.caption1.fontSize,
    fontWeight: iosTheme.typography.caption1.fontWeight,
    color: iosTheme.colors.label,
    textAlign: 'center',
  },
  
  colorValue: {
    fontSize: iosTheme.typography.caption2.fontSize,
    color: iosTheme.colors.secondaryLabel,
    textAlign: 'center',
  },
  
  typographyItem: {
    color: iosTheme.colors.label,
    marginBottom: iosTheme.spacing.sm,
  },
  
  bottomSpacing: {
    height: iosTheme.spacing.xl,
  },
});