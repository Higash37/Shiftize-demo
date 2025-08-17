/**
 * 多店舗管理サービス
 *
 * ユーザーの店舗アクセス権限管理と店舗切り替え機能を提供します
 */

import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/services/firebase/firebase";

/**
 * 店舗アクセス権限の型定義
 */
export interface StoreAccess {
  storeId: string;
  storeName: string;
  role: "master" | "user";
  nickname: string;
  joinedAt: Date;
  isActive: boolean;
}

/**
 * 店舗情報の型定義
 */
export interface StoreInfo {
  storeId: string;
  storeName: string;
  adminUid: string;
  adminNickname: string;
  isActive: boolean;
  createdAt: Date;
  // 店舗連携機能
  connectedStores?: string[]; // 連携している店舗IDの配列
  connectionPassword?: string; // 連携用パスワード（生成側）
  connectionPasswordExpiry?: Date; // パスワード有効期限
}

/**
 * 店舗連携リクエストの型定義
 */
export interface StoreConnectionRequest {
  fromStoreId: string;
  toStoreId: string;
  connectionPassword: string;
  requestedBy: string; // ユーザーUID
  requestedAt: Date;
  status: "pending" | "approved" | "rejected";
}

/**
 * ユーザーの多店舗アクセス権限
 */
export interface UserStoreAccess {
  uid: string;
  email: string;
  nickname: string; // 現在の店舗でのニックネーム
  storesAccess: Record<string, StoreAccess>; // storeId -> アクセス権限
  currentStoreId: string; // 現在選択中の店舗
}

