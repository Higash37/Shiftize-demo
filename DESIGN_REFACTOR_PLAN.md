# デザインリファクタリング計画

## 方針

**Web優先デザイン**に統一する。React Nativeで書いているが、デザインはReact（Web）寄りにしたい。将来のネイティブアプリ展開は考慮しつつ、Web体験を最優先とする。

参考イメージ: Googleカレンダー Web版（PC画面幅を活かした業務ツール型UI）

---

## MD3テーマシステム（確立済み）

### デザイン規則

全画面で以下のMD3パターンに統一する:

| 要素 | 値 |
|------|------|
| コンテナ背景 | `theme.colorScheme.surfaceContainerLowest` |
| カード背景 | `theme.colorScheme.surface` |
| カード角丸 | `theme.shape.small` |
| カード影 | `theme.elevation.level2.shadow` |
| カードpadding | `theme.spacing.xxl` |
| セクションタイトル | `theme.typography.titleMedium`, `fontWeight: "700"` |
| デスクトップmaxWidth | `1400` |
| タブレットmaxWidth | `1000` |
| コンテナ中央寄せ | `alignSelf: "center"`, `width: "100%"` |

### スタイルファクトリ署名

```typescript
export const createXxxStyles = (
  theme: MD3Theme,
  breakpoint: { isMobile: boolean; isTablet: boolean; isDesktop: boolean }
) => StyleSheet.create({ ... });
```

### レスポンシブ（Breakpoints.ts 確立済み）

```typescript
import { useBreakpoint } from "@/common/common-constants/Breakpoints";

const bp = useBreakpoint(); // { isMobile, isTablet, isDesktop }
```

### テーマ使用パターン

```typescript
const theme = useMD3Theme();
const bp = useBreakpoint();
const styles = useMemo(
  () => createXxxStyles(theme, bp),
  [theme, bp]
);
```

---

## 完了済みリファクタリング

### 1. 経営ダッシュボード（InfoDashboard）— 全面リデザイン

**ファイル**:
- `src/modules/master-view/info-dashboard/InfoDashboard.tsx` — 全面書き換え
- `src/modules/master-view/info-dashboard/InfoDashboard.styles.ts` — 新規作成
- `src/app/(main)/master/info.tsx` — MD3テーマ化

**変更内容**:
- 5タブ構成を廃止 → 1画面スクロールに統合
- 旧 `colors`/`layout`/`shadows` 定数を全削除 → MD3テーマ化
- スタッフ別データをFlatListグリッド表示（モバイル1列、タブレット3列、デスクトップ5列）
- Wrapper/Content パターン導入（auth解決後にContentマウント → hooks が loading=true の初期状態から開始、ナビゲーション時のデータ表示問題を解決）
- `info.tsx` の `colors.background` → `theme.colorScheme.surfaceContainerLowest` に移行

**統合セクション（1画面）**:
1. 月間サマリーカード（総稼働時間・総人件費・予算使用率）
2. スタッフ別稼働状況（レスポンシブグリッド）
3. 予算 vs 実績（予算・実績・残予算 + プログレスバー）
4. コスト内訳（固定費・変動費・残業代のバー）
5. 効率指標（時間あたりコスト・スタッフあたり・予算効率）

**削除ファイル（5タブコンポーネント）**:
- `analytics-widgets/StaffEfficiencyTab.tsx`
- `analytics-widgets/CostAnalysisTab.tsx`
- `analytics-widgets/ShiftMetricsTab.tsx`
- `analytics-widgets/ProductivityTab.tsx`
- `analytics-widgets/TrendAnalysisTab.tsx`
- `analytics-widgets/index.ts` → BudgetSectionのみエクスポートに更新

### 2. MasterDashboardView — 簡素化 + MD3化

**ファイル**:
- `src/modules/master-view/masterDashboard/MasterDashboardView.tsx`
- `src/modules/master-view/masterDashboard/MasterDashboardView.styles.ts`

**変更内容**:
- 削除済み「タスク管理」リンクを削除
- ハードコード `#4caf50` 削除
- `useThemedStyles` → `useMemo` + `useBreakpoint()` パターンに統一
- スタイルファクトリをbreakpointオブジェクト署名に変更
- `surfaceContainerLowest` 背景、レスポンシブ maxWidth/padding

### 3. SettingsIndexView — 準備中項目削除

**ファイル**:
- `src/modules/master-view/master-view-settings/SettingsIndexView.tsx`
- `src/modules/master-view/master-view-settings/SettingsIndexView.styles.ts`

**変更内容**:
- 9項目中7つの「準備中」項目を削除（シフトルール、祝日・特別日、外観、シフトステータス、タスク管理、バックアップ・復元、詳細設定）
- 残り2項目のみ: アカウント連携、アプリバージョン管理
- 不要スタイル削除（`disabledItem`, `disabledText`, `previewBadge`, `comingSoonBadge`）
- `surfaceContainerLowest` 背景、レスポンシブ maxWidth 追加

### 4. LoginForm — breakpointパターン統一

