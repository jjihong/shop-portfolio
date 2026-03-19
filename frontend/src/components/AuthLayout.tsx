interface Props {
  subtitle: string;         // 브랜드 패널 하단 문구 (페이지마다 다름)
  children: React.ReactNode; // 우측 폼 영역 내용
}

// LoginPage와 RegisterPage에서 동일하게 반복되던 좌우 2단 레이아웃을
// 재사용 가능한 컴포넌트로 추출.
// 좌측: 오렌지 브랜드 패널 (Shop 로고 + 문구)
// 우측: children으로 전달된 폼 내용
export default function AuthLayout({ subtitle, children }: Props) {
  return (
    <div className="flex min-h-[calc(100vh-56px)]">
      {/* 좌측 브랜드 패널 - md 이상 화면에서만 표시 */}
      <div className="hidden md:flex flex-col justify-center px-12 bg-orange-600 text-white w-96 shrink-0">
        <p className="text-3xl font-bold mb-3">Shop</p>
        <p className="text-orange-200 text-sm leading-relaxed">{subtitle}</p>
      </div>
      {/* 우측 폼 영역 */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
