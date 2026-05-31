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