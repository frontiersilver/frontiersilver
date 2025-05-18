// ✅ 篩選條件
let currentCategory = null;
let currentValue = null;

// ✅ 篩選條件設定
function showAllWorks() {
  currentCategory = null;
  currentValue = null;
  renderGallery();
}
function filterItems(category, value) {
  currentCategory = category;
  currentValue = value;
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

      // 篩選條件不符合則略過
      if (currentCategory && currentValue && item[currentCategory] !== currentValue) {
        return;
      }

      hasResult = true;

      const div = document.createElement("div");
      div.classList.add("item");
      div.innerHTML = `
        <div class="item_img">
          <img src="${item.imageUrl}" alt="${item.name || ''}" />
        </div>
        <div class="item_p">
          <p>${item.name || '無名稱'}</p>
          <p>${item.series || ''} / ${item.type || ''} / ${item.usage || ''}</p>
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

// ✅ 下拉選單控制
function toggleDropdown(menuId) {
  document.querySelectorAll(".dropdown-content").forEach(menu => {
    menu.style.display = (menu.id === menuId && menu.style.display !== "block") ? "block" : "none";
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
