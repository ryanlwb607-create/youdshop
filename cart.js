const supabaseUrl = 'https://vngzpblmstezerhnvbpm.supabase.co'

const supabaseKey = 'sb_publishable_fx9OReyvJAM7ZKCZ_iHBXg_fcyCiMuJ'

const db = window.supabase.createClient(supabaseUrl, supabaseKey);

let cart = JSON.parse(localStorage.getItem("cart")) || [];

const cartList = document.getElementById("cartList");
const cartTotal = document.getElementById("cartTotal");

function renderCart() {
  let total = 0;

  cartList.innerHTML = "";

  cart.forEach((item, index) => {
    const subtotal = item.price * item.quantity;
    total += subtotal;

    cartList.innerHTML += `
  <div style="border:1px solid #ddd;padding:10px;margin:10px;">
    <h3>${item.name || item.title || "未命名商品"}</h3>
    <p>规格：${item.spec || "默认规格"}</p >
    <p>价格：¥${item.price || 0}</p >

        <button onclick="changeQty(${index},-1)">-</button>

        <span style="margin:0 10px;">
          ${item.quantity}
        </span>

        <button onclick="changeQty(${index},1)">+</button>

        <button onclick="removeItem(${index})">
          删除
        </button>
      </div>
    `;
  });

  cartTotal.textContent = `合计：¥${total}`;
}

function changeQty(index, delta) {
  cart[index].quantity += delta;

  if (cart[index].quantity < 1) {
    cart[index].quantity = 1;
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
}

function removeItem(index) {
  cart.splice(index, 1);

  localStorage.setItem("cart", JSON.stringify(cart));

  renderCart();
}

function clearCart() {
  if (confirm("确定清空购物车吗？")) {
    cart = [];

    localStorage.setItem("cart", JSON.stringify(cart));

    renderCart();
  }
}

renderCart();

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

function getVisitorId() {
  let visitorId = localStorage.getItem("visitorId");

  if (!visitorId) {
    visitorId =
      "V" +
      Date.now() +
      Math.random().toString(36).substring(2, 8);

    localStorage.setItem("visitorId", visitorId);
  }

  return visitorId;
}

async function loadSavedAddresses() {
  const select = document.getElementById("savedAddressSelect");
  if (!select) return;

  const visitorId = getVisitorId();

  const { data, error } = await db
    .from("address_book")
    .select("*")
    .eq("visitor_id", visitorId);

  if (error) {
    console.error(error);
    return;
  }

  select.innerHTML =
    '<option value="">选择已保存收货信息</option>';

  data.forEach(item => {
    const option = document.createElement("option");

    option.value = item.id;
    option.textContent =
      item.name + "｜" + item.phone;

    option.dataset.name = item.name;
    option.dataset.phone = item.phone;
    option.dataset.address = item.address;

    select.appendChild(option);
  });
}

function fillSavedAddress() {
  const select =
    document.getElementById("savedAddressSelect");

  const option =
    select.options[select.selectedIndex];

  if (!option.value) return;

  document.getElementById("customerName").value =
    option.dataset.name;

  document.getElementById("customerPhone").value =
    option.dataset.phone;

  document.getElementById("customerAddress").value =
    option.dataset.address;
}

async function saveAddressIfNeeded() {

  const checkbox =
    document.getElementById("saveAddressCheck");

  if (!checkbox || !checkbox.checked) return;

  const visitorId = getVisitorId();

  const { error } = await db.from("address_book").insert([
  {
    visitor_id: visitorId,
    name: document.getElementById("customerName").value,
    phone: document.getElementById("customerPhone").value,
    address: document.getElementById("customerAddress").value
  }
]);

if (error) {
  console.error("保存收货信息失败：", error);
  alert("保存收货信息失败：" + error.message);
}
}

async function submitOrder() {
  const customerName = document.getElementById("customerName").value.trim();
  const customerPhone = document.getElementById("customerPhone").value.trim();
  const customerAddress = document.getElementById("customerAddress").value.trim();
  const customerNote = document.getElementById("customerNote").value.trim();

if (!customerName || !customerPhone || !customerAddress) {
  alert("请填写完整收货信息");
  return;
}

  if (cart.length === 0) {
    alert("购物车是空的");
    return;
  }

  const orderNo = generateOrderNo();
  const visitorId = getVisitorId();
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const { error } = await db.from("orders").insert([
  {
    order_no: orderNo,
    items: cart,
    total: total,
    visitor_id: visitorId,

    customer_name: customerName,
    customer_phone: customerPhone,
    customer_address: customerAddress,
    customer_note: customerNote
  }
]);

if (error) {
    console.error("订单提交失败：", error);
    alert("订单提交失败，请稍后再试");
    return;
}

  alert("订单提交成功！\n订单号:" + orderNo);

  await saveAddressIfNeeded();

  cart = [];
localStorage.setItem("cart", JSON.stringify(cart));
renderCart();
window.location.href = "my-orders.html";
}

loadSavedAddresses();