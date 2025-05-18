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
$(document).ready(function () {
  console.log("jQuery 準備完成，開始執行腳本！");

  if ($('.parallax').length) $('.parallax').paroller();
  if ($('.jumbotron').length) $('.jumbotron').paroller();
  if ($('.perspective-container').length) $('.perspective-container').paroller();
  if ($('.parallaxtext').length) $('.parallaxtext').paroller();
  if ($('.image').length) $('.image').paroller();
});

document.addEventListener("scroll", () => {
  let scrollValue = window.scrollY;
  document.documentElement.style.setProperty("--scroll-y", `${scrollValue}px`);
});

// tilt-box 效果
document.addEventListener("DOMContentLoaded", () => {
  if ($(".tilt-box").length) {
    $(".tilt-box").tilt({
      maxTilt: 10,
      perspective: 1000,
      speed: 400,
      scale: 1.02
    });
  }
});

// 側邊選單
function toggleMenu() {
  let sidebar = document.getElementById("sidebar");
  let overlay = document.getElementById("overlay");
  if (!sidebar || !overlay) return;

  sidebar.classList.toggle("open");
  overlay.classList.toggle("open");
}

function toggleMenu2() {
  const dropdown = document.querySelector(".dropdown");
  const menu = document.querySelector(".dropdown-content");
  if (!dropdown || !menu) return;

  const isOpen = menu.style.display === "block";
  menu.style.display = isOpen ? "none" : "block";
  dropdown.classList.toggle("active", !isOpen);
}

function closeMenu() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  if (!sidebar || !overlay) return;
  sidebar.classList.remove("open");
  overlay.classList.remove("open");
}

// 類打字機動畫 1
document.addEventListener("DOMContentLoaded", () => {
  const text = "Frontier Sliver Frontier Sliver   Frontier Sliver   Frontier Sliver   Frontier Sliver";
  let charIndex = 0;
  let isDeleting = false;
  const speed = 100;
  const delayBetweenCycles = 1000;
  const textElement = document.getElementById("typewriter-text");
  if (!textElement) return;

  function typeEffect() {
    if (isDeleting) {
      textElement.textContent = text.substring(text.length - charIndex);
      charIndex--;
    } else {
      textElement.textContent = text.substring(0, charIndex);
      charIndex++;
    }

    if (!isDeleting && charIndex === text.length + 1) {
      isDeleting = true;
      setTimeout(typeEffect, delayBetweenCycles);
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      setTimeout(typeEffect, delayBetweenCycles);
    } else {
      setTimeout(typeEffect, speed);
    }
  }

  typeEffect();
});

// 類打字機動畫 2
document.addEventListener("DOMContentLoaded", () => {
  const text = "FRONTIER SLIVER";
  let index = 0;
  const speed = 150;
  const animatedText = document.getElementById("animated-text");
  if (!animatedText) return;

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
        index = 0;
        typeWriter();
      }, 2000);
    }
  }

  typeWriter();
});

// 左右滑動區塊
document.addEventListener("DOMContentLoaded", () => {
  const scrollContainer = document.querySelector(".scroll-content");
  const scrollLeftBtn = document.querySelector(".scroll-left");
  const scrollRightBtn = document.querySelector(".scroll-right");
  if (!scrollContainer || !scrollLeftBtn || !scrollRightBtn) return;

  scrollLeftBtn.addEventListener("click", () => {
    scrollContainer.scrollBy({ left: -200, behavior: "smooth" });
  });

  scrollRightBtn.addEventListener("click", () => {
    scrollContainer.scrollBy({ left: 200, behavior: "smooth" });
  });

  let isDown = false;
  let startX;
  let scrollLeft;

  scrollContainer.addEventListener("mousedown", (e) => {
    isDown = true;
    scrollContainer.classList.add("active");
    startX = e.pageX - scrollContainer.offsetLeft;
    scrollLeft = scrollContainer.scrollLeft;
  });

  scrollContainer.addEventListener("mouseleave", () => {
    isDown = false;
    scrollContainer.classList.remove("active");
  });

  scrollContainer.addEventListener("mouseup", () => {
    isDown = false;
    scrollContainer.classList.remove("active");
  });

  scrollContainer.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - scrollContainer.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainer.scrollLeft = scrollLeft - walk;
  });
});

async function renderLatestWorks() {
  const container = document.getElementById("latestGallery");
  if (!container) return;

  try {
    const snapshot = await db.collection("works")
      .orderBy("timestamp", "desc")
      .limit(6)
      .get();

    container.innerHTML = "";

    snapshot.forEach(doc => {
      const d = doc.data();
      const div = document.createElement("div");
      div.className = "item";
      div.innerHTML = `
        <div class="item_img">
          <img src="${d.imageUrl}" alt="${d.name || ''}" />
        </div>
        <div class="item_p">
          <p>${d.name || '未命名作品'}</p>
          <p>${d.series || ''} / ${d.type || ''} / ${d.usage || ''}</p>
        </div>
      `;
      container.appendChild(div);
    });
  } catch (err) {
    console.error("❌ 無法載入最新作品：", err);
    container.innerHTML = "<p>無法載入作品</p>";
  }
}

document.addEventListener("DOMContentLoaded", renderLatestWorks);
