// ============ Firebase 設定 ============
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

// ============ 預覽圖片 ============
function handleImagePreview() {
  const url = document.getElementById("imageUrlInput").value.trim();
  const pre = document.getElementById("preview");
  pre.src = url;
  pre.style.display = url ? "block" : "none";
  syncCarouselArray();
}

// ============ 動態額外圖片欄位 ============
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
    inp.addEventListener("input", syncCarouselArray);
    box.appendChild(inp);
  }
  syncCarouselArray();
}

// ============ 縮圖輪播同步 ============
function syncCarouselArray() {
  const container = document.getElementById("carouselImageList");
  if (!container) return;

  const mainUrl = document.getElementById("imageUrlInput").value.trim();
  const extraUrls = [...document.querySelectorAll(".extraImageInput")].map(inp => inp.value.trim()).filter(Boolean);
  const allUrls = [mainUrl, ...extraUrls].filter(Boolean);

  container.innerHTML = "";

  allUrls.forEach(url => {
    const wrapper = document.createElement("div");
    wrapper.style = "position:relative;width:80px;height:80px;margin-right:8px";

    const img = new Image();
    img.src = url;
    img.style = "width:100%;height:100%;object-fit:cover;border:1px solid #ccc;border-radius:4px";

    const chk = document.createElement("input");
    chk.type = "checkbox";
    chk.className = "carouselCheckbox";
    chk.dataset.url = url;
    chk.checked = true;
    chk.style = "position:absolute;top:2px;right:2px";

    wrapper.appendChild(img);
    wrapper.appendChild(chk);
    container.appendChild(wrapper);
  });
}

// ============ 上傳邏輯 ============
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
    name: document.getElementById("name").value,
    price: document.getElementById("price").value,
    concept: document.getElementById("concept").value,
    material: document.getElementById("material").value,
    weight: document.getElementById("weight").value,
    size: document.getElementById("sizeInput").value.trim(),
    series: document.getElementById("seriesSelect").value,
    type: document.getElementById("typeSelect").value,
    usage: document.getElementById("usageSelect").value,
    imageUrl: mainUrl,
    imageUrls,
    carousel,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  };

  try {
    await db.collection("works").add(data);
    alert("✅ 上傳成功");
    document.getElementById("uploadForm").reset();
    handleImagePreview();
    generateExtraImageInputs();
    renderGallery();
  } catch (err) {
    console.error(err);
    alert("上傳失敗：" + err.message);
  }
}

// ============ 展示區渲染 ============
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

