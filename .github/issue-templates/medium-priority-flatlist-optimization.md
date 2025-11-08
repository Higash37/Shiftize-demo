# 🟡 中優先度: FlatList最適化の統一

## 現状
- ✅ `getOptimizedFlatListProps`でプラットフォーム別最適化が実装済み
- ⚠️ `GanttChartBody.tsx`で一部最適化設定がハードコードされている
- ❌ すべてのFlatListで最適化設定が適用されていない

## 影響
- 大きなリストでのスクロールパフォーマンスが不安定

## 推奨改善

### 1. すべてのFlatListで統一的な最適化設定を適用
```typescript
// src/modules/reusable-widgets/gantt-chart/gantt-chart-common/GanttChartBody.tsx
import { getOptimizedFlatListProps } from '@/common/common-utils/performance/webOptimization';

<FlatList
  {...getOptimizedFlatListProps()}
  ref={flatListRef}
  data={data}
  onScroll={handleScroll}
  scrollEventThrottle={16}
  // ... その他のprops
/>
```

### 2. 対象コンポーネント
- `GanttChartBody.tsx`
- `ShiftListView.tsx`
- `ShiftList.tsx`
- その他のFlatListを使用しているコンポーネント

## 実装チェックリスト
- [ ] `GanttChartBody.tsx`の最適化設定を統一
- [ ] `ShiftListView.tsx`の最適化設定を適用
- [ ] `ShiftList.tsx`の最適化設定を適用
- [ ] その他のFlatListコンポーネントを確認・修正
- [ ] スクロールパフォーマンスの改善を確認

## 関連Issue
#101

