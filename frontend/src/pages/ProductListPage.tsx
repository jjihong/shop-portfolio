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
  const [error, setError] = useState<string | null>(null);
  // 전체 페이지 수 (페이지 버튼 몇 개를 그릴지 결정)
  const [totalPages, setTotalPages] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // URL에서 현재 페이지 번호를 읽음
  // 예) ?page=3 이면 currentPage = 3
  // 값이 없으면 기본값 1 (첫 페이지)
  const currentPage = Math.max(1, Number(searchParams.get("page")) || 1);

  useEffect(() => {
    setLoading(true);
    setError(null);

    // URL에 있는 모든 검색 파라미터(search, page 등)를 그대로 API 요청에 포함
    const params = new URLSearchParams(searchParams);

    fetch(`${API_URL}/api/products?${params}`)
      .then((res) => res.json())
      .then((data) => {
        // 백엔드 응답 형식이 변경됨:
        // 이전: [상품, 상품, ...] (배열)
        // 현재: { products: [...], total: 100, page: 1, totalPages: 12 }
        setProducts(Array.isArray(data.products) ? data.products : []);
        setTotalPages(data.totalPages ?? 1);
      })
      .catch(() => setError("상품을 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요."))
      .finally(() => setLoading(false));
  }, [searchParams]);

  // 페이지 변경 함수: URL의 page 파라미터를 업데이트
  // URL이 바뀌면 위의 useEffect가 자동으로 다시 실행돼서 새 페이지 데이터를 불러옴
  const goToPage = (page: number) => {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(page));
    setSearchParams(next);
    // 페이지 이동 시 화면 상단으로 스크롤
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 표시할 페이지 번호 배열 계산
  // 전체 페이지가 많을 때 버튼을 최대 5개까지만 보여줌 (현재 페이지 중심)
  // 예) 전체 10페이지, 현재 5페이지 → [3, 4, 5, 6, 7]
  const getPageNumbers = () => {
    const delta = 2; // 현재 페이지 기준 앞뒤로 몇 개씩 보여줄지
    const start = Math.max(1, currentPage - delta);
    const end = Math.min(totalPages, currentPage + delta);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">상품 목록</h1>

      {/* 검색창 */}
      <div className="relative mb-6">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          placeholder="상품명으로 검색..."
          defaultValue={searchParams.get("search") ?? ""}
          onChange={(e) => {
            const value = e.target.value;
            if (debounceRef.current) clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() => {
              // 검색어가 바뀌면 page를 1로 리셋 (2페이지에서 검색하면 1페이지로 돌아가야 함)
              const next: Record<string, string> = value ? { search: value } : {};
              setSearchParams(next);
            }, 300);
          }}
          className="border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm bg-white"
        />
      </div>

      {/* 에러 표시 */}
      {error ? (
        <div className="text-center py-24 text-red-400">
          <svg className="w-12 h-12 mx-auto mb-3 text-red-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          {error}
        </div>
      ) : loading ? (
        /* 로딩 중 스켈레톤 UI */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl ring-1 ring-gray-100 p-5 animate-pulse">
              <div className="h-36 bg-gray-100 rounded-xl mb-3" />
              <div className="h-3 bg-gray-100 rounded w-1/3 mb-2" />
              <div className="h-4 bg-gray-100 rounded w-2/3 mb-2" />
              <div className="h-4 bg-gray-100 rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        /* 상품 없음 */
        <div className="text-center py-24 text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          상품이 없습니다.
        </div>
      ) : (
        <>
          {/* 상품 카드 목록 */}
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

          {/* 페이지네이션 버튼 - 총 페이지가 2 이상일 때만 표시 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5 mt-10">

              {/* 이전 버튼: 첫 페이지에서는 비활성화 */}
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-100 transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                ← 이전
              </button>

              {/* 페이지 번호 버튼들 (최대 5개, 현재 페이지 중심) */}
              {getPageNumbers().map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => goToPage(pageNum)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition cursor-pointer
                    ${pageNum === currentPage
                      // 현재 페이지: 주황색 강조
                      ? "bg-orange-600 text-white"
                      // 다른 페이지: 회색 hover
                      : "text-gray-600 hover:bg-gray-100"
                    }`}
                >
                  {pageNum}
                </button>
              ))}

              {/* 다음 버튼: 마지막 페이지에서는 비활성화 */}
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-100 transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                다음 →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
