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
