import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { colors } from "@/common/common-constants/ThemeConstants";
import { createDevelopmentStoryStyles } from "./DevelopmentStory.styles";
import { useThemedStyles } from "@/common/common-theme/md3/useThemedStyles";
import {
  developmentPhases,
  insights,
  learningCurve,
} from "./DevelopmentStory.data";

const DevelopmentStoryPage: React.FC = () => {
  const router = useRouter();
  const styles = useThemedStyles(createDevelopmentStoryStyles);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <AntDesign name="left" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Development Story</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>18-Month Delivery Journey</Text>
          <Text style={styles.pageSubtitle}>
            From discovery workshops to academy-wide rollout, here is how Shiftize evolved from an idea into a production platform.
          </Text>
        </View>

        <View style={styles.timelineSection}>
          <Text style={styles.sectionTitle}>Timeline</Text>
          <Text style={styles.sectionSubtitle}>
            Each phase brought new lessons, technical breakthroughs, and teamwork rituals that shaped the product today.
          </Text>

          {developmentPhases.map((phase, index) => (
            <View key={phase.phase} style={styles.timelineItem}>
              <View style={styles.phaseHeader}>
                <View style={[styles.phaseNumber, { backgroundColor: phase.color }]}>
                  <Text style={styles.phaseNumberText}>{phase.phase}</Text>
                </View>
                <View style={styles.phaseInfo}>
                  <Text style={styles.phaseTitle}>{phase.title}</Text>
                  <View style={styles.phaseDuration}>
                    <MaterialIcons name="access-time" size={16} color={colors.text.secondary} />
                    <Text style={styles.phaseDurationText}>{phase.duration}</Text>
                  </View>
                </View>
              </View>

              <View
                style={[
                  styles.phaseContent,
                  { backgroundColor: phase.backgroundColor },
                ]}
              >
                <MaterialIcons name={phase.icon} size={24} color={phase.color} />
                <Text style={styles.phaseDescription}>{phase.description}</Text>

                <View style={styles.achievementsSection}>
                  <Text style={styles.achievementsTitle}>Highlights</Text>
                  {phase.achievements.map((achievement) => (
                    <View key={achievement} style={styles.achievementItem}>
                      <View
                        style={[styles.achievementDot, { backgroundColor: phase.color }]}
                      />
                      <Text style={styles.achievementText}>{achievement}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.challengesSection}>
                  <Text style={styles.challengesTitle}>Challenges</Text>
                  <Text style={styles.challengesText}>{phase.challenges}</Text>
                </View>
              </View>

              {index < developmentPhases.length - 1 && <View style={styles.timelineConnector} />}
            </View>
          ))}
        </View>

        <View style={styles.learningSection}>
          <Text style={styles.sectionTitle}>Learning Curve</Text>
          <Text style={styles.sectionSubtitle}>
            Skill growth matched feature velocity—we invested in new disciplines as the product matured.
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

                <View style={styles.progressBars}>
                  <View style={styles.progressBarRow}>
                    <Text style={styles.progressLabel}>Before</Text>
                    <View style={styles.progressBarBg}>
                      <View
                        style={[styles.progressBar, styles.progressBarBefore, { width: `${skill.before}%` }]}
                      />
                    </View>
                  </View>
                  <View style={styles.progressBarRow}>
                    <Text style={styles.progressLabel}>After</Text>
                    <View style={styles.progressBarBg}>
                      <View
                        style={[styles.progressBar, styles.progressBarAfter, { width: `${skill.after}%` }]}
                      />
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.insightsSection}>
          <Text style={styles.sectionTitle}>Key Insights</Text>
          <Text style={styles.sectionSubtitle}>
            Three principles kept the team aligned with real classroom needs while sustaining momentum.
          </Text>

          <View style={styles.insightsGrid}>
            {insights.map((insight) => (
              <View key={insight.title} style={styles.insightCard}>
                <MaterialIcons name={insight.icon} size={32} color={colors.primary} />
                <Text style={styles.insightTitle}>{insight.title}</Text>
                <Text style={styles.insightDescription}>{insight.description}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default DevelopmentStoryPage;
