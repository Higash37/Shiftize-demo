import type {
  IMultiStoreService,
  StoreInfo,
  UserStoreAccess,
  StoreAccess,
  ConnectedStoreUser,
} from "../interfaces/IMultiStoreService";
import { getSupabase } from "./supabase-client";

export class SupabaseMultiStoreAdapter implements IMultiStoreService {
  async getUserStoreAccess(userUid: string): Promise<UserStoreAccess | null> {
    const supabase = getSupabase();
    const { data } = await supabase
      .from("user_store_access")
      .select("*")
      .eq("uid", userUid)
      .maybeSingle();

    if (!data) return null;

    return {
      uid: data.uid,
      email: data.email,
      nickname: data.nickname,
      storesAccess: data.stores_access || {},
      currentStoreId: data.current_store_id || "",
    };
  }

  async inviteUserToStore(
    inviterUid: string,
    inviterStoreId: string,
    userEmail: string,
    nickname: string,
    role: "master" | "user" = "user"
  ): Promise<void> {
    const supabase = getSupabase();

    // Check inviter permissions
    const inviterAccess = await this.getUserStoreAccess(inviterUid);
    if (
      !inviterAccess ||
      !inviterAccess.storesAccess[inviterStoreId] ||
      inviterAccess.storesAccess[inviterStoreId].role !== "master"
    ) {
      throw new Error("店舗への招待権限がありません");
    }

    // Find user by email
    const { data: users } = await supabase
      .from("users")
      .select("uid")
      .eq("email", userEmail);

    if (!users || users.length === 0 || !users[0]) throw new Error("ユーザーが見つかりません");
    const userUid = users[0].uid;

    // Get store info
    const { data: store } = await supabase
      .from("stores")
      .select("store_name")
      .eq("store_id", inviterStoreId)
      .single();

    if (!store) throw new Error("店舗が見つかりません");

    const storeAccess: StoreAccess = {
      storeId: inviterStoreId,
      storeName: store.store_name,
      role,
      nickname,
      joinedAt: new Date(),
      isActive: true,
    };

    // Check existing access
    const existing = await this.getUserStoreAccess(userUid);
    if (existing) {
      const updatedAccess = { ...existing.storesAccess, [inviterStoreId]: storeAccess };
      await supabase
        .from("user_store_access")
        .update({ stores_access: updatedAccess, updated_at: new Date().toISOString() })
        .eq("uid", userUid);
    } else {
      await supabase.from("user_store_access").insert({
        uid: userUid,
        email: userEmail,
        nickname,
        stores_access: { [inviterStoreId]: storeAccess },
        current_store_id: inviterStoreId,
      });
    }

    // Update users table for backward compatibility
    await supabase
      .from("users")
      .update({ store_id: inviterStoreId, nickname, role, updated_at: new Date().toISOString() })
      .eq("uid", userUid);
  }

  async switchCurrentStore(userUid: string, storeId: string): Promise<void> {
    const supabase = getSupabase();
    const userAccess = await this.getUserStoreAccess(userUid);

    if (!userAccess || !userAccess.storesAccess[storeId]) {
      throw new Error("この店舗にアクセスする権限がありません");
    }

    const storeAccess = userAccess.storesAccess[storeId];

    await supabase
      .from("user_store_access")
      .update({
        current_store_id: storeId,
        nickname: storeAccess.nickname,
        updated_at: new Date().toISOString(),
      })
      .eq("uid", userUid);

    await supabase
      .from("users")
      .update({
        store_id: storeId,
        nickname: storeAccess.nickname,
        role: storeAccess.role,
        updated_at: new Date().toISOString(),
      })
      .eq("uid", userUid);
  }

  async getAllStores(): Promise<StoreInfo[]> {
    const supabase = getSupabase();
    const { data } = await supabase.from("stores").select("*");

    return (data || []).map((row: any) => ({
      storeId: row.store_id,
      storeName: row.store_name,
      adminUid: row.admin_uid,
      adminNickname: row.admin_nickname,
      isActive: row.is_active ?? true,
      createdAt: new Date(row.created_at),
    }));
  }

