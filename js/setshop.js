// ===== CSS 樣式 =====
const style = document.createElement("style");
style.textContent = `
  body {
    background: #f0f0f0;
    font-family: sans-serif;
    margin: 0;
    padding: 0;
  }

  section {
    background: white;
    border-radius: 10px;
    padding: 32px 24px;
    margin: 40px auto;
    max-width: 1280px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  }

  section h2 {
    margin-top: 0;
    margin-bottom: 24px;
    font-size: 20px;
    color: #333;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 32px;
  }

  .shop-card {
    background: #fff;
    max-width: 200px;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
    padding: 20px;
    text-align: center;
    border-radius: 6px;
    cursor: pointer;
  }

  .shop-card img {
    width: 100%;
    aspect-ratio: 1 / 1;
    object-fit: cover;
    margin-bottom: 12px;
    background-color: #eee;
  }

  .shop-card .title {
    font-weight: bold;
    margin-bottom: 6px;
    font-size: 16px;
    color: #222;
  }

  .shop-card .price {
    font-size: 14px;
    color: #333;
    margin-bottom: 4px;
  }

  .shop-card .status {
    font-size: 13px;
    color: #777;
    margin-bottom: 4px;
  }

  .modal {
    position: fixed;
    top: 30%;
    left: 50%;
    transform: translate(-50%, -30%);
    background: white;
    padding: 20px;
    border: 1px solid #ccc;
    z-index: 999;
    box-shadow: 0 0 20px rgba(0,0,0,0.2);
    min-width: 300px;
  }
  .hidden {
    display: none;
  }
`;
document.head.appendChild(style);

// ===== Modal 元素 =====
const modal = document.createElement("div");
modal.id = "editModal";
modal.className = "modal hidden";
modal.innerHTML = `
  <label>狀態：
    <select id="statusSelect">
      <option value="unsold">未出售</option>
      <option value="sold">已出售</option>
    </select>
  </label>
  <br><br>
  <label>價格：
    <input type="number" id="priceInput" placeholder="輸入價格" />
  </label>
  <br><br>
  <button id="saveBtn">儲存</button>
`;
document.body.appendChild(modal);

const statusSelect = document.getElementById("statusSelect");
const priceInput = document.getElementById("priceInput");
const saveBtn = document.getElementById("saveBtn");

let currentDocId = null;
let currentCard = null;

// ===== 建立 3 個區塊 =====
function createContainerSection(id, label) {
  const section = document.createElement("section");
  section.innerHTML = `<h2>${label}</h2><div id="${id}" class="grid"></div>`;
  document.body.appendChild(section);
}
["unsoldGrid", "unknownGrid", "soldGrid"].forEach((id, idx) => {
  const labels = ["出售清單", "未標記售出狀態", "已售出"];
  createContainerSection(id, labels[idx]);
});

// ===== 渲染作品卡片 =====
async function renderAllWorksBySoldStatus() {
  const unsoldGrid = document.getElementById("unsoldGrid");
  const soldGrid = document.getElementById("soldGrid");
  const unknownGrid = document.getElementById("unknownGrid");

  try {
    const snapshot = await db.collection("works").orderBy("timestamp", "desc").get();

    snapshot.forEach(doc => {
      const d = doc.data();
      const status = d.soldStatus;
      const container =
        status === "unsold" ? unsoldGrid :
        status === "sold" ? soldGrid :
        unknownGrid;

      const card = document.createElement("div");
      card.className = "shop-card";
      card.innerHTML = `
        <img src="${d.imageUrl}" alt="${d.name || '作品'}">
        <div class="title">${d.name || '未命名作品'}</div>
        <div class="price">NT$ ${d.officialPrice || '-'}</div>
        <div class="status">${status || '未標記'}</div>
      `;

      card.addEventListener("click", () => {
        currentCard = card;
        currentDocId = doc.id;
        statusSelect.value = d.soldStatus || "unsold";
        priceInput.value = d.officialPrice || "";
        modal.classList.remove("hidden");
      });

      container.appendChild(card);
    });

  } catch (err) {
    console.error("❌ 載入失敗", err);
    unsoldGrid.innerHTML = soldGrid.innerHTML = unknownGrid.innerHTML = "<p>載入失敗，請稍後再試</p>";
  }
}

// ===== 儲存修改 =====
saveBtn.addEventListener("click", async () => {
  if (!currentCard || !currentDocId) return;

  const newStatus = statusSelect.value;
  const newPrice = priceInput.value.trim();
  const name = currentCard.querySelector(".title").textContent.trim();

  try {
    // 🔁 更新 works 集合
    await db.collection("works").doc(currentDocId).update({
      soldStatus: newStatus,
      officialPrice: newPrice
    });

    // ✅ 分別處理 shopStatusSync/sold 與 shopStatusSync/unsold
    const soldRef = db.collection("shopStatusSync").doc("sold");
    const unsoldRef = db.collection("shopStatusSync").doc("unsold");

    await db.runTransaction(async (tx) => {
      const [soldSnap, unsoldSnap] = await Promise.all([
        tx.get(soldRef),
        tx.get(unsoldRef)
      ]);

      const soldList = new Set((soldSnap.exists ? soldSnap.data().list : []) || []);
      const unsoldList = new Set((unsoldSnap.exists ? unsoldSnap.data().list : []) || []);

      // 移除 name
      soldList.delete(name);
      unsoldList.delete(name);

      // 加入新狀態
      if (newStatus === "sold") {
        soldList.add(name);
      } else {
        unsoldList.add(name);
      }

      // 更新各自 doc
      tx.set(soldRef, { list: Array.from(soldList) }, { merge: true });
      tx.set(unsoldRef, { list: Array.from(unsoldList) }, { merge: true });
    });

    // ✅ 更新 UI
    currentCard.querySelector(".status").textContent = newStatus;
    currentCard.querySelector(".price").textContent = `NT$ ${newPrice || '-'}`;
    modal.classList.add("hidden");
    alert("✅ 更新成功，並已同步購物系統！");

  } catch (err) {
    console.error("❌ 更新失敗", err);
    alert("更新失敗：" + err.message);
  }
});

// ===== 初始化 =====
document.addEventListener("DOMContentLoaded", renderAllWorksBySoldStatus);
