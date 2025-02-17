// 🔹 引入 Firebase 函式
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-analytics.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";


const firebaseConfig = {
  apiKey: "AIzaSyBNMOLOUp4VrjdQiULXQCInNyI8gx7kl9s",
  authDomain: "frontiersilver-4a99a.firebaseapp.com",
  databaseURL: "https://frontiersilver-4a99a-default-rtdb.firebaseio.com",
  projectId: "frontiersilver-4a99a",
  storageBucket: "frontiersilver-4a99a.appspot.com",
  messagingSenderId: "547331341626",
  appId: "1:547331341626:web:275d76403296f888686403",
  measurementId: "G-3Q5WS2C328"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = firebase.database();
const auth = firebase.auth();

function writeUserData(userId, name, email) {
    database.ref('users/' + userId).set({
        username: name,
        email: email
    }).then(() => {
        console.log("✅ 使用者資料成功寫入 Firebase");
    }).catch((error) => {
        console.error("❌ 錯誤：", error);
    });
}

writeUserData("user123", "John Doe", "johndoe@example.com");
