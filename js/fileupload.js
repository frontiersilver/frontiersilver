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

// ✅ 預覽圖片
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

// ✅ 上傳作品
async function handleUpload(e) {
  e.preventDefault();

  const imageUrl = document.getElementById("imageUrlInput").value.trim();
  if (!imageUrl) return alert("請貼上圖片網址！");

  const sizeText = document.getElementById("sizeInput").value.trim();
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
    handleImagePreview();
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
      const d = doc.data();
      const div = document.createElement("div");
      div.className = "item";
      div.innerHTML = `
      <div class="item">
        <img src="${d.imageUrl}" alt="${d.name}" class="item-img">
        <div class="item-info">
          <h3>${d.name}</h3>
          <p><strong>系列：</strong>${d.series}</p>
          <p><strong>品項：</strong>${d.type}</p>
          <p><strong>用途：</strong>${d.usage}</p>
          <p><strong>價格：</strong>${d.price}</p>
          <p><strong>材質：</strong>${d.material}</p>
          <p><strong>尺寸：</strong>${d.size}</p>
          <p><strong>重量：</strong>${d.weight}</p>
          <div class="concept">
            <strong>理念：</strong>
            <p>${(d.concept || "").replace(/\n/g, "<br>")}</p>
          </div>
          <button onclick="editWork('${doc.id}')">✏️ 編輯</button>
          <button onclick="deleteWork('${doc.id}')">🗑️ 刪除</button>
        </div>
      </div>
    `;
      gallery.appendChild(div);
    });
  } catch (err) {
    console.error("❌ 讀取失敗：", err);
    gallery.innerHTML = "<p>無法讀取作品</p>";
  }
}

// ✅ 編輯作品彈窗
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
        <input type="text" id="editConcept" value="${d.concept}" placeholder="理念">
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

    // ✅ 預覽圖片即時更新
    document.getElementById("editImageUrl").addEventListener("input", () => {
      const newUrl = document.getElementById("editImageUrl").value.trim();
      const preview = document.getElementById("editPreview");
      preview.src = newUrl || "";
    });
  });
}

window.editWork = editWork; // ✅ 這行非常關鍵

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

// ✅ 載入下拉式標籤
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
