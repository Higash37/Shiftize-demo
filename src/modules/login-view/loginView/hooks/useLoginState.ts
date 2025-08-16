import { useState, useEffect } from "react";
import { Platform, useWindowDimensions } from "react-native";
import { StoreIdStorage } from "@/common/common-utils/util-storage/StoreIdStorage";

export const useLoginState = (
  externalShowDemoModal?: boolean,
  externalSetShowDemoModal?: (show: boolean) => void
) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [saveStoreId, setSaveStoreId] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [storeIdAndUsername, setStoreIdAndUsername] = useState("");
  const [loginMode, setLoginMode] = useState<'storeId' | 'email'>('storeId');
  const [emailInput, setEmailInput] = useState("");
  const [demoRoleModalVisible, setDemoRoleModalVisible] = useState(externalShowDemoModal || false);

  // フォーカスの状態を管理
  const [storeIdAndUsernameFocused, setStoreIdAndUsernameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isTablet = width >= 768 && width < 1024;
  const isPC = width >= 1024;
  const isTabletOrDesktop = width >= 768;

  // コンポーネントマウント時に保存された店舗IDを読み込み
  useEffect(() => {
    const loadSavedStoreId = async () => {
      try {
        const savedStoreId = await StoreIdStorage.getStoreId();
        if (savedStoreId) {
          setStoreIdAndUsername(savedStoreId);
          setSaveStoreId(true);
        }
      } catch (error) {
        // Error loading saved store ID - fail silently
      }
    };

    loadSavedStoreId();
  }, []);

  // 外部からのデモモーダル制御
  useEffect(() => {
    if (externalShowDemoModal !== undefined) {
      setDemoRoleModalVisible(externalShowDemoModal);
    }
  }, [externalShowDemoModal]);

  return {
    // State
    username,
    password,
    rememberMe,
    saveStoreId,
    errorMessage,
    storeIdAndUsername,
    loginMode,
    emailInput,
    demoRoleModalVisible,
    storeIdAndUsernameFocused,
    emailFocused,
    passwordFocused,
    // Setters
    setUsername,
    setPassword,
    setRememberMe,
    setSaveStoreId,
    setErrorMessage,
    setStoreIdAndUsername,
    setLoginMode,
    setEmailInput,
    setDemoRoleModalVisible,
    setStoreIdAndUsernameFocused,
    setEmailFocused,
    setPasswordFocused,
    // Dimensions
    isWeb,
    isTablet,
    isPC,
    isTabletOrDesktop,
    width,
    // External handlers
    externalSetShowDemoModal,
  };
};