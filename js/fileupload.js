// ✅ Firebase 初始化
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

// ✅ 初始化
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("uploadForm")?.addEventListener("submit", handleUpload);
  document.getElementById("imageUrlInput")?.addEventListener("input", handleImagePreview);
  loadTags();
  renderGallery();
});

// ✅ 圖片預覽（從網址）
function handleImagePreview() {
  const url = document.getElementById("imageUrlInput").value.trim();
  const preview = document.getElementById("preview");

  if (url && (url.startsWith("http://") || url.startsWith("https://"))) {
    preview.src = url;
    preview.style.display = "block";
  } else {
    preview.src = "";
    preview.style.display = "none";
  }
}

// ✅ 上傳作品（用圖片網址）
async function handleUpload(e) {
  e.preventDefault();

  const imageUrl = document.getElementById("imageUrlInput").value.trim();
  if (!imageUrl) return alert("請貼上圖片網址！");

  const length = document.getElementById("lengthInput").value;
  const width = document.getElementById("widthInput").value;
  const height = document.getElementById("heightInput").value;

  const ringMin = document.getElementById("ringMin").value;
  const ringMax = document.getElementById("ringMax").value;

  let sizeText = "";
  if (length || width || height) {
    sizeText = `${length || "-"}mm×${width || "-"}mm×${height || "-"}mm`;
  }

  if (ringMin && ringMax && ringMin !== ringMax) {
    sizeText += `（戒圍 ${ringMin}～${ringMax} 號）`;
  } else if (ringMin || ringMax) {
    sizeText += `（戒圍 ${ringMin || ringMax} 號）`;
  }

  const data = {
    name: document.getElementById("name").value,
    price: document.getElementById("price").value,
    concept: document.getElementById("concept").value,
    material: document.getElementById("material").value,
    weight: document.getElementById("weight").value,
    size: sizeText,
    series: document.getElementById("seriesSelect").value,
    type: document.getElementById("typeSelect").value,
    usage: document.getElementById("usageSelect").value,
    imageUrl,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  };

  try {
    await db.collection("works").add(data);
    alert("✅ 上傳成功！");
    document.getElementById("uploadForm").reset();
    handleImagePreview(); // 清除預覽
    renderGallery();
  } catch (err) {
    console.error("❌ 上傳失敗：", err);
    alert("上傳失敗：" + err.message);
  }
}

// ✅ 渲染作品列表
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
        <p>尺寸：${d.size}</p>
        <p>重量：${d.weight}</p>
        <button onclick="editWork('${doc.id}')">✏️ 編輯</button>
        <button onclick="deleteWork('${doc.id}')">🗑️ 刪除</button>
      `;
      gallery.appendChild(div);
    });
  } catch (err) {
    console.error("❌ 讀取失敗：", err);
    gallery.innerHTML = "<p>無法讀取作品</p>";
  }
}

// ✅ 編輯
function buildEditableField(label, field, value) {
  return `
    <label>${label}</label><br>
    <input type="text" id="edit-${field}" value="${value || ''}" style="width:90%;margin-bottom:10px;"><br>
  `;
}

async function saveEdit(id) {
  const fields = ["name", "price", "concept", "material", "size", "weight", "series", "type", "usage"];
  const updates = {};
  fields.forEach(field => {
    updates[field] = document.getElementById(`edit-${field}`).value.trim();
  });

  await db.collection("works").doc(id).update(updates);
  alert("✅ 已更新！");
  document.querySelector(".popup")?.remove();
  renderGallery();
}

// ✅ 刪除
async function deleteWork(id) {
  if (confirm("確定要刪除這個作品嗎？")) {
    await db.collection("works").doc(id).delete();
    alert("✅ 已刪除！");
    renderGallery();
  }
}

// ✅ 載入標籤
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

// ✅ 側邊選單
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
