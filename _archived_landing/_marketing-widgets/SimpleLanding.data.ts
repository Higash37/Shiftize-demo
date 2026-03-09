import {
  FinalCtaFeature,
  NavigationMenuCategory,
  UpdateHistoryItem,
  UpdateType,
  UpdateTypeMeta,
} from "./SimpleLanding.types";

export const updateHistory: UpdateHistoryItem[] = [
  {
    id: "1",
    date: "2024-08-01",
    version: "v3.2.0",
    title: "新機能リリース",
    type: "feature",
    description: "タブレット UI 対応と 1on1 管理シートを追加しました。",
  },
  {
    id: "2",
    date: "2024-07-30",
    version: "v3.1.5",
    title: "UI/UX 改善",
    type: "improvement",
    description: "勤務時間帯のドラッグ操作と検索性能を改善しました。",
  },
  {
    id: "3",
    date: "2024-07-25",
    version: "v3.1.0",
    title: "自動配信を強化",
    type: "feature",
    description: "シフト通知のテンプレートとスケジュール配信を拡張しました。",
  },
  {
    id: "4",
    date: "2024-07-20",
    version: "v3.0.8",
    title: "既知の不具合を修正",
    type: "fix",
    description: "TypeScript の型エラーおよびブラウザ互換性を修正しました。",
  },
  {
    id: "5",
    date: "2024-07-15",
    version: "v3.0.5",
    title: "新しい集計レポート",
    type: "feature",
    description: "シフト集計ダッシュボードと PDF エクスポートを追加しました。",
  },
  {
    id: "6",
    date: "2024-07-10",
    version: "v3.0.0",
    title: "セキュリティ強化",
    type: "security",
    description: "AES-256 暗号化とアクセス監査ログを導入しました。",
  },
  {
    id: "7",
    date: "2024-07-05",
    version: "v2.9.0",
    title: "GDPR 対応",
    type: "security",
    description: "データ削除ワークフローとプライバシーポリシーを更新しました。",
  },
  {
    id: "8",
    date: "2024-07-01",
    version: "v2.8.5",
    title: "パフォーマンス改善",
    type: "improvement",
    description: "キャッシュ戦略を刷新し、レスポンスを最適化しました。",
  },
];

export const navigationMenu: NavigationMenuCategory[] = [
  {
    category: "スタッフ向け機能",
    items: [
      {
        icon: "person",
        title: "ログイン・勤怠",
        route: "/(landing)/staff/login",
        description: "ログイン管理と勤怠申請をサポート",
      },
      {
        icon: "home",
        title: "ホーム",
        route: "/(landing)/staff/home",
        description: "ダッシュボードと最新のお知らせ",
      },
      {
        icon: "calendar-today",
        title: "シフト管理",
        route: "/(landing)/staff/shift",
        description: "シフト確認・調整・申請フロー",
      },
      {
        icon: "assignment",
        title: "タスク管理",
        route: "/(landing)/staff/tasks",
        description: "担当タスクの確認と進行状況共有",
      },
      {
        icon: "account-circle",
        title: "プロフィール",
        route: "/(landing)/staff/profile",
        description: "プロフィール閲覧と設定変更",
      },
    ],
  },
  {
    category: "管理者向け機能",
    items: [
      {
        icon: "admin-panel-settings",
        title: "管理ダッシュボード",
        route: "/(landing)/master/dashboard",
        description: "拠点全体の KPI とアラートを確認",
      },
      {
        icon: "view-kanban",
        title: "ガントチャート",
        route: "/(landing)/master/gantt",
        description: "全体シフトの可視化と調整",
      },
      {
        icon: "groups",
        title: "スタッフ管理",
        route: "/(landing)/master/staff",
        description: "スタッフ登録と配属の管理",
      },
      {
        icon: "attach-money",
        title: "給与管理",
        route: "/(landing)/master/payroll",
        description: "給与計算と支給ステータス管理",
      },
      {
        icon: "business",
        title: "事業設定",
        route: "/(landing)/master/settings",
        description: "拠点設定とポリシーの管理",
      },
    ],
  },
  {
    category: "システム情報",
    items: [
      {
        icon: "security",
        title: "セキュリティ",
        route: "/(landing)/system/security",
        description: "セキュリティ対策と認証基盤",
      },
      {
        icon: "code",
        title: "技術スタック",
        route: "/(landing)/system/tech",
        description: "アーキテクチャと技術仕様",
      },
      {
        icon: "help",
        title: "ヘルプ・FAQ",
        route: "/(landing)/system/help",
        description: "よくある質問とサポート窓口",
      },
      {
        icon: "update",
        title: "リリースノート",
        route: "/(landing)/system/releases",
        description: "バージョン履歴と更新情報",
      },
    ],
  },
];

export const finalCtaFeatures: FinalCtaFeature[] = [
  "30 日間の無料トライアル",
  "クラウドで安全にシェア",
  "複数拠点でも柔軟に運用",
];

const UPDATE_TYPE_ICON_MAP: Record<UpdateType, UpdateTypeMeta> = {
  feature: { icon: "🚀", color: "#10B981" },
  improvement: { icon: "⚙️", color: "#3B82F6" },
  fix: { icon: "🐞", color: "#EF4444" },
  security: { icon: "🛡️", color: "#8B5CF6" },
};

export const updateTypeMeta: Record<UpdateType, UpdateTypeMeta> = UPDATE_TYPE_ICON_MAP;

