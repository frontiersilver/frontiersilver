// ✅ jQuery 觸發效果
$(document).ready(function () {
  $(".parallax, .jumbotron, .perspective-container, .parallaxtext, .image, .image2, .parallax-bg, .parallax ").paroller();

  $(".tilt-box").tilt({
    maxTilt: 10,
    perspective: 1000,
    speed: 400,
    scale: 1.02
  });
});

// ✅ 滾動數值記錄
document.addEventListener("scroll", () => {
  document.documentElement.style.setProperty("--scroll-y", `${window.scrollY}px`);
});

// ✅ 側邊選單控制
function toggleMenu() {
  document.getElementById("sidebar")?.classList.toggle("open");
  document.getElementById("overlay")?.classList.toggle("open");
}
function toggleMenu2() {
  const menu = document.querySelector(".dropdown-content");
  const isOpen = menu?.style.display === "block";
  menu.style.display = isOpen ? "none" : "block";
  document.querySelector(".dropdown")?.classList.toggle("active", !isOpen);
}
function closeMenu() {
  document.getElementById("sidebar")?.classList.remove("open");
  document.getElementById("overlay")?.classList.remove("open");
}

// ✅ 打字動畫 1
document.addEventListener("DOMContentLoaded", () => {
  const text = "Frontier Silver Frontier Silver   Frontier Silver   Frontier Silver   Frontier Silver";
  const textElement = document.getElementById("typewriter-text");
  if (!textElement) return;

  let charIndex = 0, isDeleting = false;
  function typeEffect() {
    textElement.textContent = isDeleting
      ? text.substring(text.length - charIndex)
      : text.substring(0, charIndex);
    charIndex += isDeleting ? -1 : 1;

    if (charIndex > text.length) {
      isDeleting = true;
      setTimeout(typeEffect, 1000);
    } else if (charIndex < 0) {
      isDeleting = false;
      setTimeout(typeEffect, 1000);
    } else {
      setTimeout(typeEffect, 100);
    }
  }
  typeEffect();
});

// ✅ 打字動畫 2
document.addEventListener("DOMContentLoaded", () => {
  const text = "FRONTIER SILVER";
  const animatedText = document.getElementById("animated-text");
  if (!animatedText) return;

  let index = 0;
  function typeWriter() {
    animatedText.innerHTML = `<span>${text.substring(0, index + 1)}</span><span class='cursor'>|</span>`;
    index++;
    if (index < text.length) {
      setTimeout(typeWriter, 150);
    } else {
      setTimeout(() => {
        index = 0;
        typeWriter();
      }, 2000);
    }
  }
  typeWriter();
});

// ✅ 左右滑動作品區塊
document.addEventListener("DOMContentLoaded", () => {
  const scrollContainer = document.querySelector(".scroll-content");
  const scrollLeftBtn = document.querySelector(".scroll-left");
  const scrollRightBtn = document.querySelector(".scroll-right");
  if (!scrollContainer || !scrollLeftBtn || !scrollRightBtn) return;

  scrollLeftBtn.addEventListener("click", () => scrollContainer.scrollBy({ left: -200, behavior: "smooth" }));
  scrollRightBtn.addEventListener("click", () => scrollContainer.scrollBy({ left: 200, behavior: "smooth" }));

  let isDown = false, startX, scrollLeft;
  scrollContainer.addEventListener("mousedown", (e) => {
    isDown = true;
    startX = e.pageX - scrollContainer.offsetLeft;
    scrollLeft = scrollContainer.scrollLeft;
    scrollContainer.classList.add("active");
  });
  scrollContainer.addEventListener("mouseup", () => {
    isDown = false;
    scrollContainer.classList.remove("active");
  });
  scrollContainer.addEventListener("mouseleave", () => {
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

// ✅ 載入最新 6 筆 Firebase 作品
async function renderLatestWorks() {
  const container = document.getElementById("latestGallery");
  if (!container) return;

  try {
    const snapshot = await db.collection("works").orderBy("timestamp", "desc").limit(6).get();
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
          <p class="item_name">${d.name || '未命名作品'}</p>
          <p class="item_tag">
            ${d.series ? `#${d.series}` : ''}
          </p>
          <p class="item_tag">
            ${d.type ? `#${d.type}` : ''}
          </p>
          <p class="item_tag">
            ${d.usage ? `#${d.usage}` : ''}
          </p>
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
