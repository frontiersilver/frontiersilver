// ✅ Firebase 初始化
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

// ✅ 篩選條件
let currentCategory = null;
let currentValue = null;

// ✅ 篩選條件設定
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

    snapshot.forEach(doc => {
      const item = doc.data();

      // 篩選邏輯
      if (currentCategory && currentValue && item[currentCategory] !== currentValue) {
        return;
      }

      const div = document.createElement("div");
      div.classList.add("item");
      div.innerHTML = `
        <img src="${item.imageUrl}" alt="${item.series}" />
        <p>${item.series} - ${item.type} - ${item.usage}</p>
      `;
      gallery.appendChild(div);
    });
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
