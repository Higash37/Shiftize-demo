# LIFF (LINE Front-end Framework) 実装状況レポート

最終更新: 2026-01-12

## 📋 概要

LINE内でシフトを簡単に追加できる「クイックシフトURL」機能の実装を進めています。
マスター権限のユーザーがURLを発行し、従業員がLINEからタップするだけでシフトを追加できる機能です。

---

## ✅ 完了した作業

### 1. LIFF Layout ファイルの作成
- **ファイル**: `src/app/(liff)/_layout.tsx`
- **目的**: Expo Routerが LIFF ページを認識・ビルドするために必要
- **実装内容**: Stack navigatorで `quick-add` と `quick-recruit` 画面を定義

### 2. Firebase Hosting 設定
- **ファイル**: `firebase.json`
- **追加内容**:
  ```json
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [{"source": "**", "destination": "/index.html"}],
    "site": "shiftschedulerapp-71104"
  }
  ```
- **デプロイ成功**: https://shiftschedulerapp-71104.web.app/

### 3. LIFF パラメータ抽出の実装
- **問題**: URLパラメータが `liff.state` に格納されるため、直接取得できなかった
- **解決**: `liff.state` から URLデコード → パラメータ抽出
- **実装箇所**: `quick-add.tsx`, `quick-recruit.tsx`

### 4. Firestore Timestamp 変換の修正
- **問題**: Firestore Timestamp オブジェクトを Date に変換していなかった
- **エラー**: "トークン検証中にエラーが起きた"
- **解決**: `QuickShiftTokenService.ts` で `.toDate()` メソッドを使用
  ```typescript
  expiresAt: data.expiresAt?.toDate ? data.expiresAt.toDate() : new Date(data.expiresAt)
  ```

### 5. Firebase 匿名認証の実装
- **問題**: "FirebaseError: Missing or insufficient permissions"
- **原因**: LIFF ユーザーが Firebase に認証されていない状態で Firestore にアクセス
- **解決**: `signInAnonymously(auth)` による匿名認証を追加
- **設定確認**: Firebase Console で Anonymous 認証が有効化済み

### 6. 認証タイミングの制御（最終修正）
- **問題**: 匿名認証の完了前にトークン検証が実行されていた
- **解決**: `firebaseAuthReady` state を追加し、認証完了を待つ
  ```typescript
  const [firebaseAuthReady, setFirebaseAuthReady] = useState(false);

  // 認証完了後に true を設定
  await signInAnonymously(auth);
  setFirebaseAuthReady(true);

  // useEffect で認証完了を待つ
  useEffect(() => {
    if (!liffInitialized || !firebaseAuthReady || !token) return;
    // トークン検証処理...
  }, [liffInitialized, firebaseAuthReady, token]);
  ```

---

## 🐛 現在のエラー状況

### エラー: "LINE初期化に失敗しました"

**発生タイミング**: LIFF URL を LINE で開いたとき

**考えられる原因**:
1. **LIFF ID の問題**
   - LIFF ID: `2008790644-5SoBzRPY`
   - LINE Developers Console で正しく設定されているか確認が必要

2. **LIFF アプリの設定**
   - Endpoint URL が正しく設定されているか
   - 想定 URL: `https://shiftschedulerapp-71104.web.app/quick-add`

3. **ブラウザ環境の問題**
   - LIFF SDK が LINE 内ブラウザで正しく動作しているか
   - `Platform.OS === "web"` の判定が正しく機能しているか

4. **Dynamic Import の問題**
   - `await import("@line/liff")` が失敗している可能性
   - パッケージのビルド設定に問題がある可能性

**エラーの詳細情報**:
- 具体的なエラーメッセージ（error.md が見つからず詳細不明）
- コンソールログの内容が必要

---

## 🔍 次に確認すべきこと

### 1. LINE Developers Console の設定確認
```
LIFF アプリ設定:
- LIFF ID: 2008790644-5SoBzRPY
- Endpoint URL: https://shiftschedulerapp-71104.web.app/quick-add（quick-recruitも）
- Scope: openid, profile
- Bot link feature: 有効/無効
```

### 2. ブラウザコンソールのエラーログ
LINE 内ブラウザで開いた際の詳細なエラーメッセージを確認:
- Chrome DevTools (Remote debugging)
- Safari Web Inspector (iOS)
- LIFF Inspector (LINE公式デバッグツール)

### 3. LIFF SDK のバージョン確認
```bash
npm list @line/liff
```
- 最新バージョンとの互換性確認
- 必要に応じてアップデート

### 4. ビルド設定の確認
- Expo/Metro bundler が LIFF SDK を正しく処理しているか
- `metro.config.js` の設定確認

