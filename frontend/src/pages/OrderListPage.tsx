import { useEffect, useState } from "react";
import { API_URL } from '../config';

interface OrderItem {
  id: number;
  quantity: number;
  product: { name: string };
}

interface Order {
  id: number;
  status: string;
  totalPrice: number;
  orderItems: OrderItem[];
}

export default function OrderListPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch(`${API_URL}/api/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setOrders);
  }, [token]);

  return (
    <div>
      <h1>주문 내역</h1>
      {orders.map((order) => (
        <div key={order.id}>
          <p>주문번호: {order.id}</p>
          <p>상태: {order.status}</p>
          <p>총 금액: {order.totalPrice.toLocaleString()}원</p>
          <ul>
            {order.orderItems.map((item) => (
              <li key={item.id}>
                {item.product.name} x {item.quantity}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}