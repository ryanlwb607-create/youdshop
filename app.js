const supabaseUrl = 'https://vngzpblmstezerhnvbpm.supabase.co'

const supabaseKey = 'sb_publishable_fx9OReyvJAM7ZKCZ_iHBXg_fcyCiMuJ'

const db = window.supabase.createClient(supabaseUrl, supabaseKey);

let isAdmin = localStorage.getItem("isAdmin") === "true";
let categories = [];
let selectedSubCategory = "";

async function loadCategoriesFromDB() {
  const { data, error } = await db
  .from("categories")
  .select("id, name, parent_id, sort_order")
  .order("sort_order", { ascending: true });

  if (error) {
    console.log(error);
    return;
  }

  categories = data || [];

  renderCategories();
}

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

let currentPage = 0;
const pageSize = 12;
let allLoaded = false;

async function loadProducts(reset = true, searchMode = false) {

  if (reset) {
    currentPage = 0;
    allLoaded = false;
    products = [];
  }

  const from = currentPage * pageSize;
  const to = from + pageSize - 1;

 let query = db
  .from('products')
  .select('*')
  .order('id', { ascending: false });

const selectedCategory = document.getElementById("categoryFilter").value;
const activeCategory = selectedSubCategory || selectedCategory;

if (activeCategory && activeCategory !== "全部") {
  query = query.eq("category", activeCategory);
}

if (!searchMode) {
  query = query.range(from, to);
}

const { data, error } = await query;

  if (error) {
    console.log(error);
    return;
  }

  if (!data || data.length < pageSize) {
    allLoaded = true;
  }

  products = reset
    ? data
    : [...products, ...data];

  if (document.getElementById("productList")) {
    renderProducts();
  }

  currentPage++;

  const btn = document.getElementById("loadMoreBtn");

  if (btn) {
    btn.style.display = allLoaded ? "none" : "block";
  }
}

function renderCategories() {
  const categorySelect = document.getElementById("category");
  const filterSelect = document.getElementById("categoryFilter");

  const parentCategories = categories.filter(c => !c.parent_id);

  if (categorySelect) {
    categorySelect.innerHTML = "";

    parentCategories.forEach(parent => {
      categorySelect.innerHTML += `
        <option value="${parent.name}">${parent.name}</option>
      `;
    });
  }

  if (filterSelect) {
    filterSelect.innerHTML = `<option value="全部">全部</option>`;

    parentCategories.forEach(parent => {
      filterSelect.innerHTML += `
        <option value="${parent.name}">${parent.name}</option>
      `;
    });
  }
}

function renderSubCategories(parentName) {
  const box = document.getElementById("subCategoryBox");
  if (!box) return;

  const parent = categories.find(
    c => c.name === parentName && !c.parent_id
  );

  if (!parent) {
    box.innerHTML = "";
    return;
  }

  const children = categories.filter(
    c => c.parent_id === parent.id
  );

  if (children.length === 0) {
    box.innerHTML = "";
    return;
  }

  box.innerHTML = children.map(child => `
    <button class="sub-category-btn"
      onclick="selectSubCategory('${child.name}')">
      ${child.name}
    </button>
  `).join("");
}

function closeMobileMenu() {
  const mobileMenu = document.getElementById("mobileMenu");

  if (
    mobileMenu &&
    mobileMenu.style.display !== "none"
  ) {
    toggleMobileMenu();
  }
}

function selectSubCategory(name) {
  selectedSubCategory = name;
  renderProducts();
  closeMobileMenu();
}

function renderProducts() {
  const list = document.getElementById("productList");
  const searchText = document.getElementById("searchInput").value.toLowerCase();
  const category = document.getElementById("categoryFilter").value;
  const activeCategory = selectedSubCategory || category;

  list.innerHTML = "";

  const filteredProducts = products.filter(product => {
    const matchSearch =
      product.name.toLowerCase().includes(searchText) ||
      product.desc.toLowerCase().includes(searchText) ||
      product.category.toLowerCase().includes(searchText);

    const matchCategory =
  activeCategory === "全部" ||
  product.category === activeCategory;

    return matchSearch && matchCategory;
  });

  window.currentProducts = filteredProducts;
  console.log("当前页面产品：", window.currentProducts);

  filteredProducts.forEach((product, index) => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.onclick = (e) => {
  if (e.target.closest("button")) return;

  if (e.target.classList.contains("product-img")) {
    openImageViewer(e.target.src);
  }
};

    const imageBox = document.createElement("div");
imageBox.className = "product-images";

(product.images || [product.image]).forEach((src, index)=> {
  const img = document.createElement("img");
  img.src = src;
  img.alt = product.name;
  img.className = "product-img";
  if(index !== 0){
  img.style.display = "none";
  }
  imageBox.appendChild(img);
});

    const info = document.createElement("div");
    info.className = "product-info";

    info.innerHTML = `
  <h3>${product.title || product.name || "未命名产品"}</h3>
  <div class="category">${product.category}</div>
  <p class="price">¥${product.price || "未设置价格"}</p >

  <!-- 首页隐藏简介 -->

  <button class="detail-btn" onclick='openDetail("${product.id}")'>
  查看详情
</button>

<button class="fav-btn" onclick="toggleFavorite(${index})">
  ${favorites.includes(index) ? "取消收藏" : "收藏"}
</button>

<input
  type="number"
  min="1"
  value="1"
  class="qty-input"
  id="qty-${index}"
>

<button
  class="cart-btn"
  onclick="addToCart(${index})"
>
加入购物车
</button>

${
  isAdmin
    ? `
<button class="edit-btn" onclick="editProduct(${index})">编辑</button>
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

let cart = JSON.parse(localStorage.getItem("cart")) || [];
function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function updateCartCount() {
  const cartCount = document.getElementById("cartCount");
  if (!cartCount) return;

  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = totalCount;
}

function addToCart(index) {
  const product = window.currentProducts[index];
  const qtyInput = document.getElementById(`qty-${index}`);
  const quantity = Number(qtyInput.value) || 1;

  const existing = cart.find(item => item.id === product.id);

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: Number(product.price) || 0,
      quantity: quantity
    });
  }

  saveCart();
  updateCartCount();

  alert("已加入购物车");
  console.log("当前购物车：", cart);
}

