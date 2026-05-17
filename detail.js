const products = JSON.parse(localStorage.getItem("products")) || [];

const detailBox = document.getElementById("detailBox");
const index = localStorage.getItem("detailIndex");
const product = products[index];

if (!product) {
  detailBox.innerHTML = "<p>没有找到产品</p >";
} else {
  const images = product.images || [product.image];

detailBox.innerHTML = `
  <h1>${product.name}</h1>

  <div class="slider">
    <button class="slider-btn left" onclick="prevImage()">‹</button>

    <img id="mainImage" src="${images[0]}" class="slider-img" onclick="showBigImage(this.src)">

    <button class="slider-btn right" onclick="nextImage()">›</button>
  </div>

  <div class="thumbs">
    ${images.map((img, i) => `
      <img src="${img}" class="thumb" onclick="setImage(${i})">
    `).join("")}
  </div>

  <p class="category">${product.category}</p >
  <p>${product.desc}</p >

  <button onclick="window.location.href='index.html'">返回首页</button>
`;
}
function showBigImage(src) {
  const win = window.open("", "_blank");
  win.document.body.innerHTML = "";

  const img = win.document.createElement("img");
  img.src = src;
  img.style.width = "100%";
  img.style.maxWidth = "900px";
  img.style.display = "block";
  img.style.margin = "20px auto";

  win.document.body.appendChild(img);
}
let currentIndex = 0;
const imageList = product.images || [product.image];

function setImage(index) {
  currentIndex = index;

  document.getElementById("mainImage").src =
    imageList[currentIndex];
}

function prevImage() {
  currentIndex--;

  if (currentIndex < 0) {
    currentIndex = imageList.length - 1;
  }

  setImage(currentIndex);
}

function nextImage() {
  currentIndex++;

  if (currentIndex >= imageList.length) {
    currentIndex = 0;
  }

  setImage(currentIndex);
}