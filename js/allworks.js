const state = {
  currentCategory: null,
  currentValue: null
};

function showAllWorks() {
  state.currentCategory = null;
  state.currentValue = null;
  renderGallery();
}

function filterItems(category, value) {
  state.currentCategory = category;
  state.currentValue = value;
  renderGallery();
}



// ✅ 查看詳細資訊 Popup
function viewWork(id) {
  // 防止重複 popup 疊加
  document.querySelector(".popup")?.remove();
  db.collection("works").doc(id).get().then(doc => {
    const d = doc.data();

    // === 1. 輪播圖陣列 ===
    const carousel = [];
    if (d.imageUrl) carousel.push(d.imageUrl);
    if (Array.isArray(d.carousel)) {
      d.carousel.forEach(url => {
        if (url && !carousel.includes(url)) carousel.push(url);
      });
    }

    // === 2. 額外圖片 ===
    const extrasRaw = d.imageUrls || [];
    const extraImgs = extrasRaw.filter(url => url && !carousel.includes(url));

    // === 3. 建立 popup ===
    const popup = document.createElement("div");
    popup.className = "popup";
    popup.innerHTML = `
      <div class="popup-content">
        <span class="close" onclick="this.closest('.popup').remove()">×</span>

        <h2 class="popup-h">${d.name || '未命名作品'}</h2>

        <!-- 輪播 + 懸浮大圖 -->
        <div style="position:relative;text-align:center;margin-bottom:10px;">
          <button id="prevBtn">⟨</button>
          <div class="carousel-hover-wrapper" style="display:inline-block;position:relative;">
            <img id="carouselImg"
                 src="${carousel[0] || ''}"
                 style="max-height:300px;width:auto;object-fit:contain;border:1px solid #ccc;border-radius:4px;cursor:zoom-in;" />
            <div id="hoverZoomOverlay"
                   style="display:none;
                          position:fixed;
                          top:0;
                          left:0;
                          width:100vw;
                          height:100vh;
                          background:rgba(0,0,0,0.6);
                          z-index:9998;
                          pointer-events: none;">
                <div id="hoverZoom"
                      style="display:none;
                          position:fixed;
                          top:50%;
                          left:50%;
                          transform:translate(-50%, -50%);
                          z-index:9999;
                          background:transparent;
                          padding:0;
                          pointer-events: none;">
                <img id="hoverZoomImg"
                          src="${carousel[0] || ''}"
                          style="max-width:1000px;max-height:90vh;object-fit:contain;" />
            </div>
           </div>
          </div>
          <button id="nextBtn">⟩</button>
        </div>

        <p id="concept">${(d.concept || '').replace(/\\n/g, '<br>')}</p>
        <p>材質： ${d.material || '—'}</p>
        <p>尺寸： ${d.size || '—'}</p>
        <p>重量： ${d.weight || '—'}</p>
        <p>價格： ${d.price || '—'}</p>
        <p>#${d.series || '—'}</p>
        <p>#${d.type   || '—'}</p>
        <p>#${d.usage  || '—'}</p>

        ${extraImgs.length
          ? `<div style="margin-top:15px; display:block;">
               ${extraImgs.map((u, i) => `
                 <div class="extra-hover-wrapper"
                      style="margin-bottom:15px;
                             position:relative;
                             display:flex;
                             justify-content: center;
                             align-items: center;">
                   <img class="extra-img"
                        src="${u}"
                        data-index="${i}"
                        style="max-height:300px;
                               width:auto;
                               object-fit:contain;
                               border:1px solid #ccc;
                               border-radius:4px;
                               cursor:zoom-in;" />
                 </div>
               `).join("")}
             </div>`
          : ''
        }
        <!-- 全局 overlay for extraImgs hover -->
        <!-- 黑幕 -->
        <div id="extraHoverOverlay"
             style="display:none;
                    position:fixed;
                    top:0; left:0;
                    width:100vw; height:100vh;
                    background:rgba(0,0,0,0.6);
                    z-index:9998;
                    pointer-events: none;"></div>

        <!-- 大圖 -->
        <div id="extraHoverZoom"
             style="display:none;
                    position:fixed;
                    top:50%; left:50%;
                    transform:translate(-50%,-50%);
                    z-index:9999;">
          <img id="extraHoverZoomImg"
               src=""
               style="max-width:1000px; max-height:90vh; object-fit:contain;" />
        </div>
      </div>
    `;
    document.body.appendChild(popup);

    const extraWrappers = popup.querySelectorAll(".extra-hover-wrapper");

    // === 綁定額外圖片 hover 放大 ===
    const extraZoomOverlay = popup.querySelector("#extraHoverOverlay");
    const extraZoom = popup.querySelector("#extraHoverZoom");
    const extraZoomImg = popup.querySelector("#extraHoverZoomImg");

    popup.querySelectorAll(".extra-img").forEach(thumb => {
      thumb.addEventListener("mouseenter", () => {
        extraZoomImg.src = thumb.src;
        extraZoom.style.display = "block";
        extraZoomOverlay.style.display = "block";
      });

      // 改成綁在 zoom 圖片本身，而不是 thumb
      extraZoom.addEventListener("mouseleave", () => {
        extraZoom.style.display = "none";
        extraZoomOverlay.style.display = "none";
      });

      thumb.addEventListener("load", () => {
        if (extraZoomImg.src !== thumb.src) {
          extraZoomImg.src = thumb.src;
        }
      });
    });
    // === 4. 綁定 hover 放大事件 ===
    const img = popup.querySelector("#carouselImg");
    const zoom = popup.querySelector("#hoverZoom");
    const zoomImg = popup.querySelector("#hoverZoomImg");
    const overlay = popup.querySelector("#hoverZoomOverlay");

    if (img && zoom && zoomImg && overlay) {
      zoomImg.src = img.src;

      img.addEventListener("mouseenter", () => {
        zoom.style.display = "block";
        overlay.style.display = "block";
        zoomImg.src = img.src;
      });

      img.addEventListener("mouseleave", () => {
        zoom.style.display = "none";
        overlay.style.display = "none";
      });

      img.addEventListener("load", () => {
        zoomImg.src = img.src;
      });
    }

    // === 5. 輪播按鈕功能（同步懸浮圖）===
    let idx = 0;
    const prevBtn = popup.querySelector('#prevBtn');
    const nextBtn = popup.querySelector('#nextBtn');

    prevBtn.onclick = () => {
      idx = (idx - 1 + carousel.length) % carousel.length;
      img.src = carousel[idx];
      zoomImg.src = carousel[idx];
    };

    nextBtn.onclick = () => {
      idx = (idx + 1) % carousel.length;
      img.src = carousel[idx];
      zoomImg.src = carousel[idx];
      // 綁定每張 extraImgs hover 放大功能

    };
  });
}

