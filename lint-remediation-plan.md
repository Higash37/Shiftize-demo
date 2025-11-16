# Lint Remediation Plan

最新の `npx eslint src --max-warnings=0` 実行結果（エラー 1004 件 / 231 ファイル）を踏まえ、記法・型・スタイルをエンタープライズ水準へ揃えるための優先度順ガイドです。

## 1. 未使用コードと無効スタイルの一掃
- **対象ルール:** `@typescript-eslint/no-unused-vars`, `react-native/no-unused-styles`
- **主な影響ファイル:** `src/modules/login-view/loginView/LoginForm.tsx`, `src/modules/reusable-widgets/master-shift-management/MasterShiftCreate.tsx`, `src/app/(landing)/_marketing-widgets/components/features-section/FeaturesSection.tsx`, `src/app/(main)/master/_layout.tsx`, `src/app/(main)/user/_layout.tsx`
- **理由:** 546 件の未使用変数・33 件以上の未使用スタイルがバンドル肥大と保守性低下を引き起こし、将来の設計書にも悪影響。まず画面単位で不要コードを削除し、StyleSheet から孤立エントリを外す。
- **Executable step:** 各画面を開き、使っていない hooks/props/スタイルを削除 → `npx eslint src/modules/login-view/loginView/LoginForm.tsx` など個別 lint でゼロ確認 → すべての `src/app/(main)` レイアウトで `styles.*` 参照の有無を再点検。

## 2. `any` 排除と型整備
- **対象ルール:** `@typescript-eslint/no-explicit-any`, `@typescript-eslint/no-empty-object-type`
- **主な影響ファイル:** `src/services/api/api-contracts/api-responses.ts`, `src/services/api/ShiftAPIService.ts`, `src/app/(landing)/AppSpecifications.styles.ts`, `src/app/(landing)/DevelopmentStory.styles.ts`, `src/common/common-ui/ui-layout/*.types.ts`
- **理由:** 364 件の `any` と空 interface が API 契約や UI プロップスの信頼性を損ない、商用化に不可欠な仕様書作成を阻害。まず API レイヤーから厳格な型を作りリークさせる。
- **Executable step:** `src/services/api/api-contracts/api-responses.ts` を出発点に型 alias/interface を定義 → adapters・hooks へインポート → スタイルファイルは `Record<string, ViewStyle>` など具体型へ差し替え。

## 3. `@ts-ignore`/CommonJS 禁止と displayName 追加
- **対象ルール:** `@typescript-eslint/ban-ts-comment`, `@typescript-eslint/no-require-imports`, `react/display-name`
- **主な影響ファイル:** `src/common/common-utils/util-version/AppVersion.ts`, `src/scripts`/`src/services/api/index.ts`, `src/common/common-hooks/usePushNotifications.ts`, `src/modules/reusable-widgets/calendar/*`
- **理由:** 設計書レベルで挙動保証するには、無条件な `@ts-ignore` や `require` は排除する必要がある。匿名コンポーネントは React DevTools で解析しづらく、商用バグ解析が困難。
- **Executable step:** `@ts-ignore`→`@ts-expect-error` へ置換し理由コメントを追加、あるいは型矛盾を解消／ESM import へ書き換え／ `const Foo = () => { ... }; Foo.displayName = 'Foo';`.

## 4. マーケ & テーマ統一
- **対象ルール:** `react/no-unescaped-entities`、テーマカラー未整備（バックログ「Gantt chart UI」「Home view」等）
- **主な影響ファイル:** `src/app/(landing)/_marketing-widgets/Benefits.tsx`, `Testimonials.tsx`, `GanttChartMonthView.styles.ts`, `home-common-screen.css`
- **理由:** マーケティング面は将来の導線で第一印象を左右。文字実体参照の修正ついでに、バックログのテーマカラー統一を同一プルに含めると審査が早い。
- **Executable step:** JSX 内の `"`, `'` をエスケープ → 背景色をテーマトークンへ置換 → Playwright のマーケ画面スモークを実行 (`npx playwright test --project=chromium`).

## 5. CI/自動化で退行防止
- **対応策:** `package.json` に `lint` スクリプト（例: `"lint": "npx eslint src --max-warnings=0"`）を追加し、PR CI で必須化。必要に応じ Husky + lint-staged で pre-commit を導入。
- **レビュー指針:** PR テンプレに lint 実行結果と（UI 変更時は）スクリーンショット添付を義務化することで、「記法揃え」を文化として固定化。

## 推奨進め方
1. **モジュール単位スプリント:** `login view` → `master shift management` → `gantt chart common` → `user-shift-forms` の順にワークフローを切る。
2. **型整備は API から:** API 契約 → adapters → hooks → UI への順で `any` を撲滅。途中で `tsconfig` の `noImplicitAny` を厳格化する。
3. **lint ゼロ確認:** 各スプリント後 `npx eslint src/<target> --max-warnings=0`、最終的にリポジトリ全体で同コマンドをパス。
4. **ドキュメント連携:** このファイルを更新しつつ、完了済み項目に日付を記録すると、将来的な監査／設計書作成が容易になる。