**ファイル**:
- `src/modules/login-view/loginView/LoginForm.tsx`
- `src/modules/login-view/loginView/LoginForm.styles.ts`

**変更内容**:
- `useWindowDimensions` + 独自ブレークポイント計算を削除 → `useBreakpoint()` に統一
- `useThemedStyles` → `useMemo` + `useBreakpoint()` パターンに変更
- スタイルファクトリを `(theme, breakpoint)` 署名に変更
- レスポンシブロジック（container/formCard）をスタイルファクトリ内に統合
- JSX側の条件付きスタイル配列を削除
- インラインスタイル `{{ padding: 4 }}` → `styles.modalCloseButton` に抽出

### 5. 設定画面（ユーザー側） — MD3 + Web設定ページ風

**ファイル**:
- `src/app/(main)/user/settings.tsx`

**変更内容**:
- `useThemedStyles` → `useMemo` + `useBreakpoint()` パターンに変更
- スタイルファクトリを `(theme, breakpoint)` 署名に変更
- 背景色: `surface` → `surfaceContainerLowest`（MD3規則準拠）
- カード: `surfaceContainerLow` → `surface` + `elevation.level2.shadow`（MD3カードパターン準拠）
- セクションタイトル: `labelMedium` + uppercase → `titleMedium` + fontWeight 700（MD3規則準拠）
- JSX側の `isDesktop` 条件分岐をスタイルファクトリ内に統合

### 6. ウェルカム画面 — Platform.OS排除

**ファイル**:
- `src/modules/welcome-module/WelcomeScreen.tsx`

**変更内容**:
- `Platform.OS === "web"` 分岐4箇所を全削除（Web優先のためデフォルト値に統一）
- `useThemedStyles` → `useMemo` + `useBreakpoint()` パターンに変更
- スタイルファクトリを `(theme, breakpoint)` 署名に変更
- 背景色: `surface` → `surfaceContainerLowest`
- `Platform` importを削除
- `buttonContainerDesktop` スタイルをファクトリ内に統合

### 7. ログイン画面ヘッダー — breakpointパターン統一

**ファイル**:
- `src/app/(auth)/login/index.tsx`

**変更内容**:
- `useThemedStyles` → `useMemo` + `useBreakpoint()` パターンに変更
- スタイルファクトリを `(theme, breakpoint)` 署名に変更
- JSX側の `isCompact` 条件付きスタイル配列を削除 → スタイルファクトリ内で `isCompact` 計算
- `headerCompact`, `headerTitleCompact`, `headerSubtitleCompact` を本体スタイルに統合
- 背景色: `surface` → `surfaceContainerLowest`
- 不要な `elevation.level0.shadow` を削除

### 8. ランディングページ — レスポンシブ化

**ファイル**:
- `src/app/(landing)/_marketing-widgets/SimpleLanding.tsx`
- `src/app/(landing)/_marketing-widgets/SimpleLanding.styles.ts`

**変更内容**:
- `useThemedStyles` → `useMemo` + `useBreakpoint()` パターンに変更
- スタイルファクトリを `(theme, breakpoint)` 署名に変更
- サイドバー幅: `leftSidebarTablet`/`rightSidebarTablet` を削除 → `sidebarWidth` 変数でファクトリ内統合
- Final CTA セクション: padding/font-sizeをbreakpointでレスポンシブ化（デスクトップ/タブレット/モバイル）
- JSX側の `isTablet &&` 条件付きスタイル配列を削除

---

## 技術メモ

### Wrapper/Content パターン（auth + データフック問題の解決策）

`useAuth()` は独立した状態を持つため、コンポーネント再マウント時に `user=null` → `storeId=undefined` → データフックが即座に `loading=false`/空データを返す → 「データなし」画面が表示される問題がある。

**解決策**: auth解決を待つWrapperと、storeIdを受け取るContentに分離:

```tsx
export const InfoDashboard: React.FC = () => {
  const { user, loading: authLoading } = useAuth();

  if (authLoading || !user?.storeId) {
    return <Loading />;
  }

  return <InfoDashboardContent storeId={user.storeId} />;
};

const InfoDashboardContent: React.FC<{ storeId: string }> = ({ storeId }) => {
  // hooks start fresh with loading=true
  const { shifts, loading } = useShiftsRealtime(storeId);
  // ...
};
```

他のページ（gantt-view, this-monthなど）はデータが空でもUIを表示するため、この問題が顕在化しない。「データなし」画面を持つコンポーネントではこのパターンを使う。

---

## 参考ファイル（良い例）

- `src/modules/master-view/info-dashboard/InfoDashboard.tsx` → Wrapper/Content + MD3 + レスポンシブグリッド
- `src/modules/master-view/info-dashboard/InfoDashboard.styles.ts` → MD3スタイルファクトリテンプレート
- `src/modules/master-view/masterDashboard/MasterDashboardView.tsx` → useMemo + useBreakpoint パターン
- `src/common/common-constants/Breakpoints.ts` → レスポンシブフック
