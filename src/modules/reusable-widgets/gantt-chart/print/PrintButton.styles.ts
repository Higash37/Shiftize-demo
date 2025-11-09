import { StyleSheet } from "react-native";
import { colors } from "@/common/common-constants/ThemeConstants";

export const styles = StyleSheet.create({
  printButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  printButtonText: {
    color: "#fff",
    marginLeft: 8,
    fontWeight: "bold",
  },
});
