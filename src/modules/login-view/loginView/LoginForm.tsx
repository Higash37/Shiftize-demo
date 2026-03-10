/**
 * @file LoginForm.tsx
 * @description ログイン画面のフォームコンポーネント。
 *
 * このコンポーネントが表示するもの:
 *   - 店舗ID + ニックネームの入力欄
 *   - パスワードの入力欄
 *   - ログインボタン
 *   - デモアカウント選択モーダル
 *
 * 処理の流れ（ログイン時）:
 *   1. ユーザーが「1234山田太郎」のようにID+名前を入力
 *   2. parseStoreIdAndUsername() で先頭4桁をstoreId、残りをusernameに分割
 *   3. onLogin(username, password, storeId) で親に委譲
 *   4. 親（AuthContext等）→ SupabaseAuthAdapter → Supabase Auth API で認証
 *   5. 成功: 画面遷移 / 失敗: エラーメッセージ表示
 *
 * React.FC<Props>:
 *   `React.FC` は React Function Component の略。
 *   `<LoginFormProps>` はジェネリクスで、このコンポーネントが受け取るPropsの型を指定している。
 *   これにより、Props のプロパティに型チェックが効くようになる。
 */

import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Pressable,
  Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import type { LoginFormProps } from "./LoginForm.types";
// レイアウトバグ（React Native Web固有）を自動検知してリロードするカスタムフック
import { useAutoReloadOnLayoutBug } from "@/common/common-ui/ui-loading/useAutoReloadOnLayoutBug";
// 店舗IDをローカルストレージに保存/読み込みするユーティリティ
import { StoreIdStorage } from "@/common/common-utils/util-storage/StoreIdStorage";
import Box from "@/common/common-ui/ui-base/BoxComponent";
import { createLoginFormStyles } from "./LoginForm.styles";
// MD3テーマ（Material Design 3）を取得するフック
import { useMD3Theme } from "@/common/common-theme/md3/MD3ThemeContext";
// 現在の画面サイズ（モバイル/タブレット/デスクトップ）を取得するフック
import { useBreakpoint } from "@/common/common-constants/Breakpoints";

