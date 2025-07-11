/* ---------- Firebase ---------- */
const firebaseConfig = {
  apiKey: "AIzaSyBNMOLOUp4VrjdQiULXQCInNyI8gx7kl9s",
  authDomain: "frontiersilver-4a99a.firebaseapp.com",
  projectId: "frontiersilver-4a99a",
  storageBucket: "frontiersilver-4a99a.appspot.com",
  messagingSenderId: "547331341626",
  appId: "1:547331341626:web:275d76403296f888686403"
};
if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

/* ---------- Init ---------- */
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("uploadForm")?.addEventListener("submit", handleUpload);
  document.getElementById("imageUrlInput")?.addEventListener("input", () => {
    handleImagePreview();
    updateCarouselImageList(); // ✅ 同步縮圖區
  });
  loadTags();
  renderGallery();
});

/* ============ 上傳區 ============ */

function handleImagePreview() {
  const url = document.getElementById("imageUrlInput").value.trim();
  const pre = document.getElementById("preview");
  pre.src = url;
  pre.style.display = url ? "block" : "none";
}

function generateExtraImageInputs() {
  const n = +document.getElementById("extraImageCount").value || 0;
  const box = document.getElementById("extraImageInputs");
  box.innerHTML = "";
  for (let i = 0; i < n; i++) {
    const inp = document.createElement("input");
    inp.type = "url";
    inp.placeholder = `展示圖片 ${i + 1} 網址`;
    inp.className = "extraImageInput";
    inp.style = "width:100%;margin-bottom:6px";
    inp.addEventListener("input", updateCarouselImageList); // ✅ 新增
    box.appendChild(inp);
  }
  updateCarouselImageList(); // ✅ 初始化時也呼叫
}

/* ✅ 建立 carouselImageList 縮圖與勾選 */
function updateCarouselImageList() {
  const container = document.getElementById("carouselImageList");
  if (!container) return;
  container.innerHTML = "";

  const urls = [
    document.getElementById("imageUrlInput").value.trim(),
    ...[...document.querySelectorAll(".extraImageInput")].map(i => i.value.trim())
  ].filter(Boolean);

  urls.forEach(url => {
    const wrap = document.createElement("div");
    wrap.style = "position:relative;width:80px;height:80px;margin:4px";

    const img = new Image();
    img.src = url;
    img.style = "width:100%;height:100%;object-fit:cover;border:1px solid #999";

    const chk = document.createElement("input");
    chk.type = "checkbox";
    chk.className = "carouselCheckbox";
    chk.dataset.url = url;
    chk.style = "position:absolute;top:2px;right:2px";

    wrap.append(img, chk);
    container.appendChild(wrap);
  });
}

/* 上傳作品 */
async function handleUpload(e) {
  e.preventDefault();
  const mainUrl = document.getElementById("imageUrlInput").value.trim();
  if (!mainUrl) return alert("請貼上主圖片網址！");

  const imageUrls = [...document.querySelectorAll(".extraImageInput")]
    .map(inp => inp.value.trim())
    .filter(Boolean);

  const carousel = [...document.querySelectorAll(".carouselCheckbox")]
    .filter(chk => chk.checked)
    .map(chk => chk.dataset.url);

  const data = {
    name     : document.getElementById("name").value,
    price    : document.getElementById("price").value,
    concept  : document.getElementById("concept").value,
    material : document.getElementById("material").value,
    weight   : document.getElementById("weight").value,
    size     : document.getElementById("sizeInput").value.trim(),
    series   : document.getElementById("seriesSelect").value,
    type     : document.getElementById("typeSelect").value,
    usage    : document.getElementById("usageSelect").value,
    imageUrl : mainUrl,
    imageUrls,
    carousel,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  };

  try {
    await db.collection("works").add(data);
    alert("✅ 上傳成功");
    document.getElementById("uploadForm").reset();
    handleImagePreview();
    generateExtraImageInputs(); // 清空額外欄位與縮圖
    renderGallery();
  } catch (err) {
    console.error(err);
    alert("上傳失敗：" + err.message);
  }
}

/* ============ 展示區 ============ */
async function renderGallery() {
  const g = document.getElementById("gallery");
  if (!g) return;
  g.innerHTML = "<p>載入中…</p>";
  try {
    const snap = await db.collection("works").orderBy("timestamp", "desc").get();
    g.innerHTML = snap.empty ? "<p>尚無作品</p>" : "";
    snap.forEach(doc => {
      const d = doc.data();
      const card = document.createElement("div");
      card.className = "gallery-card";
      card.innerHTML = `
        <img src="${d.imageUrl}" class="card-img" onclick="editWork('${doc.id}')">
        <p class="card-title" onclick="editWork('${doc.id}')">${d.name}</p>`;
      g.appendChild(card);
    });
  } catch (e) {
    console.error(e);
    g.innerHTML = "<p>讀取失敗</p>";
  }
}
window.editWork = editWork;

/* ============ 標籤與選單 ============ */
async function loadTags() {
  const cats = ["series", "type", "usage"];
  for (const c of cats) {
    const doc = await db.collection("tags").doc(c).get();
    const vals = doc.exists ? doc.data().values || [] : [];
    const sel = document.getElementById(`${c}Select`);
    vals.forEach(v => {
      if (![...sel.options].some(o => o.value === v)) sel.add(new Option(v, v));
    });
  }
}
function toggleMenu() {
  document.getElementById("sidebar")?.classList.toggle("open");
  document.getElementById("overlay")?.classList.toggle("open");
}
function toggleMenu2() {
  const m = document.querySelector(".dropdown-content");
  const f = m?.style.display === "block";
  if (m) {
    m.style.display = f ? "none" : "block";
    document.querySelector(".dropdown")?.classList.toggle("active", !f);
  }
}
function closeMenu() {
  document.getElementById("sidebar")?.classList.remove("open");
  document.getElementById("overlay")?.classList.remove("open");
}