// ============ 編輯作品（預留） ============
function editWork(id) {
  db.collection("works").doc(id).get().then(doc => {
    const d = doc.data() || {};
    const pop = document.createElement("div");
    pop.className = "popup";
    pop.innerHTML = `
      <div class="popup-content" style="max-height:90vh;overflow:auto">
        <span class="close" onclick="this.closest('.popup').remove()">×</span>

        <input id="editImageUrl" type="url" value="${d.imageUrl}" style="width:100%">
        <img id="editPreview" src="${d.imageUrl}" style="width:100%;margin:6px 0">

        <input id="editName" value="${d.name}" placeholder="名稱">
        <input id="editPrice" value="${d.price}" placeholder="價格">
        <textarea id="editConcept" style="width:100%;height:90px" placeholder="理念">${d.concept || ""}</textarea>
        <input id="editMaterial" value="${d.material}" placeholder="材質">
        <input id="editSize" value="${d.size}" placeholder="尺寸">
        <input id="editWeight" value="${d.weight}" placeholder="重量">
        <input id="editSeries" value="${d.series}" placeholder="系列">
        <input id="editType" value="${d.type}" placeholder="品項">
        <input id="editUsage" value="${d.usage}" placeholder="用途">

        <hr>
        <b>展示圖片：</b>
        <div id="editThumbList" style="display:flex;flex-wrap:wrap;gap:6px"></div>
        <button style="margin-top:8px" onclick="addExtraEditImageInput()">＋新增圖片欄位</button>

        <hr>
        <b>輪播預覽：</b>
        <div style="text-align:center">
          <button id="editPrevBtn">⬅️</button>
          <img id="editCarouselView" style="max-width:80%;max-height:200px;border:1px solid #ccc;object-fit:contain;display:block;margin:auto">
          <button id="editNextBtn">➡️</button>
        </div>

        <br><button onclick="saveEdit('${id}')">💾 儲存</button>
      </div>`;
    document.body.appendChild(pop);

    document.getElementById("editImageUrl").oninput = e =>
      (document.getElementById("editPreview").src = e.target.value.trim());

    const urls = d.imageUrls || [];
    const selected = new Set(d.carousel || []);
    selected.add(d.imageUrl);

    const thumbBox = document.querySelector(".popup #editThumbList");
    thumbBox.innerHTML = "";

    function addThumb(url) {
      if ([...thumbBox.querySelectorAll("img")].some(img => img.src === url)) return;

      const wrap = document.createElement("div");
      wrap.style = "position:relative;width:80px;height:80px;margin:4px;";
      wrap.draggable = true;

      wrap.ondragstart = e => {
        e.dataTransfer.setData("text/plain", url);
        wrap.classList.add("dragging");
      };
      wrap.ondragend = () => wrap.classList.remove("dragging");

      const img = new Image();
      img.src = url;
      img.dataset.src = url;
      img.className = "thumb-img";
      img.style = "width:100%;height:100%;object-fit:cover;border:1px solid #999;";

      const chk = document.createElement("input");
      chk.type = "checkbox";
      chk.checked = selected.has(url);
      chk.style = "position:absolute;top:2px;right:2px;";
      if (url === d.imageUrl) {
        chk.disabled = true;
      } else {
        chk.onchange = syncCarouselArray;
      }

      const del = document.createElement("button");
      del.innerText = "🗑️";
      del.title = "刪除圖片";
      del.style = "position:absolute;bottom:2px;right:2px;background:none;border:none;color:red;font-size:14px;";
      del.onclick = () => {
        wrap.remove();
        syncCarouselArray();
      };

      wrap.append(img, chk, del);
      thumbBox.appendChild(wrap);
    }

    addThumb(d.imageUrl);
    urls.forEach(addThumb);

    let carArr = Array.from(selected);
    let idx = 0;

    function syncCarouselArray() {
      selected.clear();
      thumbBox.querySelectorAll("div").forEach(div => {
        const url = div.querySelector("img").src;
        const ck = div.querySelector("input").checked;
        if (ck) selected.add(url);
      });
      carArr = Array.from(selected);
      idx = 0;
      renderView();
    }

    function renderView() {
      const view = document.querySelector(".popup #editCarouselView");
      if (!view) return;
      view.style.display = carArr.length ? "inline-block" : "none";
      view.src = carArr[idx] || "";
    }

    document.querySelector(".popup #editPrevBtn").onclick = () => {
      if (!carArr.length) return;
      idx = (idx - 1 + carArr.length) % carArr.length;
      renderView();
    };
    document.querySelector(".popup #editNextBtn").onclick = () => {
      if (!carArr.length) return;
      idx = (idx + 1) % carArr.length;
      renderView();
    };

    thumbBox.ondragover = e => e.preventDefault();
    thumbBox.ondrop = e => {
      e.preventDefault();
      const dragging = thumbBox.querySelector(".dragging");
      if (!dragging) return;
      const target = e.target.closest("div");
      if (target && target !== dragging) {
        thumbBox.insertBefore(dragging, target.nextSibling);
      }
      syncCarouselArray();
    };

    setTimeout(syncCarouselArray, 0);

    window.addExtraEditImageInput = () => {
      const inp = document.createElement("input");
      inp.type = "url";
      inp.placeholder = "展示圖片網址";
      inp.style = "width:100%;margin-top:4px";
      inp.onblur = () => {
        const v = inp.value.trim();
        if (v) addThumb(v);
        inp.remove();
      };
      thumbBox.parentElement.insertBefore(inp, thumbBox);
      inp.focus();
    };
  });
}

