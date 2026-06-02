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
        <h3>${item.name}</h3>

        <p>价格：¥${item.price}</p >

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

async function submitOrder() {
  if (cart.length === 0) {
    alert("购物车是空的");
    return;
  }

  const orderNo = generateOrderNo();
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const { error } = await db.from("orders").insert([
    {
        order_no: orderNo,
        items: cart,
        total: total,
        status: "待处理"
    }
]);

if (error) {
    console.error("订单提交失败：", error);
    alert("订单提交失败，请稍后再试");
    return;
}

  alert("订单提交成功！\n订单号:" + orderNo);
  cart = [];
localStorage.setItem("cart", JSON.stringify(cart));
renderCart();
window.location.href = "orders.html";
}