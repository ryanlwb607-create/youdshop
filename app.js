const supabaseUrl = 'https://vngzpblmstezerhnvbpm.supabase.co'

const supabaseKey = 'sb_publishable_fx9OReyvJAM7ZKCZ_iHBXg_fcyCiMuJ'

const db = window.supabase.createClient(
  supabaseUrl,
  supabaseKey
)
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
let products = JSON.parse(localStorage.getItem("products")) || [
  {
    name: "示例产品A",
    image: "https://picsum.photos/400/300?random=1",
    desc: "这是一个产品介绍示例。",
    category: "护肤"
  },
  {
    name: "示例产品B",
    image: "https://picsum.photos/400/300?random=2",
    desc: "这里可以写产品的详细说明。",
    category: "食品"
  }
];

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

saveProducts();

function saveProducts() {
  localStorage.setItem("products", JSON.stringify(products));
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
    card.onclick = () => openDetail(index);

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
      <h3>${product.name}</h3>
      <div class="category">${product.category}</div>
      <p>${product.desc}</p >
      <button onclick="toggleFavorite(${index})">
      <button onclick="openDetail(${index})">查看详情</button>
  ${favorites.includes(index) ? "️ 已收藏" : "🤍 收藏"}
</button>
      ${isAdmin ? `
  <button onclick="editProduct(${index})">编辑</button>
  <button class="delete-btn" onclick="deleteProduct(${index})">删除</button>
` : ""}
    `;

    card.appendChild(imageBox);
    card.appendChild(info);
    list.appendChild(card);
  });
  document.querySelector(".admin-only").style.display =
  isAdmin ? "block" : "none";
}

function addProduct() {
  const name = document.getElementById("name").value;
  const imageFiles = document.getElementById("image").files;
  const desc = document.getElementById("desc").value;
  const category = document.getElementById("category").value;

  if (!name || imageFiles.length === 0 || !desc) {
    alert("请填写完整产品信息，并选择图片");
    return;
  }

  const imageList = [];
  let loadedCount = 0;

  for (let i = 0; i < imageFiles.length; i++) {
    const reader = new FileReader();

    reader.onload = function(e) {
      imageList.push(e.target.result);
      loadedCount++;

      if (loadedCount === imageFiles.length) {
        products.push({
          name: name,
          images: imageList,
          image: imageList[0],
          desc: desc,
          category: category
        });

        saveProducts();

        saveProducts();
        clearForm();
        renderProducts();
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

function deleteProduct(index) {
  if (confirm("确定要删除这个产品吗？")) {
    products.splice(index, 1);
    saveProducts();
    renderProducts();
  }
}

function editProduct(index) {
  const product = products[index];

  document.getElementById("editIndex").value = index;
  document.getElementById("editName").value = product.name;
  document.getElementById("editDesc").value = product.desc;
  document.getElementById("editCategory").value = product.category;

  document.getElementById("editModal").style.display = "block";
}

function closeEditModal() {
  document.getElementById("editModal").style.display = "none";
}

function saveEditProduct() {
  const index =
    document.getElementById("editIndex").value;

  products[index].name =
    document.getElementById("editName").value;

  products[index].desc =
    document.getElementById("editDesc").value;

  products[index].category =
    document.getElementById("editCategory").value;

  saveProducts();
  closeEditModal();

  setTimeout(() => {
  renderProducts();
}, 100);
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

  const product = JSON.parse(localStorage.getItem("selectedProduct"));
  console.log(product);

  if (!product) {
    detailBox.innerHTML = "<p>没有找到产品</p >";
    return;
  }

  detailBox.innerHTML = `
    <h1>${product.name}</h1>

    <div class="detail-images">
      ${(product.images || [product.image]).map(img => `
        < img src="${img}" class="detail-img">
      `).join("")}
    </div>

    <p class="category">${product.category}</p >
    <p>${product.desc}</p >
    <button>查看详情</button>

    <button onclick="history.back()">返回首页</button>
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

  if (favorites.includes(index)) {

    favorites = favorites.filter(i => i !== index);

  } else {

    favorites.push(index);

  }

  localStorage.setItem("favorites", JSON.stringify(favorites));

renderCategories();

  renderProducts();
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