import { useEffect, useState } from "react";
import { API_URL } from "../config";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../utils/api";

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
  orderItems: OrderItem[];
}

const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  pending:   { bg: "bg-gray-100",   text: "text-gray-600",  label: "대기중" },
  confirmed: { bg: "bg-blue-100",   text: "text-blue-700",  label: "확인됨" },
  shipping:  { bg: "bg-amber-100",  text: "text-amber-700", label: "배송중" },
  delivered: { bg: "bg-green-100",  text: "text-green-700", label: "배송완료" },
};

export default function OrderListPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    apiFetch(`${API_URL}/api/orders`, {}, token)
      .then((res) => res.json())
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-4">
      <div className="h-8 bg-gray-100 rounded w-32 mb-6 animate-pulse" />
      {[1, 2].map((i) => <div key={i} className="h-28 bg-white rounded-2xl ring-1 ring-gray-100 animate-pulse" />)}
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">주문 내역</h1>
      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl ring-1 ring-gray-100 p-16 text-center">
          <svg className="w-14 h-14 mx-auto mb-4 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-gray-400">주문 내역이 없습니다.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => {
            const s = STATUS_STYLE[order.status] ?? STATUS_STYLE.pending;
            return (
              <div key={order.id} className="bg-white rounded-2xl ring-1 ring-gray-100 shadow-sm p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">주문 #{order.id}</p>
                    {order.createdAt && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}
                      </p>
                    )}
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
                    {s.label}
                  </span>
                </div>
                <div className="border-t border-gray-50 pt-3 mb-3">
                  {order.orderItems.map((item) => (
                    <p key={item.id} className="text-sm text-gray-600 py-0.5">
                      {item.product.name} <span className="text-gray-400">× {item.quantity}</span>
                    </p>
                  ))}
                </div>
                <div className="flex justify-end">
                  <p className="text-sm font-bold text-orange-600">{order.totalPrice.toLocaleString()}원</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
