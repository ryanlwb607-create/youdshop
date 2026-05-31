const orders = JSON.parse(localStorage.getItem("orders")) || [];
const orderList = document.getElementById("orderList");

if (orders.length === 0) {
  orderList.innerHTML = "<p>暂无订单</p >";
} else {
  orderList.innerHTML = "";

  orders.forEach((order) => {
    orderList.innerHTML += `
      <div style="border:1px solid #ddd;padding:12px;margin:12px;">
        <h3>订单号：${order.orderNo}</h3>
        <p>时间：${order.time}</p >
        <p>合计：¥${order.total}</p >
      </div>
    `;
  });
}