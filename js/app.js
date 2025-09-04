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
  push,
  onValue,
  get,
  set
} from "https://www.gstatic.com/firebasejs/11.3.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBNMOLOUp4VrjdQiULXQCInNyI8gx7kl9s",
  authDomain: "frontiersilver-4a99a.firebaseapp.com",
  databaseURL: "https://frontiersilver-4a99a-default-rtdb.firebaseio.com",
  projectId: "frontiersilver-4a99a",
  storageBucket: "frontiersilver-4a99a.appspot.com",
  messagingSenderId: "547331341626",
  appId: "1:547331341626:web:275d76403296f888686403"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("loginBtn")?.addEventListener("click", handleLoginLogout);
  document.getElementById("submitMessage")?.addEventListener("click", handleSendMessage);
  document.getElementById("closePopup")?.addEventListener("click", () => {
    document.getElementById("popup").style.display = "none";
  });

  onAuthStateChanged(auth, async (user) => {
  const loginBtn = document.getElementById("loginBtn");
  const uploadLink = document.getElementById("uploadLink");

  if (!loginBtn) return;

  if (user) {
    loginBtn.textContent = "登出";

    // ✅ 判斷是否為管理員
    try {
      const adminSnap = await get(ref(db, `admins/${user.uid}`));
      const isAdmin = adminSnap.exists() && adminSnap.val() === true;

      if (isAdmin) {
        console.log("✅ 管理員登入成功");
        if (uploadLink) uploadLink.style.display = "block";
      } else {
        if (uploadLink) uploadLink.style.display = "none";
        console.log("⚠️ 登入者不是管理員");
      }
    } catch (e) {
      console.error("❌ 讀取 admin 權限錯誤：", e);
    }

    loadPublicMessages();
  } else {
    loginBtn.textContent = "登入";
    if (uploadLink) uploadLink.style.display = "none";
  }
});
  loadPublicMessages();
});

// ✅ 登入/登出整合
async function handleLoginLogout() {
  const user = auth.currentUser;
  if (user) {
    // ✅ 登出流程
    try {
      await signOut(auth);
      alert("✅ 已登出！");
    } catch (err) {
      alert("❌ 登出錯誤：" + err.message);
    }
    return;
  }

  // ✅ 登入流程
  const email = document.getElementById("authorEmail")?.value.trim();
  const password = document.getElementById("authorPassword")?.value.trim();

  if (!email || !password) return alert("請輸入 Email 和密碼！");
  if (!email.includes("@") || password.length < 6) return alert("Email 格式或密碼長度錯誤");

  try {
    await signInWithEmailAndPassword(auth, email, password);
    alert("✅ 登入成功！");
  } catch (err) {
    if (err.code === "auth/user-not-found" || err.code === "auth/invalid-credential") {
      try {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        await set(ref(db, `users/${userCred.user.uid}`), {
          email,
          createdAt: new Date().toISOString()
        });
        alert("✅ 帳號不存在，已自動註冊並登入！");
      } catch (signupErr) {
        alert("❌ 註冊失敗：" + translateError(signupErr.code));
      }
    } else {
      alert("❌ 登入失敗：" + translateError(err.code));
    }
  }
}

// ✅ 留言功能
async function handleSendMessage() {
  const user = auth.currentUser;
  const title = document.getElementById("title")?.value.trim();
  const text = document.getElementById("message")?.value.trim();
  if (!user) return alert("⚠️ 請先登入！");
  if (!title || !text) return alert("請輸入標題與內容");

  try {
    await push(ref(db, "messages"), {
      title,
      text,
      authorID: user.uid,
      authorEmail: user.email,
      timestamp: Date.now(),
      replies: {}
    });
    alert("✅ 留言已儲存！");
    document.getElementById("title").value = "";
    document.getElementById("message").value = "";
  } catch (err) {
    alert("❌ 留言失敗：" + err.message);
  }
}

// ✅ 載入留言標題
function loadPublicMessages() {
  const container = document.getElementById("publicMessageList");
  if (!container) return;

  onValue(ref(db, "messages"), (snapshot) => {
    container.innerHTML = "";
    snapshot.forEach((child) => {
      const data = child.val();
      const div = document.createElement("div");
      div.className = "message-item";
      div.innerHTML = `
        <strong class="message-title" data-id="${child.key}">${data.title}</strong>
        <span class="message-author">（${data.authorEmail}）</span>
      `;
      container.appendChild(div);
    });

    document.querySelectorAll(".message-title").forEach(el => {
      el.addEventListener("click", e => openMessagePopup(e.target.dataset.id));
    });
  });
}

// ✅ 彈窗內容顯示
function openMessagePopup(messageId) {
  const user = auth.currentUser;
  if (!user) return alert("請先登入");

  get(ref(db, `messages/${messageId}`)).then(async (snapshot) => {
    const data = snapshot.val();
    if (!data) return alert("⚠️ 留言不存在");

    const isAuthor = data.authorID === user.uid;
    const isAdminSnap = await get(ref(db, `admins/${user.uid}`));
    const isAdmin = isAdminSnap.exists() && isAdminSnap.val() === true;

    if (!isAuthor && !isAdmin) {
      return alert("⚠️ 僅留言者或管理員可查看");
    }

    document.getElementById("popupTitle").innerText = data.title;
    document.getElementById("popupText").innerText = data.text;

    const replyList = document.getElementById("popupReplies");
    replyList.innerHTML = "";
    Object.values(data.replies || {}).forEach(reply => {
      const p = document.createElement("p");
      p.innerText = reply;
      replyList.appendChild(p);
    });

    document.getElementById("replyButton").onclick = () => submitReply(messageId);
    document.getElementById("popup").style.display = "block";
  });
}

// ✅ 回覆留言
async function submitReply(messageId) {
  const replyText = document.getElementById("replyInput").value.trim();
  if (!replyText) return alert("請輸入回覆內容");

  try {
    await push(ref(db, `messages/${messageId}/replies`), replyText);
    document.getElementById("replyInput").value = "";
    openMessagePopup(messageId);
  } catch (err) {
    alert("❌ 回覆失敗：" + err.message);
  }
}

// ✅ 錯誤翻譯
function translateError(code) {
  const map = {
    "auth/invalid-email": "Email 格式錯誤",
    "auth/wrong-password": "密碼錯誤",
    "auth/user-disabled": "帳號已被停用",
    "auth/email-already-in-use": "Email 已存在或密碼錯誤",
    "auth/weak-password": "密碼太弱，需至少 6 字",
    "auth/invalid-credential": "憑證錯誤，請確認帳號密碼"
  };
  return map[code] || `未知錯誤：${code}`;
}
