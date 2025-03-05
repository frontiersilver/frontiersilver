// 🔹 引入 Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
    getAuth,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import {
    getDatabase,
    ref,
    set,
    push,
    onValue,
    get
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

// 🔹 Firebase 設定
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

// 🔹 初始化 Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// 🔹 監聽登入按鈕
document.getElementById("loginBtn").addEventListener("click", async function () {
    const email = document.getElementById("authorEmail").value.trim();
    const password = document.getElementById("authorPassword").value.trim();

    if (!email || !password) {
        alert("請輸入 Email 和 密碼！");
        return;
    }

    try {
        // ✅ 直接用 Firebase Authentication 登入
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("✅ 登入成功！", userCredential.user);
        alert("登入成功！");
    } catch (error) {
        console.error("⚠️ 登入失敗：", error.message);
        alert("登入失敗：" + error.message);
    }
});

// 🔹 註冊新帳號
document.getElementById("registerBtn").addEventListener("click", async function () {
    const email = document.getElementById("authorEmail").value.trim();
    const password = document.getElementById("authorPassword").value.trim();

    if (!email || !password) {
        alert("請輸入 Email 和 密碼！");
        return;
    }

    try {
        // ✅ 使用 Firebase Authentication 註冊
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log("🎉 註冊成功！", user);

        // ✅ 儲存用戶資訊（不儲存密碼！）
        await set(ref(database, "users/" + user.uid), {
            email: email,
            createdAt: new Date().toISOString()
        });

        alert("帳號已創建並自動登入！");
    } catch (error) {
        console.error("❌ 註冊失敗：", error.message);
        alert("註冊失敗：" + error.message);
    }
});

// 🔹 監聽登出按鈕
document.getElementById("logoutBtn").addEventListener("click", function () {
    signOut(auth)
        .then(() => alert("已登出！"))
        .catch((error) => console.error("❌ 登出錯誤：", error.message));
});

// 🔹 監聽用戶登入狀態，確保頁面更新
onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log("✅ 使用者已登入", user.uid);

        // 檢查是否為管理員
        const isAdmin = await checkIfAdmin(user.uid);
        if (isAdmin) {
            console.log("✅ 你是管理員！");
        } else {
            console.log("⚠️ 你不是管理員");
        }

        // 讀取用戶專屬留言
        loadAdminMessages(user.uid);
    } else {
        console.warn("⚠️ 尚未登入");
    }
});

// 🔹 檢查是否為管理員
async function checkIfAdmin(userId) {
    const adminRef = ref(database, "admins/" + userId);
    try {
        const snapshot = await get(adminRef);
        return snapshot.exists();
    } catch (error) {
        console.error("❌ 讀取管理員權限失敗", error);
        return false;
    }
}

// 🔹 發送留言
document.getElementById("submitMessage").addEventListener("click", function () {
    const messageText = document.getElementById("message").value.trim();
    const titleText = document.getElementById("title").value.trim();
    const user = auth.currentUser;

    if (!user) {
        alert("請先登入！");
        return;
    }

    if (!messageText || !titleText) {
        alert("請輸入標題與留言！");
        return;
    }

    push(ref(database, "messages"), {
        title: titleText,
        text: messageText,
        authorID: user.uid
    });

    document.getElementById("message").value = "";
    document.getElementById("title").value = "";
    alert("留言已儲存！");
});

// 🔹 顯示留言標題（所有人可見）
function loadPublicMessages() {
    const publicMessageList = document.getElementById("publicMessageList");
    publicMessageList.innerHTML = "";
    onValue(ref(database, "messages"), (snapshot) => {
        snapshot.forEach((childSnapshot) => {
            let messageData = childSnapshot.val();
            let messageItem = document.createElement("div");
            messageItem.classList.add("message-item");
            messageItem.innerHTML = `<strong>${messageData.title}</strong>`;
            publicMessageList.appendChild(messageItem);
        });
    });
}

// 🔹 顯示完整留言（只有作者可見）
function loadAdminMessages(userId) {
    const adminMessageList = document.getElementById("adminMessageList");
    adminMessageList.innerHTML = "";
    onValue(ref(database, "messages"), (snapshot) => {
        snapshot.forEach((childSnapshot) => {
            let messageData = childSnapshot.val();
            if (messageData.authorID === userId) {
                let messageItem = document.createElement("div");
                messageItem.classList.add("message-item");
                messageItem.innerHTML = `<strong>${messageData.title}</strong><p>${messageData.text}</p>`;
                adminMessageList.appendChild(messageItem);
            }
        });
    });
}

// 🔹 頁面加載時，載入公開留言
document.addEventListener("DOMContentLoaded", loadPublicMessages);
