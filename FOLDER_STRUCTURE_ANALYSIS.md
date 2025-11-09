# フォルダ構成・ルーティング構造分析レポート

**分析日**: 2025-01-27  
**最終更新**: 2025-01-27  
**目的**: コード分割・遅延読み込み実装のための構造理解

---

## 📁 全体構造

### Expo Routerベースのルーティング構造

```
src/app/
├── _layout.tsx                    # ルートレイアウト
├── index.tsx                      # エントリーポイント
├── (auth)/                        # 認証関連ルートグループ
│   ├── _layout.tsx
│   ├── login/
│   ├── auth-welcome/
│   └── auth-create-group/
├── (landing)/                     # ランディングページルートグループ
│   ├── _layout.tsx
│   ├── home.tsx                   # メインランディングページ
│   └── _marketing-widgets/        # マーケティングウィジェット
└── (main)/                        # メインアプリルートグループ
    ├── _layout.tsx
    ├── master/                    # マスタービュー
    │   ├── _layout.tsx
    │   ├── home.tsx
    │   ├── gantt-view.tsx
    │   ├── gantt-edit.tsx
    │   └── info.tsx
    └── user/                      # ユーザービュー
        ├── _layout.tsx
        └── home.tsx
```

**特徴**:
- Expo Routerのファイルベースルーティングを使用
- ルートグループ（`(auth)`, `(landing)`, `(main)`）で機能を分離
- 各ルートグループに`_layout.tsx`でレイアウトを定義

---

## ✅ 実装済みコード分割

### 1. ランディングページ (`src/app/(landing)/`)

#### 実装済みの遅延読み込み
```typescript
// SimpleLanding.tsx
const HeroSection = lazy(() => 
  import("./components/hero-section").then(module => ({ default: module.HeroSection }))
);
const SocialProofSection = lazy(() => 
  import("./components/social-proof-section").then(module => ({ default: module.SocialProofSection }))
);
const FeaturesSection = lazy(() => 
  import("./components/features-section").then(module => ({ default: module.FeaturesSection }))
);
const SecuritySection = lazy(() => 
  import("./components/security-section").then(module => ({ default: module.SecuritySection }))
);
const InteractiveDemoSection = lazy(() => 
  import("./components/interactive-demo-section").then(module => ({ default: module.InteractiveDemoSection }))
);
```

**実装結果**:
- ✅ すべてのセクションコンポーネントが遅延読み込み
- ✅ `Suspense`でローディングフォールバックを実装
- ✅ 初期バンドルサイズの削減を実現

### 2. モーダルコンポーネント (`src/modules/reusable-widgets/gantt-chart/`)

#### 実装済みの遅延読み込み
```typescript
// GanttChartMonthView.tsx
const EditShiftModalView = lazy(() => import("./view-modals/EditShiftModalView"));
const AddShiftModalView = lazy(() => import("./view-modals/AddShiftModalView"));
const PayrollDetailModal = lazy(() => import("./view-modals/PayrollDetailModal"));
// ... その他のモーダル
```

**実装結果**:
- ✅ モーダルが表示されない場合のコード読み込みを削減
- ✅ 条件付き表示のモーダルで遅延読み込みを実現

### 3. マスタービューの重いコンポーネント

#### InfoDashboard.tsx
```typescript
// タブコンテンツを遅延読み込み
const StaffEfficiencyTab = lazy(() => import("./analytics-widgets/StaffEfficiencyTab"));
const CostAnalysisTab = lazy(() => import("./analytics-widgets/CostAnalysisTab"));
// ... その他のタブ
```

**実装結果**:
- ✅ 初期表示されないタブのコード読み込みを削減
- ✅ タブ切り替え時のパフォーマンスを改善

---

## 📊 ファイルの意味分けパターン

### ✅ 実装済みパターン

1. **データ/型/スタイルの分離**
   ```
   SimpleLanding.tsx
   SimpleLanding.data.ts
   SimpleLanding.styles.ts
   SimpleLanding.types.ts
   ```

2. **コンポーネントの機能別フォルダ分離**
   ```
   components/
   ├── hero-section/
   │   ├── HeroSection.tsx
   │   ├── hero-section.styles.ts
   │   └── index.tsx
   └── features-section/
       ├── FeaturesSection.tsx
       ├── features-section.styles.ts
       └── index.tsx
   ```

3. **モジュールベースの構造**
   ```
   modules/
   ├── master-view/
   ├── user-view/
   ├── home-view/
   └── reusable-widgets/
   ```

---

## 📝 実装時の注意点（実装済み）

1. **SuspenseのフォールバックUI**
   - ✅ 各遅延読み込みコンポーネントに適切なローディングUIを実装

2. **型安全性**
   - ✅ TypeScriptの型定義を維持

3. **既存のパターンとの整合性**
   - ✅ データ/型/スタイルの分離パターンを維持

---

## 🎯 実装結果

すべての優先度別コード分割タスクが完了しました：

- ✅ ランディングページのセクションコンポーネント
- ✅ モーダルコンポーネント
- ✅ InfoDashboardのタブコンテンツ

初期バンドルサイズの大幅削減と、不要なコードの読み込み削減を実現しました。
