import type { IQuickShiftTokenService, QuickShiftToken } from "../interfaces/IQuickShiftTokenService";
import { getSupabase } from "./supabase-client";
import * as Crypto from "expo-crypto";

export class SupabaseQuickShiftTokenAdapter implements IQuickShiftTokenService {
  private async generateTokenId(): Promise<string> {
    const randomBytes = await Crypto.getRandomBytesAsync(16);
    return Array.from(randomBytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  async createRecruitmentToken(
    storeId: string,
    createdBy: string,
    recruitmentShiftIds: string[],
    options?: {
      expiresInHours?: number;
      maxUses?: number;
      allowedUserIds?: string[];
      requireLineAuth?: boolean;
    }
  ): Promise<string> {
    const tokenId = await this.generateTokenId();
    const expiresAt = new Date(Date.now() + (options?.expiresInHours || 168) * 3600000);
    const supabase = getSupabase();

    const row: any = {
      id: tokenId,
      store_id: storeId,
      created_by: createdBy,
      token_type: "recruitment",
      recruitment_shift_ids: recruitmentShiftIds,
      expires_at: expiresAt.toISOString(),
      current_uses: 0,
      require_line_auth: options?.requireLineAuth ?? true,
      is_active: true,
      usage_log: [],
    };

    if (options?.maxUses !== undefined) row.max_uses = options.maxUses;
    if (options?.allowedUserIds !== undefined) row.allowed_user_ids = options.allowedUserIds;

    await supabase.from("quick_shift_tokens").insert(row);
    return tokenId;
  }

  async createFreeAddToken(
    storeId: string,
    createdBy: string,
    options?: {
      expiresInHours?: number;
      maxUses?: number;
      allowedUserIds?: string[];
      requireLineAuth?: boolean;
    }
  ): Promise<string> {
    const tokenId = await this.generateTokenId();
    const expiresAt = new Date(Date.now() + (options?.expiresInHours || 168) * 3600000);
    const supabase = getSupabase();

    const row: any = {
      id: tokenId,
      store_id: storeId,
      created_by: createdBy,
      token_type: "free_add",
      expires_at: expiresAt.toISOString(),
      current_uses: 0,
      require_line_auth: options?.requireLineAuth ?? true,
      is_active: true,
      usage_log: [],
    };

    if (options?.maxUses !== undefined) row.max_uses = options.maxUses;
    if (options?.allowedUserIds !== undefined) row.allowed_user_ids = options.allowedUserIds;

    await supabase.from("quick_shift_tokens").insert(row);
    return tokenId;
  }

  async validateToken(
    tokenId: string,
    userId?: string
  ): Promise<{ valid: boolean; token?: QuickShiftToken; error?: string }> {
    try {
      const supabase = getSupabase();
      const { data } = await supabase
        .from("quick_shift_tokens")
        .select("*")
        .eq("id", tokenId)
        .maybeSingle();

      if (!data) return { valid: false, error: "トークンが見つかりません" };

      const token = this.mapRowToToken(data);

      if (!token.isActive) return { valid: false, error: "このURLは無効化されています" };
      if (new Date() > new Date(token.expiresAt)) return { valid: false, error: "このURLは期限切れです" };
      if (token.maxUses && token.currentUses >= token.maxUses) return { valid: false, error: "このURLは使用上限に達しました" };
      if (userId && token.allowedUserIds && token.allowedUserIds.length > 0) {
        if (!token.allowedUserIds.includes(userId)) return { valid: false, error: "このURLを使用する権限がありません" };
      }

      return { valid: true, token };
    } catch {
      return { valid: false, error: "トークン検証中にエラーが発生しました" };
    }
  }

  async recordTokenUsage(tokenId: string, userId: string, shiftId: string): Promise<void> {
    try {
      const supabase = getSupabase();
      const { data } = await supabase
        .from("quick_shift_tokens")
        .select("current_uses, usage_log")
        .eq("id", tokenId)
        .maybeSingle();

      if (!data) return;

      const usageLog = data.usage_log || [];
      usageLog.push({ userId, usedAt: new Date().toISOString(), shiftId });

      await supabase.from("quick_shift_tokens").update({
        current_uses: data.current_uses + 1,
        last_used_at: new Date().toISOString(),
        usage_log: usageLog,
        updated_at: new Date().toISOString(),
      }).eq("id", tokenId);
    } catch (error) {
      console.error("Failed to record token usage:", error);
    }
  }

  async deactivateToken(tokenId: string): Promise<void> {
    const supabase = getSupabase();
    await supabase.from("quick_shift_tokens").update({
      is_active: false,
      updated_at: new Date().toISOString(),
    }).eq("id", tokenId);
  }

  async deleteToken(tokenId: string): Promise<void> {
    const supabase = getSupabase();
    await supabase.from("quick_shift_tokens").delete().eq("id", tokenId);
  }

  async getStoreTokens(storeId: string): Promise<QuickShiftToken[]> {
    try {
      const supabase = getSupabase();
      const { data } = await supabase
        .from("quick_shift_tokens")
        .select("*")
        .eq("store_id", storeId);

      return (data || []).map((row: any) => this.mapRowToToken(row));
    } catch {
      return [];
    }
  }

  generateQuickShiftUrl(tokenId: string, tokenType: "recruitment" | "free_add"): string {
    const baseUrl = "https://shiftschedulerapp-71104.web.app";
    const path = tokenType === "recruitment" ? "quick-recruit" : "quick-add";
    return `${baseUrl}/${path}?token=${tokenId}`;
  }

  private mapRowToToken(row: any): QuickShiftToken {
    return {
      id: row.id,
      storeId: row.store_id,
      createdBy: row.created_by,
      tokenType: row.token_type,
      recruitmentShiftIds: row.recruitment_shift_ids,
      allowedDateRange: row.allowed_date_range,
      expiresAt: new Date(row.expires_at),
      maxUses: row.max_uses,
      currentUses: row.current_uses,
      allowedUserIds: row.allowed_user_ids,
      requireLineAuth: row.require_line_auth,
      isActive: row.is_active,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      ...(row.last_used_at ? { lastUsedAt: new Date(row.last_used_at) } : {}),
      usageLog: row.usage_log || [],
    };
  }
}
