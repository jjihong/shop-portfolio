import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { API_URL } from "../config";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/AuthLayout";
import PasswordInput from "../components/PasswordInput";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? "/products";

  const handleLogin = async () => {
    if (!email || !password) { setError("이메일과 비밀번호를 입력해주세요."); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message ?? "로그인에 실패했습니다."); return; }
      login(data.token);
      navigate(from, { replace: true });
    } catch {
      setError("서버에 연결할 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => { if (e.key === "Enter") handleLogin(); };

  return (
    // AuthLayout: 좌측 브랜드 패널 + 우측 폼 레이아웃 (공통 컴포넌트)
    <AuthLayout subtitle={"더 나은 쇼핑 경험을 위해\n로그인해주세요."}>
      <h1 className="text-2xl font-bold text-gray-800 mb-1">로그인</h1>
      <p className="text-sm text-gray-500 mb-8">
        계정이 없으신가요?{" "}
        <Link to="/register" className="text-orange-600 hover:underline font-medium">
          회원가입
        </Link>
      </p>
      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">이메일</label>
          <input
            type="email"
            placeholder="example@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={onKeyDown}
            className="border border-gray-200 rounded-lg px-3.5 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">비밀번호</label>
          {/* PasswordInput: 비밀번호 입력 + 눈 모양 토글 (공통 컴포넌트) */}
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="비밀번호 입력"
          />
        </div>
        {error && (
          <p className="text-red-500 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="bg-orange-600 text-white px-4 py-2.5 rounded-lg hover:bg-orange-700 transition font-medium cursor-pointer disabled:opacity-60 w-full mt-1"
        >
          {loading ? "로그인 중..." : "로그인"}
        </button>
      </div>
    </AuthLayout>
  );
}
