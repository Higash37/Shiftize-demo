# 🔴 高優先度: コード分割・遅延読み込みの実装

## 現状
- ❌ 動的インポート（`React.lazy`）が使用されていない
- ❌ 大きなコンポーネント（`GanttChartMonthView.tsx` 1000行超）が一括読み込み
- ⚠️ ランディングページのマーケティングウィジェットが即座に読み込まれる

## 影響
- 初期バンドルサイズが大きい
- 初回ロード時間が長い
- 不要なコードが即座に読み込まれる

## 推奨改善

### 1. ランディングページのマーケティングウィジェット
```typescript
// src/app/(landing)/home.tsx
const Features = React.lazy(() => import('./_marketing-widgets/Features'));
const Screenshots = React.lazy(() => import('./_marketing-widgets/Screenshots'));
const Hero = React.lazy(() => import('./_marketing-widgets/Hero'));

// Suspenseでラップ
<Suspense fallback={<LoadingSpinner />}>
  <Features />
  <Screenshots />
  <Hero />
</Suspense>
```

### 2. 大きなモーダルコンポーネント
- `EditShiftModalView.tsx`
- `AddShiftModalView.tsx`
- `PayrollDetailModal.tsx`

### 3. マスタービューの重いコンポーネント
- `GanttChartMonthView.tsx`
- `InfoDashboard.tsx`

## 実装チェックリスト
- [ ] ランディングページのマーケティングウィジェットを遅延読み込み
- [ ] 大きなモーダルコンポーネントを遅延読み込み
- [ ] マスタービューの重いコンポーネントを遅延読み込み
- [ ] SuspenseのフォールバックUIを実装
- [ ] バンドルサイズの改善を確認

## 関連Issue
#101