### 5. エラーハンドリングの強化
`quick-add.tsx` と `quick-recruit.tsx` のエラーハンドリング:
```typescript
try {
  const liff = (await import("@line/liff")).default;
  await liff.init({ liffId: "2008790644-5SoBzRPY" });
  console.log("LIFF initialized successfully");
} catch (err) {
  console.error("LIFF initialization error:", err);
  console.error("Error details:", JSON.stringify(err, null, 2));
  setError(`LIFF初期化に失敗しました: ${err instanceof Error ? err.message : "不明なエラー"}`);
}
```

---

## 📁 関連ファイル

### LIFF 画面
- `src/app/(liff)/_layout.tsx` - LIFF レイアウト
- `src/app/(liff)/quick-add.tsx` - フリー入力型シフト追加
- `src/app/(liff)/quick-recruit.tsx` - 募集シフト選択型

### サービス層
- `src/services/quick-shift/QuickShiftTokenService.ts` - トークン管理
- `src/services/quick-shift/QuickShiftLIFFService.ts` - LIFF URL生成

### マスター画面
- `src/app/(tabs)/master/index.tsx` - マスター画面（URL発行機能）

### 設定ファイル
- `firebase.json` - Firebase Hosting 設定
- `firestore.rules` - Firestore Security Rules（匿名認証対応）

---

## 🎯 実装の目標

### Phase 1: 基本機能（現在のフェーズ）
- [x] LIFF ページの作成
- [x] Firebase Hosting デプロイ
- [x] トークン生成・検証機能
- [x] Firebase 匿名認証
- [ ] **LIFF 初期化の安定化** ← 現在ここ
- [ ] 本番環境での動作確認

### Phase 2: ユーザー体験の向上
- [ ] エラーメッセージの改善
- [ ] ローディング状態の最適化
- [ ] 成功時のフィードバック（LINE メッセージ送信）

### Phase 3: 機能拡張
- [ ] トークンの使用回数制限
- [ ] トークンの有効期限表示
- [ ] シフト追加履歴の記録

---

## 💡 技術的な学び

### 1. Expo Router のファイルベースルーティング
- `(liff)` のような括弧付きフォルダはルートグループを作成
- `_layout.tsx` がないとルートが認識されない

### 2. LIFF のパラメータ管理
- URL パラメータは `liff.state` クエリパラメータに格納される
- デコードとパース処理が必要: `decodeURIComponent(liffState)`

### 3. Firestore Timestamp の扱い
- Firestore から取得したタイムスタンプは特殊オブジェクト
- `.toDate()` メソッドで JavaScript Date に変換が必須

### 4. Firebase Security Rules と匿名認証
- Firestore Security Rules で `request.auth != null` を使用
- 匿名認証により、LIFF ユーザーも認証状態になる
- 認証のタイミング制御が重要（非同期処理の完了を待つ）

### 5. Dynamic Import の活用
- LIFF SDK は Web 専用のため、dynamic import が必須
- `Platform.OS` による環境判定と組み合わせ

---

## 📊 Git ブランチ状況

- **作業ブランチ**: `feature/quick-shift-url`
- **最新コミット**: "feat: クイックシフトURL機能を実装 (#新機能) (#121)"
- **マージ状況**: PR #121 として main ブランチにマージ済み

---

## 🔄 次のアクション

1. **エラーログの収集**
   - LINE 内ブラウザのコンソールログをキャプチャ
   - エラーの詳細情報を取得

2. **LINE Developers Console の設定確認**
   - LIFF アプリの Endpoint URL 確認
   - 必要に応じて修正

3. **デバッグビルドのデプロイ**
   - 詳細なエラーログを出力するバージョンをデプロイ
   - LIFF Inspector での動作確認

4. **動作確認**
   - 実機でのテスト（iOS/Android 両方）
   - エラーが解決したら本番環境での最終確認

---

## 📝 メモ

- Firebase 匿名認証は有効化済み
- LIFF ID: `2008790644-5SoBzRPY`
- Deploy URL: https://shiftschedulerapp-71104.web.app/
- Firestore Security Rules は匿名ユーザーの読み取りを許可済み

---

## ⚠️ 注意事項

### セキュリティ
- トークンの有効期限チェックは実装済み
- 匿名認証でも Firestore Security Rules による保護は有効
- トークンは一度使用したら無効化される仕組みが必要（今後実装）

### パフォーマンス
- LIFF SDK の初期化は非同期処理のため、ローディング状態の管理が重要
- Firebase 認証も非同期のため、適切な待機処理が必須

### ユーザー体験
- エラーメッセージは日本語でわかりやすく
- ローディング中の UI フィードバックを提供
- 成功時には LINE 内で完結するフィードバックを検討
