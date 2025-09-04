// ✅ 建立樣式
const style = document.createElement("style");
style.textContent = `
  .grid {
    flex: 1;
    display: grid;
    align-items: start;
    justify-content: center;
    gap: 32px;
    padding: 40px;
    max-width: 1200px;
    margin: auto;
  }

  .shop-card {
    width: 100%;
    max-width: 220px;
    height: 320px;
    overflow: hidden;
    background: white;
    text-align: center;
    padding: 20px;
    box-sizing: border-box;
  }

  .shop-card img {
    width: 100%;
    height: 70%;
    object-fit: cover; /* ✅ 維持比例裁切 */
    display: block;
    align-items: center;
    justify-content: center;
    margin-bottom: 10px;
    overflow: hidden;
  }

  .shop-card .title {
    font-weight: bold;
    margin-bottom: 6px;
    font-size: 16px;
  }

  .shop-card .price {
    font-size: 14px;
    color: #444;
  }
`;
document.head.appendChild(style);

// ✅ 建立 shopGrid 容器（如果沒有的話）
let grid = document.getElementById("shopGrid");
if (!grid) {
  grid = document.createElement("div");
  grid.id = "shopGrid";
  grid.className = "grid";
  document.body.appendChild(grid);
}

// ✅ 主函式：渲染未售出商品
async function renderUnsoldWorks() {
  grid.innerHTML = "載入中...";

  try {
    const snapshot = await db.collection("works")
      .where("soldStatus", "==", "unsold")
      .orderBy("timestamp", "desc")
      .get();

    if (snapshot.empty) {
      grid.innerHTML = "<p>目前沒有可購買的商品</p>";
      return;
    }

    grid.innerHTML = "";

    snapshot.forEach(doc => {
      const d = doc.data();
      const card = document.createElement("div");
      card.className = "shop-card";
      card.innerHTML = `
        <img src="${d.imageUrl}" alt="${d.name || '作品'}">
        <div class="title">${d.name || '未命名作品'}</div>
        <div class="price">NT$ ${d.officialPrice || '—'}</div>
      `;
      grid.appendChild(card);
    });

  } catch (err) {
    console.error("❌ 載入商品失敗：", err);
    grid.innerHTML = "<p>載入商品失敗，請稍後再試</p>";
  }
}

// ✅ 自動初始化
document.addEventListener("DOMContentLoaded", renderUnsoldWorks);
