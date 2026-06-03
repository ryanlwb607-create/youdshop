let selectedVariant = null;
let currentProduct = null;

const supabaseUrl = 'https://vngzpblmstezerhnvbpm.supabase.co'

const supabaseKey = 'sb_publishable_fx9OReyvJAM7ZKCZ_iHBXg_fcyCiMuJ'

const db = window.supabase.createClient(supabaseUrl, supabaseKey);
const params = new URLSearchParams(window.location.search);
const productId = params.get("id");
let product = null;

const detailBox = document.getElementById("detailBox");

async function loadProduct() {
  const { data, error } = await db
    .from("products")
    .select("*")
    .eq("id", productId)
    .single();

  if (error || !data) {
    detailBox.innerHTML = "<p>没有找到产品</p >";
    return;
  }

  product = data;
  currentProduct = product;

if (!product) {
  detailBox.innerHTML = "<p>没有找到产品</p >";
} else {
  const images = product.images && product.images.length > 0
  ? product.images
  : [product.image];

  let variants = [];

if (typeof product.variants === "string") {
    variants = product.variants.split(/[，,]/).map(v => {
        const parts = v.split("=");
        return {
            name: parts[0],
            price: parts[1]
        };
    });
}

detailBox.innerHTML = `
  <div class="detail-images">
    ${images.map(img => `<img src="${img}" class="detail-image">`).join("")}
  </div>
  <h2>${product.name || ""}</h2>
  <p>分类：${product.category || ""}</p >
  <p>${product.desc || ""}</p >

  <div class="variant-box">
    <h3>规格选择</h3>

    ${variants.length > 0 ? variants.map(v => `
    <button class="variant-btn" onclick="selectVariant('${v.name}', ${v.price})">
        ${v.name} ¥${v.price}
    </button>
`).join("") : "<p>暂无规格</p >"}
  </div>
  <button onclick="addToCart()">加入购物车</button>
  `;
}

window.selectVariant = function(name, price) {
  selectedVariant = { name, price };
  alert("已选择：" + name + " ¥" + price);
};

let currentImageIndex = 0;

window.nextImage = function () {
  const images = product.images || [product.image];

  currentImageIndex++;

  if (currentImageIndex >= images.length) {
    currentImageIndex = 0;
  }

  document.getElementById("sliderImage").src = images[currentImageIndex];
};

window.prevImage = function () {
  const images = product.images || [product.image];

  currentImageIndex--;

  if (currentImageIndex < 0) {
    currentImageIndex = images.length - 1;
  }

  document.getElementById("sliderImage").src = images[currentImageIndex];
};

}

window.addToCart = function() {
  if (!selectedVariant) {
    alert("请先选择规格");
    return;
  }

  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  const newItem = {
    id: currentProduct.id,
    title: currentProduct.title,
    name: currentProduct.name || currentProduct.title,
    image: currentProduct.image ||currentProduct.images?.[0],
    spec: selectedVariant.name,
    price: selectedVariant.price,
    quantity: 1
  };

  const existingItem = cart.find(item =>
    item.id === newItem.id && item.spec === newItem.spec
  );

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push(newItem);
  }

  localStorage.setItem("cart", JSON.stringify(cart));

  alert("已加入购物车");
};

loadProduct();

window.addToCartFromDetail = function () {
  const product = window.currentProduct;

  if (!product) {
    alert("商品信息读取失败");
    return;
  }

  const selectedSpecBtn = document.querySelector(".spec-btn.active");
  const selectedSpec = selectedSpecBtn ? selectedSpecBtn.innerText : "";

  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  const cartItem = {
    id: product.id,
    title: product.title,
    price: product.price,
    image: product.image || (product.images && product.images[0]) || "",
    spec: selectedSpec,
    quantity: 1
  };

  const existingItem = cart.find(item =>
    item.id === cartItem.id && item.spec === cartItem.spec
  );

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push(cartItem);
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  alert("已加入购物车");
};