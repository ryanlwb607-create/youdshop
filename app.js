const supabaseUrl = 'https://vngzpblmstezerhnvbpm.supabase.co'

const supabaseKey = 'sb_publishable_fx9OReyvJAM7ZKCZ_iHBXg_fcyCiMuJ'

const db = window.supabase.createClient(supabaseUrl, supabaseKey);

let isAdmin = localStorage.getItem("isAdmin") === "true";
let categories =
JSON.parse(localStorage.getItem("categories")) || [
    "护肤",
    "彩妆",
    "保健"
];

const ADMIN_USER = "admin";
const ADMIN_PASS = "123456";
const banners = [
  "https://picsum.photos/1200/350?random=1",
  "https://picsum.photos/1200/350?random=2",
  "https://picsum.photos/1200/350?random=3",
  "https://picsum.photos/1200/350?random=4"
];

let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
let bannerIndex = 0;
let products = [];

async function loadProducts() {
  const { data, error } = await db
    .from('products')
    .select('*');

  if (error) {
    console.log(error);
    return;
  }

  if (data && data.length > 0) {
  products = data;
}

  renderProducts();
}

function renderCategories() {

    const categorySelect =
        document.getElementById("category");

    const filterSelect =
        document.getElementById("categoryFilter");

    if(categorySelect){
        categorySelect.innerHTML = "";
    }

    if(filterSelect){
        filterSelect.innerHTML =
        "<option>全部</option>";
    }

    categories.forEach(category => {

        if(categorySelect){
            categorySelect.innerHTML +=
            `<option value="${category}">
                ${category}
            </option>`;
        }

        if(filterSelect){
            filterSelect.innerHTML +=
            `<option value="${category}">
                ${category}
            </option>`;
        }

    });

}

function renderProducts() {
  const list = document.getElementById("productList");
  const searchText = document.getElementById("searchInput").value.toLowerCase();
  const category = document.getElementById("categoryFilter").value;

  list.innerHTML = "";

  const filteredProducts = products.filter(product => {
    const matchSearch =
      product.name.toLowerCase().includes(searchText) ||
      product.desc.toLowerCase().includes(searchText) ||
      product.category.toLowerCase().includes(searchText);

    const matchCategory = category === "全部" || product.category === category;

    return matchSearch && matchCategory;
  });

  filteredProducts.forEach((product, index) => {
    window.currentProducts = filteredProducts;
    const card = document.createElement("div");
    card.className = "product-card";
    card.onclick = (e) => {
  if (e.target.tagName === "BUTTON") return;
  openDetail(index);
};

    const imageBox = document.createElement("div");
imageBox.className = "product-images";

(product.images || [product.image]).forEach(src => {
  const img = document.createElement("img");
  img.src = src;
  img.alt = product.name;
  img.className = "product-img";
  imageBox.appendChild(img);
});

    const info = document.createElement("div");
    info.className = "product-info";

    info.innerHTML = `
  <h3>${product.title || product.name || "未命名产品"}</h3>
  <div class="category">${product.category}</div>
  <p class="price">¥${product.price || "未设置价格"}</p >

  <p>${product.description || product.desc || "暂无介绍"}</p >

  <button onclick="openDetail(${index})">
    查看详情
  </button>

  <button onclick="toggleFavorite(${index})">
    ${favorites.includes(index) ? "取消收藏" : "收藏"}
  </button>

  ${
    isAdmin
      ? `
      <button onclick="editProduct(${index})">编辑</button>
      <button class="delete-btn" onclick="deleteProduct(${index})">删除</button>
    `
      : ""
  }
`;

    card.appendChild(imageBox);
    card.appendChild(info);
    list.appendChild(card);
  });
  document.querySelector(".admin-only").style.display =
  isAdmin ? "block" : "none";
}

async function addProduct() {
  const name = document.getElementById("name").value;
  const imageFiles = document.getElementById("image").files;
  const price = document.getElementById("price").value;
  const desc = document.getElementById("desc").value;
  const category = document.getElementById("category").value;

  if (!name || imageFiles.length === 0 || !desc) {
    alert("请填写完整产品信息，并选择图片");
    return;
  }

  const imageList = [];
  let loadedCount = 0;

  for (let i = 0; i <imageFiles.length; i++) {
    const reader = new FileReader();

    reader.onload = async function(e) {
      imageList.push(e.target.result);
      loadedCount++;

      if (loadedCount === imageFiles.length) {
        const newProduct = {
  name: name,
  price:price,
  images: imageList,
  image: imageList[0],
  desc: desc,
  category: category
};

const { error } = await db
  .from("products")
  .insert([newProduct]);

if (error) {
  console.log(error);
  alert("上传失败");
  return;
}

await loadProducts();

        clearForm();
      }
    };

    reader.readAsDataURL(imageFiles[i]);
  }
}

function clearForm() {
  document.getElementById("name").value = "";
  document.getElementById("image").value = "";
  document.getElementById("desc").value = "";
}

async function deleteProduct(index) {

    const product = window.currentProducts[index];

    if (!confirm("确定要删除这个产品吗？")) return;

    const { error } = await db
        .from("products")
        .delete()
        .eq("id", product.id);

    if (error) {
        alert("删除失败：" + error.message);
        return;
    }

    products.splice(index, 1);

    renderProducts();
}

function editProduct(index) {
  const product = products[index];

  document.getElementById("editIndex").value = index;
  document.getElementById("editName").value = product.name;
  document.getElementById("editDesc").value = product.desc;
  document.getElementById("editCategory").value = product.category;
  document.getElementById("editPrice").value = product.price || "";
  document.getElementById("editModal").style.display = "block";
}

function closeEditModal() {
  document.getElementById("editModal").style.display = "none";
}

