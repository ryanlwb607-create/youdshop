const orders = JSON.parse(localStorage.getItem("orders")) || [];
const orderList = document.getElementById("orderList");
const totalAmount = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);

orderList.innerHTML = `
    <div style="padding:12px;margin:12px;border:1px solid #ddd;">
        <h3>订单统计</h3>
        <p>订单数量：${orders.length}</p >
        <p>订单总金额：¥${totalAmount}</p >
    </div>
`;

if (orders.length === 0) {
    orderList.innerHTML += "<p>暂无订单</p >";
} else {

  orders.forEach((order,index) => {
    orderList.innerHTML += `
<div style="border:1px solid #ddd;padding:12px;margin:12px;border-radius:8px;">
    <h3>订单号：${order.orderNo}</h3>

    <p>下单时间：${order.time}</p >
    <p>商品数量：${order.items.length} 件</p >

    <p>商品明细：</p >

    <ul>
    ${order.items.map(item => `
    <li>
    ${item.title} × ${item.quantity}
    </li>
`   ).join("")}
    </ul>

    <p>订单金额：¥${order.total}</p >

    <p>订单状态：
        <span style="color:orange;">
            待处理
        </span>
    </p >

    <button onclick="deleteOrder(${index})">
        删除订单
    </button>

</div>
`;
  });
}

function deleteOrder(index) {

    if (!confirm("确定删除这个订单吗？")) {
        return;
    }

    let orders =
        JSON.parse(localStorage.getItem("orders")) || [];

    orders.splice(index, 1);

    localStorage.setItem(
        "orders",
        JSON.stringify(orders)
    );

    location.reload();
}