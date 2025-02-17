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

    if (email === "" || password === "") {
        alert("請輸入 Email 和 密碼！");
        return;
    }

    try {
        const userData = await checkUserExists(email);

        if (userData) {
            // ✅ 檢查密碼是否正確
            if (userData.password === password) {
                // ✅ 密碼正確，執行登入
                signInWithEmailAndPassword(auth, email, password)
                    .then((userCredential) => {
                        console.log("✅ 登入成功！", userCredential.user);
                        alert("登入成功！");
                    })
                    .catch((error) => {
                        console.warn("⚠️ 登入失敗：" + error.message);
                        alert("登入失敗：" + error.message);
                    });
            } else {
                // ❌ 密碼錯誤
                alert("⚠️ 密碼錯誤，請重新輸入！");
            }
        } else {
            // 🔹 使用者不存在，創建新帳號
            createUser(email, password);
        }
    } catch (error) {
        console.error("❌ 錯誤：", error);
        alert("發生錯誤：" + error.message);
    }
});

// 🔹 檢查 Firebase Database 是否已有該 Email
async function checkUserExists(email) {
    const usersRef = ref(database, "users");
    const snapshot = await get(usersRef);
    if (snapshot.exists()) {
        const usersData = snapshot.val();
        for (const userId in usersData) {
            if (usersData[userId].email === email) {
                return usersData[userId]; // ✅ 回傳使用者資訊（包含密碼）
            }
        }
    }
    return null; // ❌ 沒有找到該 Email
}

// 🔹 註冊新帳號並自動登入
function createUser(email, password) {
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log("🎉 新帳號已創建！", user);

            // 🔹 儲存使用者資料（包含密碼）
            set(ref(database, "users/" + user.uid), {
                email: email,
                password: password, // ✅ 儲存密碼
                createdAt: new Date().toISOString()
            }).then(() => {
                console.log("✅ 使用者資訊已儲存至 Firebase Database");
                alert("帳號已創建並自動登入！");
            }).catch((error) => {
                console.error("❌ 儲存錯誤：", error);
            });
        })
        .catch((error) => {
            console.error("❌ 註冊失敗：", error.message);
            alert("註冊失敗：" + error.message);
        });
}

// 🔹 監聽登出按鈕
document.getElementById("logoutBtn").addEventListener("click", function () {
    signOut(auth).then(() => {
        alert("已登出！");
    }).catch((error) => {
        console.error("❌ 登出錯誤：", error.message);
    });
});

// 🔹 監聽登入狀態
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("✅ 使用者已登入", user.uid);
        loadAdminMessages(user.uid);
    } else {
        console.warn("⚠️ 尚未登入");
    }
});

onAuthStateChanged(auth, (user) => {
    if (user) {
        checkIfAdmin(user).then((isAdmin) => {
            if (isAdmin) {
                console.log("✅ 你是管理員！");
            } else {
                console.log("⚠️ 你不是管理員");
            }
        });
    }
});

function checkIfAdmin(user) {
    if (!user) return Promise.resolve(false);

    const database = getDatabase();
    const adminRef = ref(database, "admins/" + user.uid);

    return get(adminRef).then((snapshot) => {
        return snapshot.exists(); // ✅ 存在代表是管理員
    }).catch((error) => {
        console.error("❌ 讀取管理員權限失敗", error);
        return false;
    });
}

// 🛠 登入後檢查是否為管理員
auth.onAuthStateChanged((user) => {
    if (user) {
        checkIfAdmin(user).then((isAdmin) => {
            if (isAdmin) {
                console.log("✅ 這是管理員！", user.uid);
            } else {
                console.warn("⚠️ 這不是管理員！", user.uid);
            }
        });
    }
});

// 🔹 監聽發送留言按鈕
document.getElementById("submitMessage").addEventListener("click", function () {
    const messageText = document.getElementById("message").value.trim();
    const titleText = document.getElementById("title").value.trim();
    const user = auth.currentUser;

    if (!user) {
        alert("請先登入！");
        return;
    }

    if (messageText === "" || titleText === "") {
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

// 🔹 顯示完整留言（只有作者登入後可見）
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
