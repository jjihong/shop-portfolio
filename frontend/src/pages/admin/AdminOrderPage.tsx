import { useEffect, useState } from "react";
import { API_URL } from '../../config';

interface OrderItem {
  id: number;
  quantity: number;
  product: { name: string };
}

interface Order {
  id: number;
  status: string;
  totalPrice: number;
  user: { email: string };
  orderItems: OrderItem[];
}

const STATUS_OPTIONS = ["pending", "confirmed", "shipping", "delivered"];

export default function AdminOrderPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const token = localStorage.getItem("token");

  const fetchOrders = () => {
    fetch(`${API_URL}/api/admin/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setOrders);
  };

  useEffect(() => { fetchOrders(); }, [token]);

  const handleStatusChange = async (id: number, status: string) => {
    await fetch(`${API_URL}/api/admin/orders/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    fetchOrders();
  };

  return (
    <div>
      <h1>주문 관리</h1>
      {orders.map((order) => (
        <div key={order.id}>
          <p>주문번호: {order.id} / 고객: {order.user.email}</p>
          <p>총 금액: {order.totalPrice.toLocaleString()}원</p>
          <ul>
            {order.orderItems.map((item) => (
              <li key={item.id}>{item.product.name} x {item.quantity}</li>
            ))}
          </ul>
          <select
            value={order.status}
            onChange={(e) => handleStatusChange(order.id, e.target.value)}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}