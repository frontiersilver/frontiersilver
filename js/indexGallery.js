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
