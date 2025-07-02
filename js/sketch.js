/* jagged.js ---------------------------------------------------- */
let holder, img, maskG;

/* 0. 你的主要圖片 */
function preload() {
  img = loadImage(
    "https://res.cloudinary.com/dyjvqds92/image/upload/v1750414494/20241215_194203_w1ik0u.jpg"
  );
}

/* 1. 綠色外框 (把絕對 px 改成 0–1 的 uv 百分比)  */
const designW = 960,
  designH = 720;
const shapeUV = [
  [120, 90],
  [300, 90],
  [300, 30],
  [420, 30],
  [420, 90],
  [620, 90],
  [620, 30],
  [740, 30],
  [740, 150],
  [860, 150],
  [860, 270],
  [920, 270],
  [920, 390],
  [860, 390],
  [860, 510],
  [680, 510],
  [680, 570],
  [560, 570],
  [560, 630],
  [320, 630],
  [320, 690],
  [120, 690],
  [120, 570],
  [60, 570],
  [60, 450],
  [0, 450],
  [0, 330],
  [60, 330],
  [60, 210],
  [120, 210]
].map(([x, y]) => [x / designW, y / designH]); // 轉成百分比

function setup() {
  holder = document.getElementById("jaggedHolder");
  const c = createCanvas(holder.clientWidth, holder.clientHeight);
  c.parent(holder);
  noLoop();
  buildMask(); // 建一次遮罩
  redraw();
}

/* 2. 依目前畫布尺寸重做遮罩圖形 */
function buildMask() {
  maskG = createGraphics(width, height);
  maskG.noStroke();
  maskG.fill(255);
  maskG.beginShape();
  shapeUV.forEach(([u, v]) => maskG.vertex(u * width, v * height));
  maskG.endShape(CLOSE);
}

function draw() {
  clear();

  /* 3. 把原圖塞滿畫布後套遮罩 */
  let tex = img.get();
  tex.resize(width, height); // cover 充滿
  tex.mask(maskG);
  image(tex, 0, 0);

  /* 4. 外框線 (可要可不要) */
  stroke("#333");
  strokeWeight(2);
  noFill();
  beginShape();
  shapeUV.forEach(([u, v]) => vertex(u * width, v * height));
  endShape(CLOSE);
}

/* 5. RWD */
function windowResized() {
  resizeCanvas(holder.clientWidth, holder.clientHeight, false);
  buildMask();
  redraw();
}
