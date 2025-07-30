// Firebaseの接続確認とコレクション確認用スクリプト
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

// Firebase設定（あなたの.envまたは設定から）
const firebaseConfig = {
  // ここに実際のFirebase設定を入れる必要があります
  // 実際の設定は.firebasercや環境変数から取得してください
};

async function checkCollections() {
  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    // filesコレクションを確認
    const filesRef = collection(db, 'files');
    const filesSnapshot = await getDocs(filesRef);
    
    // foldersコレクションも確認
    const foldersRef = collection(db, 'folders');
    const foldersSnapshot = await getDocs(foldersRef);
    
    // 各ドキュメントの詳細を表示
    filesSnapshot.forEach((doc) => {
    });
    
    foldersSnapshot.forEach((doc) => {
    });
    
  } catch (error) {
    console.error('エラー:', error);
  }
}

// この関数は手動で実行する必要があります
// checkCollections();