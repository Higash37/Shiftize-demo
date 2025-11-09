import { StyleSheet } from "react-native";
import { colors } from "@/common/common-constants/ThemeConstants";
import { shadows } from "@/common/common-constants/ShadowConstants";

export const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.surface,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  errorContainer: {
    backgroundColor: colors.error + "10",
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  errorText: {
    color: colors.error,
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
    color: colors.primary,
  },
  datePickerButton: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: colors.border,
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
    backgroundColor: colors.surface,
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
    color: colors.text.white,
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
    color: colors.text.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  deleteButton: {
    backgroundColor: colors.error + "1A",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 10,
  },
  deleteButtonText: {
    color: colors.error,
    fontSize: 16,
    fontWeight: "bold",
  },
  successMessage: {
    position: "absolute",
    top: 80,
    left: 0,
    right: 0,
    backgroundColor: colors.success + "CC",
    padding: 10,
    margin: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  successText: {
    color: colors.text.white,
    fontWeight: "bold",
  },
  // ユーザーピッカーボタン
  userPickerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  userPickerText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  placeholderTextDropdown: {
    color: colors.text.disabled,
  },
  // ドロップダウン関連
  dropdownOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    justifyContent: "flex-start",
    paddingTop: 80, // ユーザー選択ボタンの下
    paddingHorizontal: 16,
  },
  dropdownContainer: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownList: {
    maxHeight: 400,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dropdownUserInfo: {
    flex: 1,
    marginLeft: 8,
  },
  dropdownItemText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  dropdownUserRole: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  userListContainer: {
    maxHeight: 240,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  userItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  selectedUserItem: {
    backgroundColor: colors.primary,
  },
  userItemText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  selectedUserItemText: {
    color: colors.text.white,
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
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
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
    backgroundColor: colors.selected,
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
    backgroundColor: colors.error + "1A",
  },
  removeDateText: {
    color: colors.error,
    fontWeight: "bold",
  },
  toggleButton: {
    backgroundColor: colors.surface,
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
    backgroundColor: colors.surface,
  },
  classTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  addButton: {
    flexDirection: "row",
    backgroundColor: colors.primary,
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
    color: colors.text.white,
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
