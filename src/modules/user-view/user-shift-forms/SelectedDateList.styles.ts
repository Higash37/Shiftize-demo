import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold" as const,
    marginBottom: 8,
    color: "#333",
  },
  calendar: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold" as const,
    marginBottom: 12,
    color: "#003366",
  },
  item: {
    backgroundColor: "#F2F4F8",
    padding: 12,
    borderRadius: 12,
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 8,
  },
  dateText: {
    fontSize: 15,
    fontWeight: "500",
  },
  removeText: {
    color: "#007AFF",
    fontWeight: "bold" as const,
  },
  noneText: {
    color: "#999",
    fontStyle: "italic",
  },
  picker: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
  },
});
