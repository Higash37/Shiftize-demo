import { collection, query, where, getDocs } from "firebase/firestore";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/services/firebase/firebase-core";

export const handleLogin = async (
  email: string,
  password: string,
  setError: (msg: string) => void
) => {
  try {
    // Firestoreからユーザー情報を取得
    const usersRef = collection(db, "users");
    const userQuery = query(usersRef, where("email", "==", email));
    const userSnapshot = await getDocs(userQuery);

    if (userSnapshot.empty) {
      throw new Error("ユーザーが見つかりません");
    }

    const userDoc = userSnapshot.docs[0];
    if (!userDoc) {
      throw new Error("ユーザーが見つかりません");
    }
    const userData = userDoc.data();

    // 削除フラグを確認
    if (userData['deleted']) {
      throw new Error("このユーザーは削除されています");
    }

    // currentPasswordと入力されたパスワードを照合

    if (userData['currentPassword'] !== password) {
      throw new Error("パスワードが正しくありません");
    }

    // Firebase Authでのログイン（メールアドレスとcurrentPasswordを使用）
    await signInWithEmailAndPassword(auth, email, userData['currentPassword']);
  } catch (err: any) {
    setError(err.message || "ログインに失敗しました");
  }
};
