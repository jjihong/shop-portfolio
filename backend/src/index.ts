// Express: Node.js 웹 서버 프레임워크
// CORS: 다른 도메인(예: 프론트엔드)에서 이 서버로 요청할 수 있게 허용
// dotenv: .env 파일에 저장된 환경변수를 불러오는 라이브러리
// authRouter: 인증 관련 라우터 (회원가입, 로그인 등)
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRouter from "./routes/auth";
import productRouter from "./routes/products";
import cartRouter from "./routes/cart";
import orderRouter from "./routes/order";
import adminRouter from "./routes/admin";
// .env 파일 로드 (예: PORT=4000 같은 설정값 읽기)
dotenv.config();

// Express 앱 인스턴스 생성
const app = express();
// 포트 번호: 환경변수에 PORT가 있으면 그것을 사용, 없으면 기본값 4000
const PORT = process.env.PORT || 4000;

// CORS 설정: 프론트엔드가 http://localhost:5173에서 이 서버로 요청할 수 있도록 허용
app.use(
  cors({
    origin: ["http://localhost:5173", "https://shop-portfolio-six.vercel.app"],
  }),
); // 요청 본문(body)을 JSON 형식으로 파싱
app.use(express.json());

// GET /health 엔드포인트: 서버가 정상 작동 중인지 확인하는 헬스체크 API
app.get("/health", (req, res) => {
  res.json({ message: "서버 정상 작동 중" });
});

// 인증 관련 라우터: 회원가입, 로그인 등
app.use("/api/auth", authRouter);
app.use("/api/products", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/orders", orderRouter);
app.use("/api/admin", adminRouter);

// 서버 시작: 지정한 포트로 요청을 받기 시작
app.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});

// 전역 에러 핸들러: 라우터에서 next(err)로 전달된 에러 또는 예상치 못한 에러를 일괄 처리
// 이 핸들러가 없으면 에러 발생 시 서버가 크래시되거나 에러 스택이 클라이언트에 노출될 수 있음
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error("전역 에러:", err);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  },
);
