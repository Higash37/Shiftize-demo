import { StyleSheet } from "react-native";
import { colors } from "@/common/common-constants/ThemeConstants";
import { shadows } from "@/common/common-constants/ShadowConstants";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    maxWidth: "70%",
    width: "100%",
    alignSelf: "center",
    alignItems: "center",
    alignContent: "center",
    marginHorizontal: "auto",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  scrollView: {
    padding: 24,
    width: "100%",
  },
  errorContainer: {
    backgroundColor: "#fff1f0",
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#ff4d4f",
  },
  errorText: {
    color: "#ff4d4f",
    textAlign: "center",
    fontSize: 14,
    fontWeight: "500",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    color: "#1976d2",
  },
  datePickerButton: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  dateText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  placeholderText: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeField: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 14,
    marginBottom: 5,
    color: colors.text.primary,
  },
  separator: {
    width: 30,
    alignItems: "center",
  },
  separatorText: {
    fontSize: 18,
    color: colors.text.secondary,
  },
  shiftTypeContainer: {
    flexDirection: "row",
  },
  shiftTypeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 5,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    marginHorizontal: 5,
  },
  activeShiftTypeButton: {
    backgroundColor: colors.primary,
  },
  shiftTypeText: {
    color: colors.text.secondary,
  },
  activeShiftTypeText: {
    color: "#fff",
    fontWeight: "bold",
  },
  saveButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 10,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  deleteButton: {
    backgroundColor: "rgba(255, 0, 0, 0.1)",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 10,
  },
  deleteButtonText: {
    color: "red",
    fontSize: 16,
    fontWeight: "bold",
  },
  successMessage: {
    position: "absolute",
    top: 80,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 200, 0, 0.8)",
    padding: 10,
    margin: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  successText: {
    color: "#fff",
    fontWeight: "bold",
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: "#f5f5f5",
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  userListContainer: {
    maxHeight: 240,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    backgroundColor: "#fafafa",
  },
  userItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  selectedUserItem: {
    backgroundColor: colors.primary,
  },
  userItemText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  selectedUserItemText: {
    color: "#fff",
    fontWeight: "bold",
  },
  storeNameText: {
    fontSize: 14,
    color: colors.text.secondary,
    fontStyle: "italic",
  },
  noResultsText: {
    padding: 10,
    textAlign: "center",
    color: colors.text.secondary,
  },
  pickerContainer: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    overflow: "hidden",
  },
  picker: {
    height: 56,
    width: "100%",
  },
  selectedDatesContainer: {
    marginTop: 10,
  },
  selectedDateCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#e0f7fa",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  selectedDateText: {
    fontSize: 14,
    color: colors.text.primary,
  },
  removeDateButton: {
    padding: 5,
    borderRadius: 5,
    backgroundColor: "rgba(255, 0, 0, 0.1)",
  },
  removeDateText: {
    color: "red",
    fontWeight: "bold",
  },
  toggleButton: {
    backgroundColor: "#f0f0f0",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 10,
  },
  toggleButtonText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  classesContainer: {
    marginTop: 10,
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#f9f9f9",
  },
  classTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  addButton: {
    flexDirection: "row",
    backgroundColor: "#1976d2",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    alignSelf: "flex-start",
    ...shadows.button,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 6,
    letterSpacing: 1,
  },
  removeButton: {
    marginLeft: 10,
  },
  recruitmentItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.primary + "10",
    borderColor: colors.primary,
  },
  recruitmentText: {
    color: colors.primary,
    fontWeight: "600",
  },
});
