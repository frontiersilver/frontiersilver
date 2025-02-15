function toggleMenu3() {
    var dropdown = document.querySelector(".dropdown");
    var menu = document.querySelector(".dropdown-content");

    var isOpen = menu.style.display === "block";

    // 切換顯示/隱藏
    menu.style.display = isOpen ? "none" : "block";

    // 切換 active 狀態來旋轉箭頭
    dropdown.classList.toggle("active", !isOpen);
}
