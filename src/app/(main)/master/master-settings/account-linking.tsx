import React, { Suspense, lazy } from "react";
import { View, TouchableOpacity, Text, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { colors } from "@/common/common-constants/ThemeConstants";

const AccountLinkingSection = lazy(() =>
  import("@/modules/reusable-widgets/account-linking/AccountLinkingSection").then(
    (module) => ({ default: module.AccountLinkingSection })
  )
);

export default function AccountLinkingPage() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>アカウント連携</Text>

        <Suspense fallback={null}>
          <AccountLinkingSection />
        </Suspense>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>戻る</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold" as const,
    color: colors.primary,
    marginBottom: 20,
  },
  backButton: {
    padding: 16,
    alignItems: "center" as const,
  },
  backButtonText: {
    color: colors.primary,
    fontSize: 16,
  },
};
