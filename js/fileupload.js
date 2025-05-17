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

// ✅ 預覽圖片網址
function handleImagePreview() {
  const url = document.getElementById("imageUrlInput").value.trim();
  const preview = document.getElementById("preview");
  preview.src = url;
  preview.style.display = url ? "block" : "none";
}
function generateExtraImageInputs() {
  const count = parseInt(document.getElementById("extraImageCount").value) || 0;
  const container = document.getElementById("extraImageInputs");
  container.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const input = document.createElement("input");
    input.type = "url";
    input.placeholder = `展示圖片 ${i + 1} 網址`;
    input.className = "extraImageInput";
    input.style = "width: 100%; margin-bottom: 5px;";
    container.appendChild(input);
  }
}
// ✅ 上傳作品
async function handleUpload(e) {
  e.preventDefault();
  const imageUrl = document.getElementById("imageUrlInput").value.trim();
  if (!imageUrl) return alert("請貼上圖片網址");
  // ✅ 收集額外圖片網址
  const extraImageInputs = Array.from(document.querySelectorAll(".extraImageInput"));
  const extraImageUrls = extraImageInputs
    .map(input => input.value.trim())
    .filter(url => url !== ""); // 過濾掉空的欄位
  const data = {
    name: document.getElementById("name").value,
    price: document.getElementById("price").value,
    concept: document.getElementById("concept").value,
    material: document.getElementById("material").value,
    weight: document.getElementById("weight").value,
    size: document.getElementById("sizeInput").value.trim(),
    series: document.getElementById("seriesSelect").value,
    type: document.getElementById("typeSelect").value,
    usage: document.getElementById("usageSelect").value,
    imageUrl,
    imageUrls: extraImageUrls, // ✅ 加入這一行，存為陣列
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  };

  try {
    await db.collection("works").add(data);
    alert("✅ 上傳成功！");
    document.getElementById("uploadForm").reset();
    handleImagePreview();
    renderGallery();
  } catch (err) {
    console.error("❌ 上傳失敗：", err);
    alert("上傳失敗：" + err.message);
  }
}

// ✅ 展示所有作品
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
      div.className = "gallery-card";
      div.innerHTML = `
        <img src="${d.imageUrl}" alt="${d.name}" class="card-img" onclick="editWork('${doc.id}')">
        <p class="card-title" onclick="editWork('${doc.id}')">${d.name}</p>
      `;
      gallery.appendChild(div);
    });
  } catch (err) {
    console.error("❌ 讀取失敗：", err);
    gallery.innerHTML = "<p>無法讀取作品</p>";
  }
}
// ✅ 編輯作品
function editWork(id) {
  db.collection("works").doc(id).get().then(doc => {
    const d = doc.data();

    const popup = document.createElement("div");
    popup.className = "popup";
    popup.innerHTML = `
      <div class="popup-content">
        <span class="close" onclick="this.closest('.popup').remove()">×</span>
        <input type="url" id="editImageUrl" value="${d.imageUrl}" placeholder="圖片網址" style="width: 100%;">
        <img id="editPreview" src="${d.imageUrl}" alt="${d.name}" style="width: 100%; margin-bottom: 10px;">
        <input type="text" id="editName" value="${d.name}" placeholder="作品名稱">
        <input type="text" id="editPrice" value="${d.price}" placeholder="價格">
        <textarea id="editConcept" placeholder="理念" style="width:100%; height:100px;">${d.concept || ""}</textarea>
        <input type="text" id="editMaterial" value="${d.material}" placeholder="材質">
        <input type="text" id="editSize" value="${d.size}" placeholder="尺寸">
        <input type="text" id="editWeight" value="${d.weight}" placeholder="重量">
        <input type="text" id="editSeries" value="${d.series}" placeholder="系列">
        <input type="text" id="editType" value="${d.type}" placeholder="品項">
        <input type="text" id="editUsage" value="${d.usage}" placeholder="用途">
        <button onclick="saveEdit('${id}')">✅ 儲存</button>
      </div>
    `;
    document.body.appendChild(popup);

    document.getElementById("editImageUrl").addEventListener("input", () => {
      document.getElementById("editPreview").src = document.getElementById("editImageUrl").value.trim();
    });
  });
}
window.editWork = editWork;

// ✅ 儲存編輯
function saveEdit(id) {
  const updated = {
    imageUrl: document.getElementById("editImageUrl").value.trim(),
    name: document.getElementById("editName").value,
    price: document.getElementById("editPrice").value,
    concept: document.getElementById("editConcept").value,
    material: document.getElementById("editMaterial").value,
    size: document.getElementById("editSize").value,
    weight: document.getElementById("editWeight").value,
    series: document.getElementById("editSeries").value,
    type: document.getElementById("editType").value,
    usage: document.getElementById("editUsage").value
  };

  db.collection("works").doc(id).update(updated).then(() => {
    alert("✅ 已更新！");
    document.querySelector(".popup")?.remove();
    renderGallery();
  });
}

// ✅ 刪除作品
window.deleteWork = async function(id) {
  if (confirm("確定要刪除這個作品嗎？")) {
    await db.collection("works").doc(id).delete();
    alert("✅ 已刪除！");
    renderGallery();
  }
};

// ✅ 載入下拉選單標籤
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
  document.getElementById("sidebar")?.classList.toggle("open");
  document.getElementById("overlay")?.classList.toggle("open");
}
function toggleMenu2() {
  const dropdown = document.querySelector(".dropdown");
  const menu = document.querySelector(".dropdown-content");
  const isOpen = menu?.style.display === "block";
  if (dropdown && menu) {
    menu.style.display = isOpen ? "none" : "block";
    dropdown.classList.toggle("active", !isOpen);
  }
}
function closeMenu() {
  document.getElementById("sidebar")?.classList.remove("open");
  document.getElementById("overlay")?.classList.remove("open");
}
