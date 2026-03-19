import { Router, Response } from "express";
import prisma from "../lib/prisma";
import { authenticate, AuthRequest } from "../middleware/auth";
import { adminOnly } from "../middleware/admin";

const router = Router();

router.use(authenticate, adminOnly); // 모든 라우터에 인증 + 관리자 권한 적용

// 상품 등록
router.post("/products", async (req: AuthRequest, res: Response) => {
  const { name, description, price, stock, imageUrl, categoryId } = req.body;

  // 필수 항목 검증: 이름, 가격, 재고, 카테고리가 없으면 요청 거부
  if (!name || price === undefined || stock === undefined || !categoryId) {
    res
      .status(400)
      .json({ message: "필수 항목(이름, 가격, 재고, 카테고리)을 모두 입력해주세요." });
    return;
  }

  // 가격과 재고가 음수이면 요청 거부 (데이터 무결성 보호)
  if (Number(price) < 0 || Number(stock) < 0) {
    res.status(400).json({ message: "가격과 재고는 0 이상이어야 합니다." });
    return;
  }

  try {
    const product = await prisma.product.create({
      data: { name, description, price, stock, imageUrl, categoryId },
    });

    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

// 상품 수정
router.patch("/products/:id", async (req: AuthRequest, res: Response) => {
  const { name, description, price, stock, imageUrl, categoryId } = req.body;

  // 필수 항목 검증 (등록과 동일하게 적용)
  if (!name || price === undefined || stock === undefined || !categoryId) {
    res
      .status(400)
      .json({ message: "필수 항목(이름, 가격, 재고, 카테고리)을 모두 입력해주세요." });
    return;
  }

  // 가격과 재고가 음수이면 요청 거부
  if (Number(price) < 0 || Number(stock) < 0) {
    res.status(400).json({ message: "가격과 재고는 0 이상이어야 합니다." });
    return;
  }

  try {
    const product = await prisma.product.update({
      where: { id: Number(req.params.id) },
      data: { name, description, price, stock, imageUrl, categoryId },
    });

    res.json(product);
  } catch (err) {
    // 존재하지 않는 상품 수정 시 Prisma가 에러를 던지므로 404로 응답
    res.status(404).json({ message: "상품을 찾을 수 없습니다." });
  }
});

// 상품 삭제
router.delete("/products/:id", async (req: AuthRequest, res: Response) => {
  try {
    await prisma.product.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: "삭제 완료" });
  } catch (err) {
    // 존재하지 않는 상품 삭제 시 Prisma가 에러를 던지므로 404로 응답
    res.status(404).json({ message: "상품을 찾을 수 없습니다." });
  }
});

// 전체 주문 목록 조회
router.get("/orders", async (req: AuthRequest, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: { select: { email: true } },
        orderItems: { include: { product: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

// 주문 상태 변경
router.patch("/orders/:id/status", async (req: AuthRequest, res: Response) => {
  const { status } = req.body;

  const validStatuses = ["pending", "confirmed", "shipping", "delivered"];
  if (!validStatuses.includes(status)) {
    res.status(400).json({ message: "유효하지 않은 상태값입니다." });
    return;
  }

  try {
    const order = await prisma.order.update({
      where: { id: Number(req.params.id) },
      data: { status },
    });

    res.json(order);
  } catch (err) {
    // 존재하지 않는 주문 수정 시 Prisma가 에러를 던지므로 404로 응답
    res.status(404).json({ message: "주문을 찾을 수 없습니다." });
  }
});

export default router;
