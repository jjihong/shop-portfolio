import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_URL } from "../config";
import AuthLayout from "../components/AuthLayout";
import PasswordInput from "../components/PasswordInput";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!email || !password) { setError("이메일과 비밀번호를 입력해주세요."); return; }
    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) { setError("올바른 이메일 형식을 입력해주세요."); return; }
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
    // AuthLayout: 좌측 브랜드 패널 + 우측 폼 레이아웃 (공통 컴포넌트)
    <AuthLayout subtitle={"새 계정을 만들고\n쇼핑을 시작해보세요."}>
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
          {/* PasswordInput: 비밀번호 입력 + 눈 모양 토글 (공통 컴포넌트) */}
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="6자 이상 입력"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">비밀번호 확인</label>
          {/* 확인용 입력도 PasswordInput 재사용 - 토글 상태는 각각 독립적으로 관리됨 */}
          <PasswordInput
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="비밀번호 재입력"
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
    </AuthLayout>
  );
}
