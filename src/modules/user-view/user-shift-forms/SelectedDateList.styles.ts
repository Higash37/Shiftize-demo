import { StyleSheet } from "react-native";
import { SelectedDateListStyles } from "./SelectedDateList.types";

export const styles = StyleSheet.create<SelectedDateListStyles>({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#003366",
  },
  item: {
    backgroundColor: "#F2F4F8",
    padding: 12,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  dateText: {
    fontSize: 15,
    fontWeight: "500",
  },
  removeText: {
    color: "#007AFF",
    fontWeight: "bold",
  },
  noneText: {
    color: "#999",
    fontStyle: "italic",
  },
});