  async removeUserFromStore(
    removerUid: string,
    targetUserUid: string,
    storeId: string
  ): Promise<void> {
    const supabase = getSupabase();
    const removerAccess = await this.getUserStoreAccess(removerUid);

    if (
      !removerAccess ||
      !removerAccess.storesAccess[storeId] ||
      removerAccess.storesAccess[storeId].role !== "master"
    ) {
      throw new Error("ユーザー削除の権限がありません");
    }

    const userAccess = await this.getUserStoreAccess(targetUserUid);
    if (!userAccess) return;

    const updatedAccess = { ...userAccess.storesAccess };
    delete updatedAccess[storeId];

    await supabase
      .from("user_store_access")
      .update({ stores_access: updatedAccess, updated_at: new Date().toISOString() })
      .eq("uid", targetUserUid);

    if (userAccess.currentStoreId === storeId) {
      const remaining = Object.keys(updatedAccess);
      if (remaining.length > 0 && remaining[0]) {
        await this.switchCurrentStore(targetUserUid, remaining[0]);
      }
    }
  }

  async migrateLegacyUser(userUid: string): Promise<void> {
    const supabase = getSupabase();

    const { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("uid", userUid)
      .single();

    if (!user) throw new Error("ユーザーが見つかりません");

    const { data: store } = await supabase
      .from("stores")
      .select("store_name")
      .eq("store_id", user.store_id)
      .single();

    if (!store) throw new Error("店舗が見つかりません");

    const storeAccess: StoreAccess = {
      storeId: user.store_id,
      storeName: store.store_name,
      role: user.role,
      nickname: user.nickname,
      joinedAt: new Date(user.created_at || Date.now()),
      isActive: true,
    };

    await supabase.from("user_store_access").upsert({
      uid: userUid,
      email: user.email,
      nickname: user.nickname,
      stores_access: { [user.store_id]: storeAccess },
      current_store_id: user.store_id,
    });
  }

  async generateConnectionPassword(storeId: string, _userUid: string): Promise<string> {
    const supabase = getSupabase();
    const password = Math.random().toString(36).substring(2, 8).toUpperCase();
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 24);

    await supabase
      .from("stores")
      .update({
        connection_password: password,
        connection_password_expiry: expiryDate.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("store_id", storeId);

    return password;
  }

  async connectStores(
    fromStoreId: string,
    toStoreId: string,
    connectionPassword: string,
    userUid: string
  ): Promise<void> {
    const supabase = getSupabase();

    const { data: toStore } = await supabase
      .from("stores")
      .select("*")
      .eq("store_id", toStoreId)
      .single();

    if (!toStore) throw new Error("連携先の店舗が見つかりません");
    if (toStore.connection_password !== connectionPassword) throw new Error("連携パスワードが正しくありません");

    const expiry = toStore.connection_password_expiry ? new Date(toStore.connection_password_expiry) : null;
    if (!expiry || expiry < new Date()) throw new Error("連携パスワードの有効期限が切れています");

    const { data: fromStore } = await supabase
      .from("stores")
      .select("connected_stores")
      .eq("store_id", fromStoreId)
      .single();

    await supabase
      .from("stores")
      .update({
        connected_stores: [...(toStore.connected_stores || []), fromStoreId],
        connection_password: null,
        connection_password_expiry: null,
        updated_at: new Date().toISOString(),
      })
      .eq("store_id", toStoreId);

    await supabase
      .from("stores")
      .update({
        connected_stores: [...(fromStore?.connected_stores || []), toStoreId],
        updated_at: new Date().toISOString(),
      })
      .eq("store_id", fromStoreId);

    await this.updateUsersConnectedStores(fromStoreId, toStoreId, "connect");
    await this.grantCrossStoreAccess(userUid, fromStoreId, toStoreId);
  }

  private async grantCrossStoreAccess(
    userUid: string,
    storeId1: string,
    storeId2: string
  ): Promise<void> {
    let userAccess = await this.getUserStoreAccess(userUid);
    if (!userAccess) {
      await this.migrateLegacyUser(userUid);
      userAccess = await this.getUserStoreAccess(userUid);
    }
    if (!userAccess) throw new Error("ユーザーアクセス権限の取得に失敗しました");

    const supabase = getSupabase();
    const updatedAccess = { ...userAccess.storesAccess };

    for (const sid of [storeId1, storeId2]) {
      if (!updatedAccess[sid]) {
        const { data: store } = await supabase
          .from("stores")
          .select("store_name")
          .eq("store_id", sid)
          .single();

        updatedAccess[sid] = {
          storeId: sid,
          storeName: store?.store_name || "",
          role: "master",
          nickname: userAccess.nickname,
          joinedAt: new Date(),
          isActive: true,
        };
      }
    }

    await supabase
      .from("user_store_access")
      .update({ stores_access: updatedAccess, updated_at: new Date().toISOString() })
      .eq("uid", userUid);
  }

  async disconnectStores(
    storeId1: string,
    storeId2: string,
    _userUid: string
  ): Promise<void> {
    const supabase = getSupabase();

    const { data: store1 } = await supabase
      .from("stores")
      .select("connected_stores")
      .eq("store_id", storeId1)
      .single();

    const { data: store2 } = await supabase
      .from("stores")
      .select("connected_stores")
      .eq("store_id", storeId2)
      .single();

    if (store1) {
      await supabase
        .from("stores")
        .update({
          connected_stores: (store1.connected_stores || []).filter((id: string) => id !== storeId2),
          updated_at: new Date().toISOString(),
        })
        .eq("store_id", storeId1);
    }

    if (store2) {
      await supabase
        .from("stores")
        .update({
          connected_stores: (store2.connected_stores || []).filter((id: string) => id !== storeId1),
          updated_at: new Date().toISOString(),
        })
        .eq("store_id", storeId2);
    }

    await this.updateUsersConnectedStores(storeId1, storeId2, "disconnect");
  }

  async getConnectedStoreUsers(storeId: string): Promise<ConnectedStoreUser[]> {
    const supabase = getSupabase();

    const { data: store } = await supabase
      .from("stores")
      .select("connected_stores")
      .eq("store_id", storeId)
      .single();

    if (!store) return [];

    const connectedStoreIds: string[] = store.connected_stores || [];
    const allUsers: ConnectedStoreUser[] = [];

    for (const connectedStoreId of connectedStoreIds) {
      try {
        const { data: connStore } = await supabase
          .from("stores")
          .select("store_name")
          .eq("store_id", connectedStoreId)
          .single();

        const { data: users } = await supabase
          .from("users")
          .select("uid, nickname, email, role")
          .eq("store_id", connectedStoreId);

        (users || []).forEach((u: any) => {
          allUsers.push({
            uid: u.uid,
            nickname: u.nickname || "名前未設定",
            email: u.email || "",
            role: u.role || "user",
            storeId: connectedStoreId,
            storeName: connStore?.store_name || "",
            isFromOtherStore: true,
          });
        });
      } catch {}
    }

    return allUsers;
  }

  async getConnectedStores(userUid: string): Promise<StoreInfo[]> {
    const userAccess = await this.getUserStoreAccess(userUid);
    if (!userAccess?.storesAccess) return [];

    const supabase = getSupabase();
    const stores: StoreInfo[] = [];

    for (const sid of Object.keys(userAccess.storesAccess)) {
      try {
        const access = userAccess.storesAccess[sid];
        if (!access?.isActive) continue;

        const { data: store } = await supabase
          .from("stores")
          .select("*")
          .eq("store_id", sid)
          .single();

        if (store) {
          stores.push({
            storeId: sid,
            storeName: store.store_name || access.storeName,
            adminUid: store.admin_uid || "",
            adminNickname: store.admin_nickname || "",
            isActive: true,
            createdAt: new Date(store.created_at || Date.now()),
          });
        }
      } catch {}
    }

    return stores;
  }

  async updateUsersConnectedStores(
    storeId1: string,
    storeId2: string,
    action: "connect" | "disconnect"
  ): Promise<void> {
    const supabase = getSupabase();

    const { data: store1Users } = await supabase
      .from("users")
      .select("uid, connected_stores")
      .eq("store_id", storeId1);

    const { data: store2Users } = await supabase
      .from("users")
      .select("uid, connected_stores")
      .eq("store_id", storeId2);

    const updates: PromiseLike<any>[] = [];

    const processUsers = (users: any[], targetStoreId: string) => {
      (users || []).forEach((u: any) => {
        const current: string[] = u.connected_stores || [];
        let updated: string[];

        if (action === "connect") {
          updated = current.includes(targetStoreId) ? current : [...current, targetStoreId];
        } else {
          updated = current.filter((id: string) => id !== targetStoreId);
        }

        if (JSON.stringify(current) !== JSON.stringify(updated)) {
          updates.push(
            supabase
              .from("users")
              .update({ connected_stores: updated, updated_at: new Date().toISOString() })
              .eq("uid", u.uid)
          );
        }
      });
    };

    processUsers(store1Users || [], storeId2);
    processUsers(store2Users || [], storeId1);

    await Promise.all(updates);
  }
}
