# 🟡 中優先度: バンドルサイズの最適化

## 現状
- ⚠️ 依存関係が多い（`package.json`に多数のパッケージ）
- ❌ 未使用の依存関係の確認が行われていない
- ❌ Tree shakingの効果が不明

## 影響
- バンドルサイズが大きい
- 初回ロード時間が長い

## 推奨改善

### 1. 未使用の依存関係の確認
```bash
# 未使用の依存関係を確認
npx depcheck

# 結果を確認して、不要な依存関係を削除
npm uninstall <package-name>
```

### 2. バンドルサイズの分析
```bash
# ソースマップを生成
npx expo export --dump-sourcemap

# バンドルサイズの可視化
npx source-map-explorer dist/_expo/static/js/web/*.js
```

### 3. Tree shakingの確認
- `package.json`の`sideEffects`フィールドを確認
- 動的インポートの活用
- 必要な部分のみをインポート

## 実装チェックリスト
- [ ] `depcheck`で未使用依存関係を確認
- [ ] 不要な依存関係を削除
- [ ] バンドルサイズの分析を実施
- [ ] Tree shakingの効果を確認
- [ ] バンドルサイズの削減を確認

## 関連Issue
#101

