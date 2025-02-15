$(document).ready(function () {
    console.log("jQuery 準備完成，開始執行腳本！");


    $('.parallax').paroller();
    $('.jumbotron').paroller();
    $('.perspective-container').paroller();

});

document.addEventListener("scroll", function () {
  let scrollValue = window.scrollY;
  document.documentElement.style.setProperty("--scroll-y", `${scrollValue}px`);
});

document.addEventListener("scroll", function () {
    let scrollValue = window.scrollY;
    document.documentElement.style.setProperty("--scroll-y", `${scrollValue}px`);
});
$(document).ready(function() {
    $('.parallaxtext').paroller(); // 啟動視差滾動
});

document.addEventListener("DOMContentLoaded", function() {
    $(".tilt-box").tilt({
      maxTilt: 10,
      perspective: 1000,
      speed: 400,
      scale: 1.02
    });
});
$('.image').paroller();

function toggleMenu() {
    let sidebar = document.getElementById("sidebar");
    if (sidebar.style.width === "250px") {
        sidebar.style.width = "0";
    } else {
        sidebar.style.width = "250px";
    }
}
function toggleMenu() {
    let sidebar = document.getElementById("sidebar");
    let overlay = document.getElementById("overlay");

    if (sidebar.classList.contains("open")) {
        sidebar.classList.remove("open");
        overlay.classList.remove("open");
    } else {
        sidebar.classList.add("open");
        overlay.classList.add("open");
    }
}

function toggleMenu2() {
    var dropdown = document.querySelector(".dropdown");
    var menu = document.querySelector(".dropdown-content");

    var isOpen = menu.style.display === "block";

    // 切換顯示/隱藏
    menu.style.display = isOpen ? "none" : "block";

    // 切換 active 狀態來旋轉箭頭
    dropdown.classList.toggle("active", !isOpen);
}

function closeMenu() {
    document.getElementById("sidebar").classList.remove("open");
    document.getElementById("overlay").classList.remove("open");
}



document.addEventListener("DOMContentLoaded", function () {
    const text = "Frontier Sliver Frontier Sliver   Frontier Sliver   Frontier Sliver   Frontier Sliver";
    let charIndex = 0;
    let isDeleting = false;
    let speed = 100; // 打字速度
    let delayBetweenCycles = 1000; // 刪除完畢後等待時間
    let textElement = document.getElementById("typewriter-text");



    function typeEffect() {
        if (isDeleting) {
            // 從左到右刪除
            textElement.textContent = text.substring(text.length - charIndex);
            charIndex--;
        } else {
            // 從左到右逐字打出
            textElement.textContent = text.substring(0, charIndex);
            charIndex++;
        }

        if (!isDeleting && charIndex === text.length + 1) {
            isDeleting = true;
            setTimeout(typeEffect, delayBetweenCycles); // 停留後開始刪除
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            setTimeout(typeEffect, delayBetweenCycles); // 停留後重新開始
        } else {
            setTimeout(typeEffect, speed);
        }
    }

    typeEffect();
});


document.addEventListener("DOMContentLoaded", function () {
    let text = "FRONTIER SLIVER";
    let index = 0;
    let speed = 150; // 文字出現速度
    let animatedText = document.getElementById("animated-text");

    animatedText.style.fontFamily = "'LXGW WenKai Regular', sans-serif";
    animatedText.style.fontWeight = "200";
    animatedText.style.fontStyle = "normal";

    function typeWriter() {
        if (index < text.length) {
            animatedText.innerHTML = `<span style="font-family: 'LXGW WenKai Regular', sans-serif; font-weight: 200;">${text.substring(0, index + 1)}</span><span class='cursor'>|</span>`;
            index++;
            setTimeout(typeWriter, speed);
        } else {
            setTimeout(() => {
                index = 0; // 重置動畫
                typeWriter();
            }, 2000);
        }
    }

    typeWriter();
});
