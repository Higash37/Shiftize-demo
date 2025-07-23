import { StyleSheet } from "react-native";
import { colors } from "@/common/common-constants/ThemeConstants";

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  container: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text.primary,
  },
  closeButton: {
    padding: 8,
    borderRadius: 4,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text.primary,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#dee2e6",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text.primary,
    backgroundColor: "#ffffff",
  },
  hint: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 8,
    lineHeight: 16,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
    gap: 12,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: "#f8f9fa",
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text.secondary,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  createButtonDisabled: {
    backgroundColor: "#adb5bd",
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
    marginLeft: 4,
  },
});
