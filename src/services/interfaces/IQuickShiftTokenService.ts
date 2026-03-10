/** @file IQuickShiftTokenService.ts @description クイックシフトトークン（募集・自由追加）の管理インターフェース */

/** クイックシフトトークンのデータ構造 */
export interface QuickShiftToken {
  /** トークンID */
  id: string;
  /** 店舗ID */
  storeId: string;
  /** 作成者のユーザーID */
  createdBy: string;
  /** トークン種別: 募集 or 自由追加 */
  tokenType: "recruitment" | "free_add";
  /** 募集対象のシフトID一覧 */
  recruitmentShiftIds?: string[];
  /** 許可する日付範囲 */
  allowedDateRange?: {
    startDate: string;
    endDate: string;
  };
  /** 有効期限 */
  expiresAt: Date;
  /** 最大使用回数 */
  maxUses: number | undefined;
  /** 現在の使用回数 */
  currentUses: number;
  /** 使用を許可するユーザーID一覧 */
  allowedUserIds: string[] | undefined;
  /** LINE認証を必須にするか */
  requireLineAuth: boolean;
  /** トークンが有効か */
  isActive: boolean;
  /** 作成日時 */
  createdAt: Date;
  /** 更新日時 */
  updatedAt: Date;
  /** 最終使用日時 */
  lastUsedAt?: Date;
  /** 使用履歴 */
  usageLog: Array<{
    userId: string;
    usedAt: Date;
    shiftId: string;
  }>;
}

/** クイックシフトトークンの作成・検証・管理を行うサービス */
export interface IQuickShiftTokenService {
  /** 募集用トークンを作成する */
  createRecruitmentToken(
    storeId: string,
    createdBy: string,
    recruitmentShiftIds: string[],
    options?: {
      expiresInHours?: number;
      maxUses?: number;
      allowedUserIds?: string[];
      requireLineAuth?: boolean;
    }
  ): Promise<string>;

  /** 自由追加用トークンを作成する */
  createFreeAddToken(
    storeId: string,
    createdBy: string,
    options?: {
      expiresInHours?: number;
      maxUses?: number;
      allowedUserIds?: string[];
      requireLineAuth?: boolean;
    }
  ): Promise<string>;

  /** トークンの有効性を検証する */
  validateToken(
    tokenId: string,
    userId?: string
  ): Promise<{ valid: boolean; token?: QuickShiftToken; error?: string }>;

  /** トークンの使用を記録する */
  recordTokenUsage(tokenId: string, userId: string, shiftId: string): Promise<void>;
  /** トークンを無効化する */
  deactivateToken(tokenId: string): Promise<void>;
  /** トークンを削除する */
  deleteToken(tokenId: string): Promise<void>;
  /** 店舗のトークン一覧を取得する */
  getStoreTokens(storeId: string): Promise<QuickShiftToken[]>;
  /** クイックシフト用URLを生成する */
  generateQuickShiftUrl(tokenId: string, tokenType: "recruitment" | "free_add"): string;
}
