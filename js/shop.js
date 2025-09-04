// ✅ 建立樣式
const style = document.createElement("style");
style.textContent = `
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 32px;
    padding: 40px;
    max-width: 1200px;
    margin: auto;
    justify-items: center;
    align-items: start;
  }

  .shop-card {
    width: 100%;
    max-width: 220px;
    height: 320px;
    background: white;
    text-align: center;
    padding: 20px;
    box-sizing: border-box;
    border-radius: 6px;
    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .shop-card-img {
    width: 100%;
    height: 70%;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 12px;
  }

  .shop-card-img img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .shop-card .title {
    font-weight: bold;
    margin-bottom: 6px;
    font-size: 16px;
    color: #222;
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
        <div class="shop-card-img">
          <img src="${d.imageUrl}" alt="${d.name || '作品'}">
        </div>
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

// ✅ 初始化
document.addEventListener("DOMContentLoaded", renderUnsoldWorks);
