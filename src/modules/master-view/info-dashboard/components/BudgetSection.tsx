import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "@/common/common-constants/ColorConstants";
import { layout } from "@/common/common-constants/LayoutConstants";
import { shadows } from "@/common/common-constants/ShadowConstants";
import Box from "@/common/common-ui/ui-base/BaseBox/BoxComponent";

interface BudgetSectionProps {
  budget: number;
  onBudgetChange: (budget: number) => void;
}

export const BudgetSection: React.FC<BudgetSectionProps> = ({
  budget,
  onBudgetChange,
}) => {
  const [inputValue, setInputValue] = useState(budget.toString());
  const { width } = useWindowDimensions();
  const isTabletOrDesktop = width >= 768;

  const handleBudgetChange = (value: string) => {
    setInputValue(value);
    const numericValue = parseInt(value.replace(/,/g, ""), 10);
    if (!isNaN(numericValue)) {
      onBudgetChange(numericValue);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
    }).format(amount);
  };

  return (
    <Box
      variant="card"
      style={[styles.container, isTabletOrDesktop && styles.containerDesktop]}
    >
      {/* 1行目: タイトルと入力・表示 */}
      <View
        style={[styles.mainRow, isTabletOrDesktop && styles.mainRowDesktop]}
      >
        <View style={styles.titleSection}>
          <MaterialIcons
            name="account-balance"
            size={20}
            color={colors.primary}
          />
          <Text style={styles.titleCompact}>月間予算設定</Text>
        </View>

        <View style={styles.inputSection}>
          <View
            style={[
              styles.inputWrapper,
              isTabletOrDesktop && styles.inputWrapperCompact,
            ]}
          >
            <Text style={styles.currencySymbol}>¥</Text>
            <TextInput
              style={[styles.input, isTabletOrDesktop && styles.inputCompact]}
              value={inputValue}
              onChangeText={handleBudgetChange}
              keyboardType="numeric"
              placeholder="500000"
              placeholderTextColor="#999"
            />
          </View>
          <Text
            style={[
              styles.budgetDisplay,
              isTabletOrDesktop && styles.budgetDisplayCompact,
            ]}
          >
            予算: {formatCurrency(budget)}
          </Text>
        </View>
      </View>

      {/* 2行目: 説明文 */}
      <Text style={styles.infoTextCompact}>
        ※ この予算を基に各種指標が計算されます
      </Text>
    </Box>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: layout.padding.medium,
    marginBottom: layout.padding.small,
    paddingVertical: layout.padding.small, // 縦の余白を削減
  },
  containerDesktop: {
    marginHorizontal: layout.padding.large,
    maxWidth: 1000, // 幅を拡張
    alignSelf: "center",
  },
  mainRow: {
    flexDirection: "column",
    marginBottom: layout.padding.small,
  },
  mainRowDesktop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: layout.padding.small,
  },
  titleCompact: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
    marginLeft: layout.padding.small,
  },
  inputSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: layout.borderRadius.small,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: layout.padding.small,
    paddingVertical: 6, // 高さを縮小
    marginRight: layout.padding.medium,
    minWidth: 120,
  },
  inputWrapperCompact: {
    minWidth: 140,
  },
  currencySymbol: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.secondary,
    marginRight: 4,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.primary,
    paddingVertical: 4,
  },
  inputCompact: {
    fontSize: 16,
  },
  budgetDisplay: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.primary,
    textAlign: "center",
    marginTop: layout.padding.small,
  },
  budgetDisplayCompact: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
    marginTop: 0,
    textAlign: "left",
  },
  infoTextCompact: {
    fontSize: 11,
    color: colors.text.secondary,
    textAlign: "center",
    fontStyle: "italic",
    marginTop: layout.padding.small,
  },
});
