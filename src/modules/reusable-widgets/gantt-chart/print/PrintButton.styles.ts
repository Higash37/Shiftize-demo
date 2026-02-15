import { StyleSheet } from "react-native";
import { MD3Theme } from "@/common/common-theme/md3/MD3Theme.types";

export const createPrintButtonStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    printButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colorScheme.primary,
      padding: 10,
      borderRadius: 6,
      marginTop: 10,
    },
    printButtonText: {
      color: theme.colorScheme.onPrimary,
      marginLeft: 8,
      fontWeight: "bold",
    },
  });
