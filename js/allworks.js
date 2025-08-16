const state = {
  currentCategory: null,
  currentValue: null
};

function showAllWorks() {
  state.currentCategory = null;
  state.currentValue = null;
  renderGallery();
}

function filterItems(category, value) {
  state.currentCategory = category;
  state.currentValue = value;
  renderGallery();
}

async function renderGallery() {
  const gallery = document.getElementById("gallery");
  gallery.innerHTML = "<p>載入中...</p>";

  try {
    const snapshot = await db.collection("works").orderBy("timestamp", "desc").get();
    gallery.innerHTML = "";

    let hasResult = false;

    snapshot.forEach(doc => {
      const item = doc.data();

      if (state.currentCategory && state.currentValue && item[state.currentCategory] !== state.currentValue) {
        return;
      }

      hasResult = true;

      const div = document.createElement("div");
      div.classList.add("item");
      div.setAttribute("onclick", `viewWork('${doc.id}')`);
      div.innerHTML = `
        <div class="item_pic">
          <img src="${item.imageUrl}" alt="${item.name || ''}" />
        </div>
        <div class="item_p">
          <p class="item_name">${item.name || '無名稱'}</p>
          <div>
            <p class="item_tag">#${item.series || ''}</p>
            <p class="item_tag">#${item.type || ''}</p>
            <p class="item_tag">#${item.usage || ''}</p>
          </div>
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

// ✅ 延遲載入 tag 用
const loadedMenus = new Set();

async function populateSingleMenu(cat) {
  if (loadedMenus.has(cat)) return;

  try {
    const doc = await db.collection("tags").doc(cat).get();
    const values = doc.exists ? doc.data().values || [] : [];
    const menu = document.getElementById(`${cat}-menu`);
    if (!menu) return;

    values.forEach(v => {
      const a = document.createElement("a");
      a.href = "#";
      a.innerText = v;
      a.onclick = (e) => {
        e.preventDefault();
        filterItems(cat, v);
      };
      menu.appendChild(a);
    });

    loadedMenus.add(cat);
  } catch (err) {
    console.error(`❌ 載入 ${cat} tags 失敗：`, err);
  }
}

// ✅ 修正版 toggleAsideMenu（從外層容器控制開關）
async function toggleAsideMenu(id) {
  const menu = document.getElementById(id);
  if (!menu) return;

  // 修正：向上找包含 menu 的 wrapper（可穿透中間一層）
  let wrapper = menu.parentElement;
  while (wrapper && !wrapper.classList.contains("dropdown-content2") &&
                  !wrapper.classList.contains("dropdown-content3") &&
                  !wrapper.classList.contains("dropdown-content4")) {
    wrapper = wrapper.parentElement;
  }
  if (!wrapper) return;

  const isOpen = wrapper.classList.contains('open');

  // 全部收起
  document.querySelectorAll('.dropdown-content2, .dropdown-content3, .dropdown-content4')
    .forEach(el => el.classList.remove('open'));

  if (!isOpen) {
    wrapper.classList.add('open');
    const cat = id.replace("-menu", "");
    await populateSingleMenu(cat);
  }
}

// ✅ 初始畫廊載入
document.addEventListener("DOMContentLoaded", renderGallery);
