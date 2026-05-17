const products = JSON.parse(localStorage.getItem("products")) || [];
const favorites = JSON.parse(localStorage.getItem("favorites")) || [];

const list = document.getElementById("favoritesList");

const favoriteProducts = favorites
  .map(index => ({ product: products[index], index }))
  .filter(item => item.product);

if (favoriteProducts.length === 0) {
  list.innerHTML = "<p>暂无收藏商品</p >";
} else {
  list.innerHTML = favoriteProducts.map(item => `
    <div class="product-card">
      < img src="${(item.product.images || [item.product.image])[0]}" class="product-img">

      <h3>${item.product.name}</h3>
      <p>${item.product.desc}</p >
      <p>${item.product.category}</p >

      <button onclick="openDetail(${item.index})">查看详情</button>
      <button onclick="removeFavorite(${item.index})">取消收藏</button>
    </div>
  `).join("");
}

function openDetail(index) {
  localStorage.setItem("detailIndex", index);
  location.href = "detail.html";
}

function removeFavorite(index) {
  const newFavorites = favorites.filter(i => i !== index);
  localStorage.setItem("favorites", JSON.stringify(newFavorites));
  location.reload();
}