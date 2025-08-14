import { StyleSheet } from "react-native";
import { colors, typography } from "@/common/common-constants/ThemeConstants";

export const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 16,
  },
  input: {
    height: 40,
    borderColor: colors.border,
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 8,
    borderRadius: 8,
  },
  title: {
    fontSize: typography.fontSize.large,
    fontWeight: "600",
    marginBottom: 16,
    color: colors.text.primary,
  },
  label: {
    fontSize: typography.fontSize.medium,
    marginBottom: 4,
    color: colors.text.primary,
  },
  message: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
  },
  successMessage: {
    backgroundColor: colors.success + "20",
    color: colors.success,
  },
  errorMessage: {
    backgroundColor: colors.error + "20",
    color: colors.error,
  },
  buttonContainer: {
    marginTop: 16,
  },
});
