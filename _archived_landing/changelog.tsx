import React, { useMemo, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { colors } from "@/common/common-constants/ThemeConstants";
import { createChangelogStyles } from "./Changelog.styles";
import { useThemedStyles } from "@/common/common-theme/md3/useThemedStyles";
import {
  categories,
  changelogEntries,
  futurePlan,
  statusMeta,
} from "./Changelog.data";
import type { ChangelogCategoryId } from "./Changelog.types";

export default function ChangelogPage() {
  const router = useRouter();
  const styles = useThemedStyles(createChangelogStyles);
  const [selectedCategory, setSelectedCategory] = useState<ChangelogCategoryId>("all");

  const categoryMap = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    []
  );

  const filteredChangelog = useMemo(
    () =>
      selectedCategory === "all"
        ? changelogEntries
        : changelogEntries.filter((item) => item.category === selectedCategory),
    [selectedCategory]
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <AntDesign name="left" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Changelog</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>Release Timeline & Roadmap</Text>
          <Text style={styles.pageSubtitle}>
            Track product updates, fixes, and upcoming initiatives for Shiftize.
          </Text>
        </View>

        <View style={styles.filterSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
          >
            {categories.map((category) => {
              const isActive = selectedCategory === category.id;

              return (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.filterButton,
                    isActive && [styles.filterButtonActive, { borderColor: category.color }],
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      isActive && { color: category.color },
                    ]}
                  >
                    {category.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.changelogSection}>
          {filteredChangelog.map((item, index) => {
            const categoryInfo = categoryMap.get(item.category) ?? categories.find(cat => cat.id === "all") ?? categories[0];
            const statusInfo = statusMeta[item.status];

            if (!categoryInfo) {
              return null; // Skip rendering if no category info found
            }

            return (
              <View key={item.version} style={styles.changelogItem}>
                <View style={styles.changelogHeader}>
                  <View style={styles.versionInfo}>
                    <Text style={styles.version}>{item.version}</Text>
                    <View
                      style={[styles.categoryBadge, { backgroundColor: categoryInfo.color }]}
                    >
                      <Text style={styles.categoryBadgeText}>{categoryInfo.label}</Text>
                    </View>
                  </View>
                  <View style={styles.statusInfo}>
                    <MaterialIcons
                      name={statusInfo.icon}
                      size={16}
                      color={statusInfo.color}
                    />
                    <Text style={[styles.statusText, { color: statusInfo.color }]}>
                      {statusInfo.label}
                    </Text>
                  </View>
                </View>

                <Text style={styles.date}>{item.date}</Text>

                <Text style={styles.changelogTitle}>{item.title}</Text>
                <Text style={styles.changelogDescription}>{item.description}</Text>

                <View style={styles.changesList}>
                  <Text style={styles.changesTitle}>Changes</Text>
                  {item.changes.map((change) => (
                    <View key={change} style={styles.changeItem}>
                      <View
                        style={[styles.changeDot, { backgroundColor: categoryInfo.color }]}
                      />
                      <Text style={styles.changeText}>{change}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.impactSection}>
                  <MaterialIcons name="trending-up" size={16} color={colors.success} />
                  <Text style={styles.impactText}>{item.impact}</Text>
                </View>

                {index < filteredChangelog.length - 1 && (
                  <View style={styles.timelineConnector} />
                )}
              </View>
            );
          })}
        </View>

        <View style={styles.futurePlansSection}>
          <Text style={styles.sectionTitle}>What’s Next</Text>
          <View style={styles.futurePlanCard}>
            <MaterialIcons name={futurePlan.icon} size={32} color={colors.primary} />
            <Text style={styles.futurePlanTitle}>{futurePlan.title}</Text>
            <Text style={styles.futurePlanText}>{futurePlan.description}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
