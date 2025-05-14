// ✅ 初始化 Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBNMOLOUp4VrjdQiULXQCInNyI8gx7kl9s",
  authDomain: "frontiersilver-4a99a.firebaseapp.com",
  databaseURL: "https://frontiersilver-4a99a-default-rtdb.firebaseio.com",
  projectId: "frontiersilver-4a99a",
  storageBucket: "frontiersilver-4a99a.appspot.com",
  messagingSenderId: "547331341626",
  appId: "1:547331341626:web:275d76403296f888686403"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();

// ✅ 頁面初始化
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("uploadForm")?.addEventListener("submit", handleUpload);
  document.getElementById("fileInput")?.addEventListener("change", handlePreview);
    loadTags(); // 🔺 加這一行才會載入 Firestore 裡的自訂標籤
  renderGallery();
});

// ✅ 圖片預覽
function handlePreview(e) {
  const file = e.target.files[0];
  const preview = document.getElementById("preview");
  if (file && preview) {
    const reader = new FileReader();
    reader.onload = (e) => {
      preview.src = e.target.result;
      preview.style.display = "block";
    };
    reader.readAsDataURL(file);
  } else {
    preview.src = "";
    preview.style.display = "none";
  }
}
async function loadTags() {
  const tagTypes = ["series", "type", "usage"];
  for (const tagType of tagTypes) {
    const tagRef = db.collection("tags").doc(tagType);
    const doc = await tagRef.get();

    if (!doc.exists) {
      await tagRef.set({ values: [] }); // 若沒有則自動建立
      continue;
    }

    const values = doc.data().values || [];
    const select = document.getElementById(`${tagType}Select`);
    const existingOptions = Array.from(select.options).map(opt => opt.value);

    // 只加入還沒出現的
    values.forEach(val => {
      if (!existingOptions.includes(val)) {
        const opt = document.createElement("option");
        opt.value = val;
        opt.textContent = val;
        select.appendChild(opt);
      }
    });
  }
}
async function addNewTag(type) {
  const input = document.getElementById(`new${capitalize(type)}Input`);
  const newValue = input.value.trim();
  if (!newValue) return alert("請輸入內容");

  const tagRef = db.collection("tags").doc(type);
  const doc = await tagRef.get();

  let values = [];
  if (doc.exists) {
    values = doc.data().values || [];
    if (values.includes(newValue)) return alert("此項目已存在！");
  }

  values.push(newValue);
  await tagRef.set({ values });

  const select = document.getElementById(`${type}Select`);
  const opt = document.createElement("option");
  opt.value = newValue;
  opt.textContent = newValue;
  select.appendChild(opt);
  select.value = newValue; // 自動選取剛加的
  input.value = "";
}
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
// ✅ 上傳作品
async function handleUpload(e) {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const price = document.getElementById("price").value;
  const concept = document.getElementById("concept").value;
  const material = document.getElementById("material").value;
  const weight = document.getElementById("weight").value;
  const sizeChoice = document.getElementById("sizeChoice").value;
  const file = document.getElementById("fileInput").files[0];
  const series = document.getElementById("seriesSelect").value;
  const type = document.getElementById("typeSelect").value;
  const usage = document.getElementById("usageSelect").value;
  const length = document.getElementById("lengthInput").value;
  const width = document.getElementById("widthInput").value;
  const height = document.getElementById("heightInput").value;
  const size = `${length}mm×${width}mm×${height}mm`;

  if (!file) return alert("請選擇圖片");

  try {
    const storageRef = storage.ref(`works/${Date.now()}_${file.name}`);
    const snapshot = await storageRef.put(file);
    const imageUrl = await snapshot.ref.getDownloadURL();

    await db.collection("works").add({
      name,
      price,
      concept,
      material,
      size,
      weight,
      sizeChoice,
      series,
      type,
      usage,
      imageUrl,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });

    alert("✅ 上傳成功！");
    document.getElementById("uploadForm").reset();
    document.getElementById("preview").style.display = "none";
    renderGallery();
  } catch (err) {
    console.error("❌ 上傳失敗：", err);
    alert("上傳失敗：" + err.message);
  }
}

// ✅ 顯示所有作品
async function renderGallery() {
  const gallery = document.getElementById("gallery");
  if (!gallery) return;

  gallery.innerHTML = "<p>載入中...</p>";

  try {
    const snapshot = await db.collection("works").orderBy("timestamp", "desc").get();
    gallery.innerHTML = "";

    if (snapshot.empty) {
      gallery.innerHTML = "<p>目前尚無作品。</p>";
      return;
    }

    snapshot.forEach(doc => {
      const data = doc.data();
      const div = document.createElement("div");
      div.className = "item";
      div.innerHTML = `
        <img src="${data.imageUrl}" alt="${data.name}" style="width:200px;height:auto;">
        <p><strong>${data.name}</strong></p>
        <p>系列：${data.series}</p>
        <p>品項：${data.type}</p>
        <p>用途：${data.usage}</p>
        <p>價錢：${data.price}</p>
        <p>理念：${data.concept}</p>
        <p>材質：${data.material}</p>
        <p>尺寸：${data.size}（${data.sizeChoice}號）</p>
        <p>重量：${data.weight}</p>
        <button onclick="editWork('${doc.id}')">✏️ 編輯</button>
        <button onclick="deleteWork('${doc.id}')">🗑️ 刪除</button>
      `;
      gallery.appendChild(div);
    });
  } catch (err) {
    console.error("❌ 讀取作品失敗：", err);
    gallery.innerHTML = "<p>無法載入作品</p>";
  }
}

// ✅ 編輯作品（目前僅修改價格，可擴充）
async function editWork(workId) {
  const doc = await db.collection("works").doc(workId).get();
  const data = doc.data();
  const newPrice = prompt("輸入新價格：", data.price);
  if (newPrice !== null) {
    await db.collection("works").doc(workId).update({ price: newPrice });
    alert("✅ 價格已更新！");
    renderGallery();
  }
}

// ✅ 刪除作品
async function deleteWork(workId) {
  if (confirm("確定要刪除這個作品嗎？")) {
    await db.collection("works").doc(workId).delete();
    alert("✅ 已刪除");
    renderGallery();
  }
}
// 側邊選單
function toggleMenu() {
  let sidebar = document.getElementById("sidebar");
  let overlay = document.getElementById("overlay");
  if (!sidebar || !overlay) return;

  sidebar.classList.toggle("open");
  overlay.classList.toggle("open");
}

function toggleMenu2() {
  const dropdown = document.querySelector(".dropdown");
  const menu = document.querySelector(".dropdown-content");
  if (!dropdown || !menu) return;

  const isOpen = menu.style.display === "block";
  menu.style.display = isOpen ? "none" : "block";
  dropdown.classList.toggle("active", !isOpen);
}

function closeMenu() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  if (!sidebar || !overlay) return;
  sidebar.classList.remove("open");
  overlay.classList.remove("open");
}
