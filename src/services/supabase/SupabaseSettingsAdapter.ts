import type { ISettingsService } from "../interfaces/ISettingsService";
import type { AppSettings } from "@/common/common-utils/util-settings/useAppSettings";
import { getSupabase } from "./supabase-client";
import type { RealtimeChannel } from "@supabase/supabase-js";

export class SupabaseSettingsAdapter implements ISettingsService {
  async getSettings(): Promise<AppSettings | null> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("settings")
      .select("data")
      .eq("settings_key", "shiftApp")
      .maybeSingle();

    if (error || !data) return null;
    return data.data as AppSettings;
  }

  async saveSettings(settings: Partial<AppSettings>): Promise<void> {
    const supabase = getSupabase();

    // 既存設定を取得してマージ
    const { data: existing } = await supabase
      .from("settings")
      .select("data, store_id")
      .eq("settings_key", "shiftApp")
      .maybeSingle();

    if (existing) {
      const mergedData = { ...existing.data, ...settings };
      const { error } = await supabase
        .from("settings")
        .update({ data: mergedData })
        .eq("settings_key", "shiftApp")
        .eq("store_id", existing.store_id);
      if (error) throw error;
    } else {
      // store_idはユーザーのstore_idから取得
      const { data: userData } = await supabase
        .from("users")
        .select("store_id")
        .eq("uid", (await supabase.auth.getUser()).data.user?.id || "")
        .maybeSingle();

      const storeId = userData?.store_id || "";

      const { error } = await supabase.from("settings").insert({
        store_id: storeId,
        settings_key: "shiftApp",
        data: settings,
      });
      if (error) throw error;
    }
  }

  async resetSettings(defaults: AppSettings): Promise<void> {
    const supabase = getSupabase();

    const { data: existing } = await supabase
      .from("settings")
      .select("store_id")
      .eq("settings_key", "shiftApp")
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from("settings")
        .update({ data: defaults })
        .eq("settings_key", "shiftApp")
        .eq("store_id", existing.store_id);
      if (error) throw error;
    } else {
      const { data: userData } = await supabase
        .from("users")
        .select("store_id")
        .eq("uid", (await supabase.auth.getUser()).data.user?.id || "")
        .single();

      const storeId = userData?.store_id || "";

      const { error } = await supabase.from("settings").insert({
        store_id: storeId,
        settings_key: "shiftApp",
        data: defaults,
      });
      if (error) throw error;
    }
  }

  onSettingsChanged(
    callback: (settings: AppSettings | null) => void
  ): () => void {
    const supabase = getSupabase();
    let channel: RealtimeChannel | null = null;

    // 初期値を取得
    this.getSettings().then(callback).catch(() => callback(null));

    // Supabase Realtimeで変更監視
    channel = supabase
      .channel("settings-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "settings",
          filter: "settings_key=eq.shiftApp",
        },
        (payload) => {
          if (payload.new && typeof payload.new === "object" && "data" in payload.new) {
            callback((payload.new as any).data as AppSettings);
          } else {
            callback(null);
          }
        }
      )
      .subscribe();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }

  onShiftStatusConfigChanged(callback: (configs: Record<string, any> | null) => void): () => void {
    const supabase = getSupabase();
    let channel: RealtimeChannel | null = null;

    // 初期値を取得
    (async () => {
      const { data } = await supabase
        .from("settings")
        .select("data")
        .eq("settings_key", "shiftStatus")
        .maybeSingle();
      callback(data?.data || null);
    })().catch(() => callback(null));

    // Supabase Realtimeで変更監視
    channel = supabase
      .channel("settings-shift-status-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "settings",
          filter: "settings_key=eq.shiftStatus",
        },
        (payload) => {
          if (payload.new && typeof payload.new === "object" && "data" in payload.new) {
            callback((payload.new as any).data);
          } else {
            callback(null);
          }
        }
      )
      .subscribe();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }
}