function showCart() {
  if (cart.length === 0) {
    alert("购物车是空的");
    return;
  }

  let message = "购物车：\n\n";
  let total = 0;

  cart.forEach((item, index) => {
    const subtotal = item.price * item.quantity;
    total += subtotal;

    message += `${index + 1}. ${item.name}\n`;
    message += `数量：${item.quantity}\n`;
    message += `小计：¥${subtotal}\n\n`;
  });

  const orderNo = generateOrderNo();

message += `合计：¥${total}\n\n`;
message += `订单号：${orderNo}`;

alert(message);
}

function clearCart() {
  if (confirm("确定要清空购物车吗？")) {
    cart = [];
    saveCart();
    updateCartCount();
    alert("购物车已清空");
  }
}

function generateOrderNo() {
  const now = new Date();

  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const h = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  const s = String(now.getSeconds()).padStart(2, "0");
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");

  return `YD${y}${m}${d}${h}${min}${s}${random}`;
}

async function addProduct() {
  const name = document.getElementById("name").value;
  const imageFiles = document.getElementById("image").files;
  const price = document.getElementById("price").value;
  const variants = document.getElementById("variants").value;
  const desc = document.getElementById("desc").value;
  const category = document.getElementById("category").value;

  if (!name || imageFiles.length === 0 || !desc) {
    alert("请填写完整产品信息，并选择图片");
    return;
  }

  const imageList = [];
  let loadedCount = 0;

  for (let i = 0; i < imageFiles.length; i++) {
  new Compressor(imageFiles[i], {
    quality: 0.7,
    maxWidth: 900,
    maxHeight: 900,
    convertSize: 500000,

    success(result) {
      const reader = new FileReader();

      reader.onload = async function(e) {
        imageList.push(e.target.result);
        loadedCount++;

        if (loadedCount === imageFiles.length) {
          const newProduct = {
            name: name,
            price: price,
            variants: variants,
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

      reader.readAsDataURL(result);
    },

    error(err) {
      console.log(err);
      alert("图片压缩失败");
    }
  });
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
  const editCategory = document.getElementById("editCategory");

  editCategory.innerHTML = categories
  .map(c => `<option value="${c.name}">${c.name}</option>`)
  .join("");

  editCategory.value = product.category;
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

  const currentScrollY = window.scrollY;
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

  await loadProducts(false);

  window.scrollTo({
  top: currentScrollY,
  behavior: "instant"
});

closeEditModal();
}

const searchInput = document.getElementById("searchInput");
if (searchInput) {
  let searchTimer = null;

searchInput.addEventListener("input", () => {
  clearTimeout(searchTimer);

  searchTimer = setTimeout(async () => {
    const keyword = searchInput.value.trim();

    const searchStatus =
      document.getElementById("searchStatus");

    if (keyword) {

      if (searchStatus) {
        searchStatus.textContent = " 加载中...";
      }

      await loadProducts(true, true);

      if (products.length === 0) {
        if (searchStatus) {
         searchStatus.textContent = "无相关产品";
        }
      } else {
        if (searchStatus) {
          searchStatus.textContent = "";
        }
      }

    } else {

      if (searchStatus) {
        searchStatus.textContent = "";
      }

      await loadProducts(true);
    }

  }, 500);
});
}

const categoryFilter = document.getElementById("categoryFilter");
if (categoryFilter) {
  categoryFilter.addEventListener("change", function () {
  selectedSubCategory = "";
  renderSubCategories(this.value);
  loadProducts(true);

  const parent = categories.find(c => c.name === this.value && !c.parent_id);
  const hasChildren = parent && categories.some(c => c.parent_id === parent.id);

  if (!hasChildren) {
    closeMobileMenu();
  }
});
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
function openDetail(id) {
  window.location.href = `detail.html?id=${id}`;
}

function renderDetail() {
  const detailBox = document.getElementById("detailBox");
  if (!detailBox) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  const product = products.find(p => String(p.id) === String(id));

  console.log(product);

  if (!product) {
    detailBox.innerHTML = "<p>没有找到产品</p >";
    return;
  }

 detailBox.innerHTML = `
    <div class="detail-card">

      <div class="detail-slider">
        <button class="slider-btn" onclick="prevImage()">‹</button>

        <img
          id="sliderImage"
          src="${(product.images || [product.image])[0]}"
          class="detail-image"
        >

        <button class="slider-btn" onclick="nextImage()">›</button>
      </div>

        <h1>
            ${product.title || product.name || "未命名产品"}
        </h1>

        <h2 style="color:red;">
            ¥${product.price || "未设置价格"}
        </h2>

        <p>
            ${product.description || product.desc || "暂无介绍"}
        </p >

        <button class="fav-btn"
        onclick="toggleFavorite(products.findIndex(p => p.id == product.id))">
        收藏
        </button>

        <button onclick="history.back()">
            返回首页
        </button>

    </div>
`;
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

loadCategoriesFromDB();

if (document.getElementById("productList")) {
  loadProducts();
}

if (document.getElementById("detailBox")) {
  loadProducts().then(() => {
    renderDetail();
  });
}
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
function openImageViewer(imageUrl) {
  let viewer = document.getElementById("imageViewer");

  if (!viewer) {
    viewer = document.createElement("div");
    viewer.id = "imageViewer";
    document.body.appendChild(viewer);
  }

  viewer.innerHTML = `
    <div class="image-viewer-overlay" onclick="closeImageViewer()">
      < img src="${imageUrl}" class="image-viewer-img">
    </div>
  `;

  viewer.style.display = "block";
}

function closeImageViewer() {
  const viewer = document.getElementById("imageViewer");

  if (viewer) {
    viewer.style.display = "none";
  }
}

function openImageViewer(src) {
  const viewer = document.createElement("div");
  viewer.className = "image-viewer";
  viewer.innerHTML = `
    <div class="image-viewer-bg"></div>
    <img src="${src}" class="image-viewer-img">
  `;

  viewer.onclick = function () {
    viewer.remove();
  };

  document.body.appendChild(viewer);
}

updateCartCount();

function toggleMobileMenu() {
  const menu = document.getElementById("mobileMenu");

  menu.classList.toggle("show");
}

window.goOrdersPage = function () {
  if (isAdmin) {
    location.href = "orders.html";
  } else {
    location.href = "my-orders.html";
  }
};

window.showQR = function () {
    document.getElementById("qrModal").style.display = "flex";
}

window.closeQR = function () {
    document.getElementById("qrModal").style.display = "none";
}

window.addEventListener("click", function(e) {
    const modal = document.getElementById("qrModal");

    if (e.target === modal) {
        closeQR();
    }
});

function openLoginModal() {
  document.getElementById("loginModal").style.display = "flex";
}

function closeLoginModal() {
  document.getElementById("loginModal").style.display = "none";
}

async function registerMember() {
  const name = document.getElementById("memberName").value;
  const email = document.getElementById("memberEmail").value;
  const password = document.getElementById("memberPassword").value;

  const { data, error } = await db.auth.signUp({
    email,
    password,
    options: {
      data: { name: name }
    }
  });

  document.getElementById("loginMsg").innerText =
    error ? error.message : "注册成功，请去邮箱确认验证邮件";
}

async function loginMember() {
  const email = document.getElementById("memberEmail").value;
  const password = document.getElementById("memberPassword").value;

  const { data, error } = await db.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    document.getElementById("loginMsg").innerText = error.message;
    return;
  }

  const userName = data.user.user_metadata.name || email;
  localStorage.setItem("memberName", userName);
  document.getElementById("userNameText").innerText = "欢迎，" + userName;
  document.getElementById("loginMsg").innerText = "登录成功";
  closeLoginModal();
}

async function checkMemberLogin() {
  if (isAdmin) {
    document.getElementById("userNameText").innerText = "";
    return;
  }

  const { data } = await db.auth.getUser();

  if (data && data.user) {
    const name = data.user.user_metadata.name || data.user.email;
    document.getElementById("userNameText").innerText = "欢迎，" + name;
  }
}

checkMemberLogin();

function toggleAdminPanel() {
  const panel = document.getElementById("adminPanel");
  const btn = document.getElementById("adminToggleBtn");

  if (panel.style.display === "none") {
    panel.style.display = "block";
    btn.innerText = "管理员入口 ▲";
  } else {
    panel.style.display = "none";
    btn.innerText = "管理员入口 ▼";
  }
}