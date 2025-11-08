# フォルダ構成・ルーティング構造分析レポート

**分析日**: 2025-01-27  
**目的**: コード分割・遅延読み込み実装のための構造理解

---

## 📁 全体構造

### 1. Expo Routerベースのルーティング構造

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

## 🎯 コード分割対象の分析

### 1. ランディングページ (`src/app/(landing)/`)

#### 現在の構造
```
(landing)/
├── home.tsx                       # SimpleLandingを直接インポート
└── _marketing-widgets/
    ├── SimpleLanding.tsx          # メインコンポーネント
    ├── SimpleLanding.data.ts      # データ分離 ✅
    ├── SimpleLanding.styles.ts    # スタイル分離 ✅
    ├── SimpleLanding.types.ts     # 型分離 ✅
    ├── components/                # セクションコンポーネント
    │   ├── hero-section/
    │   ├── features-section/
    │   ├── social-proof-section/
    │   ├── security-section/
    │   └── interactive-demo-section/
    ├── Hero.tsx
    ├── Features.tsx
    ├── Screenshots.tsx
    └── DemoModal.tsx
```

#### 現在のインポートパターン
```typescript
// SimpleLanding.tsx
import { HeroSection } from "./components/hero-section";
import { SocialProofSection } from "./components/social-proof-section";
import { FeaturesSection } from "./components/features-section";
import { SecuritySection } from "./components/security-section";
import { InteractiveDemoSection } from "./components/interactive-demo-section";
```

**問題点**:
- ❌ すべてのセクションコンポーネントが即座に読み込まれる
- ❌ 初期バンドルサイズが大きい
- ✅ データ/型/スタイルの分離は実装済み（良いパターン）

**改善案**:
```typescript
// SimpleLanding.tsx に遅延読み込みを追加
const HeroSection = React.lazy(() => import("./components/hero-section"));
const SocialProofSection = React.lazy(() => import("./components/social-proof-section"));
const FeaturesSection = React.lazy(() => import("./components/features-section"));
const SecuritySection = React.lazy(() => import("./components/security-section"));
const InteractiveDemoSection = React.lazy(() => import("./components/interactive-demo-section"));
```

---

### 2. モーダルコンポーネント (`src/modules/reusable-widgets/gantt-chart/view-modals/`)

#### 現在の構造
```
gantt-chart/
├── GanttChartMonthView.tsx        # 大きなコンポーネント（1000行超）
└── view-modals/
    ├── EditShiftModalView.tsx     # 編集モーダル
    ├── AddShiftModalView.tsx      # 追加モーダル
    ├── PayrollDetailModal.tsx     # 給与詳細モーダル
    ├── BatchConfirmModal.tsx      # 一括承認モーダル
    ├── ShiftHistoryModal.tsx      # シフト履歴モーダル
    └── MobileShiftModal.tsx       # モバイル用モーダル
```

#### 現在のインポートパターン
```typescript
// GanttChartMonthView.tsx
import { EditShiftModalView } from "./view-modals/EditShiftModalView";
import { AddShiftModalView } from "./view-modals/AddShiftModalView";
import { PayrollDetailModal } from "./view-modals/PayrollDetailModal";
import BatchConfirmModal from "./view-modals/BatchConfirmModal";
import { ShiftHistoryModal } from "./view-modals/ShiftHistoryModal";
```

**問題点**:
- ❌ モーダルが表示されない場合でもコードが読み込まれる
- ❌ モーダルは条件付きで表示されるため、遅延読み込みが有効

**改善案**:
```typescript
// モーダルを遅延読み込み
const EditShiftModalView = React.lazy(() => import("./view-modals/EditShiftModalView"));
const AddShiftModalView = React.lazy(() => import("./view-modals/AddShiftModalView"));
const PayrollDetailModal = React.lazy(() => import("./view-modals/PayrollDetailModal"));
```

---

### 3. マスタービューの重いコンポーネント