async function renderGallery() {
  const gallery = document.getElementById("gallery");
  gallery.innerHTML = "<p>載入中...</p>";

  try {
    const snapshot = await db.collection("works").orderBy("timestamp", "desc").get();
    console.log("📦 取得作品數量：", snapshot.size);

    gallery.innerHTML = "";

    let hasResult = false;

    snapshot.forEach(doc => {
      const item = doc.data();

      // ➤ 確認是否符合篩選條件
      if (
        state.currentCategory &&
        state.currentValue &&
        ![].concat(item[state.currentCategory] || []).includes(state.currentValue)
      ) {
        console.log(
          "🧪 排除項目：",
          item.name || doc.id,
          "分類欄位值 =",
          item[state.currentCategory],
          "，需要 =",
          state.currentValue
        );
        return;
      }

      console.log("✅ 顯示項目：", item.name || doc.id);

      hasResult = true;

      const div = document.createElement("div");
      div.classList.add("item");
      div.addEventListener("click", () => viewWork(doc.id));
      div.innerHTML = `
        <div class="item_pic">
          <img src="${item.imageUrl}" alt="${item.name || ''}" />
        </div>
        <div class="item_p">
          <p class="item_name">${item.name || '無名稱'}</p>
          <div>
            <p class="item_tag">#${item.series || ''}</p>
            <p class="item_tag">#${item.type || ''}</p>
            <p class="item_tag">#${item.usage || ''}</p>
          </div>
        </div>
      `;
      gallery.appendChild(div);
    });

    if (!hasResult) {
      console.log("🈳 沒有任何作品符合篩選條件");
      gallery.innerHTML = "<p>目前沒有符合條件的作品。</p>";
    } else {
      console.log("✅ 作品顯示完成");
    }

  } catch (err) {
    console.error("❌ 讀取作品失敗：", err);
    gallery.innerHTML = "<p>無法載入作品</p>";
  }
}


async function generateAsideMenus() {
  const categories = [
    { id: "series", label: "系列" },
    { id: "type", label: "品項" },
    { id: "usage", label: "用途" },
  ];

  const aside = document.getElementById("aside");
  if (!aside) {
    console.error("❌ 沒有找到 #aside 容器");
    return;
  }

  for (const { id, label } of categories) {
    try {
      // 建立區塊
      const block = document.createElement("div");
      block.className = "aside-block";

      // 建立分類標題
      const title = document.createElement("h2");
      title.className = "aside-title";
      title.textContent = label;
      title.style.cursor = "pointer";

      // 建立對應 menu 容器（預設隱藏）
      const list = document.createElement("div");
      list.id = `${id}-menu`;
      list.className = "aside-menu-list";

      // 👉 點擊分類標題時展開/收起
      title.onclick = () => {
        const isOpen = list.classList.contains("open");

        // 收起所有其他分類
        document.querySelectorAll(".aside-menu-list").forEach(el => el.classList.remove("open"));

        // 如果不是已經展開，才打開這一個
        if (!isOpen) {
          list.classList.add("open");
        }
      };

      // 組裝 DOM
      block.appendChild(title);
      block.appendChild(list);
      aside.appendChild(block);

      // Firestore 載入資料
      const doc = await db.collection("tags").doc(id).get();
      if (!doc.exists) {
        console.warn(`⚠️ 找不到 ${id} 資料`);
        continue;
      }

      const values = doc.data().values || [];
      values.forEach(val => {
        const item = document.createElement("div");
        item.className = "aside-menu-item";
        item.textContent = val;
        item.onclick = () => {
          filterItems(id, val);

          // 高亮選擇
          document.querySelectorAll(".aside-menu-item, .aside-all-btn")
            .forEach(el => el.classList.remove("active"));
          item.classList.add("active");
        };
        list.appendChild(item);
      });

    } catch (err) {
      console.error(`🚫 載入 ${id} 失敗：`, err);
    }
  }
}
// ✅ 頁面載入後初始化
document.addEventListener("DOMContentLoaded", () => {
  renderGallery();
  generateAsideMenus();

  const workId = sessionStorage.getItem("viewWorkId");
  if (workId) {
    sessionStorage.removeItem("viewWorkId");
    setTimeout(() => {
      viewWork(workId);
    }, 300);
  }
});
