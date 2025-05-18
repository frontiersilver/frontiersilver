// ✅ 確保 Firebase SDK 已正確載入（firebase-app.js 與 firebase-firestore.js）
// 本檔案請確保在 HTML 中「firebase-app.js 和 firebase-firestore.js」之後載入

// ✅ 避免重複初始化 Firebase
if (!firebase.apps.length) {
  const firebaseConfig = {
    apiKey: "AIzaSyBNMOLOUp4VrjdQiULXQCInNyI8gx7kl9s",
    authDomain: "frontiersilver-4a99a.firebaseapp.com",
    projectId: "frontiersilver-4a99a",
    storageBucket: "frontiersilver-4a99a.appspot.com",
    messagingSenderId: "547331341626",
    appId: "1:547331341626:web:275d76403296f888686403"
  };

  firebase.initializeApp(firebaseConfig);
}

// ✅ 提供全站共用 Firestore 實例
const db = firebase.firestore();
