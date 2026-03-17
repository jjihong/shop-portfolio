import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_URL } from "../config";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!email || !password) { setError("이메일과 비밀번호를 입력해주세요."); return; }
    if (password !== confirm) { setError("비밀번호가 일치하지 않습니다."); return; }
    if (password.length < 6) { setError("비밀번호는 6자 이상이어야 합니다."); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message ?? "회원가입에 실패했습니다."); return; }
      navigate("/login");
    } catch {
      setError("서버에 연결할 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => { if (e.key === "Enter") handleRegister(); };

  return (
    <div className="flex min-h-[calc(100vh-56px)]">
      <div className="hidden md:flex flex-col justify-center px-12 bg-orange-600 text-white w-96 shrink-0">
        <p className="text-3xl font-bold mb-3">Shop</p>
        <p className="text-orange-200 text-sm leading-relaxed">
          새 계정을 만들고<br />쇼핑을 시작해보세요.
        </p>
      </div>
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">회원가입</h1>
          <p className="text-sm text-gray-500 mb-8">
            이미 계정이 있으신가요?{" "}
            <Link to="/login" className="text-orange-600 hover:underline font-medium">
              로그인
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
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="6자 이상 입력"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={onKeyDown}
                  className="border border-gray-200 rounded-lg px-3.5 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPw ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">비밀번호 확인</label>
              <input
                type={showPw ? "text" : "password"}
                placeholder="비밀번호 재입력"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                onKeyDown={onKeyDown}
                className="border border-gray-200 rounded-lg px-3.5 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
              />
            </div>
            {error && (
              <p className="text-red-500 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}
            <button
              onClick={handleRegister}
              disabled={loading}
              className="bg-orange-600 text-white px-4 py-2.5 rounded-lg hover:bg-orange-700 transition font-medium cursor-pointer disabled:opacity-60 w-full mt-1"
            >
              {loading ? "처리 중..." : "회원가입"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