export const LoginForm: React.FC<LoginFormProps> = ({
  onLogin,
  loading,
  // `externalShowDemoModal` は Props の `showDemoModal` をリネームして受け取っている
  // 分割代入時に `: 新しい名前` とすると、ローカル変数名を変えられる
  showDemoModal: externalShowDemoModal,
  setShowDemoModal: externalSetShowDemoModal,
}) => {
  // --- Hooks ---

  // レイアウトバグの自動検知・修復フック（React Native Web特有の問題対策）
  useAutoReloadOnLayoutBug();

  // テーマオブジェクトを取得（色、フォント、スペーシング等が入っている）
  const theme = useMD3Theme();

  // 画面サイズに応じたブレークポイント情報を取得
  // bp = { isMobile: boolean, isTablet: boolean, isDesktop: boolean }
  const bp = useBreakpoint();

  // useMemo: テーマやブレークポイントが変わったときだけスタイルを再計算する
  // 毎回のレンダリングで無駄にスタイルを作り直すのを防ぐパフォーマンス最適化
  // 第2引数の配列 [theme, bp] が「依存配列」で、この値が変わったときだけ再計算される
  const styles = useMemo(() => createLoginFormStyles(theme, bp), [theme, bp]);

  // colorScheme をテーマから取り出す（色の参照を短く書くため）
  const { colorScheme } = theme;

  // --- State ---

  // パスワード入力値を管理する state
  // useState("") は初期値が空文字列。[現在の値, 値を更新する関数] の配列を返す
  const [password, setPassword] = useState("");

  // エラーメッセージを管理する state（空文字列 = エラーなし）
  const [errorMessage, setErrorMessage] = useState("");

  // 「店舗ID + ニックネーム」の結合文字列を管理する state
  // 例: "1234山田太郎" → storeId="1234", username="山田太郎" に後で分割する
  const [storeIdAndUsername, setStoreIdAndUsername] = useState("");

  // 店舗IDを保存するかどうかのチェックボックス状態
  const [saveStoreId, setSaveStoreId] = useState(true);

  // デモ役割選択モーダルの表示/非表示を管理する state
  // 外部から渡された値があればそれを初期値にする（|| false でundefined対策）
  const [demoRoleModalVisible, setDemoRoleModalVisible] = useState(
    externalShowDemoModal || false
  );

  // --- Hooks (useEffect) ---

  /**
   * コンポーネントのマウント時に、前回保存した店舗IDを読み込む。
   *
   * useEffect の第2引数が空配列 [] の場合:
   *   → コンポーネントが最初に表示されたとき（マウント時）に1回だけ実行される
   *
   * async/await を useEffect 内で使う場合:
   *   useEffect のコールバック自体は async にできない（Reactの仕様）ため、
   *   内部で async 関数を定義して即座に呼び出すパターンを使う
   */
  useEffect(() => {
    const loadSavedStoreId = async () => {
      try {
        // ローカルストレージから保存済みの店舗IDを読み込む
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

  /**
   * 外部から showDemoModal の値が変更されたとき、内部のstateに同期する。
   *
   * useEffect の第2引数 [externalShowDemoModal]:
   *   → externalShowDemoModal の値が変わるたびに実行される
   */
  useEffect(() => {
    if (externalShowDemoModal !== undefined) {
      setDemoRoleModalVisible(externalShowDemoModal);
    }
  }, [externalShowDemoModal]);

  // --- Handlers ---

  /**
   * 結合文字列を店舗ID（先頭4桁）とユーザー名（残り）に分割する。
   *
   * @param input - 例: "1234山田太郎"
   * @returns { storeId: "1234", username: "山田太郎" }
   *
   * substring(start, end):
   *   文字列のstart番目からend番目の手前までを切り出す。
   *   substring(0, 4) → 0〜3番目の4文字を取得
   *   substring(4)    → 4番目以降の全文字を取得
   */
  const parseStoreIdAndUsername = (input: string) => {
    if (input.length < 4) {
      return { storeId: input, username: "" };
    }
    return { storeId: input.substring(0, 4), username: input.substring(4) };
  };

  /**
   * ログインボタン押下時のハンドラ。
   * バリデーション → onLogin呼び出し → 店舗ID保存 の順で処理する。
   */
  const handleLogin = async () => {
    // 入力値を分割
    const { storeId, username } = parseStoreIdAndUsername(storeIdAndUsername);

    // バリデーション: 全フィールドが入力されているかチェック
    if (!username || !password || !storeId) {
      setErrorMessage(
        "店舗ID（4桁）+ ニックネーム・パスワードを入力してください"
      );
      return; // ここで関数を抜ける（ログイン処理に進まない）
    }

    // 正規表現で店舗IDが4桁の数字かチェック
    // `^\d{4}$` の意味: ^ = 先頭, \d = 数字1文字, {4} = 4回繰り返し, $ = 末尾
    // test() は正規表現にマッチすればtrue、しなければfalseを返す
    if (!/^\d{4}$/.test(storeId)) {
      setErrorMessage("店舗IDは4桁の数字で入力してください");
      return;
    }

    // onLogin が渡されている場合のみ実行（オプショナルPropsなので存在チェックが必要）
    if (onLogin) {
      try {
        // 親コンポーネントから渡されたログイン処理を実行
        await onLogin(username, password, storeId);

        // ログイン成功後、設定に応じて店舗IDを保存 or 削除
        if (saveStoreId) {
          await StoreIdStorage.saveStoreId(storeId);
        } else {
          await StoreIdStorage.clearStoreId();
        }
        setErrorMessage(""); // エラーメッセージをクリア
      } catch (error) {
        setErrorMessage("ログインに失敗しました。再度お試しください。");
      }
    }
  };

  /**
   * デモモーダルを閉じるハンドラ。
   * 内部stateと外部stateの両方を更新する。
   */
  const closeDemoModal = () => {
    setDemoRoleModalVisible(false);
    // 外部から setShowDemoModal が渡されている場合は外部stateも更新
    if (externalSetShowDemoModal) {
      externalSetShowDemoModal(false);
    }
  };

  // --- Render ---

  return (
    <View style={styles.container}>
      <View style={styles.formCard}>
        {/* Box: カード風のUIラッパーコンポーネント。variant="card" で影やpadding等が適用される */}
        <Box variant="card">
          {/* タイトル */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>ログイン</Text>
          </View>

          {/* エラーメッセージ: errorMessageが空でない（truthy）ときだけ表示 */}
          {/* `&&` は短絡評価。左がtrueのときだけ右を評価（=表示）する */}
          {errorMessage && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {/*
           * Platform.OS === "web" でプラットフォーム判定。
           * Web版ではHTML <form> タグを使い、Enterキーでsubmitできるようにしている。
           * ネイティブ（iOS/Android）では <form> が使えないので、
           * 通常の View + TouchableOpacity で代替する。
           */}
          {Platform.OS === "web" ? (
            <form
              onSubmit={(e: any) => {
                // e.preventDefault() でページリロード（フォーム送信のデフォルト動作）を阻止
                e.preventDefault();
                handleLogin();
              }}
              style={{ display: "flex", flexDirection: "column" }}
            >
              {/* 入力フィールド */}
              <View style={styles.inputGroup}>
                <View style={styles.labelContainer}>
                  {/* MaterialIcons: Google Material Design のアイコンライブラリ */}
                  <MaterialIcons
                    name="store"
                    size={20}
                    color={colorScheme.primary}
                    style={styles.labelIcon}
                  />
                  <Text style={styles.label}>店舗ID + ニックネーム</Text>
                </View>
                <TextInput
                  style={styles.input}
                  value={storeIdAndUsername}
                  onChangeText={setStoreIdAndUsername}
                  placeholder="例: 1234山田太郎"
                  placeholderTextColor={colorScheme.onSurfaceVariant}
                  // autoCapitalize="none" で自動大文字変換を無効にする
                  // "none" | "sentences" | "words" | "characters" から選べる
                  autoCapitalize="none"
                />
              </View>

              {/* パスワード入力 */}
              <View style={styles.inputGroup}>
                <View style={styles.labelContainer}>
                  <MaterialIcons
                    name="lock"
                    size={20}
                    color={colorScheme.primary}
                    style={styles.labelIcon}
                  />
                  <Text style={styles.label}>パスワード</Text>
                </View>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="パスワードを入力"
                  placeholderTextColor={colorScheme.onSurfaceVariant}
                  // secureTextEntry: パスワード入力用。文字を ●●● で隠す
                  secureTextEntry
                  // returnKeyType: キーボードの確定ボタンの表示テキストを指定
                  // "done" | "go" | "next" | "search" | "send" から選べる
                  returnKeyType="go"
                  // onSubmitEditing: キーボードの確定ボタンを押したときのコールバック
                  onSubmitEditing={handleLogin}
                />
              </View>

              {/* ログインボタン */}
              <TouchableOpacity
                style={[
                  styles.loginButton,
                  // loading が true のとき、loginButtonDisabled スタイル（半透明）を追加適用
                  // 配列でスタイルを渡すと、後のスタイルが前のスタイルを上書きする
                  loading && styles.loginButtonDisabled,
                ]}
                onPress={handleLogin}
                // disabled: true にするとタップを無効化する
                disabled={loading}
              >
                <Text style={styles.loginButtonText}>
                  {/* 三項演算子: loading が true なら "ログイン中..." を、false なら "ログイン" を表示 */}
                  {loading ? "ログイン中..." : "ログイン"}
                </Text>
              </TouchableOpacity>
            </form>
          ) : (
            <>
              {/* ネイティブ版の入力フィールド（Web版と同じ内容だが <form> タグなし） */}
              {/* <> </> はフラグメント: 複数の要素をグループ化するが、実際のDOMには何も追加しない */}

              {/* 入力フィールド */}
              <View style={styles.inputGroup}>
                <View style={styles.labelContainer}>
                  <MaterialIcons
                    name="store"
                    size={20}
                    color={colorScheme.primary}
                    style={styles.labelIcon}
                  />
                  <Text style={styles.label}>店舗ID + ニックネーム</Text>
                </View>
                <TextInput
                  style={styles.input}
                  value={storeIdAndUsername}
                  onChangeText={setStoreIdAndUsername}
                  placeholder="例: 1234山田太郎"
                  placeholderTextColor={colorScheme.onSurfaceVariant}
                  autoCapitalize="none"
                />
              </View>

              {/* パスワード入力 */}
              <View style={styles.inputGroup}>
                <View style={styles.labelContainer}>
                  <MaterialIcons
                    name="lock"
                    size={20}
                    color={colorScheme.primary}
                    style={styles.labelIcon}
                  />
                  <Text style={styles.label}>パスワード</Text>
                </View>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="パスワードを入力"
                  placeholderTextColor={colorScheme.onSurfaceVariant}
                  secureTextEntry
                  returnKeyType="go"
                  onSubmitEditing={handleLogin}
                />
              </View>

              {/* ログインボタン */}
              <TouchableOpacity
                style={[
                  styles.loginButton,
                  loading && styles.loginButtonDisabled,
                ]}
                onPress={handleLogin}
                disabled={loading}
              >
                <Text style={styles.loginButtonText}>
                  {loading ? "ログイン中..." : "ログイン"}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </Box>

        {/* デモリンク - ボックス外に配置 */}
        <TouchableOpacity
          style={styles.demoLink}
          onPress={() => {
            setDemoRoleModalVisible(true);
            // 外部のstate更新関数があれば呼ぶ
            if (externalSetShowDemoModal) {
              externalSetShowDemoModal(true);
            }
          }}
        >
          <Text style={styles.demoLinkText}>デモを体験する</Text>
        </TouchableOpacity>

        {/*
         * デモ役割選択モーダル
         *
         * Modal コンポーネント:
         *   - visible: モーダルの表示/非表示
         *   - transparent: 背景を透明にする（オーバーレイ効果を自前で作るため）
         *   - animationType: 表示アニメーション "none" | "slide" | "fade" から選べる
         *   - onRequestClose: Androidの戻るボタンで閉じる処理
         */}
        <Modal
          visible={demoRoleModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={closeDemoModal}
        >
          {/* 外側のPressable: オーバーレイ（半透明背景）をタップで閉じる */}
          <Pressable style={styles.modalOverlay} onPress={closeDemoModal}>
            {/*
             * 内側のPressable: モーダル本体。
             * e.stopPropagation() で、モーダル内のタップが外側に伝播するのを防ぐ。
             * これがないと、モーダル内をタップしてもオーバーレイのonPressが発火して閉じてしまう。
             */}
            <Pressable
              style={styles.modalContent}
              onPress={(e) => e.stopPropagation()}
            >
              {/* ヘッダー */}
              <View style={styles.modalHeader}>
                <MaterialIcons
                  name="person"
                  size={24}
                  color={colorScheme.primary}
                />
                <Text style={styles.modalTitle}>デモアカウントを選択</Text>
                <TouchableOpacity onPress={closeDemoModal} style={styles.modalCloseButton}>
                  <MaterialIcons
                    name="close"
                    size={24}
                    color={colorScheme.onSurfaceVariant}
                  />
                </TouchableOpacity>
              </View>

              {/* 説明 */}
              <Text style={styles.modalDescription}>
                体験したい役割を選択してください。{"\n"}
                自動でログイン情報が入力されます。
              </Text>

              {/* 役割選択ボタン */}
              <View style={styles.modalButtonGroup}>
                {/* 教室長用デモボタン: タップすると入力欄にデモアカウント情報を自動入力 */}
                <TouchableOpacity
                  style={styles.demoButtonMaster}
                  onPress={() => {
                    setStoreIdAndUsername("0000佐藤");
                    setPassword("123456");
                    closeDemoModal();
                  }}
                >
                  <Text style={styles.demoButtonMasterTitle}>
                    🏫 教室長として体験
                  </Text>
                  <Text style={styles.demoButtonSub}>
                    ID: 0000佐藤 / Pass: 123456
                  </Text>
                  <Text style={styles.demoButtonCaption}>
                    全機能・管理者権限でお試し
                  </Text>
                </TouchableOpacity>

                {/* 講師用デモボタン */}
                <TouchableOpacity
                  style={styles.demoButtonTeacher}
                  onPress={() => {
                    setStoreIdAndUsername("0000町田");
                    setPassword("123456");
                    closeDemoModal();
                  }}
                >
                  <Text style={styles.demoButtonTeacherTitle}>
                    👨‍🏫 講師として体験
                  </Text>
                  <Text style={styles.demoButtonSub}>
                    ID: 0000町田 / Pass: 123456
                  </Text>
                  <Text style={styles.demoButtonCaption}>
                    講師権限でお試し
                  </Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    </View>
  );
};
