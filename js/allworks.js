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
