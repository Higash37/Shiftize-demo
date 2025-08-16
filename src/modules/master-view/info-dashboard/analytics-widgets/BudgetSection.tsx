import React, { useState, useCallback, useMemo } from "react";
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
import Box from "@/common/common-ui/ui-base/BoxComponent";

interface BudgetSectionProps {
  budget: number;
  onBudgetChange: (budget: number) => void;
}

/**
 * Enhanced budget section component with robust numeric processing
 * and production-ready validation
 */

export const BudgetSection: React.FC<BudgetSectionProps> = ({
  budget,
  onBudgetChange,
}) => {
  const [inputValue, setInputValue] = useState<string>(
    BudgetSectionValidator.formatBudgetForDisplay(budget)
  );
  const { width } = useWindowDimensions();
  const isTabletOrDesktop = width >= 768;

  const handleBudgetChange = useCallback((value: string) => {
    const sanitizedValue = BudgetSectionValidator.sanitizeInput(value);
    setInputValue(sanitizedValue);
    
    const validationResult = BudgetSectionValidator.validateAndParse(sanitizedValue);
    if (validationResult.isValid && validationResult.value !== null) {
      onBudgetChange(validationResult.value);
    }
  }, [onBudgetChange]);

  const formatCurrency = useCallback((amount: number) => {
    return BudgetSectionValidator.formatCurrency(amount);
  }, []);

  // Update input value when budget prop changes
  React.useEffect(() => {
    const formattedBudget = BudgetSectionValidator.formatBudgetForDisplay(budget);
    if (formattedBudget !== inputValue) {
      setInputValue(formattedBudget);
    }
  }, [budget, inputValue]);

  // Memoized validation status
  const validationStatus = useMemo(() => {
    return BudgetSectionValidator.validateDisplayValue(inputValue);
  }, [inputValue]);

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
              style={[
                styles.input, 
                isTabletOrDesktop && styles.inputCompact,
                !validationStatus.isValid && styles.inputError
              ]}
              value={inputValue}
              onChangeText={handleBudgetChange}
              keyboardType="numeric"
              placeholder="500000"
              placeholderTextColor="#999"
              maxLength={10}
              accessibilityLabel="月間予算入力"
              accessibilityHint="数字のみ入力可能"
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
  inputError: {
    borderColor: "#FF4444",
    borderWidth: 1,
  },
});

/**
 * Budget section validation and formatting utility class
 */
class BudgetSectionValidator {
  /**
   * Sanitize input to allow only numbers
   */
  static sanitizeInput(input: string): string {
    if (!input || typeof input !== 'string') {
      return "";
    }
    // Allow only digits, remove any other characters
    return input.replace(/[^\d]/g, "");
  }

  /**
   * Validate and parse budget input
   */
  static validateAndParse(input: string): { isValid: boolean; value: number | null; error?: string } {
    if (!input || input.trim() === "") {
      return { isValid: true, value: 0 }; // Empty input is valid, defaults to 0
    }

    const sanitized = this.sanitizeInput(input);
    const numericValue = parseInt(sanitized, 10);

    if (!Number.isFinite(numericValue) || numericValue < 0) {
      return { 
        isValid: false, 
        value: null, 
        error: "有効な予算を入力してください" 
      };
    }

    if (numericValue > 100000000) { // 1億円制限
      return { 
        isValid: false, 
        value: null, 
        error: "予算は1億円以下で入力してください" 
      };
    }

    return { isValid: true, value: numericValue };
  }

  /**
   * Validate display value for styling purposes
   */
  static validateDisplayValue(input: string): { isValid: boolean; error?: string } {
    if (!input || input.trim() === "") {
      return { isValid: true }; // Empty is valid
    }

    const validation = this.validateAndParse(input);
    return {
      isValid: validation.isValid,
      error: validation.error
    };
  }

  /**
   * Format budget for display in input field
   */
  static formatBudgetForDisplay(budget: number): string {
    if (!Number.isFinite(budget) || budget < 0) {
      return "";
    }
    return budget.toString();
  }

  /**
   * Format currency with proper validation and fallback
   */
  static formatCurrency(amount: number): string {
    if (!Number.isFinite(amount)) {
      return "¥0";
    }

    try {
      return new Intl.NumberFormat("ja-JP", {
        style: "currency",
        currency: "JPY",
      }).format(Math.round(Math.max(0, amount)));
    } catch (error) {
      // Fallback formatting if Intl fails
      const roundedAmount = Math.round(Math.max(0, amount));
      return `¥${roundedAmount.toLocaleString()}`;
    }
  }
}
