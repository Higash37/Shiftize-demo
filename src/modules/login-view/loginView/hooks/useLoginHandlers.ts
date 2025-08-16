import { StoreIdStorage } from "@/common/common-utils/util-storage/StoreIdStorage";

interface LoginHandlersProps {
  onLogin?: (username: string, password: string, storeId: string) => Promise<void>;
  storeIdAndUsername: string;
  emailInput: string;
  password: string;
  loginMode: 'storeId' | 'email';
  saveStoreId: boolean;
  setErrorMessage: (message: string) => void;
}

export const useLoginHandlers = ({
  onLogin,
  storeIdAndUsername,
  emailInput,
  password,
  loginMode,
  saveStoreId,
  setErrorMessage,
}: LoginHandlersProps) => {
  
  // 入力文字列から店舗IDとニックネームを分離
  const parseStoreIdAndUsername = (input: string) => {
    if (input.length < 4) {
      return { storeId: input, username: "" };
    }
    const storeId = input.substring(0, 4);
    const username = input.substring(4);
    return { storeId, username };
  };

  const handleLogin = async () => {
    if (loginMode === 'storeId') {
      // 従来の店舗ID + ニックネーム方式
      const { storeId, username } = parseStoreIdAndUsername(storeIdAndUsername);

      if (!username || !password || !storeId) {
        setErrorMessage(
          "店舗ID（4桁）+ ニックネーム・パスワードを入力してください"
        );
        return;
      }

      // storeIdの形式チェック（4桁の数字）
      if (!/^\d{4}$/.test(storeId)) {
        setErrorMessage("店舗IDは4桁の数字で入力してください");
        return;
      }

      if (onLogin) {
        try {
          await onLogin(username, password, storeId);

          // 店舗ID保存の設定に応じて処理
          if (saveStoreId) {
            await StoreIdStorage.saveStoreId(storeId);
          } else {
            await StoreIdStorage.clearStoreId();
          }

          setErrorMessage("");
        } catch (error) {
          setErrorMessage("ログインに失敗しました。再度お試しください。");
        }
      }
    } else {
      // メールアドレス方式
      if (!emailInput || !password) {
        setErrorMessage("メールアドレスとパスワードを入力してください");
        return;
      }

      // セキュアなメールアドレス検証
      const { validateEmail } = await import("@/common/common-utils/validation/inputValidation");
      const emailValidation = validateEmail(emailInput);
      if (!emailValidation.isValid) {
        setErrorMessage(emailValidation.error || "有効なメールアドレスを入力してください");
        return;
      }

      if (onLogin) {
        try {
          const storeId = await StoreIdStorage.getStoreId() || "default";
          await onLogin(emailInput, password, storeId);
          setErrorMessage("");
        } catch (error) {
          setErrorMessage("ログインに失敗しました。再度お試しください。");
        }
      }
    }
  };

  const handleDemoLogin = (role: 'master' | 'user', setters: {
    setStoreIdAndUsername: (value: string) => void;
    setPassword: (value: string) => void;
    setLoginMode: (mode: 'storeId' | 'email') => void;
    setDemoRoleModalVisible: (visible: boolean) => void;
    externalSetShowDemoModal?: (visible: boolean) => void;
  }) => {
    if (role === 'master') {
      setters.setStoreIdAndUsername('0000佐藤');
      setters.setPassword('password');
    } else {
      setters.setStoreIdAndUsername('0000山田');
      setters.setPassword('password2');
    }
    setters.setLoginMode('storeId');
    setters.setDemoRoleModalVisible(false);
    if (setters.externalSetShowDemoModal) {
      setters.externalSetShowDemoModal(false);
    }
  };

  return {
    handleLogin,
    handleDemoLogin,
    parseStoreIdAndUsername,
  };
};