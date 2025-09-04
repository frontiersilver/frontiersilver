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

let uploadCheckedOrder = [];  // 儲存勾選順序
let uploadCarouselArr = [];
let uploadCarouselIdx = 0;

function syncCarouselArray() {
  const container = document.getElementById("carouselImageList");
  if (!container) return;

  const mainUrl = document.getElementById("imageUrlInput").value.trim();
  const extraUrls = [...document.querySelectorAll(".extraImageInput")].map(inp => inp.value.trim()).filter(Boolean);
  const allUrls = [mainUrl, ...extraUrls].filter(Boolean);

  // ✅ 若沒有網址，不渲染
  if (allUrls.length === 0) {
    container.innerHTML = "";
    const view = document.getElementById("uploadCarouselView");
    if (view) view.style.display = "none";
    return;
  }

  // ⛔️ 避免預覽區提早出現
  if (!document.getElementById("uploadCarouselView")) {
    createUploadCarouselPreview();
  }

  // 剩下照你原本的邏輯來渲染縮圖與輪播
  uploadCheckedOrder = uploadCheckedOrder.filter(url => allUrls.includes(url));
  if (!uploadCheckedOrder.includes(mainUrl)) {
    uploadCheckedOrder.unshift(mainUrl);
  } else {
    uploadCheckedOrder = [mainUrl, ...uploadCheckedOrder.filter(u => u !== mainUrl)];
  }

  const ordered = [
    ...uploadCheckedOrder,
    ...allUrls.filter(url => !uploadCheckedOrder.includes(url))
  ];

  container.innerHTML = "";
  ordered.forEach(url => {
    const wrapper = document.createElement("div");
    wrapper.style = "position:relative;width:80px;height:80px;margin-right:8px";

    const img = new Image();
    img.src = url;
    img.style = "width:100%;height:100%;object-fit:cover;border:1px solid #ccc;border-radius:4px";

    const chk = document.createElement("input");
    chk.type = "checkbox";
    chk.className = "carouselCheckbox";
    chk.dataset.url = url;
    chk.checked = uploadCheckedOrder.includes(url);
    chk.style = "position:absolute;top:2px;right:2px";

    chk.onchange = () => {
      if (chk.checked) {
        if (!uploadCheckedOrder.includes(url)) {
          if (url === mainUrl) {
            uploadCheckedOrder.unshift(url);
          } else {
            uploadCheckedOrder.push(url);
          }
        }
      } else {
        uploadCheckedOrder = uploadCheckedOrder.filter(u => u !== url);
      }
      syncCarouselArray(); // 重新渲染順序
    };

    wrapper.appendChild(img);
    wrapper.appendChild(chk);
    container.appendChild(wrapper);
  });

  updateUploadCarouselPreview(); // 🖼️ 更新輪播
}

function createUploadCarouselPreview() {
  const previewArea = document.getElementById("carouselImageList");
  if (!previewArea || document.getElementById("uploadCarouselView")) return;

  const mainUrl = document.getElementById("imageUrlInput").value.trim();
  const extraUrls = [...document.querySelectorAll(".extraImageInput")].map(inp => inp.value.trim()).filter(Boolean);
  const hasAnyImage = mainUrl || extraUrls.length > 0;

  if (!hasAnyImage) return; // 🚫 若還沒有任何圖片網址就不要產生輪播預覽區

  const hr = document.createElement("hr");

  const label = document.createElement("b");
  label.innerText = "輪播預覽：";

  const wrapper = document.createElement("div");
  wrapper.style.textAlign = "center";
  wrapper.style.margin = "10px 0";

  const prevBtn = document.createElement("button");
  prevBtn.id = "uploadPrevBtn";
  prevBtn.innerText = "⬅️";

  const img = document.createElement("img");
  img.id = "uploadCarouselView";
  img.style = "max-width:80%;max-height:200px;border:1px solid #ccc;object-fit:contain;display:none;margin:auto";

  const nextBtn = document.createElement("button");
  nextBtn.id = "uploadNextBtn";
  nextBtn.innerText = "➡️";

  wrapper.appendChild(prevBtn);
  wrapper.appendChild(img);
  wrapper.appendChild(nextBtn);

  previewArea.insertAdjacentElement("afterend", wrapper);
  previewArea.insertAdjacentElement("afterend", label);
  previewArea.insertAdjacentElement("afterend", hr);

  document.getElementById("uploadPrevBtn").onclick = () => {
    if (uploadCarouselArr.length === 0) return;
    uploadCarouselIdx = (uploadCarouselIdx - 1 + uploadCarouselArr.length) % uploadCarouselArr.length;
    document.getElementById("uploadCarouselView").src = uploadCarouselArr[uploadCarouselIdx];
  };

  document.getElementById("uploadNextBtn").onclick = () => {
    if (uploadCarouselArr.length === 0) return;
    uploadCarouselIdx = (uploadCarouselIdx + 1) % uploadCarouselArr.length;
    document.getElementById("uploadCarouselView").src = uploadCarouselArr[uploadCarouselIdx];
  };
}

