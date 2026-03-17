import { useEffect, useState } from "react";
import { API_URL } from "../../config";
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../utils/api";

interface OrderItem {
  id: number;
  quantity: number;
  product: { name: string };
}

interface Order {
  id: number;
  status: string;
  totalPrice: number;
  createdAt?: string;
  user: { email: string };
  orderItems: OrderItem[];
}

const STATUS_OPTIONS = [
  { value: "pending",   label: "대기중" },
  { value: "confirmed", label: "확인됨" },
  { value: "shipping",  label: "배송중" },
  { value: "delivered", label: "배송완료" },
];

const STATUS_STYLE: Record<string, string> = {
  pending:   "bg-gray-100 text-gray-600",
  confirmed: "bg-blue-100 text-blue-700",
  shipping:  "bg-amber-100 text-amber-700",
  delivered: "bg-green-100 text-green-700",
};

export default function AdminOrderPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  const fetchOrders = () => {
    apiFetch(`${API_URL}/api/admin/orders`, {}, token)
      .then((res) => res.json())
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, [token]);

  const handleStatusChange = async (id: number, status: string) => {
    await apiFetch(
      `${API_URL}/api/admin/orders/${id}/status`,
      { method: "PATCH", body: JSON.stringify({ status }) },
      token
    );
    fetchOrders();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">주문 관리</h1>
      <div className="bg-white rounded-2xl ring-1 ring-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400 text-sm animate-pulse">불러오는 중...</div>
        ) : orders.length === 0 ? (
          <p className="text-center text-gray-400 py-12 text-sm">주문이 없습니다.</p>
        ) : (
          <table className="table-auto w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 bg-gray-50 text-xs uppercase tracking-wide">
                <th className="px-6 py-3 font-medium">주문번호</th>
                <th className="px-6 py-3 font-medium">고객</th>
                <th className="px-6 py-3 font-medium">상품</th>
                <th className="px-6 py-3 font-medium">금액</th>
                <th className="px-6 py-3 font-medium">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map((order) => (
                <tr key={order.id} className="even:bg-gray-50/50 hover:bg-orange-50/30 transition">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-800">#{order.id}</p>
                    {order.createdAt && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString("ko-KR")}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{order.user.email}</td>
                  <td className="px-6 py-4">
                    {order.orderItems.map((item) => (
                      <p key={item.id} className="text-gray-600 leading-relaxed">
                        {item.product.name} <span className="text-gray-400">×{item.quantity}</span>
                      </p>
                    ))}
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-800 whitespace-nowrap">
                    {order.totalPrice.toLocaleString()}원
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer ${STATUS_STYLE[order.status] ?? STATUS_STYLE.pending}`}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
