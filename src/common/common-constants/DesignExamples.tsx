import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { designSystem } from "@/common/common-constants/DesignSystem";
import { colors } from "@/common/common-constants/ColorConstants";
import { layout } from "@/common/common-constants/LayoutConstants";

import { MaterialIcons } from "@expo/vector-icons";

/**
 * デザインシステムの使用例
 * ウェルカムページのような美しいデザインを全体に適用するためのサンプル
 */

// カードコンポーネントの例
export const ExampleCard: React.FC<{
  title: string;
  subtitle?: string;
  onPress?: () => void;
  variant?: "default" | "elevated" | "welcome";
}> = ({ title, subtitle, onPress, variant = "default" }) => {
  const cardStyle = (() => {
    switch (variant) {
      case "elevated":
        return designSystem.card.elevatedCard;
      case "welcome":
        return designSystem.card.welcomeCard;
      default:
        return designSystem.card.card;
    }
  })();

  const CardContent = (
    <View style={[cardStyle, styles.cardContent]}>
      <Text style={designSystem.text.welcomeText}>{title}</Text>
      {subtitle && (
        <Text style={designSystem.text.description}>{subtitle}</Text>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} style={styles.touchableCard}>
        {CardContent}
      </TouchableOpacity>
    );
  }

  return CardContent;
};

// ボタングループの例
export const ExampleButtonGroup: React.FC<{
  onPrimary?: () => void;
  onSecondary?: () => void;
  primaryTitle?: string;
  secondaryTitle?: string;
}> = ({
  onPrimary,
  onSecondary,
  primaryTitle = "メイン",
  secondaryTitle = "サブ",
}) => (
  <View style={styles.buttonGroup}>
    <TouchableOpacity
      style={[designSystem.button.primary, styles.button]}
      onPress={onPrimary}
    >
      <Text style={designSystem.text.buttonText}>{primaryTitle}</Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={[designSystem.button.outline, styles.button]}
      onPress={onSecondary}
    >
      <Text style={designSystem.text.outlineButtonText}>{secondaryTitle}</Text>
    </TouchableOpacity>
  </View>
);

// チップコンポーネントの例
export const ExampleChip: React.FC<{
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: string;
}> = ({ label, selected = false, onPress, icon }) => (
  <TouchableOpacity
    style={[
      designSystem.card.chip,
      selected && styles.chipSelected,
      styles.chip,
    ]}
    onPress={onPress}
  >
    {icon && (
      <MaterialIcons
        name={icon as "string"}
        size={16}
        color={selected ? colors.text.white : colors.text.primary}
        style={styles.chipIcon}
      />
    )}
    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
      {label}
    </Text>
  </TouchableOpacity>
);

// フローティングアクションボタンの例
export const ExampleFAB: React.FC<{
  onPress?: () => void;
  icon?: string;
}> = ({ onPress, icon = "add" }) => (
  <TouchableOpacity
    style={[designSystem.button.floating, styles.fab]}
    onPress={onPress}
  >
    <MaterialIcons name={icon as any} size={24} color={colors.text.white} />
  </TouchableOpacity>
);

// リストアイテムの例
export const ExampleListItem: React.FC<{
  title: string;
  subtitle?: string;
  rightIcon?: string;
  onPress?: () => void;
}> = ({ title, subtitle, rightIcon = "chevron-right", onPress }) => (
  <TouchableOpacity style={designSystem.card.listItemCard} onPress={onPress}>
    <View style={styles.listItemContent}>
      <View style={styles.listItemText}>
        <Text style={styles.listItemTitle}>{title}</Text>
        {subtitle && <Text style={styles.listItemSubtitle}>{subtitle}</Text>}
      </View>
      <MaterialIcons
        name={rightIcon as "string"}
        size={20}
        color={colors.text.secondary}
      />
    </View>
  </TouchableOpacity>
);

// ページヘッダーの例
export const ExamplePageHeader: React.FC<{
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBack?: () => void;
}> = ({ title, subtitle, showBackButton = false, onBack }) => (
  <View style={designSystem.layout.headerPrimary}>
    <View style={styles.headerContent}>
      {showBackButton && (
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={colors.text.white}
          />
        </TouchableOpacity>
      )}
      <View style={styles.headerTextContainer}>
        <Text style={designSystem.text.headerTitle}>{title}</Text>
        {subtitle && <Text style={designSystem.text.subtitle}>{subtitle}</Text>}
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  cardContent: {
    alignItems: "center",
  },
  touchableCard: {
    // TouchableOpacityのラッパー用
  },
  buttonGroup: {
    ...designSystem.responsive.mobileButtonContainer,
  },
  button: {
    // ボタン共通スタイル
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
  },
  chipSelected: {
    backgroundColor: colors.primary,
  },
  chipIcon: {
    marginRight: 4,
  },
  chipText: {
    fontSize: 14,
    color: colors.text.primary,
  },
  chipTextSelected: {
    color: colors.text.white,
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
  },
  listItemContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  listItemText: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 2,
  },
  listItemSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 16,
    padding: 8,
    borderRadius: layout.components.button,
  },
  headerTextContainer: {
    flex: 1,
    alignItems: "center",
  },
});

// デザインシステムの使用例をまとめたオブジェクト
export const DesignExamples = {
  Card: ExampleCard,
  ButtonGroup: ExampleButtonGroup,
  Chip: ExampleChip,
  FAB: ExampleFAB,
  ListItem: ExampleListItem,
  PageHeader: ExamplePageHeader,
};
