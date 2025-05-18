// ✅ 確保 Firebase SDK 已正確載入（請在 HTML 先引入 firebase-app 和 firebase-firestore）

// 避免重複初始化
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

// ✅ Firestore 全域使用
const db = firebase.firestore();
