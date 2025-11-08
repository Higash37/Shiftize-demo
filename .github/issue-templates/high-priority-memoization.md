# 🔴 高優先度: メモ化の拡充

## 現状
- ✅ `React.memo`, `useMemo`, `useCallback`が一部で使用されている（35ファイル）
- ❌ 大きなコンポーネント（`GanttChartMonthView`, `InfoDashboard`）で未使用
- ❌ 頻繁に再レンダリングされる可能性のあるコンポーネントで未適用

## 影響
- 不要な再レンダリングが発生
- ガントチャートなどの重いコンポーネントでパフォーマンス低下

## 推奨改善

### 1. GanttChartMonthView.tsx
```typescript
// フィルタリング結果をメモ化
const memoizedShifts = useMemo(() => {
  return shifts.filter(shift => {
    // フィルタリングロジック
  });
}, [shifts]);

// イベントハンドラをメモ化
const handleShiftPress = useCallback((shift: ShiftItem) => {
  onShiftPress(shift);
}, [onShiftPress]);

// コンポーネント自体をメモ化
export const GanttChartMonthView = React.memo<GanttChartMonthViewProps>(({ ... }) => {
  // ...
});
```

### 2. InfoDashboard.tsx
```typescript
// 集計データをメモ化
const realData = useMemo(() => {
  // 集計ロジック
  return {
    totalHours: 0,
    totalCost: 0,
    // ...
  };
}, [currentMonthShifts, users]);
```

### 3. 頻繁に再レンダリングされるコンポーネント
- `GanttChartRow.tsx`
- `ShiftListItem.tsx`
- `DayComponent.tsx`

## 実装チェックリスト
- [ ] `GanttChartMonthView`のメモ化
- [ ] `InfoDashboard`のメモ化
- [ ] `GanttChartRow`のメモ化
- [ ] `ShiftListItem`のメモ化
- [ ] 再レンダリング回数の削減を確認（React DevTools Profiler）

## 関連Issue
#101

