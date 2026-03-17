import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_URL } from "../config";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../utils/api";

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  imageUrl: string | null;
  description: string | null;
  category: { id: number; name: string };
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const { token, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_URL}/api/products/${id}`)
      .then((res) => res.json())
      .then(setProduct);
  }, [id]);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 2500);
  };

  const addToCart = async () => {
    if (!isLoggedIn) { navigate("/login"); return; }
    const res = await apiFetch(
      `${API_URL}/api/cart`,
      { method: "POST", body: JSON.stringify({ productId: product?.id, quantity }) },
      token
    );
    if (res.ok) {
      showToast("장바구니에 추가되었습니다.", true);
    } else {
      const data = await res.json();
      showToast(data.message ?? "추가에 실패했습니다.", false);
    }
  };

  if (!product) return (
    <div className="max-w-5xl mx-auto px-4 py-8 flex items-center gap-2 text-gray-400">
      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
      <span className="text-sm">로딩 중...</span>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* 토스트 */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${toast.ok ? "bg-green-600 text-white" : "bg-red-500 text-white"}`}>
          {toast.msg}
        </div>
      )}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 cursor-pointer"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        목록으로
      </button>
      <div className="bg-white rounded-2xl ring-1 ring-gray-100 shadow-sm p-6 flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-80 h-64 bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <svg className="w-16 h-16 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )}
        </div>
        <div className="flex-1">
          {product.category && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-600 mb-3">
              {product.category.name}
            </span>
          )}
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{product.name}</h1>
          {product.description && (
            <p className="text-sm text-gray-500 leading-relaxed mb-4">{product.description}</p>
          )}
          <p className="text-3xl font-bold text-orange-600 mb-1">{product.price.toLocaleString()}원</p>
          <p className="text-sm text-gray-400 mb-6">
            재고: <span className={product.stock > 0 ? "text-green-600 font-medium" : "text-red-500 font-medium"}>{product.stock}개</span>
          </p>
          <div className="flex items-center gap-3 mb-4">
            <label className="text-sm font-medium text-gray-700">수량</label>
            <div className="flex items-center border border-gray-200 rounded-lg">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-3 py-1.5 text-gray-500 hover:text-gray-700 cursor-pointer"
              >−</button>
              <span className="px-3 py-1.5 text-sm font-semibold text-gray-800 min-w-[2rem] text-center">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                className="px-3 py-1.5 text-gray-500 hover:text-gray-700 cursor-pointer"
              >+</button>
            </div>
          </div>
          <button
            onClick={addToCart}
            disabled={product.stock === 0}
            className="bg-orange-600 text-white px-6 py-2.5 rounded-lg hover:bg-orange-700 transition font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            장바구니 담기
          </button>
        </div>
      </div>
    </div>
  );
}
