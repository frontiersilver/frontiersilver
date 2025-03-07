// 🔹 引入 Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import {
    getAuth,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";
import {
    getDatabase,
    ref,
    set,
    push,
    onValue,
    get
} from "https://www.gstatic.com/firebasejs/11.3.1/firebase-database.js";

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

// 🔹 確保 DOM 載入後執行
document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ DOM 加載完成，初始化 Firebase");

    const loginBtn = document.getElementById("loginBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    const submitMessageBtn = document.getElementById("submitMessage");

    if (loginBtn) {
        loginBtn.addEventListener("click", handleLogin);
    } else {
        console.error("❌ 找不到 loginBtn 按鈕");
    }

    if (logoutBtn) {
        logoutBtn.addEventListener("click", handleLogout);
    } else {
        console.error("❌ 找不到 logoutBtn 按鈕");
    }

    if (submitMessageBtn) {
        submitMessageBtn.addEventListener("click", handleSendMessage);
    } else {
        console.error("❌ 找不到 submitMessage 按鈕");
    }

    // 🔹 監聽登入狀態變化
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            console.log("✅ 使用者已登入:", user.uid);
            logoutBtn.style.display = "inline";
            loginBtn.style.display = "none";

            loadAdminMessages(user.uid); // 讀取用戶留言
        } else {
            console.warn("⚠️ 尚未登入");
            logoutBtn.style.display = "none";
            loginBtn.style.display = "inline";
        }
    });

    // 🔹 載入公開留言
    loadPublicMessages();
});

// 🔹 登入功能
async function handleLogin() {
    const email = document.getElementById("authorEmail").value.trim();
    const password = document.getElementById("authorPassword").value.trim();

    if (!email || !password) {
        alert("⚠️ 請輸入 Email 和 密碼！");
        return;
    }

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("✅ 登入成功！", userCredential.user);
        alert("✅ 登入成功！");
    } catch (error) {
        console.error("⚠️ 登入失敗：", error.message);
        alert("⚠️ 登入失敗：" + error.message);
    }
}

// 🔹 登出功能
async function handleLogout() {
    try {
        await signOut(auth);
        alert("✅ 已登出！");
    } catch (error) {
        console.error("❌ 登出錯誤：", error.message);
    }
}

// 🔹 發送留言（包含作者 Gmail）
async function handleSendMessage() {
    const messageText = document.getElementById("message").value.trim();
    const titleText = document.getElementById("title").value.trim();
    const user = auth.currentUser;

    if (!user) {
        alert("⚠️ 請先登入！");
        return;
    }

    if (!messageText || !titleText) {
        alert("⚠️ 請輸入標題與留言！");
        return;
    }

    try {
        await push(ref(database, "messages"), {
            title: titleText,
            text: messageText,
            authorID: user.uid,
            authorEmail: user.email,  // ✅ 儲存 Gmail
            timestamp: Date.now(),
            replies: {}
        });

        document.getElementById("message").value = "";
        document.getElementById("title").value = "";
        alert("✅ 留言已成功發送！");
    } catch (error) {
        console.error("❌ 發送留言失敗:", error);
        alert("⚠️ 發送留言失敗：" + error.message);
    }
}

// 🔹 顯示留言標題（包含作者 Gmail）
function loadPublicMessages() {
    const publicMessageList = document.getElementById("publicMessageList");
    if (!publicMessageList) {
        console.error("❌ 找不到 publicMessageList 元素");
        return;
    }

    publicMessageList.innerHTML = "";
    onValue(ref(database, "messages"), (snapshot) => {
        publicMessageList.innerHTML = ""; // 清空現有內容
        snapshot.forEach((childSnapshot) => {
            let messageData = childSnapshot.val();
            let messageId = childSnapshot.key;
            let messageItem = document.createElement("div");

            messageItem.classList.add("message-item");
            messageItem.innerHTML = `
                <strong class="message-title" data-id="${messageId}">${messageData.title}</strong>
                <span class="message-author">   帳號：${messageData.authorEmail}</span>
            `;
            publicMessageList.appendChild(messageItem);
        });

        // 綁定點擊事件，只有作者才能打開留言
        document.querySelectorAll(".message-title").forEach(title => {
            title.addEventListener("click", (event) => {
                const messageId = event.target.dataset.id;
                openMessagePopup(messageId);
            });
        });
    });
}
// 🔹 顯示留言內容 + 回覆
function openMessagePopup(messageId) {
    const user = auth.currentUser;
    if (!user) {
        alert("⚠️ 只有作者可以查看完整留言！");
        return;
    }

    get(ref(database, `messages/${messageId}`)).then((snapshot) => {
        if (snapshot.exists()) {
            const messageData = snapshot.val();

            if (messageData.authorID !== user.uid) {
                alert("⚠️ 只有留言作者能查看內容！");
                return;
            }

            // 設置彈出視窗內容
            document.getElementById("popupTitle").innerText = messageData.title;
            document.getElementById("popupText").innerText = messageData.text;
            document.getElementById("popupReplies").innerHTML = "";

            // 加載回覆
            if (messageData.replies) {
                Object.values(messageData.replies).forEach(reply => {
                    let replyItem = document.createElement("p");
                    replyItem.innerText = reply;
                    document.getElementById("popupReplies").appendChild(replyItem);
                });
            }

            // 設置回覆按鈕
            document.getElementById("replyButton").onclick = () => submitReply(messageId);
            document.getElementById("popup").style.display = "block";
        }
    });
}

// 🔹 送出回覆
async function submitReply(messageId) {
    const replyText = document.getElementById("replyInput").value.trim();
    if (!replyText) {
        alert("⚠️ 請輸入回覆內容！");
        return;
    }

    try {
        await push(ref(database, `messages/${messageId}/replies`), replyText);
        document.getElementById("replyInput").value = "";
        alert("✅ 回覆已送出！");
        openMessagePopup(messageId);
    } catch (error) {
        console.error("❌ 送出回覆失敗:", error);
        alert("⚠️ 回覆失敗：" + error.message);
    }
}

// 🔹 關閉彈出視窗
document.getElementById("closePopup").addEventListener("click", () => {
    document.getElementById("popup").style.display = "none";
});
