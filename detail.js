const product = JSON.parse(localStorage.getItem("selectedProduct") || "null");

const detailBox = document.getElementById("detailBox");

if (!product) {
  detailBox.innerHTML = "<p>没有找到产品</p >";
} else {
  const img = product.images?.[0] || product.image || "";

  detailBox.innerHTML = `
    < img src="${img}" class="detail-image">
    <h2>${product.name || ""}</h2>
    <p>分类：${product.category || ""}</p >
    <p>${product.desc || ""}</p >
    <button>立即咨询</button>
  `;
}