#### GanttChartMonthView.tsx
- **場所**: `src/modules/reusable-widgets/gantt-chart/GanttChartMonthView.tsx`
- **サイズ**: 1000行超
- **使用箇所**: 
  - `src/app/(main)/master/gantt-view.tsx` → `GanttViewView.tsx` → `GanttChartMonthView.tsx`
  - `src/app/(main)/master/gantt-edit.tsx`

**問題点**:
- ❌ ガントチャート画面にアクセスしない場合でも読み込まれる可能性
- ❌ 非常に大きなコンポーネント

**改善案**:
```typescript
// gantt-view.tsx または gantt-edit.tsx で遅延読み込み
const GanttChartMonthView = React.lazy(() => 
  import("@/modules/reusable-widgets/gantt-chart/GanttChartMonthView")
);
```

#### InfoDashboard.tsx
- **場所**: `src/modules/master-view/info-dashboard/InfoDashboard.tsx`
- **使用箇所**: `src/app/(main)/master/info.tsx`

**現在のインポートパターン**:
```typescript
// InfoDashboard.tsx
import {
  BudgetSection,
  StaffEfficiencyTab,
  CostAnalysisTab,
  ShiftMetricsTab,
  ProductivityTab,
  TrendAnalysisTab,
} from "./analytics-widgets";
```

**問題点**:
- ❌ すべての分析ウィジェットが即座に読み込まれる
- ❌ タブで切り替えられるため、初期表示されないタブも読み込まれる

**改善案**:
```typescript
// タブコンテンツを遅延読み込み
const StaffEfficiencyTab = React.lazy(() => import("./analytics-widgets/StaffEfficiencyTab"));
const CostAnalysisTab = React.lazy(() => import("./analytics-widgets/CostAnalysisTab"));
// ...
```

---

## 📊 ファイルの意味分けパターン

### ✅ 良いパターン（実装済み）

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

### ⚠️ 改善の余地があるパターン

1. **モーダルの即座読み込み**
   - モーダルは条件付き表示のため、遅延読み込みが有効

2. **大きなコンポーネントの一括読み込み**
   - `GanttChartMonthView.tsx`（1000行超）が即座に読み込まれる

3. **タブコンテンツの一括読み込み**
   - `InfoDashboard.tsx`で全タブが即座に読み込まれる

---

## 🎯 コード分割の優先順位

### 🔴 最優先（即座に実施）

1. **ランディングページのセクションコンポーネント**
   - `SimpleLanding.tsx`のセクションコンポーネント
   - 影響: 初期バンドルサイズの大幅削減

2. **モーダルコンポーネント**
   - `GanttChartMonthView.tsx`内のモーダル
   - 影響: モーダルが表示されない場合のコード削減

### 🟡 中優先度

3. **ガントチャートビュー**
   - `GanttChartMonthView.tsx`自体の遅延読み込み
   - 影響: ガントチャート画面にアクセスしない場合のコード削減

4. **InfoDashboardのタブコンテンツ**
   - 各タブコンテンツの遅延読み込み
   - 影響: 初期表示されないタブのコード削減

---

## 📝 実装時の注意点

1. **SuspenseのフォールバックUI**
   - 各遅延読み込みコンポーネントに適切なローディングUIを実装

2. **エラーバウンダリ**
   - 遅延読み込みコンポーネントのエラーハンドリング

3. **型安全性**
   - TypeScriptの型定義を維持

4. **既存のパターンとの整合性**
   - データ/型/スタイルの分離パターンを維持

---

## 🔗 関連ファイル

- `src/app/(landing)/home.tsx` - ランディングページエントリー
- `src/app/(landing)/_marketing-widgets/SimpleLanding.tsx` - メインコンポーネント
- `src/modules/reusable-widgets/gantt-chart/GanttChartMonthView.tsx` - 大きなコンポーネント
- `src/modules/master-view/info-dashboard/InfoDashboard.tsx` - ダッシュボード
- `src/app/(main)/master/gantt-view.tsx` - ガントチャートビューのエントリー

