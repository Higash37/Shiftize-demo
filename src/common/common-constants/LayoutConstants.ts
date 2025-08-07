export type LayoutType = {
  padding: {
    small: number;
    medium: number;
    large: number;
    xlarge: number;
  };
  borderRadius: {
    none: number;
    small: number;
    medium: number;
    large: number;
    xlarge: number;
    xxlarge: number;
    full: number; // 完全な円形
  };
  // ヘッダー/フッター専用の角丸設定
  headerFooter: {
    borderRadius: {
      header: number; // ヘッダー下部の角丸
      footer: number; // フッター上部の角丸
    };
  };
  // カード/コンポーネント用の角丸設定
  components: {
    card: number;
    button: number;
    input: number;
    modal: number;
    chip: number; // チップ・バッジ用
    avatar: number; // アバター・プロフィール画像用
    listItem: number; // リストアイテム用
    tab: number; // タブ用
    notification: number; // 通知・アラート用
  };
  // スペシャルケース用の角丸設定
  special: {
    welcome: number; // ウェルカムページのような特別なカード
    hero: number; // ヒーローセクション用
    feature: number; // フィーチャー要素用
  };
};

export const layout: LayoutType = {
  padding: {
    small: 8,
    medium: 16,
    large: 24,
    xlarge: 32,
  },
  borderRadius: {
    none: 0,
    small: 6,
    medium: 12,
    large: 18,
    xlarge: 24,
    xxlarge: 32,
    full: 9999, // 完全な円形
  },
  // ヘッダー/フッター専用の角丸設定
  headerFooter: {
    borderRadius: {
      header: 18, // ヘッダー下部の美しい角丸
      footer: 18, // フッター上部の美しい角丸
    },
  },
  // カード/コンポーネント用の角丸設定
  components: {
    card: 16,
    button: 12,
    input: 10,
    modal: 20,
    chip: 16, // チップ・バッジ用
    avatar: 8, // アバター・プロフィール画像用
    listItem: 12, // リストアイテム用
    tab: 8, // タブ用
    notification: 12, // 通知・アラート用
  },
  // スペシャルケース用の角丸設定
  special: {
    welcome: 20, // ウェルカムページのような特別なカード
    hero: 24, // ヒーローセクション用
    feature: 18, // フィーチャー要素用
  },
};
