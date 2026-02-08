export interface QuickShiftToken {
  id: string;
  storeId: string;
  createdBy: string;
  tokenType: "recruitment" | "free_add";
  recruitmentShiftIds?: string[];
  allowedDateRange?: {
    startDate: string;
    endDate: string;
  };
  expiresAt: Date;
  maxUses: number | undefined;
  currentUses: number;
  allowedUserIds: string[] | undefined;
  requireLineAuth: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastUsedAt?: Date;
  usageLog: Array<{
    userId: string;
    usedAt: Date;
    shiftId: string;
  }>;
}

export interface IQuickShiftTokenService {
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

  validateToken(
    tokenId: string,
    userId?: string
  ): Promise<{ valid: boolean; token?: QuickShiftToken; error?: string }>;

  recordTokenUsage(tokenId: string, userId: string, shiftId: string): Promise<void>;
  deactivateToken(tokenId: string): Promise<void>;
  deleteToken(tokenId: string): Promise<void>;
  getStoreTokens(storeId: string): Promise<QuickShiftToken[]>;
  generateQuickShiftUrl(tokenId: string, tokenType: "recruitment" | "free_add"): string;
}