async function saveEditProduct() {

  const index =
    document.getElementById("editIndex").value;

  const product = products[index];

  const newName =
    document.getElementById("editName").value;

  const newDesc =
    document.getElementById("editDesc").value;

  const newCategory =
    document.getElementById("editCategory").value;

  const newPrice =
  document.getElementById("editPrice").value;

  const { error } = await db
  .from("products")
  .update({
    name: newName,
    desc: newDesc,
    category: newCategory,
    image: product.image,
    price: newPrice
  })
  .eq("id", product.id);

  if (error) {
    console.error("编辑失败：", error);
    alert("编辑失败");
    return;
  }

  alert("编辑成功");

  await loadProducts();
  
  closeEditModal();
}

const searchInput = document.getElementById("searchInput");
if (searchInput) {
  searchInput.addEventListener("input", renderProducts);
}

const categoryFilter = document.getElementById("categoryFilter");
if (categoryFilter) {
  categoryFilter.addEventListener("change", renderProducts);
}

loadProducts();
function loginAdmin() {
  const user = document.getElementById("adminUser").value;
  const pass = document.getElementById("adminPass").value;

  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    isAdmin = true;
    localStorage.setItem("isAdmin", "true");
    alert("管理员登录成功");
    renderProducts();
    updateAdminView();
  } else {
    alert("账号或密码错误");
  }
}

function logoutAdmin() {
  isAdmin = false;
  localStorage.removeItem("isAdmin");
  alert("已退出管理员模式");
  renderProducts();
  updateAdminView();
}
function showDetail(index) {
  const product = products[index];

  document.getElementById("detailModal").style.display = "block";

  document.getElementById("detailImage").src =
  product.images ? product.images[0] : product.image;

  document.getElementById("detailName").innerText =
    product.name;

  document.getElementById("detailCategory").innerText =
    "分类：" + product.category;

  document.getElementById("detailDesc").innerText =
    product.desc;
}

function closeDetail() {
  document.getElementById("detailModal").style.display = "none";
}
function openDetail(index) {
  const product = window.currentProducts[index];
  localStorage.setItem("selectedProduct", JSON.stringify(product));
  window.location.href = "detail.html";
}

function renderDetail() {
  const detailBox = document.getElementById("detailBox");
  if (!detailBox) return;

  const savedProduct = localStorage.getItem("selectedProduct");
  const product = savedProduct ? JSON.parse(savedProduct) : null;
  console.log(product);

  if (!product) {
    detailBox.innerHTML = "<p>没有找到产品</p >";
    return;
  }

 detailBox.innerHTML = `
    <div class="detail-card">

       <img 
            src="${product.image || product.images?.[0] || ''}" 
            class="detail-image"
        >

        <h1>
            ${product.title || product.name || "未命名产品"}
        </h1>

        <h2 style="color:red;">
            ¥${product.price || "未设置价格"}
        </h2>

        <p>
            ${product.description || product.desc || "暂无介绍"}
        </p >

        <button onclick="history.back()">
            返回首页
        </button>

    </div>
`;
}

if (document.getElementById("detailBox")) {
  renderDetail();
}

function updateAdminView() {

  const isAdmin = localStorage.getItem("isAdmin") === "true";

  document.querySelectorAll(".admin-only").forEach(el => {
    el.style.display = isAdmin ? "block" : "none";
  });

  document.querySelectorAll(".edit-btn, .delete-btn").forEach(el => {
    el.style.display = isAdmin ? "inline-block" : "none";
  });
}
if (document.getElementById("productList")) {
  renderProducts();
  updateAdminView();
}

function toggleFavorite(index) {
  let favorites =
    JSON.parse(localStorage.getItem("favorites")) || [];

  if (favorites.includes(index)) {
    favorites = favorites.filter(i => i !== index);
  } else {
    favorites.push(index);
  }

  localStorage.setItem(
    "favorites",
    JSON.stringify(favorites)
  );

  location.reload();
}
function addFavorite(index) {
    let favorites =
        JSON.parse(localStorage.getItem("favorites")) || [];

    if (!favorites.includes(index)) {
        favorites.push(index);

        localStorage.setItem(
            "favorites",
            JSON.stringify(favorites)
        );

        alert("已加入收藏");
    } else {
        alert("已经收藏过了");
    }
}
function addCategory() {
  const input = document.getElementById("newCategory");
  const newCategory = input.value.trim();

  if (!newCategory) {
    alert("请输入分类名称");
    return;
  }

  if (categories.includes(newCategory)) {
    alert("这个分类已经存在");
    return;
  }

  categories.push(newCategory);

  localStorage.setItem(
    "categories",
    JSON.stringify(categories)
  );

  input.value = "";

  renderCategories();
  alert("分类添加成功");
}

function closeDetail() {
  document.getElementById("detailModal").classList.add("hidden");
}
renderCategories();
loadProducts();
function closeDetail() {
  const detailModal = document.getElementById("detailModal");
  if (detailModal) {
    detailModal.style.display = "none";
  }

  const detailBox = document.getElementById("detailBox");
  if (detailBox) {
    detailBox.style.display = "none";
  }

  const imageViewer = document.getElementById("imageViewer");
  if (imageViewer) {
    imageViewer.style.display = "none";
  }
}
function closeDetail() {
  const detailModal = document.getElementById("detailModal");
  if (detailModal) detailModal.style.display = "none";

  const imageViewer = document.getElementById("imageViewer");
  if (imageViewer) imageViewer.style.display = "none";
}
window.closeDetail = function () {
  const detailModal = document.getElementById("detailModal");
  if (detailModal) detailModal.style.display = "none";

  const imageViewer = document.getElementById("imageViewer");
  if (imageViewer) imageViewer.style.display = "none";
};