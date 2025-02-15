document.addEventListener("DOMContentLoaded", function () {
    const messageInput = document.getElementById("message");
    const titleInput = document.getElementById("title");
    const submitButton = document.getElementById("submitMessage");
    const publicMessageList = document.getElementById("publicMessageList");
    const adminMessageList = document.getElementById("adminMessageList");
    const loginBtn = document.getElementById("loginBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    const authorEmail = document.getElementById("authorEmail");
    const authorPassword = document.getElementById("authorPassword");

    let currentAuthorID = null; // 🔹 追蹤作者登入狀態

    // 🔹 發送留言
    submitButton.addEventListener("click", function () {
        const messageText = messageInput.value.trim();
        const titleText = titleInput.value.trim();

        if (messageText === "" || titleText === "") {
            alert("請輸入標題與留言！");
            return;
        }

        database.ref("messages").push({
            title: titleText,
            text: messageText,
            authorID: "admin123" // 🔹 只有這個作者能查看留言內容
        });

        messageInput.value = "";
        titleInput.value = "";
        alert("留言已儲存！");
    });

    // 🔹 顯示留言標題（所有人可見）
    function loadPublicMessages() {
        publicMessageList.innerHTML = "";
        database.ref("messages").once("value", function (snapshot) {
            snapshot.forEach(function (childSnapshot) {
                let messageData = childSnapshot.val();
                let messageItem = document.createElement("div");
                messageItem.classList.add("message-item");
                messageItem.innerHTML = `<strong>${messageData.title}</strong>`;
                publicMessageList.appendChild(messageItem);
            });
        });
    }

    // 🔹 顯示完整留言（只有作者登入後可見）
    function loadAdminMessages() {
        adminMessageList.innerHTML = "";
        database.ref("messages").once("value", function (snapshot) {
            snapshot.forEach(function (childSnapshot) {
                let messageData = childSnapshot.val();

                if (messageData.authorID === currentAuthorID) { // 🔹 只有 `admin123` 可以看到詳細內容
                    let messageItem = document.createElement("div");
                    messageItem.classList.add("message-item");
                    messageItem.innerHTML = `<strong>${messageData.title}</strong><p>${messageData.text}</p>`;
                    adminMessageList.appendChild(messageItem);
                }
            });
        });
    }

    // 🔹 登入
    loginBtn.addEventListener("click", function () {
        const email = authorEmail.value.trim();
        const password = authorPassword.value.trim();

        auth.signInWithEmailAndPassword(email, password)
            .then(userCredential => {
                currentAuthorID = "admin123"; 
                alert("登入成功！");
                loginBtn.style.display = "none";
                logoutBtn.style.display = "block";
                loadAdminMessages();
            })
            .catch(error => {
                alert("登入失敗：" + error.message);
            });
    });

    // 🔹 登出
    logoutBtn.addEventListener("click", function () {
        auth.signOut().then(() => {
            currentAuthorID = null;
            alert("已登出！");
            loginBtn.style.display = "block";
            logoutBtn.style.display = "none";
            adminMessageList.innerHTML = "";
        });
    });

    // 🔹 頁面加載時，載入公開留言
    loadPublicMessages();
});
