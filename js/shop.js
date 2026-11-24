// shop.js
import { auth } from './app.js';

// ✅ 建立樣式
const style = document.createElement("style");
style.textContent = `
  button {
    border: none;
    background-color: none;
  }
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
    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    cursor: pointer;
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
  .close {
    position: absolute;
    top: 10px;
    right: 14px;
    font-size: 22px;
    font-weight: bold;
    cursor: pointer;
    color: #888;
  }
  .product-modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    max-width: 400px;
    width: 90%;
    padding: 24px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    z-index: 9999;
  }
  .product-modal img {
    width: 100%;
    height: auto;
    margin-bottom: 16px;
    object-fit: cover;
  }
  .product-modal h3 {
    margin: 0 0 8px;
  }
  .product-modal p {
    margin: 0 0 16px;
    font-size: 14px;
    color: #555;
  }
  .product-modal button {
    padding: 10px 16px;
    background: black;
    color: white;
    border: none;
    cursor: pointer;
  }
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.3);
    z-index: 9998;
  }
`;
document.head.appendChild(style);

// ✅ 建立 shopGrid 容器
let grid = document.getElementById("shopGrid");
if (!grid) {
  grid = document.createElement("div");
  grid.id = "shopGrid";
  grid.className = "grid";
  document.body.appendChild(grid);
}

// ✅ 渲染未售出商品
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
      d.workId = doc.id;
      const card = document.createElement("div");
      card.className = "shop-card";
      card.innerHTML = `
        <div class="shop-card-img">
          <img src="${d.imageUrl}" alt="${d.name || '作品'}">
        </div>
        <div class="title">${d.name || '未命名作品'}</div>
        <div class="price">NT$ ${d.officialPrice || '—'}</div>
      `;
      card.addEventListener("click", () => openProductModal(d));
      grid.appendChild(card);
    });
  } catch (err) {
    console.error("❌ 載入商品失敗：", err);
    grid.innerHTML = "<p>載入商品失敗，請稍後再試</p>";
  }
}

const cartItems = [];

function updateCartUI() {
  const cartContainer = document.getElementById("cartItems");
  const totalDisplay = document.getElementById("totalPrice");
  if (!cartContainer) return;
  cartContainer.innerHTML = "";
  let total = 0;
  cartItems.forEach((item, idx) => {
    const div = document.createElement("div");
    div.className = "shop-card";
    div.style.maxWidth = "180px";
    div.style.height = "auto";
    div.style.position = "relative";
    div.innerHTML = `
      <div class="shop-card-img" style="height: 140px;">
        <img src="${item.imageUrl}" alt="${item.name}">
      </div>
      <div class="title">${item.name}</div>
      <div class="price">NT$ ${item.officialPrice || '—'}</div>
      <button onclick="removeCartItem(${idx})" style="position: absolute; top: 6px; right: 6px; font-size: 12px; background: crimson; color: white; border: none; border-radius: 4px; padding: 4px 6px; cursor: pointer;">移除</button>
    `;
    cartContainer.appendChild(div);
    const price = parseInt(item.officialPrice) || 0;
    total += price;
  });
  if (totalDisplay) totalDisplay.innerText = total;
}

window.removeCartItem = function(index) {
  cartItems.splice(index, 1);
  updateCartUI();
};

function openProductModal(data) {
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  document.body.appendChild(overlay);
  const modal = document.createElement("div");
  modal.className = "product-modal";
  modal.innerHTML = `
    <span class="close" onclick="this.parentElement.remove(); document.querySelector('.modal-overlay').remove();">×</span>
    <img src="${data.imageUrl}" alt="${data.name}">
    <h3>${data.name || "未命名作品"}</h3>
    <p><b>售價：</b>NT$ ${data.officialPrice || "—"}</p>
    <p>材質： ${data.material || '—'}</p>
    <p>尺寸： ${data.size || '—'}</p>
    <p>重量： ${data.weight || '—'}</p>
    <p>價格備註： ${data.price || '—'}</p>
    <button id="addToCartBtn">加入購物車</button>
  `;
  document.body.appendChild(modal);
  overlay.addEventListener("click", () => {
    modal.remove();
    overlay.remove();
  });
  modal.querySelector("#addToCartBtn").addEventListener("click", () => {
    const user = auth.currentUser;
    if (!user) return alert("⚠️ 請先登入才能加入購物車！");
    if (cartItems.some(item => item.name === data.name)) return alert("⚠️ 此商品已在購物車中！");
    cartItems.push(data);
    updateCartUI();
    modal.remove();
    overlay.remove();
  });
}

// ✅ 結帳按鈕
const checkoutBtn = document.createElement("button");
checkoutBtn.textContent = "結帳";
checkoutBtn.style.cssText = "display: block; margin: 20px auto; padding: 10px 20px; font-size: 16px; background: #333; color: white; border-radius: 4px; cursor: pointer;";
checkoutBtn.addEventListener("click", openCheckoutForm);
document.body.appendChild(checkoutBtn);

function openCheckoutForm() {
  if (cartItems.length === 0) return alert("購物車為空，請先加入商品。");
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  document.body.appendChild(overlay);
  const form = document.createElement("div");
  form.className = "product-modal";
  form.innerHTML = `
    <span class="close" onclick="this.parentElement.remove(); document.querySelector('.modal-overlay').remove();">&times;</span>
    <h3>填寫訂單資料</h3>
    <p><input type="text" id="checkoutName" placeholder="姓名" required style="width: 100%; padding: 8px; margin-bottom: 10px;"></p>
    <p><input type="tel" id="checkoutPhone" placeholder="電話" required style="width: 100%; padding: 8px; margin-bottom: 10px;"></p>
    <p><input type="email" id="checkoutEmail" placeholder="電子郵件" required style="width: 100%; padding: 8px; margin-bottom: 10px;"></p>
    <p><input type="text" id="checkoutStore" placeholder="取貨門市（如：7-11 松江門市）" required style="width: 100%; padding: 8px; margin-bottom: 10px;"></p>
    <button id="submitCheckout" style="margin-top: 10px; width: 100%; background: black; color: white; padding: 10px; border: none;">✅ 確認送出</button>
  `;
  document.body.appendChild(form);
  overlay.addEventListener("click", () => {
    form.remove();
    overlay.remove();
  });

  form.querySelector("#submitCheckout").addEventListener("click", async () => {
    const name = document.getElementById("checkoutName").value.trim();
    const phone = document.getElementById("checkoutPhone").value.trim();
    const email = document.getElementById("checkoutEmail").value.trim();
    const store = document.getElementById("checkoutStore").value.trim();

    if (!name || !phone || !email || !store) {
      return alert("請完整填寫所有欄位。");
    }

    const orderData = {
      name,
      phone,
      email,
      store,
      productNames: cartItems.map(item => item.name), // ✅ 加這一行
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    };

    try {
      const docRef = await db.collection("orders").add(orderData);
      console.log("✅ 訂單已儲存，ID:", docRef.id);

      const updatePromises = cartItems.map(async (item) => {
        const workId = item.workId || item.id;
        if (!workId) return;

        await db.collection("works").doc(workId).update({
          soldStatus: "sold",
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
      });

      await Promise.all(updatePromises);

      cartItems.length = 0;
      updateCartUI();
      alert("✅ 訂單已送出並更新商品狀態！");
      form.remove();
      overlay.remove();
      renderUnsoldWorks();
    } catch (error) {
      console.error("❌ 發生錯誤：", error);
      alert("❌ 提交訂單或更新商品狀態時出錯，請稍後再試。");
    }
  });
}

document.addEventListener("DOMContentLoaded", renderUnsoldWorks);
