// 🔧 Firebase 初始化
const firebaseConfig = {
  apiKey: "AIzaSyBNMOLOUp4VrjdQiULXQCInNyI8gx7kl9s",
  authDomain: "frontiersilver-4a99a.firebaseapp.com",
  projectId: "frontiersilver-4a99a",
  storageBucket: "frontiersilver-4a99a.appspot.com",
  messagingSenderId: "547331341626",
  appId: "1:547331341626:web:275d76403296f888686403"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();

// ✅ DOM 載入後執行
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("uploadForm")?.addEventListener("submit", handleUpload);
  document.getElementById("fileInput")?.addEventListener("change", handlePreview);
  loadTags(); // 載入標籤（series/type/usage）
  renderGallery(); // 渲染作品
});

// ✅ 預覽圖片
function handlePreview(e) {
  const file = e.target.files[0];
  const preview = document.getElementById("preview");
  if (file) {
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

// ✅ 自動載入 Firestore 標籤選項
async function loadTags() {
  const categories = ["series", "type", "usage"];
  for (let cat of categories) {
    const doc = await db.collection("tags").doc(cat).get();
    const values = doc.exists ? doc.data().values || [] : [];

    const select = document.getElementById(`${cat}Select`);
    values.forEach(v => {
      if (!Array.from(select.options).some(opt => opt.value === v)) {
        const option = document.createElement("option");
        option.value = v;
        option.textContent = v;
        select.appendChild(option);
      }
    });
  }
}

// ✅ 新增標籤
async function addNewTag(type) {
  const input = document.getElementById(`new${capitalize(type)}Input`);
  const newValue = input.value.trim();
  if (!newValue) return alert("請輸入內容");

  const ref = db.collection("tags").doc(type);
  const doc = await ref.get();
  const current = doc.exists ? doc.data().values || [] : [];

  if (current.includes(newValue)) return alert("已存在！");
  current.push(newValue);
  await ref.set({ values: current });

  const select = document.getElementById(`${type}Select`);
  const option = document.createElement("option");
  option.value = newValue;
  option.textContent = newValue;
  select.appendChild(option);
  select.value = newValue;
  input.value = "";
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ✅ 上傳作品
async function handleUpload(e) {
  e.preventDefault();

  const file = document.getElementById("fileInput").files[0];
  if (!file) return alert("請選擇圖片！");

  const data = {
    name: document.getElementById("name").value,
    price: document.getElementById("price").value,
    concept: document.getElementById("concept").value,
    material: document.getElementById("material").value,
    weight: document.getElementById("weight").value,
    sizeChoice: document.getElementById("sizeChoice").value,
    series: document.getElementById("seriesSelect").value,
    type: document.getElementById("typeSelect").value,
    usage: document.getElementById("usageSelect").value,
    size: `${document.getElementById("lengthInput").value}mm×${document.getElementById("widthInput").value}mm×${document.getElementById("heightInput").value}mm`,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  };

  try {
    const ref = storage.ref(`works/${Date.now()}_${file.name}`);
    const snapshot = await ref.put(file);
    data.imageUrl = await snapshot.ref.getDownloadURL();

    await db.collection("works").add(data);
    alert("✅ 上傳成功！");
    document.getElementById("uploadForm").reset();
    document.getElementById("preview").style.display = "none";
    renderGallery();
  } catch (err) {
    console.error("❌ 上傳失敗：", err);
    alert("上傳失敗：" + err.message);
  }
}

// ✅ 渲染所有作品
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
      const d = doc.data();
      const div = document.createElement("div");
      div.className = "item";
      div.innerHTML = `
        <img src="${d.imageUrl}" alt="${d.name}" style="width:200px;height:auto;">
        <p><strong>${d.name}</strong></p>
        <p>系列：${d.series}</p>
        <p>品項：${d.type}</p>
        <p>用途：${d.usage}</p>
        <p>價格：${d.price}</p>
        <p>理念：${d.concept}</p>
        <p>材質：${d.material}</p>
        <p>尺寸：${d.size}（${d.sizeChoice}號）</p>
        <p>重量：${d.weight}</p>
        <button onclick="editWork('${doc.id}')">✏️ 編輯</button>
        <button onclick="deleteWork('${doc.id}')">🗑️ 刪除</button>
      `;
      gallery.appendChild(div);
    });
  } catch (err) {
    console.error("❌ 載入失敗：", err);
    gallery.innerHTML = "<p>無法載入作品。</p>";
  }
}

// ✅ 編輯價格
async function editWork(id) {
  const doc = await db.collection("works").doc(id).get();
  const data = doc.data();
  const newPrice = prompt("輸入新價格：", data.price);
  if (newPrice !== null) {
    await db.collection("works").doc(id).update({ price: newPrice });
    alert("✅ 已更新！");
    renderGallery();
  }
}

// ✅ 刪除作品
async function deleteWork(id) {
  if (confirm("確定要刪除這個作品嗎？")) {
    await db.collection("works").doc(id).delete();
    alert("✅ 已刪除！");
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
