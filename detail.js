const product = JSON.parse(localStorage.getItem("selectedProduct") || "null");

const detailBox = document.getElementById("detailBox");

if (!product) {
  detailBox.innerHTML = "<p>没有找到产品</p >";
} else {
  const images = product.images && product.images.length > 0
  ? product.images
  : [product.image];

detailBox.innerHTML = `
  <div class="detail-images">
    ${images.map(img => `<img src="${img}" class="detail-image">`).join("")}
  </div>
  <h2>${product.name || ""}</h2>
  <p>分类：${product.category || ""}</p >
  <p>${product.desc || ""}</p >
  <button>立即咨询</button>
  `;
}

let currentImageIndex = 0;

let currentImageIndex = 0;

window.nextImage = function () {
  const product = JSON.parse(localStorage.getItem("selectedProduct"));
  const images = product.images || [product.image];

  currentImageIndex++;

  if (currentImageIndex >= images.length) {
    currentImageIndex = 0;
  }

  document.getElementById("sliderImage").src = images[currentImageIndex];
};

window.prevImage = function () {
  const product = JSON.parse(localStorage.getItem("selectedProduct"));
  const images = product.images || [product.image];

  currentImageIndex--;

  if (currentImageIndex < 0) {
    currentImageIndex = images.length - 1;
  }

  document.getElementById("sliderImage").src = images[currentImageIndex];
};
//test save