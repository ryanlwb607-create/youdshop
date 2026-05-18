const products = JSON.parse(localStorage.getItem("products")) || [];

const detailBox = document.getElementById("detailBox");
const index = localStorage.getItem("detailIndex");
const product = products[index];

if (!product) {
  detailBox.innerHTML = "<p>没有找到产品</p >";
} else {
  const images = product.images || [product.image];

document.getElementById("detailImage").src =
  product.images ? product.images[0] : product.image;
document.getElementById("detailTitle").innerText = product.name;
document.getElementById("detailCategory").innerText = product.category;
document.getElementById("detailDesc").innerText = product.desc;
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