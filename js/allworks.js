// 作品資料（模擬後台上傳）
const items = [
    { id: 1, img: "https://res.cloudinary.com/dyjvqds92/image/upload/v1739694458/4_d7bmy1.jpg", series: "獻祭-獻系列", type: "戒指", usage: "日常細節" },
    { id: 2, img: "https://res.cloudinary.com/dyjvqds92/image/upload/v1739694378/%E8%83%8C%E6%99%AF1_f2l3lm.jpg", series: "獻祭-祭系列", type: "手鍊", usage: "特殊搭配" },
    { id: 3, img: "https://res.cloudinary.com/dyjvqds92/image/upload/v1739694478/1_ou3ckx.jpg", series: "對話系列", type: "吊墜&配鏈", usage: "對話系列" },
    { id: 4, img: "https://res.cloudinary.com/dyjvqds92/image/upload/v1739414629/index2_fjmuwj.jpg", series: "熾天使系列", type: "耳飾", usage: "送禮選擇" },
    { id: 5, img: "https://res.cloudinary.com/dyjvqds92/image/upload/v1739414629/index1_wwddxr.jpg", series: "鎖鏈系列", type: "手鍊", usage: "日常細節" },
    { id: 6, img: "https://res.cloudinary.com/dyjvqds92/image/upload/v1739414629/index3_kjdfto.jpg", series: "荒城系列", type: "戒指", usage: "特殊搭配" },
];

// 儲存目前篩選條件
let filters = {
    series: null,
    type: null,
    usage: null
};

// 顯示篩選後的作品
function filterItems(category, value) {
    filters[category] = value; // 設定篩選條件
    renderGallery();
}

// 渲染作品
function renderGallery() {
    const gallery = document.getElementById("gallery");
    gallery.innerHTML = ""; // 清空現有內容

    // 篩選符合條件的作品
    const filteredItems = items.filter(item =>
        (!filters.series || item.series === filters.series) &&
        (!filters.type || item.type === filters.type) &&
        (!filters.usage || item.usage === filters.usage)
    );

    // 如果沒有篩選條件，顯示所有作品
    const displayItems = (filters.series || filters.type || filters.usage) ? filteredItems : items;


    // 生成新的作品內容
    filteredItems.forEach(item => {
        const div = document.createElement("div");
        div.classList.add("item");
        div.innerHTML = `
            <img src="${item.img}" alt="${item.series}">
            <p>${item.series} <br> ${item.type} <br> ${item.usage}</p>
        `;
        gallery.appendChild(div);
    });
}

// 控制下拉選單顯示
function toggleDropdown(menuId) {
    document.querySelectorAll(".dropdown-content").forEach(menu => {
        if (menu.id === menuId) {
            menu.style.display = menu.style.display === "block" ? "none" : "block";
        } else {
            menu.style.display = "none";
        }
    });
}

// 頁面載入時，顯示所有作品
document.addEventListener("DOMContentLoaded", renderGallery);



function asideMenu() {
    var dropdown = document.querySelector(".dropdown2");
    var menu = document.querySelector(".dropdown-content2");

    var isOpen = menu.style.display === "block";

    // 切換顯示/隱藏
    menu.style.display = isOpen ? "none" : "block";

    // 切換 active 狀態來旋轉箭頭
    dropdown.classList.toggle("active", !isOpen);
}
function asideMenu2() {
    var dropdown = document.querySelector(".dropdown2");
    var menu = document.querySelector(".dropdown-content3");

    var isOpen = menu.style.display === "block";

    // 切換顯示/隱藏
    menu.style.display = isOpen ? "none" : "block";

    // 切換 active 狀態來旋轉箭頭
    dropdown.classList.toggle("active", !isOpen);
}
function asideMenu3() {
    var dropdown = document.querySelector(".dropdown2");
    var menu = document.querySelector(".dropdown-content4");

    var isOpen = menu.style.display === "block";

    // 切換顯示/隱藏
    menu.style.display = isOpen ? "none" : "block";

    // 切換 active 狀態來旋轉箭頭
    dropdown.classList.toggle("active", !isOpen);
}
