import type {
  ArchitectureSections,
  FeatureSpecification,
  MaterialIconGlyph,
  SecuritySpecification,
  TabDefinition,
  TechnicalSpecification,
} from "./AppSpecifications.types";

export const tabs: TabDefinition[] = [
  { id: "architecture", label: "システム構成", icon: "architecture" as MaterialIconGlyph },
      { id: "features", label: "機能仕様", icon: "features" as MaterialIconGlyph },
      { id: "security", label: "セキュリティ", icon: "security" as MaterialIconGlyph },
      { id: "technical", label: "技術詳細", icon: "code" as MaterialIconGlyph },
];

export const architectureData: ArchitectureSections = {
  frontend: {
        title: "フロントエンド",
        items: [
          {
            name: "React Native",
            version: "0.74+",
            description: "クロスプラットフォーム開発フレームワーク",
          },
          {
            name: "Expo Router",
            version: "v3",
            description: "ファイルベースルーティングシステム",
          },
          {
            name: "TypeScript",
            version: "5.0+",
            description: "型安全性を提供する静的型付けJavaScript",
          },
          {
            name: "React Native Web",
            version: "latest",
            description: "Web対応のクロスプラットフォーム機能",
          },
        ],
      },
      backend: {
        title: "バックエンド・データベース",
        items: [
          {
            name: "Supabase",
            version: "v2",
            description: "PostgreSQLベースのBaaS（認証・DB・ストレージ統合）",
          },
        ],
      },
      tools: {
        title: "開発ツール・ライブラリ",
        items: [
          {
            name: "React Native Vector Icons",
            version: "latest",
            description: "アイコンライブラリ",
          },
          {
            name: "React Hook Form",
            version: "v7",
            description: "フォーム管理ライブラリ",
          },
          {
            name: "Crypto-JS",
            version: "v4",
            description: "AES-256暗号化ライブラリ",
          },
          {
            name: "date-fns",
            version: "v2",
            description: "日付操作ユーティリティ",
          },
        ],
      },
};

export const featuresData: FeatureSpecification[] = [
  {
        category: "シフト管理機能",
        description: "ガントチャートによる視覚的シフト管理",
        specifications: [
          "時間範囲: 9:00-22:00 または 13:00-22:00 (切り替え可能)",
          "最小単位: 15分刻みでの時間設定",
          "重複チェック: 同一ユーザーの重複シフト自動検出",
          "ステータス管理: 基本3段階のシフトステータス (申請中→承認済み→完了)",
          "ドラッグ&ドロップ: 直感的なシフト編集操作",
        ],
      },
      {
        category: "権限管理システム",
        description: "ロールベースアクセス制御 (RBAC)",
        specifications: [
          "Master権限: 全機能アクセス・ユーザー管理・シフト承認",
          "User権限: 自分のシフト管理・タスク報告のみ",
          "セッション管理: 自動ログアウト・セッション有効期限",
          "アクセス制御: 画面・API レベルでの権限チェック",
          "データ分離: 店舗別データの完全分離",
        ],
      },
      {
        category: "給与計算機能",
        description: "塾特化の複雑な給与計算システム",
        specifications: [
          "授業時間除外: シフト時間から授業時間を自動除外",
          "時給設定: ユーザー別時給設定 (デフォルト1,100円)",
          "月間予算: 月間50万円のデフォルト予算設定",
          "計算精度: 分単位での正確な給与計算",
          "レポート出力: CSV・Excel形式でのデータエクスポート",
        ],
      },
      {
        category: "リアルタイム機能",
        description: "Supabase連携による即時データ同期",
        specifications: [
          "リアルタイム更新: Supabase Realtimeによる即時データ反映",
          "オフライン対応: ネットワーク断絶時のローカルキャッシュ",
          "プッシュ通知: シフト変更・承認・却下の即時通知",
          "同期制御: 複数ユーザー同時編集時の競合解決",
          "データ整合性: トランザクション処理による整合性保証",
        ],
      },
];

export const securityData: SecuritySpecification[] = [
  {
        category: "データ暗号化",
        level: "最高レベル",
        tone: "success",
        specifications: [
          "AES-256暗号化: 個人情報の完全暗号化",
          "データベース暗号化: Firestore保存時暗号化",
          "通信暗号化: HTTPS/TLS 1.3による通信保護",
          "キー管理: 暗号化キーの安全な管理システム",
        ],
      },
      {
        category: "GDPR準拠",
        level: "完全対応",
        tone: "success",
        specifications: [
          "データ削除権: ユーザーデータの完全削除機能",
          "同意管理: データ処理に対する明示的同意取得",
          "監査ログ: 7年間保存対応の包括的監査システム",
          "データポータビリティ: データエクスポート機能",
        ],
      },
      {
        category: "アクセスセキュリティ",
        level: "エンタープライズ級",
        tone: "primary",
        specifications: [
          "Supabase RLS: 店舗分離＋ロールベースアクセス制御",
          "入力値検証: XSS・SQLインジェクション対策",
          "CSRF保護: クロスサイトリクエスト偽造対策",
          "セッション管理: 安全なセッション管理・自動無効化",
        ],
      },
];

export const technicalData: TechnicalSpecification[] = [
  {
        category: "アーキテクチャパターン",
        description: "モジュラー設計による保守性の高いアーキテクチャ",
        details: [
          "レイヤードアーキテクチャ: プレゼンテーション・ビジネスロジック・データアクセス層の分離",
          "モジュール分割: 機能別モジュール設計 (user-view, master-view, common)",
          "コンポーネント設計: 再利用可能なUIコンポーネントライブラリ",
          "カスタムフック: ビジネスロジックの抽象化とテスタビリティ向上",
        ],
      },
      {
        category: "データモデル設計",
        description: "スケーラブルなFirestoreデータモデル",
        details: [
          "コレクション構造: users, shifts, stores, tasks, auditLogs",
          "インデックス最適化: クエリパフォーマンス向上のための複合インデックス",
          "データ正規化: 重複データ最小化と整合性確保",
          "サブコレクション活用: 階層構造による効率的データ管理",
        ],
      },
      {
        category: "パフォーマンス最適化",
        description: "エンタープライズレベルのパフォーマンス",
        details: [
          "レンダリング最適化: React.memo・useMemo・useCallbackによる最適化",
          "バンドルサイズ最適化: Code Splitting・Tree Shakingによるサイズ削減",
          "キャッシュ戦略: Firestore キャッシュ・クライアントサイドキャッシュ",
          "レスポンシブ対応: デバイス別最適化とブレークポイント管理",
        ],
      },
      {
        category: "テスト・品質管理",
        description: "高品質なコード品質管理",
        details: [
          "TypeScript強化: Strict モード・型安全性の徹底",
          "ESLint・Prettier: コード品質・スタイル統一",
          "エラーハンドリング: 包括的なエラー処理・ユーザーフレンドリーなエラー表示",
          "ログ管理: 開発・本番環境対応のログシステム",
        ],
      },
];

