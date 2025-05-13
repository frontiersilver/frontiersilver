// ✅ Firebase 配置
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

// 初始化 Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();  // ✅ 初始化 Firebase Storage

// 監聽表單提交
document.getElementById("uploadForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    // 取得輸入值
    const name = document.getElementById("name").value;
    const price = document.getElementById("price").value;
    const concept = document.getElementById("concept").value;
    const material = document.getElementById("material").value;
    const size = document.getElementById("size").value;
    const weight = document.getElementById("weight").value;
    const sizeChoice = document.getElementById("sizeChoice").value;
    const file = document.getElementById("fileInput").files[0]; // ✅ 取得檔案

    if (!file) {
        alert("請選擇圖片上傳！");
        return;
    }

    try {
        // ✅ 1. 上傳圖片到 Firebase Storage
        const storageRef = storage.ref(`works/${file.name}`);
        const snapshot = await storageRef.put(file);
        const imageUrl = await snapshot.ref.getDownloadURL(); // ✅ 獲取圖片 URL

        console.log("圖片上傳成功，URL:", imageUrl);

        // ✅ 2. 上傳作品資訊到 Firestore
        const docRef = await db.collection("works").add({
            name,
            price,
            concept,
            material,
            size,
            weight,
            sizeChoice,
            imageUrl,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });

        console.log("作品已上傳，ID：", docRef.id);
        alert("作品上傳成功！");
        document.getElementById("uploadForm").reset(); // ✅ 清空表單
        renderGallery(); // ✅ 重新載入作品展示
    } catch (error) {
        console.error("上傳失敗：", error);
        alert("上傳失敗，請檢查網路或 Firebase 設定！");
    }
});

// ✅ 讀取並顯示作品
async function renderGallery() {
    const gallery = document.getElementById("gallery");
    gallery.innerHTML = ""; // ✅ 清空現有內容

    const querySnapshot = await db.collection("works").orderBy("timestamp", "desc").get();
    querySnapshot.forEach(doc => {
        const data = doc.data();
        const div = document.createElement("div");
        div.classList.add("item");
        div.innerHTML = `
            <img src="${data.imageUrl}" alt="${data.name}" style="width:200px;height:auto;">
            <p><strong>${data.name}</strong></p>
            <p>價錢：${data.price}</p>
            <p>理念：${data.concept}</p>
            <p>材質：${data.material}</p>
            <p>尺寸：${data.size} (${data.sizeChoice}號)</p>
            <p>重量：${data.weight}</p>
        `;
        gallery.appendChild(div);
    });
}

// ✅ 頁面載入時，自動顯示所有作品
document.addEventListener("DOMContentLoaded", renderGallery);