function updateUploadCarouselPreview() {
  const view = document.getElementById("uploadCarouselView");
  if (!view) return;

  const mainUrl = document.getElementById("imageUrlInput").value.trim();

  const filtered = uploadCheckedOrder.filter(url => url && url !== mainUrl);
  uploadCarouselArr = [mainUrl, ...filtered];

  if (uploadCarouselArr.length > 0) {
    uploadCarouselIdx = 0;
    view.style.display = "inline-block";
    view.src = uploadCarouselArr[uploadCarouselIdx];
  } else {
    view.style.display = "none";
  }
}



// ============ 上傳邏輯 ============
async function handleUpload(e) {
  e.preventDefault();

  const mainUrl = document.getElementById("imageUrlInput").value.trim();
  if (!mainUrl) return alert("請貼上主圖片網址！");

  const imageUrls = [...document.querySelectorAll(".extraImageInput")]
    .map(inp => inp.value.trim())
    .filter(Boolean);

  // ✅ 取得所有勾選順序，並確保主圖排最前
  const filtered = uploadCheckedOrder.filter(url => url && url !== mainUrl);
  const carousel = [mainUrl, ...filtered];
  // 售出狀態與正式價格
  const soldStatus = document.querySelector('input[name="soldStatusRadio"]:checked')?.value || "未指定";
  const officialPriceInput = document.getElementById("officialPrice")?.value.trim() || "";

  // 👉 若未售出，價格為必填且要是數字
  if (soldStatus === "unsold" && (!officialPriceInput || isNaN(officialPriceInput))) {
    alert("請輸入有效的正式售價");
    return;
  }

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
    soldStatus: soldStatus,
    officialPrice: soldStatus === "unsold" ? parseFloat(officialPriceInput) : null,
    imageUrl: mainUrl,
    imageUrls,
    carousel,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  };

  try {
    const docRef = await db.collection("works").add(data);

    // ✅ 未售出才寫入 unsoldItems 集合
    if (soldStatus === "unsold") {
      await db.collection("unsoldItems").doc(docRef.id).set({
        workId: docRef.id,
        name: data.name,
        imageUrl: data.imageUrl,
        officialPrice: data.officialPrice,
        timestamp: data.timestamp,
      });
    }

    alert("✅ 上傳成功");
    document.getElementById("uploadForm").reset();
    handleImagePreview();
    generateExtraImageInputs();
    renderGallery();

  } catch (err) {
    console.error("❌ 上傳錯誤：", err);
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

let checkedOrder = []; // 🆕 紀錄勾選順序
// ============ 編輯作品 ============
function editWork(id) {
  let checkedOrder = [];
  let thumbMetaList = [];

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
        <!-- 是否售出 -->
        <label>是否已售出：</label><br>
        <input type="radio" name="editSoldStatus" value="sold" ${d.soldStatus === 'sold' ? 'checked' : ''}> 已售出
        <input type="radio" name="editSoldStatus" value="unsold" ${d.soldStatus === 'unsold' ? 'checked' : ''}> 未售出

        <!-- 正式售價 -->
        <input id="editOfficialPrice" value="${d.officialPrice || ''}" placeholder="正式售價（若未售出則必填）">
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

        <br><button onclick="saveEdit('${id}')">📋 儲存</button>
      </div>`;

    document.body.appendChild(pop);
    document.getElementById("editImageUrl").oninput = e =>
      (document.getElementById("editPreview").src = e.target.value.trim());

    const urls = d.imageUrls || [];
    const selected = new Set(d.carousel || []);
    selected.add(d.imageUrl);

    // === 預載入縮圖資料 ===
    function addThumb(url, isChecked = false) {
      if (thumbMetaList.some(item => item.url === url)) return;
      thumbMetaList.push({ url, checked: isChecked });
      if (isChecked && !checkedOrder.includes(url)) {
        checkedOrder.push(url);
      }
    }

    function renderThumbs() {
      const thumbBox = document.querySelector(".popup #editThumbList");
      if (!thumbBox) return;
      thumbBox.innerHTML = "";

      const ordered = [
        ...checkedOrder.map(url => thumbMetaList.find(t => t.url === url)),
        ...thumbMetaList.filter(t => !checkedOrder.includes(t.url))
      ];

      ordered.forEach(({ url }) => {
        const wrap = document.createElement("div");
        wrap.style = "position:relative;width:80px;height:80px;margin:4px;";
        wrap.draggable = true;

        const img = new Image();
        img.src = url;
        img.dataset.src = url;
        img.style = "width:100%;height:100%;object-fit:cover;border:1px solid #999;";

        const chk = document.createElement("input");
        chk.type = "checkbox";
        chk.checked = checkedOrder.includes(url);
        chk.style = "position:absolute;top:2px;right:2px;";
        if (url === d.imageUrl) {
          chk.disabled = true;
        } else {
          chk.onchange = () => {
            if (chk.checked) {
              if (!checkedOrder.includes(url)) checkedOrder.push(url);
            } else {
              checkedOrder = checkedOrder.filter(u => u !== url);
            }
            renderThumbs();
            syncCarouselArray();
          };
        }

        const del = document.createElement("button");
        del.innerText = "🖑️";
        del.title = "刪除圖片";
        del.style = "position:absolute;bottom:2px;right:2px;background:none;border:none;color:red;font-size:14px;";
        del.onclick = () => {
          thumbMetaList = thumbMetaList.filter(t => t.url !== url);
          checkedOrder = checkedOrder.filter(u => u !== url);
          renderThumbs();
          syncCarouselArray();
        };

        wrap.append(img, chk, del);
        thumbBox.appendChild(wrap);
      });
    }

    addThumb(d.imageUrl, true);
    (d.imageUrls || []).forEach(url => {
      const isChecked = (d.carousel || []).includes(url);
      addThumb(url, isChecked);
    });

    checkedOrder = [d.imageUrl, ...(d.carousel || []).filter(url => url && url !== d.imageUrl)];
    renderThumbs();

    let carArr = [];
    let idx = 0;

    function syncCarouselArray() {
      const imageUrl = document.getElementById("editImageUrl").value.trim();
      const filtered = checkedOrder.filter(url => url && url !== imageUrl);
      carArr = [imageUrl, ...filtered];
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

    setTimeout(syncCarouselArray, 0);

    window.addExtraEditImageInput = () => {
      const inp = document.createElement("input");
      inp.type = "url";
      inp.placeholder = "展示圖片網址";
      inp.style = "width:100%;margin-top:4px";
      inp.onblur = () => {
        const v = inp.value.trim();
        if (v) {
          addThumb(v, false);
          renderThumbs();
          syncCarouselArray();
        }
        inp.remove();
      };
      document.querySelector(".popup #editThumbList").parentElement.insertBefore(inp, document.querySelector(".popup #editThumbList"));
      inp.focus();
    };
    // ✅ 當選擇售出狀態變化時，控制正式售價必填
    const soldInputs = document.querySelectorAll('input[name="editSoldStatus"]');
    const officialPriceInput = document.getElementById("editOfficialPrice");

    soldInputs.forEach(input => {
      input.addEventListener("change", () => {
        if (input.value === "unsold" && input.checked) {
          officialPriceInput.required = true;
          officialPriceInput.placeholder = "正式售價（必填）";
        } else {
          officialPriceInput.required = false;
          officialPriceInput.placeholder = "正式售價（可空白）";
        }
      });
    });
  });
}

function saveEdit(id) {
  const imageUrl = document.getElementById("editImageUrl").value.trim();
  const soldStatus = document.querySelector('input[name="editSoldStatus"]:checked')?.value || "未指定";
  const officialPrice = document.getElementById("editOfficialPrice").value.trim();

  if (soldStatus === "unsold" && !officialPrice) {
    alert("請填寫正式售價，因為您選擇了『未售出』");
    return;
  }
  const filtered = checkedOrder.filter(url => url && url !== imageUrl);
  const carousel = [imageUrl, ...filtered]; // ✅ 主圖永遠在前

  const thumbList = document.getElementById("editThumbList");
  const allUrls = [];

  thumbList.querySelectorAll("div").forEach(div => {
    const url = div.querySelector("img").src;
    allUrls.push(url);
  });

  const data = {
    imageUrl,
    name: document.getElementById("editName").value,
    price: document.getElementById("editPrice").value,
    concept: document.getElementById("editConcept").value,
    material: document.getElementById("editMaterial").value,
    size: document.getElementById("editSize").value,
    weight: document.getElementById("editWeight").value,
    series: document.getElementById("editSeries").value,
    type: document.getElementById("editType").value,
    usage: document.getElementById("editUsage").value,
    soldStatus: document.querySelector('input[name="editSoldStatus"]:checked')?.value || "未指定",
    officialPrice: document.getElementById("editOfficialPrice").value.trim(),
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
async function loadTagEditor() {
  const type = document.getElementById("tagCategorySelect").value;
  const listContainer = document.getElementById("tagEditorList");
  listContainer.innerHTML = "<p>載入中...</p>";

  try {
    const doc = await db.collection("tags").doc(type).get();
    const tags = doc.exists ? doc.data().values || [] : [];

    listContainer.innerHTML = tags.map((tag, idx) => `
      <div style="display:flex;gap:6px;align-items:center;margin-bottom:8px;">
        <input type="text" value="${tag}" data-original="${tag}" style="flex:1;" />
        <button onclick="saveTagChange('${type}', ${idx})">💾</button>
        <button onclick="deleteTag('${type}', ${idx})">🗑️</button>
      </div>
    `).join("");
  } catch (err) {
    console.error(`❌ 載入 ${type} tags 失敗：`, err);
    listContainer.innerHTML = "<p>載入失敗</p>";
  }
}

async function saveTagChange(type, idx) {
  const inputs = document.querySelectorAll("#tagEditorList input");
  const input = inputs[idx];
  const newValue = input.value.trim();
  const oldValue = input.dataset.original;

  if (!newValue) return alert("標籤不得為空");

  const updatedValues = Array.from(inputs).map(i => i.value.trim()).filter(Boolean);
  await db.collection("tags").doc(type).set({ values: updatedValues });

  // ✅ 若有修改名稱，則同步更新作品中的標籤
  if (oldValue !== newValue) {
    const snapshot = await db.collection("works").where(type, "==", oldValue).get();
    const batch = db.batch();
    snapshot.forEach(doc => {
      batch.update(doc.ref, { [type]: newValue });
    });
    await batch.commit();
    alert(`✅ 已更新標籤，並同步 ${snapshot.size} 筆作品`);
  } else {
    alert("✅ 標籤已儲存");
  }

  loadTagEditor(); // 重新載入
}

async function deleteTag(type, idx) {
  const confirmed = confirm("確定要刪除這個標籤嗎？\n（所有使用此標籤的作品該欄位會被清空）");
  if (!confirmed) return;

  const doc = await db.collection("tags").doc(type).get();
  const tags = doc.exists ? doc.data().values || [] : [];

  const deletedValue = tags[idx];
  tags.splice(idx, 1);
  await db.collection("tags").doc(type).set({ values: tags });

  // ✅ 清空所有使用該值的作品欄位
  const snapshot = await db.collection("works").where(type, "==", deletedValue).get();
  const batch = db.batch();
  snapshot.forEach(doc => {
    batch.update(doc.ref, { [type]: "" });
  });
  await batch.commit();

  alert(`🗑️ 已刪除標籤，並清空 ${snapshot.size} 筆作品中的該欄位`);
  loadTagEditor();
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