function saveEdit(id) {
  const thumbList = document.getElementById("editThumbList");
  const allUrls = [];
  const carousel = [];

  thumbList.querySelectorAll("div").forEach(div => {
    const url = div.querySelector("img").src;
    const ck = div.querySelector("input").checked;
    allUrls.push(url);
    if (ck) carousel.push(url);
  });

  const data = {
    imageUrl: document.getElementById("editImageUrl").value.trim(),
    name: document.getElementById("editName").value,
    price: document.getElementById("editPrice").value,
    concept: document.getElementById("editConcept").value,
    material: document.getElementById("editMaterial").value,
    size: document.getElementById("editSize").value,
    weight: document.getElementById("editWeight").value,
    series: document.getElementById("editSeries").value,
    type: document.getElementById("editType").value,
    usage: document.getElementById("editUsage").value,
    imageUrls: allUrls,
    carousel
  };

  db.collection("works").doc(id).update(data).then(() => {
    alert("✅ 已更新");
    document.querySelector(".popup")?.remove();
    renderGallery();
  });
}

// ============ 新增標籤 ============
async function addNewTag(type) {
  const input = document.getElementById(`new${capitalize(type)}Input`);
  const value = input.value.trim();
  if (!value) return;

  const select = document.getElementById(`${type}Select`);
  select.add(new Option(value, value));
  input.value = "";

  const ref = db.collection("tags").doc(type);
  const doc = await ref.get();
  const values = doc.exists ? doc.data().values || [] : [];
  if (!values.includes(value)) {
    await ref.set({ values: [...values, value] });
  }
}
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
window.addNewTag = addNewTag;

// ============ 載入既有標籤 ============
async function loadTags() {
  const cats = ["series", "type", "usage"];
  for (const c of cats) {
    const doc = await db.collection("tags").doc(c).get();
    const vals = doc.exists ? doc.data().values || [] : [];
    const sel = document.getElementById(`${c}Select`);
    vals.forEach(v => {
      if (![...sel.options].some(o => o.value === v)) {
        sel.add(new Option(v, v));
      }
    });
  }
}

async function extractTagsFromWorksToTagsCollection() {
  try {
    const snapshot = await db.collection("works").get();

    const tags = {
      series: new Set(),
      type: new Set(),
      usage: new Set()
    };

    snapshot.forEach(doc => {
      const d = doc.data();
      if (d.series) tags.series.add(d.series);
      if (d.type) tags.type.add(d.type);
      if (d.usage) tags.usage.add(d.usage);
    });

    for (const [key, valueSet] of Object.entries(tags)) {
      const values = Array.from(valueSet);
      await db.collection("tags").doc(key).set({ values });
      console.log(`✅ 已更新 tags/${key}：`, values);
    }

  } catch (err) {
    console.error("❌ 無法同步 Tags：", err);
  }
}

// ✅ 自動執行同步（建議只在 admin 頁面）
document.addEventListener("DOMContentLoaded", () => {
  const isAdminPage = location.pathname.includes("upload") || location.pathname.includes("admin");
  if (isAdminPage) {
    extractTagsFromWorksToTagsCollection();
  }
});

// ✅ 側邊選單控制
function toggleMenu() {
  document.getElementById("sidebar")?.classList.toggle("open");
  document.getElementById("overlay")?.classList.toggle("open");
}
function toggleMenu2() {
  const menu = document.querySelector(".dropdown-content");
  const isOpen = menu?.style.display === "block";
  menu.style.display = isOpen ? "none" : "block";
  document.querySelector(".dropdown")?.classList.toggle("active", !isOpen);
}
function closeMenu() {
  document.getElementById("sidebar")?.classList.remove("open");
  document.getElementById("overlay")?.classList.remove("open");
}

// ============ 啟動 ============
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("uploadForm")?.addEventListener("submit", handleUpload);
  document.getElementById("imageUrlInput")?.addEventListener("input", handleImagePreview);
  generateExtraImageInputs();
  loadTags();
  renderGallery();
});
