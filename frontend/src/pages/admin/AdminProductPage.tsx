import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../config";
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../utils/api";

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  categoryId: number;
  imageUrl: string | null;
  description: string | null;
}

const EMPTY_FORM = { name: "", price: "", stock: "", categoryId: "", imageUrl: "", description: "" };

const FIELDS: { key: keyof typeof EMPTY_FORM; label: string; type: string }[] = [
  { key: "name",        label: "상품명",      type: "text"   },
  { key: "price",       label: "가격",        type: "number" },
  { key: "stock",       label: "재고",        type: "number" },
  { key: "categoryId",  label: "카테고리 ID", type: "number" },
  { key: "imageUrl",    label: "이미지 URL",  type: "text"   },
  { key: "description", label: "설명",        type: "text"   },
];

export default function AdminProductPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { token } = useAuth();
  const navigate = useNavigate();

  const fetchProducts = () => {
    fetch(`${API_URL}/api/products`)
      .then((res) => res.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []));
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleSubmit = async () => {
    if (!form.name || !form.price) return;
    setSubmitting(true);
    const url = editId ? `${API_URL}/api/admin/products/${editId}` : `${API_URL}/api/admin/products`;
    await apiFetch(
      url,
      {
        method: editId ? "PATCH" : "POST",
        body: JSON.stringify({ ...form, price: Number(form.price), stock: Number(form.stock), categoryId: Number(form.categoryId) }),
      },
      token
    );
    setForm(EMPTY_FORM);
    setEditId(null);
    fetchProducts();
    setSubmitting(false);
  };

  const handleEdit = (p: Product) => {
    setEditId(p.id);
    setForm({ name: p.name, price: String(p.price), stock: String(p.stock), categoryId: String(p.categoryId), imageUrl: p.imageUrl ?? "", description: p.description ?? "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("상품을 삭제하시겠습니까?")) return;
    await apiFetch(`${API_URL}/api/admin/products/${id}`, { method: "DELETE" }, token);
    fetchProducts();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">상품 관리</h1>
        <button
          onClick={() => navigate("/admin/orders")}
          className="bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition text-sm cursor-pointer"
        >
          주문 관리 →
        </button>
      </div>

      {/* 등록/수정 폼 */}
      <div className="bg-white rounded-2xl ring-1 ring-gray-100 shadow-sm p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-700 mb-4">
          {editId ? "상품 수정" : "새 상품 등록"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {FIELDS.map(({ key, label, type }) => (
            <input
              key={key}
              type={type}
              placeholder={label}
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              className="border border-gray-200 rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
            />
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-orange-600 text-white px-5 py-2.5 rounded-lg hover:bg-orange-700 transition font-medium cursor-pointer disabled:opacity-60 text-sm"
          >
            {submitting ? "처리 중..." : editId ? "수정 완료" : "등록"}
          </button>
          {editId && (
            <button
              onClick={() => { setEditId(null); setForm(EMPTY_FORM); }}
              className="bg-white text-gray-700 px-5 py-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition text-sm cursor-pointer"
            >
              취소
            </button>
          )}
        </div>
      </div>

      {/* 상품 목록 */}
      <div className="bg-white rounded-2xl ring-1 ring-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50">
          <h2 className="text-base font-semibold text-gray-700">상품 목록</h2>
        </div>
        {products.length === 0 ? (
          <p className="text-center text-gray-400 py-12 text-sm">등록된 상품이 없습니다.</p>
        ) : (
          <table className="table-auto w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 bg-gray-50 text-xs uppercase tracking-wide">
                <th className="px-6 py-3 font-medium">상품명</th>
                <th className="px-6 py-3 font-medium">가격</th>
                <th className="px-6 py-3 font-medium">재고</th>
                <th className="px-6 py-3 font-medium text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-3.5 text-gray-800 font-medium">{p.name}</td>
                  <td className="px-6 py-3.5 text-gray-600">{p.price.toLocaleString()}원</td>
                  <td className="px-6 py-3.5 text-gray-600">{p.stock}개</td>
                  <td className="px-6 py-3.5 text-right">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => handleEdit(p)}
                        className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition text-xs cursor-pointer"
                      >수정</button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 transition text-xs cursor-pointer"
                      >삭제</button>
                    </div>
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
