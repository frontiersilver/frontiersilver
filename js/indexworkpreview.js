// ✅ 插入 popup CSS 到 head（只插一次）
(function injectPopupCSS() {
  if (document.getElementById("popup-style")) return;
  const style = document.createElement("style");
  style.id = "popup-style";
  style.textContent = `
    .popup {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
    }
    .popup-content {
      background: white;
      padding: 20px;
      max-width: 90vw;
      max-height: 90vh;
      overflow: auto;
      position: relative;
      border-radius: opx;
      box-shadow: 0 0 20px rgba(0,0,0,0.3);
    }
    .popup .close {
      position: absolute;
      top: 10px;
      right: 15px;
      font-size: 20px;
      cursor: pointer;
    }
  `;
  document.head.appendChild(style);
})();

// ✅ 左右滑動作品區塊
document.addEventListener("DOMContentLoaded", () => {
  const scrollContainer = document.querySelector(".scroll-content");
  const scrollLeftBtn = document.querySelector(".scroll-left");
  const scrollRightBtn = document.querySelector(".scroll-right");
  if (!scrollContainer || !scrollLeftBtn || !scrollRightBtn) return;

  scrollLeftBtn.addEventListener("click", () => scrollContainer.scrollBy({ left: -200, behavior: "smooth" }));
  scrollRightBtn.addEventListener("click", () => scrollContainer.scrollBy({ left: 200, behavior: "smooth" }));

  let isDown = false, startX, scrollLeft;
  scrollContainer.addEventListener("mousedown", (e) => {
    isDown = true;
    startX = e.pageX - scrollContainer.offsetLeft;
    scrollLeft = scrollContainer.scrollLeft;
    scrollContainer.classList.add("active");
  });
  scrollContainer.addEventListener("mouseup", () => {
    isDown = false;
    scrollContainer.classList.remove("active");
  });
  scrollContainer.addEventListener("mouseleave", () => {
    isDown = false;
    scrollContainer.classList.remove("active");
  });
  scrollContainer.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - scrollContainer.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainer.scrollLeft = scrollLeft - walk;
  });
});

// ✅ 載入最新 6 筆 Firebase 作品
async function renderLatestWorks() {
  const container = document.getElementById("latestGallery");
  if (!container) return;

  try {
    const snapshot = await db.collection("works").orderBy("timestamp", "desc").limit(6).get();
    container.innerHTML = "";

    snapshot.forEach(doc => {
      const d = doc.data();
      const workId = doc.id;

      const div = document.createElement("div");
      div.className = "item";
      div.innerHTML = `
        <div class="item_img">
          <img src="${d.imageUrl}" alt="${d.name || ''}" class="clickable-img" data-id="${workId}" />
        </div>
        <div class="item_p">
          <p class="item_name">${d.name || '未命名作品'}</p>
          <p class="item_tag">${d.series ? `#${d.series}` : ''}</p>
          <p class="item_tag">${d.type ? `#${d.type}` : ''}</p>
          <p class="item_tag">${d.usage ? `#${d.usage}` : ''}</p>
        </div>
      `;
      container.appendChild(div);

      // ✅ 點擊圖片 → 預覽 popup
      div.querySelector("img").addEventListener("click", () => {
        viewWorkPopup(workId);
      });

      // ✅ 點擊標題文字 → 同樣彈出 popup
      div.querySelector(".item_name").addEventListener("click", (e) => {
        e.stopPropagation(); // 避免干擾滑動等事件
        viewWorkPopup(workId);
      });
    });

  } catch (err) {
    console.error("❌ 無法載入最新作品：", err);
    container.innerHTML = "<p>無法載入作品</p>";
  }
}

// ✅ 預覽視窗
function viewWorkPopup(id) {
  db.collection("works").doc(id).get().then(doc => {
    const d = doc.data();
    const carousel = [];
    if (d.imageUrl) carousel.push(d.imageUrl);
    if (Array.isArray(d.carousel)) {
      d.carousel.forEach(url => {
        if (url && !carousel.includes(url)) carousel.push(url);
      });
    }

    const popup = document.createElement("div");
    popup.className = "popup";
    popup.innerHTML = `
      <div class="popup-content">
        <span class="close" onclick="this.closest('.popup').remove()">✕</span>
        <h2 style="text-align:left;">${d.name || '未命名作品'}</h2>
        <div style="text-align:center;margin-bottom:10px;">
          <img id="carouselImg" src="${carousel[0] || ''}" style="max-height:300px;max-width:100%;margin:0 10px;border:1px solid #ccc;" />
        </div>
        <p>${(d.concept || '').replace(/\\n/g, '<br>')}</p>
        <p>材質：${d.material || '—'}</p>
        <p>尺寸：${d.size || '—'}</p>
        <p>重量：${d.weight || '—'}</p>
        <p>價格：${d.price || '—'}</p>
        <p>#${d.series || '—'} #${d.type || '—'} #${d.usage || '—'}</p>
        <div style="margin-top: 13px; text-align:left;">
          <button onclick="goToAllWorks('${doc.id}')" style="font-family: 'LXGW WenKai Regular', sans-serif;padding:3px 5px;font-size:16px;border:none;background:#F8F8F8;color:gray;cursor:pointer;">
            查看更多作品
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(popup);

    // 輪播功能
    let idx = 0;
    const img = popup.querySelector("#carouselImg");
    popup.querySelector("#prevBtn").onclick = () => {
      idx = (idx - 1 + carousel.length) % carousel.length;
      img.src = carousel[idx];
    };
    popup.querySelector("#nextBtn").onclick = () => {
      idx = (idx + 1) % carousel.length;
      img.src = carousel[idx];
    };
  });
}

// ✅ 跳轉頁面
function goToAllWorks(id) {
  sessionStorage.setItem("viewWorkId", id);
  window.location.href = "allworks.html";
}

// ✅ 必須掛到 window，否則 popup 裡的 onclick 抓不到
window.viewWorkPopup = viewWorkPopup;
window.goToAllWorks = goToAllWorks;

// ✅ 初始化
document.addEventListener("DOMContentLoaded", renderLatestWorks);
