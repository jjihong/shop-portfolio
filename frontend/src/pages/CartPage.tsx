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
  // 처리 중인 아이템 id를 관리해서 버튼 중복 클릭 방지
  // null이면 아무 작업도 없는 상태, 숫자면 해당 id의 아이템이 처리 중
  const [processingId, setProcessingId] = useState<number | null>(null);
  // 주문 중 상태 (주문하기 버튼 중복 클릭 방지)
  const [ordering, setOrdering] = useState(false);
  // 주문 실패 시 인라인 에러 메시지 (alert 대신 UI 내에 표시)
  const [orderError, setOrderError] = useState<string | null>(null);
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
    // 처리 중인 아이템 id를 기록해 버튼을 비활성화함
    // API 응답이 오기 전까지 같은 버튼을 연속 클릭하는 것을 방지
    setProcessingId(id);
    await apiFetch(
      `${API_URL}/api/cart/${id}`,
      { method: "PATCH", body: JSON.stringify({ quantity }) },
      token
    );
    await fetchCart();
    setProcessingId(null);
  };

  const deleteItem = async (id: number) => {
    setProcessingId(id);
    await apiFetch(`${API_URL}/api/cart/${id}`, { method: "DELETE" }, token);
    await fetchCart();
    setProcessingId(null);
  };

  const placeOrder = async () => {
    // 주문 중 상태로 전환해 주문하기 버튼 비활성화
    setOrdering(true);
    // 이전 에러 메시지 초기화
    setOrderError(null);
    const res = await apiFetch(`${API_URL}/api/orders`, { method: "POST" }, token);
    if (res.ok) {
      navigate("/orders");
    } else {
      const data = await res.json();
      // 이전 코드: alert()로 브라우저 기본 팝업 표시 → UI 불일치, 사용성 저하
      // 수정 후: 인라인 에러 메시지로 다른 페이지와 일관된 UX 제공
      setOrderError(data.message ?? "주문에 실패했습니다.");
      setOrdering(false);
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
                    // 해당 아이템이 처리 중일 때 버튼 비활성화 (중복 클릭 방지)
                    disabled={processingId === item.id}
                    className="px-2.5 py-1 text-gray-500 hover:text-gray-700 cursor-pointer text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                  >−</button>
                  <span className="px-2.5 py-1 text-sm font-semibold text-gray-800 min-w-[2rem] text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    disabled={processingId === item.id}
                    className="px-2.5 py-1 text-gray-500 hover:text-gray-700 cursor-pointer text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                  >+</button>
                </div>
                <p className="text-sm font-bold text-gray-700 w-24 text-right shrink-0">
                  {(item.product.price * item.quantity).toLocaleString()}원
                </p>
                <button
                  onClick={() => deleteItem(item.id)}
                  disabled={processingId === item.id}
                  className="text-gray-300 hover:text-red-500 transition cursor-pointer shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 px-6 py-5">
            {/* 주문 실패 시 인라인 에러 메시지 표시 */}
            {orderError && (
              <p className="text-red-500 text-sm bg-red-50 rounded-lg px-3 py-2 mb-4">{orderError}</p>
            )}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 mb-1">총 결제 금액</p>
                <p className="text-2xl font-bold text-orange-600">{total.toLocaleString()}원</p>
              </div>
              <button
                onClick={placeOrder}
                // 주문 처리 중일 때 버튼 비활성화 (중복 주문 방지)
                disabled={ordering}
                className="bg-orange-600 text-white px-7 py-3 rounded-xl hover:bg-orange-700 transition font-semibold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {ordering ? "처리 중..." : "주문하기"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
