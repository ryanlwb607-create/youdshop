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

if (!product) {
  detailBox.innerHTML = "<p>没有找到产品</p >";
} else {
  const images = product.images && product.images.length > 0
  ? product.images
  : [product.image];

  const variants = product.variants
    ? product.variants.split(/[，,]/).map(v => {
        const parts = v.split("=");
        return {
            name: parts[0],
            price: parts[1]
        };
    })
    : [];

detailBox.innerHTML = `
  <div class="detail-images">
    ${images.map(img => `<img src="${img}" class="detail-image">`).join("")}
  </div>
  <h2>${product.name || ""}</h2>
  <p>分类：${product.category || ""}</p >
  <p>${product.desc || ""}</p >

  <div class="variant-box">
    <h3>规格选择</h3>

    ${variants.map(v => `
        <button class="variant-btn">
            ${v.name} ¥${v.price}
        </button>
    `).join("")}
  </div>
  <button>立即咨询</button>
  `;
}

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

loadProduct();