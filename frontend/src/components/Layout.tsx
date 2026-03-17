import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/products" className="text-lg font-bold tracking-tight text-orange-600">
            Shop
          </Link>
          <div className="flex items-center gap-1 text-sm font-medium">
            <Link to="/products" className="px-3 py-1.5 rounded-lg text-gray-600 hover:text-orange-600 hover:bg-orange-50 transition">
              상품 목록
            </Link>
            {isLoggedIn ? (
              <>
                <Link to="/cart" className="px-3 py-1.5 rounded-lg text-gray-600 hover:text-orange-600 hover:bg-orange-50 transition">
                  장바구니
                </Link>
                <Link to="/orders" className="px-3 py-1.5 rounded-lg text-gray-600 hover:text-orange-600 hover:bg-orange-50 transition">
                  주문 내역
                </Link>
                {role === "admin" && (
                  <Link to="/admin/products" className="px-3 py-1.5 rounded-lg text-gray-600 hover:text-orange-600 hover:bg-orange-50 transition">
                    어드민
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="ml-1 px-3 py-1.5 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-3 py-1.5 rounded-lg text-gray-600 hover:text-orange-600 hover:bg-orange-50 transition">
                  로그인
                </Link>
                <Link to="/register" className="ml-1 px-3 py-1.5 rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition">
                  회원가입
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
      <main className="bg-gray-50 min-h-screen">
        {children}
      </main>
    </>
  );
}
