import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../utils/api";

interface CartItem {
  id: number;
  quantity: number;
  product: { id: number; name: string; price: number };
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const navigate = useNavigate();

  const fetchCart = useCallback(() => {
    apiFetch(`${API_URL}/api/cart`, {}, token)
      .then((res) => res.json())
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const updateQuantity = async (id: number, quantity: number) => {
    if (quantity < 1) return;
    await apiFetch(
      `${API_URL}/api/cart/${id}`,
      { method: "PATCH", body: JSON.stringify({ quantity }) },
      token
    );
    fetchCart();
  };

  const deleteItem = async (id: number) => {
    await apiFetch(`${API_URL}/api/cart/${id}`, { method: "DELETE" }, token);
    fetchCart();
  };

  const placeOrder = async () => {
    const res = await apiFetch(`${API_URL}/api/orders`, { method: "POST" }, token);
    if (res.ok) {
      navigate("/orders");
    } else {
      const data = await res.json();
      alert(data.message ?? "주문에 실패했습니다.");
    }
  };

  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="h-8 bg-gray-100 rounded w-32 mb-6 animate-pulse" />
      <div className="bg-white rounded-2xl ring-1 ring-gray-100 p-6 space-y-4">
        {[1, 2].map((i) => <div key={i} className="h-14 bg-gray-50 rounded-xl animate-pulse" />)}
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">장바구니</h1>
      {items.length === 0 ? (
        <div className="bg-white rounded-2xl ring-1 ring-gray-100 p-16 text-center">
          <svg className="w-14 h-14 mx-auto mb-4 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-gray-400 mb-4">장바구니가 비어있습니다.</p>
          <button
            onClick={() => navigate("/products")}
            className="bg-orange-600 text-white px-5 py-2.5 rounded-lg hover:bg-orange-700 transition font-medium cursor-pointer"
          >
            상품 보러가기
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl ring-1 ring-gray-100 shadow-sm">
          <div className="divide-y divide-gray-50">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 px-6 py-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">{item.product.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.product.price.toLocaleString()}원 / 개</p>
                </div>
                <div className="flex items-center border border-gray-200 rounded-lg shrink-0">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="px-2.5 py-1 text-gray-500 hover:text-gray-700 cursor-pointer text-sm"
                  >−</button>
                  <span className="px-2.5 py-1 text-sm font-semibold text-gray-800 min-w-[2rem] text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="px-2.5 py-1 text-gray-500 hover:text-gray-700 cursor-pointer text-sm"
                  >+</button>
                </div>
                <p className="text-sm font-bold text-gray-700 w-24 text-right shrink-0">
                  {(item.product.price * item.quantity).toLocaleString()}원
                </p>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="text-gray-300 hover:text-red-500 transition cursor-pointer shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 px-6 py-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 mb-1">총 결제 금액</p>
              <p className="text-2xl font-bold text-orange-600">{total.toLocaleString()}원</p>
            </div>
            <button
              onClick={placeOrder}
              className="bg-orange-600 text-white px-7 py-3 rounded-xl hover:bg-orange-700 transition font-semibold cursor-pointer"
            >
              주문하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
