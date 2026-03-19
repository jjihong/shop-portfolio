import { useEffect, useState, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { API_URL } from "../config";

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  imageUrl: string | null;
  category: { id: number; name: string };
}

export default function ProductListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  // 네트워크/서버 에러 발생 시 유저에게 피드백을 주기 위한 상태
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  // 검색 디바운싱용 타이머 ref
  // 타이핑할 때마다 API를 호출하면 불필요한 요청이 과다하게 발생하므로
  // 300ms 동안 추가 입력이 없을 때만 searchParams를 업데이트해 API를 호출함
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLoading(true);
    // 이전 에러 초기화 (재검색 시 이전 에러 메시지가 남아있지 않도록)
    setError(null);
    const params = new URLSearchParams(searchParams);
    fetch(`${API_URL}/api/products?${params}`)
      .then((res) => res.json())
      .then((data) => { setProducts(Array.isArray(data) ? data : []); })
      // 이전 코드에는 .catch가 없어서 네트워크 오류 발생 시 유저에게 아무 피드백이 없었음
      // 수정 후: 에러 상태를 저장해 화면에 안내 메시지 표시
      .catch(() => setError("상품을 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요."))
      .finally(() => setLoading(false));
  }, [searchParams]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">상품 목록</h1>
      <div className="relative mb-6">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          placeholder="상품명으로 검색..."
          defaultValue={searchParams.get("search") ?? ""}
          onChange={(e) => {
            const value = e.target.value;
            // 이전 타이머가 있으면 취소 (연속 입력 시 이전 타이머 리셋)
            if (debounceRef.current) clearTimeout(debounceRef.current);
            // 300ms 후에 searchParams 업데이트 (그 안에 또 타이핑하면 다시 리셋됨)
            debounceRef.current = setTimeout(() => {
              setSearchParams(value ? { search: value } : {});
            }, 300);
          }}
          className="border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm bg-white"
        />
      </div>

      {/* 에러 발생 시 로딩/목록 대신 에러 메시지를 표시 */}
      {error ? (
        <div className="text-center py-24 text-red-400">
          <svg className="w-12 h-12 mx-auto mb-3 text-red-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          {error}
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl ring-1 ring-gray-100 p-5 animate-pulse">
              <div className="h-36 bg-gray-100 rounded-xl mb-3" />
              <div className="h-3 bg-gray-100 rounded w-1/3 mb-2" />
              <div className="h-4 bg-gray-100 rounded w-2/3 mb-2" />
              <div className="h-4 bg-gray-100 rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          상품이 없습니다.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {products.map((p) => (
            <Link
              key={p.id}
              to={`/products/${p.id}`}
              className="bg-white rounded-2xl ring-1 ring-gray-100 shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition-all block"
            >
              <div className="w-full h-36 bg-gray-50 rounded-xl mb-3 flex items-center justify-center overflow-hidden">
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
                ) : (
                  <svg className="w-10 h-10 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
              </div>
              {p.category && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-600 mb-2">
                  {p.category.name}
                </span>
              )}
              <h3 className="font-semibold text-gray-800 text-sm mb-1 truncate">{p.name}</h3>
              <p className="text-orange-600 font-bold">{p.price.toLocaleString()}원</p>
              <p className="text-xs text-gray-400 mt-1">재고 {p.stock}개</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
