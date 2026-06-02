const supabaseUrl = 'https://vngzpblmstezerhnvbpm.supabase.co'
const supabaseKey = 'sb_publishable_fx9OReyvJAM7ZKCZ_iHBXg_fcyCiMuJ'
const db = supabase.createClient(supabaseUrl, supabaseKey);

const orderList = document.getElementById("orderList");

async function loadOrders() {
  const visitorId = localStorage.getItem("visitorId");
  const { data: orders, error } = await db
    .from("orders")
    .select("*")
    .eq("visitor_id", visitorId)
    .order("id", { ascending: false });

  if (error) {
    console.error("读取订单失败：", error);
    orderList.innerHTML = "<p>订单读取失败</p >";
    return;
  }

  const totalAmount = orders.reduce(
    (sum, order) => sum + Number(order.total || 0),
    0
  );

  orderList.innerHTML = `
    <div style="padding:12px;margin:12px;border:1px solid #ddd;">
      <h3>订单统计</h3>
      <p>订单数量：${orders.length}</p >
      <p>订单总金额：¥${totalAmount}</p >
    </div>
  `;

  if (orders.length === 0) {
    orderList.innerHTML += "<p>暂无订单</p >";
    return;
  }

  orders.forEach((order) => {
    const items = order.items || [];

    orderList.innerHTML += `
      <div style="border:1px solid #ddd;padding:12px;margin:12px;border-radius:8px;">
        <h3>订单号：${order.order_no}</h3>
        <p>商品数量：${items.length} 件</p >

        <p>商品明细：</p >
        <ul>
          ${items.map(item => `
            <li>${item.name} × ${item.quantity}</li>
          `).join("")}
        </ul>

        <p>订单金额：¥${order.total}</p >
        <p>订单状态：
          <span style="color:orange;">
          ${order.status || "待处理"}
          </span>
          </p >

          <button onclick="deleteOrder(${order.id})">
          删除订单
          </button>
          </div>
          `;
  });
}

async function deleteOrder(id) {
  if (!confirm("确定删除这个订单吗？")) return;

  const { error } = await db
    .from("orders")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("删除失败：", error);
    alert("删除失败");
    return;
  }

  alert("订单已删除");
  location.reload();
}

loadOrders();