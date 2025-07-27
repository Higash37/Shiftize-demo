const express = require("express");
const bcrypt = require("bcrypt");
const admin = require("firebase-admin");
const app = express();

// Firebase Admin SDKの初期化
const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

app.use(express.json());

app.post("/hash-password", async (req, res) => {
  const { password } = req.body;
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  res.json({ hashedPassword });
});

// ユーザー削除のエンドポイント
app.delete("/api/users/:uid", async (req, res) => {
  try {
    const { uid } = req.params;

    // Firebase Authenticationからユーザーを削除
    await admin.auth().deleteUser(uid);

    res.status(200).json({ message: "ユーザーが正常に削除されました" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "ユーザーの削除中にエラーが発生しました" });
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
