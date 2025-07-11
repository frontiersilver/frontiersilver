// ✅ 狀態集中管理
const state = {
  currentCategory: null,
  currentValue: null
};

// ✅ 篩選條件設定
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

// ✅ 渲染作品（從 Firebase）
async function renderGallery() {
  const gallery = document.getElementById("gallery");
  gallery.innerHTML = "<p>載入中...</p>";

  try {
    const snapshot = await db.collection("works").orderBy("timestamp", "desc").get();
    gallery.innerHTML = "";

    let hasResult = false;

    snapshot.forEach(doc => {
      const item = doc.data();

      if (state.currentCategory && state.currentValue && item[state.currentCategory] !== state.currentValue) {
        return;
      }

      hasResult = true;

      const div = document.createElement("div");
      div.classList.add("item");
      div.setAttribute("onclick", `viewWork('${doc.id}')`);
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
      gallery.innerHTML = "<p>目前沒有符合條件的作品。</p>";
    }

  } catch (err) {
    console.error("❌ 讀取作品失敗：", err);
    gallery.innerHTML = "<p>無法載入作品</p>";
  }
}

// ✅ 查看詳細資訊 Popup
function viewWork(id) {
  db.collection("works").doc(id).get().then(doc => {
    const d = doc.data();

    /* === 1. 組輪播圖片陣列（主圖一定在、且不重複） === */
    const carousel = [];
    if (d.imageUrl) carousel.push(d.imageUrl);

    if (Array.isArray(d.carousel)) {
      d.carousel.forEach(url => {
        if (url && !carousel.includes(url)) carousel.push(url);
      });
    }

    /* === 2. 非輪播 (額外) 圖片 === */
    const extrasRaw = d.imageUrls || [];          // ←若你欄位叫 extraImages 就改名
    const extraImgs = extrasRaw.filter(url => url && !carousel.includes(url));

    /* === 3. 產生 popup === */
    const popup = document.createElement("div");
    popup.className = "popup";
    popup.innerHTML = `
      <div class="popup-content">
        <span class="close" onclick="this.closest('.popup').remove()">×</span>

        <h2 class="popup-h">${d.name || '未命名作品'}</h2>

        <!-- ===== 輪播盒 ===== -->
        <div style="position:relative;text-align:center;margin-bottom:10px;">
          <button id="prevBtn" style="">⟨</button>
          <img id="carouselImg"
               src="${carousel[0] || ''}"
               style="width:100%;aspect-ratio:1/1;object-fit:cover;" />
          <button id="nextBtn" style="">⟩</button>
        </div>

        <p id="concept">${(d.concept || '').replace(/\\n/g, '<br>')}</p>
        <p>材質： ${d.material || '—'}</p>
        <p>尺寸： ${d.size || '—'}</p>
        <p>重量： ${d.weight || '—'}</p>
        <p>價格： ${d.price || '—'}</p>
        <p>#${d.series || '—'}</p>
        <p>#${d.type   || '—'}</p>
        <p>#${d.usage  || '—'}</p>

        <!-- ===== 其餘圖片 ===== -->
        ${extraImgs.length
          ? `<div style="margin-top:15px">
               ${extraImgs.map(u=>`<img src="${u}" style="width:100%;margin-top:10px;object-fit:contain;"/>`).join("")}
             </div>`
          : ''
        }
      </div>
    `;
    document.body.appendChild(popup);

    /* === 4. 輪播按鈕事件 === */
    let idx = 0;
    const imgEl  = popup.querySelector('#carouselImg');
    popup.querySelector('#prevBtn').onclick = () => {
      idx = (idx - 1 + carousel.length) % carousel.length;
      imgEl.src = carousel[idx];
    };
    popup.querySelector('#nextBtn').onclick = () => {
      idx = (idx + 1) % carousel.length;
      imgEl.src = carousel[idx];
    };
  });
}

// ✅ 側邊選單控制
function asideMenu() {
  const menu = document.querySelector(".dropdown-content2");
  const dropdown = document.querySelector(".dropdown2");
  const isOpen = menu.style.display === "block";
  menu.style.display = isOpen ? "none" : "block";
  dropdown.classList.toggle("active", !isOpen);
}
function asideMenu2() {
  const menu = document.querySelector(".dropdown-content3");
  const dropdown = document.querySelector(".dropdown2");
  const isOpen = menu.style.display === "block";
  menu.style.display = isOpen ? "none" : "block";
  dropdown.classList.toggle("active", !isOpen);
}
function asideMenu3() {
  const menu = document.querySelector(".dropdown-content4");
  const dropdown = document.querySelector(".dropdown2");
  const isOpen = menu.style.display === "block";
  menu.style.display = isOpen ? "none" : "block";
  dropdown.classList.toggle("active", !isOpen);
}

// ✅ 初始載入
document.addEventListener("DOMContentLoaded", renderGallery);