export const MultiStoreService = {
  /**
   * ユーザーがアクセス可能な店舗一覧を取得
   */
  getUserStoreAccess: async (
    userUid: string
  ): Promise<UserStoreAccess | null> => {
    try {
      const userStoreDoc = await getDoc(doc(db, "userStoreAccess", userUid));

      if (!userStoreDoc.exists()) {
        return null;
      }

      const data = userStoreDoc.data();
      return {
        uid: data["uid"],
        email: data["email"],
        nickname: data["nickname"],
        storesAccess: data["storesAccess"] || {},
        currentStoreId: data["currentStoreId"] || "",
      };
    } catch (error) {
      throw error;
    }
  },

  /**
   * ユーザーを他の店舗に招待（masterロールのみ実行可能）
   */
  inviteUserToStore: async (
    inviterUid: string,
    inviterStoreId: string,
    userEmail: string,
    nickname: string,
    role: "master" | "user" = "user"
  ): Promise<void> => {
    try {
      // 招待者がmasterロールかつ該当店舗の権限があるかチェック
      const inviterAccess = await MultiStoreService.getUserStoreAccess(
        inviterUid
      );
      if (
        !inviterAccess ||
        !inviterAccess.storesAccess[inviterStoreId] ||
        inviterAccess.storesAccess[inviterStoreId].role !== "master"
      ) {
        throw new Error("店舗への招待権限がありません");
      }

      // 招待対象のユーザーを検索
      const usersRef = collection(db, "users");
      const userQuery = query(usersRef, where("email", "==", userEmail));
      const userSnapshot = await getDocs(userQuery);

      if (userSnapshot.empty) {
        throw new Error("ユーザーが見つかりません");
      }

      const userData = userSnapshot.docs[0];
      const userUid = userData.id;

      // 店舗情報を取得
      const storeDoc = await getDoc(doc(db, "stores", inviterStoreId));
      if (!storeDoc.exists()) {
        throw new Error("店舗が見つかりません");
      }

      const storeData = storeDoc.data();

      // ユーザーの店舗アクセス権限を更新
      const userStoreDocRef = doc(db, "userStoreAccess", userUid);
      const userStoreDoc = await getDoc(userStoreDocRef);

      const storeAccess: StoreAccess = {
        storeId: inviterStoreId,
        storeName: storeData["storeName"],
        role,
        nickname,
        joinedAt: new Date(),
        isActive: true,
      };

      if (userStoreDoc.exists()) {
        // 既存のアクセス権限を更新
        const existingData = userStoreDoc.data() as UserStoreAccess;
        await updateDoc(userStoreDocRef, {
          [`storesAccess.${inviterStoreId}`]: storeAccess,
          updatedAt: serverTimestamp(),
        });
      } else {
        // 新規作成
        const userData = userSnapshot.docs[0].data();
        await setDoc(userStoreDocRef, {
          uid: userUid,
          email: userEmail,
          nickname: nickname,
          storesAccess: {
            [inviterStoreId]: storeAccess,
          },
          currentStoreId: inviterStoreId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      // 既存の users コレクションにも店舗ID情報を追加（後方互換性のため）
      await updateDoc(doc(db, "users", userUid), {
        storeId: inviterStoreId,
        nickname: nickname,
        role: role,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * ユーザーの現在の店舗を変更
   */
  switchCurrentStore: async (
    userUid: string,
    storeId: string
  ): Promise<void> => {
    try {
      const userStoreAccess = await MultiStoreService.getUserStoreAccess(
        userUid
      );

      if (!userStoreAccess || !userStoreAccess.storesAccess[storeId]) {
        throw new Error("この店舗にアクセスする権限がありません");
      }

      const storeAccess = userStoreAccess.storesAccess[storeId];

      // 現在の店舗を更新
      await updateDoc(doc(db, "userStoreAccess", userUid), {
        currentStoreId: storeId,
        nickname: storeAccess.nickname, // 現在のニックネームを更新
        updatedAt: serverTimestamp(),
      });

      // 既存の users コレクションも更新（後方互換性のため）
      await updateDoc(doc(db, "users", userUid), {
        storeId: storeId,
        nickname: storeAccess.nickname,
        role: storeAccess.role,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * 店舗一覧を取得
   */
  getAllStores: async (): Promise<StoreInfo[]> => {
    try {
      const storesRef = collection(db, "stores");
      const storesSnapshot = await getDocs(storesRef);

      return storesSnapshot.docs.map((doc) => ({
        storeId: doc.id,
        storeName: doc.data().storeName,
        adminUid: doc.data().adminUid,
        adminNickname: doc.data().adminNickname,
        isActive: doc.data().isActive || true,
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      }));
    } catch (error) {
      throw error;
    }
  },

  /**
   * ユーザーを店舗から削除
   */
  removeUserFromStore: async (
    removerUid: string,
    targetUserUid: string,
    storeId: string
  ): Promise<void> => {
    try {
      // 削除者がmasterロールかつ該当店舗の権限があるかチェック
      const removerAccess = await MultiStoreService.getUserStoreAccess(
        removerUid
      );
      if (
        !removerAccess ||
        !removerAccess.storesAccess[storeId] ||
        removerAccess.storesAccess[storeId].role !== "master"
      ) {
        throw new Error("ユーザー削除の権限がありません");
      }

      // 対象ユーザーの店舗アクセス権限を削除
      const userStoreDocRef = doc(db, "userStoreAccess", targetUserUid);
      await updateDoc(userStoreDocRef, {
        [`storesAccess.${storeId}`]: null,
        updatedAt: serverTimestamp(),
      });

      // 削除された店舗が現在の店舗だった場合、他の店舗に切り替える
      const userStoreAccess = await MultiStoreService.getUserStoreAccess(
        targetUserUid
      );
      if (userStoreAccess && userStoreAccess.currentStoreId === storeId) {
        const remainingStores = Object.keys(userStoreAccess.storesAccess);
        if (remainingStores.length > 0) {
          await MultiStoreService.switchCurrentStore(
            targetUserUid,
            remainingStores[0]
          );
        }
      }
    } catch (error) {
      throw error;
    }
  },

  /**
   * レガシーユーザーを多店舗対応に移行
   */
  migrateLegacyUser: async (userUid: string): Promise<void> => {
    try {
      // 既存のusersコレクションからユーザー情報を取得
      const userDoc = await getDoc(doc(db, "users", userUid));
      if (!userDoc.exists()) {
        throw new Error("ユーザーが見つかりません");
      }

      const userData = userDoc.data();

      // 店舗情報を取得
      const storeDoc = await getDoc(doc(db, "stores", userData["storeId"]));
      if (!storeDoc.exists()) {
        throw new Error("店舗が見つかりません");
      }

      const storeData = storeDoc.data();

      // userStoreAccessコレクションに移行
      const storeAccess: StoreAccess = {
        storeId: userData["storeId"],
        storeName: storeData["storeName"],
        role: userData["role"],
        nickname: userData["nickname"],
        joinedAt: userData.createdAt?.toDate() || new Date(),
        isActive: true,
      };

      await setDoc(doc(db, "userStoreAccess", userUid), {
        uid: userUid,
        email: userData["email"],
        nickname: userData["nickname"],
        storesAccess: {
          [userData["storeId"]]: storeAccess,
        },
        currentStoreId: userData["storeId"],
        createdAt: userData.createdAt || serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * 店舗連携用パスワードを生成
   */
  generateConnectionPassword: async (
    storeId: string,
    userUid: string
  ): Promise<string> => {
    try {
      // 6桁のランダムパスワードを生成
      const password = Math.random().toString(36).substring(2, 8).toUpperCase();
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 24); // 24時間有効

      // storeドキュメントを更新
      await updateDoc(doc(db, "stores", storeId), {
        connectionPassword: password,
        connectionPasswordExpiry: expiryDate,
        updatedAt: serverTimestamp(),
      });

      return password;
    } catch (error) {
      throw error;
    }
  },

  /**
   * 店舗連携を実行
   */
  connectStores: async (
    fromStoreId: string,
    toStoreId: string,
    connectionPassword: string,
    userUid: string
  ): Promise<void> => {
    try {
      // 連携先の店舗情報を取得
      const toStoreDoc = await getDoc(doc(db, "stores", toStoreId));
      if (!toStoreDoc.exists()) {
        throw new Error("連携先の店舗が見つかりません");
      }

      const toStoreData = toStoreDoc.data();

      // パスワードの検証
      if (
        !toStoreData.connectionPassword ||
        toStoreData.connectionPassword !== connectionPassword
      ) {
        throw new Error("連携パスワードが正しくありません");
      }

      // パスワードの有効期限チェック
      const expiryDate = toStoreData.connectionPasswordExpiry?.toDate();
      if (!expiryDate || expiryDate < new Date()) {
        throw new Error("連携パスワードの有効期限が切れています");
      }

      // 連携元の店舗情報を取得
      const fromStoreDoc = await getDoc(doc(db, "stores", fromStoreId));
      if (!fromStoreDoc.exists()) {
        throw new Error("連携元の店舗が見つかりません");
      }

      const fromStoreData = fromStoreDoc.data();

      // 両方の店舗に相手の店舗IDを追加
      await updateDoc(doc(db, "stores", toStoreId), {
        connectedStores: [...(toStoreData.connectedStores || []), fromStoreId],
        connectionPassword: null, // パスワードをクリア
        connectionPasswordExpiry: null,
        updatedAt: serverTimestamp(),
      });

      await updateDoc(doc(db, "stores", fromStoreId), {
        connectedStores: [...(fromStoreData.connectedStores || []), toStoreId],
        updatedAt: serverTimestamp(),
      });

      // 両店舗の全講師のconnectedStoresを更新
      await MultiStoreService.updateUsersConnectedStores(
        fromStoreId,
        toStoreId,
        "connect"
      );

      // リクエストユーザーに両店舗のアクセス権限を付与
      await MultiStoreService.grantCrossStoreAccess(
        userUid,
        fromStoreId,
        toStoreId
      );
    } catch (error) {
      throw error;
    }
  },

  /**
   * 店舗間アクセス権限を付与
   */
  grantCrossStoreAccess: async (
    userUid: string,
    storeId1: string,
    storeId2: string
  ): Promise<void> => {
    try {
      // 既存のアクセス権限を取得
      let userAccess = await MultiStoreService.getUserStoreAccess(userUid);

      // アクセス権限がない場合はレガシーユーザー移行
      if (!userAccess) {
        await MultiStoreService.migrateLegacyUser(userUid);
        userAccess = await MultiStoreService.getUserStoreAccess(userUid);
      }

      if (!userAccess) {
        throw new Error("ユーザーアクセス権限の取得に失敗しました");
      }

      // 両店舗の情報を取得
      const [store1Doc, store2Doc] = await Promise.all([
        getDoc(doc(db, "stores", storeId1)),
        getDoc(doc(db, "stores", storeId2)),
      ]);

      if (!store1Doc.exists() || !store2Doc.exists()) {
        throw new Error("店舗情報の取得に失敗しました");
      }

      const store1Data = store1Doc.data();
      const store2Data = store2Doc.data();

      // 新しいアクセス権限を追加
      const updatedStoresAccess = { ...userAccess.storesAccess };

      // 店舗1のアクセス権限（まだなければ追加）
      if (!updatedStoresAccess[storeId1]) {
        updatedStoresAccess[storeId1] = {
          storeId: storeId1,
          storeName: store1Data.storeName,
          role: userAccess.uid === store1Data.adminUid ? "master" : "master", // 連携は基本master権限
          nickname: userAccess.nickname,
          joinedAt: new Date(),
          isActive: true,
        };
      }

      // 店舗2のアクセス権限（まだなければ追加）
      if (!updatedStoresAccess[storeId2]) {
        updatedStoresAccess[storeId2] = {
          storeId: storeId2,
          storeName: store2Data.storeName,
          role: userAccess.uid === store2Data.adminUid ? "master" : "master", // 連携は基本master権限
          nickname: userAccess.nickname,
          joinedAt: new Date(),
          isActive: true,
        };
      }

      // userStoreAccessを更新
      await updateDoc(doc(db, "userStoreAccess", userUid), {
        storesAccess: updatedStoresAccess,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * 店舗連携を解除
   */
  disconnectStores: async (
    storeId1: string,
    storeId2: string,
    userUid: string
  ): Promise<void> => {
    try {
      // 両店舗の連携情報を更新
      const [store1Doc, store2Doc] = await Promise.all([
        getDoc(doc(db, "stores", storeId1)),
        getDoc(doc(db, "stores", storeId2)),
      ]);

      if (store1Doc.exists()) {
        const store1Data = store1Doc.data();
        const updatedConnectedStores = (
          store1Data.connectedStores || []
        ).filter((id: string) => id !== storeId2);
        await updateDoc(doc(db, "stores", storeId1), {
          connectedStores: updatedConnectedStores,
          updatedAt: serverTimestamp(),
        });
      }

      if (store2Doc.exists()) {
        const store2Data = store2Doc.data();
        const updatedConnectedStores = (
          store2Data.connectedStores || []
        ).filter((id: string) => id !== storeId1);
        await updateDoc(doc(db, "stores", storeId2), {
          connectedStores: updatedConnectedStores,
          updatedAt: serverTimestamp(),
        });
      }

      // 両店舗の全講師のconnectedStoresからも削除
      await MultiStoreService.updateUsersConnectedStores(
        storeId1,
        storeId2,
        "disconnect"
      );
    } catch (error) {
      throw error;
    }
  },

  /**
   * 連携校舎を含む全ユーザーを取得
   */
  getConnectedStoreUsers: async (
    storeId: string
  ): Promise<
    Array<{
      uid: string;
      nickname: string;
      email: string;
      role: string;
      storeId: string;
      storeName: string;
      isFromOtherStore: boolean;
    }>
  > => {
    try {
      // 指定された店舗の情報を取得
      const storeDoc = await getDoc(doc(db, "stores", storeId));
      if (!storeDoc.exists()) return [];

      const storeData = storeDoc.data();
      const connectedStoreIds = storeData.connectedStores || [];

      const allUsers: Array<{
        uid: string;
        nickname: string;
        email: string;
        role: string;
        storeId: string;
        storeName: string;
        isFromOtherStore: boolean;
      }> = [];

      // 連携している各店舗のユーザーを取得
      for (const connectedStoreId of connectedStoreIds) {
        try {
          // 連携店舗の情報を取得
          const connectedStoreDoc = await getDoc(
            doc(db, "stores", connectedStoreId)
          );
          if (!connectedStoreDoc.exists()) continue;

          const connectedStoreData = connectedStoreDoc.data();

          // 該当店舗のユーザー一覧を取得
          const usersQuery = query(
            collection(db, "users"),
            where("storeId", "==", connectedStoreId)
          );
          const usersSnapshot = await getDocs(usersQuery);

          usersSnapshot.forEach((userDoc) => {
            const userData = userDoc.data();
            allUsers.push({
              uid: userDoc.id,
              nickname: userData["nickname"] || "名前未設定",
              email: userData["email"] || "",
              role: userData["role"] || "user",
              storeId: connectedStoreId,
              storeName: connectedStoreData.storeName,
              isFromOtherStore: true,
            });
          });
        } catch (error) {
          // Failed to get users from connected store
        }
      }

      return allUsers;
    } catch (error) {
      throw error;
    }
  },

  /**
   * ユーザーがアクセス可能な連携店舗一覧を取得
   */
  getConnectedStores: async (userUid: string): Promise<StoreInfo[]> => {
    try {
      // ユーザーのアクセス権限を取得
      const userAccess = await MultiStoreService.getUserStoreAccess(userUid);

      if (!userAccess || !userAccess.storesAccess) {
        return [];
      }

      const connectedStores: StoreInfo[] = [];

      // アクセス権限のある各店舗の詳細情報を取得
      for (const storeId of Object.keys(userAccess.storesAccess)) {
        try {
          const storeDoc = await getDoc(doc(db, "stores", storeId));
          if (storeDoc.exists()) {
            const storeData = storeDoc.data();
            const storeAccess = userAccess.storesAccess[storeId];

            // アクティブな店舗のみ追加
            if (storeAccess.isActive) {
              connectedStores.push({
                storeId: storeId,
                storeName: storeData["storeName"] || storeAccess.storeName,
                adminUid: storeData["adminUid"] || "",
                adminNickname: storeData["adminNickname"] || "",
                isActive: true,
                createdAt: storeData["createdAt"] || new Date(),
              });
            }
          }
        } catch (error) {
          // Failed to get store info
        }
      }

      return connectedStores;
    } catch (error) {
      return [];
    }
  },

  /**
   * 店舗連携時に両店舗の全講師のconnectedStores配列を更新
   */
  updateUsersConnectedStores: async (
    storeId1: string,
    storeId2: string,
    action: "connect" | "disconnect"
  ): Promise<void> => {
    try {
      // 両店舗の講師を取得
      const store1UsersQuery = query(
        collection(db, "users"),
        where("storeId", "==", storeId1)
      );
      const store2UsersQuery = query(
        collection(db, "users"),
        where("storeId", "==", storeId2)
      );

      const [store1UsersSnapshot, store2UsersSnapshot] = await Promise.all([
        getDocs(store1UsersQuery),
        getDocs(store2UsersQuery),
      ]);

      const updates: Promise<void>[] = [];

      // store1の講師のconnectedStoresにstore2を追加/削除
      store1UsersSnapshot.forEach((userDoc) => {
        const userData = userDoc.data();
        const currentConnected = userData.connectedStores || [];

        let newConnectedStores: string[];
        if (action === "connect") {
          // 重複チェックして追加
          newConnectedStores = currentConnected.includes(storeId2)
            ? currentConnected
            : [...currentConnected, storeId2];
        } else {
          // 削除
          newConnectedStores = currentConnected.filter(
            (id: string) => id !== storeId2
          );
        }

        if (
          JSON.stringify(currentConnected) !==
          JSON.stringify(newConnectedStores)
        ) {
          updates.push(
            updateDoc(doc(db, "users", userDoc.id), {
              connectedStores: newConnectedStores,
              updatedAt: serverTimestamp(),
            })
          );
        }
      });

      // store2の講師のconnectedStoresにstore1を追加/削除
      store2UsersSnapshot.forEach((userDoc) => {
        const userData = userDoc.data();
        const currentConnected = userData.connectedStores || [];

        let newConnectedStores: string[];
        if (action === "connect") {
          // 重複チェックして追加
          newConnectedStores = currentConnected.includes(storeId1)
            ? currentConnected
            : [...currentConnected, storeId1];
        } else {
          // 削除
          newConnectedStores = currentConnected.filter(
            (id: string) => id !== storeId1
          );
        }

        if (
          JSON.stringify(currentConnected) !==
          JSON.stringify(newConnectedStores)
        ) {
          updates.push(
            updateDoc(doc(db, "users", userDoc.id), {
              connectedStores: newConnectedStores,
              updatedAt: serverTimestamp(),
            })
          );
        }
      });

      // 全ての更新を実行
      await Promise.all(updates);

      // Successfully updated stores for users
    } catch (error) {
      // Failed to update users' connected stores
      throw error;
    }
  },
};
