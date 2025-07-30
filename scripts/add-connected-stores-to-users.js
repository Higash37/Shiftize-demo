/**
 * 特定店舗の全講師にconnectedStores配列を追加するスクリプト
 * 使用方法: node scripts/add-connected-stores-to-users.js
 */

const admin = require("firebase-admin");

// Firebase Admin SDKの初期化
const serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function addConnectedStoresToUsers() {
  try {
    // 設定：連携する店舗ID
    const storeId1 = "1456"; // トライ川崎駅前校
    const storeId2 = "0000"; // 連携先店舗ID


    // store1の全講師を取得
    const store1UsersQuery = await db
      .collection("users")
      .where("storeId", "==", storeId1)
      .get();

    // store2の全講師を取得
    const store2UsersQuery = await db
      .collection("users")
      .where("storeId", "==", storeId2)
      .get();

    const batch = db.batch();
    let updateCount = 0;

    // store1の講師にstore2を追加
    store1UsersQuery.forEach((doc) => {
      const userData = doc.data();
      const currentConnected = userData.connectedStores || [];

      if (!currentConnected.includes(storeId2)) {
        const newConnectedStores = [...currentConnected, storeId2];
        batch.update(doc.ref, {
          connectedStores: newConnectedStores,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        updateCount++;
      }
    });

    // store2の講師にstore1を追加
    store2UsersQuery.forEach((doc) => {
      const userData = doc.data();
      const currentConnected = userData.connectedStores || [];

      if (!currentConnected.includes(storeId1)) {
        const newConnectedStores = [...currentConnected, storeId1];
        batch.update(doc.ref, {
          connectedStores: newConnectedStores,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        updateCount++;
      }
    });

    if (updateCount > 0) {
      await batch.commit();
    } else {
    }

    // 結果確認
    const updatedStore1Users = await db
      .collection("users")
      .where("storeId", "==", storeId1)
      .get();
    updatedStore1Users.forEach((doc) => {
      const userData = doc.data();
    });

    const updatedStore2Users = await db
      .collection("users")
      .where("storeId", "==", storeId2)
      .get();
    updatedStore2Users.forEach((doc) => {
      const userData = doc.data();
    });
  } catch (error) {
    console.error("Error updating users:", error);
  } finally {
    process.exit();
  }
}

addConnectedStoresToUsers();
