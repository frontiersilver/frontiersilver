document.addEventListener("DOMContentLoaded", async () => {
  const ordersContainer = document.getElementById("orders-container");
  if (!ordersContainer) {
    console.error("❌ 找不到 orders-container 元素");
    return;
  }

  // 加入 CSS 樣式
  const style = document.createElement("style");
  style.innerHTML = `
    .order-item {
      border: 1px solid #ccc;
      padding: 1em;
      margin-bottom: 1em;
      border-radius: 8px;
      background: #fff;
    }
    .order-status {
      cursor: pointer;
      color: white;
      background: #999;
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
    }
    .order-status.shipped {
      background-color: #4caf50;
    }
    .order-status.pending {
      background-color: #f44336;
    }
    .status-dropdown {
      position: absolute;
      background: white;
      border: 1px solid #ccc;
      border-radius: 4px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
      padding: 0.5em;
      z-index: 9999;
    }
    .status-dropdown button {
      display: block;
      width: 100%;
      border: none;
      background: none;
      padding: 0.3em 0.5em;
      text-align: left;
      cursor: pointer;
    }
    .status-dropdown button:hover {
      background-color: #f0f0f0;
    }
  `;
  document.head.appendChild(style);

  try {
    const ordersSnapshot = await db.collection("orders").orderBy("createdAt", "desc").get();
    if (ordersSnapshot.empty) {
      ordersContainer.innerHTML = "<p>目前尚無訂單。</p>";
      return;
    }

    ordersContainer.innerHTML = "";

    // 建立兩個分類容器
    const pendingSection = document.createElement("div");
    const shippedSection = document.createElement("div");
    pendingSection.innerHTML = "<h2>未出貨</h2>";
    shippedSection.innerHTML = "<h2>已出貨</h2>";

    ordersSnapshot.forEach(doc => {
      const data = doc.data();
      const status = data.status || "未出貨";
      const isShipped = status === "已出貨";

      const orderElement = document.createElement("div");
      orderElement.classList.add("order-item");

      const statusClass = isShipped ? "shipped" : "pending";

      // 狀態按鈕
      const statusBtn = document.createElement("span");
      statusBtn.classList.add("order-status", statusClass);
      statusBtn.innerText = status;

      // 點擊顯示懸浮選單
      statusBtn.addEventListener("click", (e) => {
        e.stopPropagation(); // 防止冒泡導致頁面其他點擊事件觸發

        const existingDropdown = document.querySelector(".status-dropdown");
        if (existingDropdown) existingDropdown.remove();

        const dropdown = document.createElement("div");
        dropdown.className = "status-dropdown";

        ["已出貨", "未出貨"].forEach(opt => {
          const btn = document.createElement("button");
          btn.innerText = opt;
          btn.addEventListener("click", async () => {
            try {
              await db.collection("orders").doc(doc.id).update({ status: opt });
              statusBtn.innerText = opt;
              statusBtn.classList.toggle("shipped", opt === "已出貨");
              statusBtn.classList.toggle("pending", opt === "未出貨");
              dropdown.remove();

              // 重新分類移動 DOM 元素
              (opt === "已出貨" ? shippedSection : pendingSection).appendChild(orderElement);
            } catch (err) {
              alert("❌ 狀態更新失敗");
              console.error(err);
            }
          });
          dropdown.appendChild(btn);
        });

        dropdown.style.top = `${statusBtn.getBoundingClientRect().bottom + window.scrollY}px`;
        dropdown.style.left = `${statusBtn.getBoundingClientRect().left + window.scrollX}px`;
        document.body.appendChild(dropdown);

        // 點擊外部關閉
        document.addEventListener("click", () => dropdown.remove(), { once: true });
      });

      // 訂單顯示內容
      orderElement.innerHTML = `
        <h3>訂單編號：${doc.id}</h3>
        <p><strong>下單者：</strong>${data.name || "匿名"}</p>
        <p><strong>商品名稱：</strong>${data.productNames || ""}</p>
        <p><strong>電子郵件：</strong>${data.email || "無"}</p>
        <p><strong>電話：</strong>${data.phone || "無"}</p>
        <p><strong>取貨門市：</strong>${data.store || "無"}</p>
        <p><strong>時間：</strong>${data.createdAt?.toDate().toLocaleString() || "未知"}</p>
      `;
      orderElement.appendChild(statusBtn);

      if (isShipped) {
        shippedSection.appendChild(orderElement);
      } else {
        pendingSection.appendChild(orderElement);
      }
    });

    ordersContainer.appendChild(pendingSection);
    ordersContainer.appendChild(shippedSection);

  } catch (error) {
    console.error("❌ 無法取得訂單清單：", error);
    ordersContainer.innerHTML = "<p>發生錯誤，請稍後再試。</p>";
  }
});
