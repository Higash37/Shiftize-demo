import { StyleSheet, Dimensions, Platform } from "react-native";
import { shadows } from "@/common/common-constants/ShadowConstants";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const IS_TABLET = SCREEN_WIDTH >= 768 && SCREEN_WIDTH < 1000;

export const loginFormStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: IS_TABLET ? "#eef2f7" : "#f5f5f5",
  },
  header: {
    backgroundColor: IS_TABLET ? "#0d47a1" : "#1565C0", // タブレットは少し濃い青
    width: "100%",
    ...(IS_TABLET && {
      paddingVertical: 40,
      ...shadows.header,
    }),
  },
  headerContent: {
    width: "100%",
    padding: 16,
  },
  titleContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "#fff",
    fontSize: IS_TABLET ? 38 : 20,
    fontWeight: "bold",
    ...(IS_TABLET && {
      letterSpacing: 1.5,
    }),
  },
  contentContainer: {
    flex: 1,
    width: "100%",
  },
  formWrapper: {
    flex: 1,
    width: "100%",
    padding: 16,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: "10%",
  },
  formWrapperWeb: {
    width: IS_TABLET ? "55%" : "65%",
    maxWidth: IS_TABLET ? 700 : 600,
    minWidth: 260,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: IS_TABLET ? "8%" : "3%",
  },
  formContainer: {
    backgroundColor: "#fff",
    borderRadius: IS_TABLET ? 20 : 12,
    padding: IS_TABLET ? 56 : 24,
    width: "100%",
    ...(IS_TABLET ? shadows.large : shadows.medium),
    ...(IS_TABLET && {
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.8)",
    }),
  },
  loginTitle: {
    fontSize: IS_TABLET ? 42 : 24,
    fontWeight: IS_TABLET ? "700" : "600",
    marginBottom: IS_TABLET ? 48 : 24,
    textAlign: "center",
    ...(IS_TABLET && {
      color: "#0d47a1",
      letterSpacing: 1,
    }),
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: IS_TABLET ? 20 : 14,
    fontWeight: IS_TABLET ? "600" : "500",
    color: IS_TABLET ? "#0d47a1" : "#333",
    ...(IS_TABLET && {
      marginBottom: 8,
      letterSpacing: 0.5,
    }),
  },
  input: {
    borderWidth: IS_TABLET ? 2 : 1,
    borderColor: IS_TABLET ? "#bbdefb" : "#ddd",
    borderRadius: IS_TABLET ? 12 : 6,
    padding: IS_TABLET ? 22 : 12,
    fontSize: IS_TABLET ? 24 : 16,
    backgroundColor: IS_TABLET ? "#f8faff" : "#fafafa",
    ...(IS_TABLET && {
      ...shadows.small,
    }),
  },
  rememberMe: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  checkbox: {
    width: IS_TABLET ? 32 : 20,
    height: IS_TABLET ? 32 : 20,
    borderWidth: IS_TABLET ? 3 : 2,
    borderColor: IS_TABLET ? "#0d47a1" : "#666",
    borderRadius: IS_TABLET ? 8 : 4,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: IS_TABLET ? "#0d47a1" : "#1565C0",
    borderColor: IS_TABLET ? "#0d47a1" : "#1565C0",
  },
  checkmark: {
    color: "#fff",
    fontSize: IS_TABLET ? 20 : 14,
    fontWeight: "bold",
  },
  rememberMeText: {
    color: IS_TABLET ? "#333" : "#666",
    fontSize: IS_TABLET ? 20 : 14,
    ...(IS_TABLET && {
      fontWeight: "500",
    }),
  },
  loginButton: {
    backgroundColor: IS_TABLET ? "#0d47a1" : "#1565C0",
    padding: IS_TABLET ? 24 : 12,
    borderRadius: IS_TABLET ? 14 : 6,
    alignItems: "center",
    ...(IS_TABLET ? shadows.large : shadows.button),
    ...(IS_TABLET &&
      Platform.OS === "web" && {
        cursor: "pointer",
        transition: "all 0.3s ease",
        ":hover": {
          backgroundColor: "#083080",
          transform: [{ scale: 1.02 }],
        },
      }),
  },
  loginButtonDisabled: {
    backgroundColor: IS_TABLET ? "#9e9e9e" : "#ccc",
  },
  loginButtonText: {
    color: "#fff",
    fontSize: IS_TABLET ? 26 : 16,
    fontWeight: IS_TABLET ? "700" : "600",
    ...(IS_TABLET && {
      letterSpacing: 1,
    }),
  },
  forgotPassword: {
    alignItems: "center",
  },
  forgotPasswordText: {
    color: "#1565C0",
    fontSize: 14,
    textDecorationLine: "underline",
  },
  maintenanceText: {
    color: IS_TABLET ? "#455a64" : "#666",
    fontSize: IS_TABLET ? 16 : 12,
    textAlign: "center",
    marginTop: IS_TABLET ? 32 : 16,
    ...(IS_TABLET && {
      fontWeight: "500",
      maxWidth: "80%",
    }),
  },
  storeIdContainer: {
    marginBottom: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  storeIdDisplay: {
    fontSize: 16,
    color: "#1565C0",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  confirmButton: {
    marginLeft: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#1565C0",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
});
