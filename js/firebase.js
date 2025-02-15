// 🔹 Firebase 設定
const firebaseConfig = {
    apiKey: "你的API金鑰",
    authDomain: "你的Firebase專案.firebaseapp.com",
    databaseURL: "https://你的Firebase專案.firebaseio.com",
    projectId: "你的Firebase專案ID",
    storageBucket: "你的Firebase專案.appspot.com",
    messagingSenderId: "你的發送者ID",
    appId: "你的應用ID"
};

// 🔹 初始化 Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const auth = firebase.auth();
