import React, { useMemo } from "react";
import { View, Text, ActivityIndicator, Pressable } from "react-native";
import { Link } from "expo-router";
import { MasterHeader } from "@/common/common-ui/ui-layout";
import { User } from "@/common/common-models/model-user/UserModel";
import { useMD3Theme } from "@/common/common-theme/md3/MD3ThemeContext";
import { useBreakpoint } from "@/common/common-constants/Breakpoints";
import { createMasterDashboardViewStyles } from "./MasterDashboardView.styles";
import type {
  MasterDashboardViewProps,
  StatCardProps,
} from "./MasterDashboardView.types";

export const MasterDashboardView: React.FC<MasterDashboardViewProps> = ({
  users,
  loading,
  error,
}) => {
  const theme = useMD3Theme();
  const bp = useBreakpoint();
  const styles = useMemo(
    () => createMasterDashboardViewStyles(theme, bp),
    [theme, bp]
  );

  const StatCard: React.FC<StatCardProps> = ({ title, value }) => (
    <View style={styles.card}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{title}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colorScheme.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const regularUsers =
    users?.filter((user: User) => user.role === "user") ?? [];

  return (
    <View style={styles.container}>
      <MasterHeader title="ダッシュボード" />
      <View style={styles.content}>
        <Text style={styles.title}>ダッシュボード</Text>
        <Text style={styles.subtitle}>マスター管理画面のトップページです</Text>
        <View style={styles.stats}>
          <StatCard title="総ユーザー数" value={users?.length ?? 0} />
          <StatCard title="一般ユーザー数" value={regularUsers.length} />
        </View>
        <View style={styles.linksContainer}>
          <Link href="/master/users" asChild>
            <Pressable style={styles.link}>
              <Text style={styles.linkText}>ユーザー管理へ</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </View>
  );
};
