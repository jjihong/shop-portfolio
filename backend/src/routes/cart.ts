import { Router, Response } from "express";
import { authenticate, AuthRequest } from "../middleware/auth";
import prisma from "../lib/prisma";

const router = Router();

// 모든 cart 라우터에 인증 적용
router.use(authenticate);

// 내 장바구니 조회
router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const items = await prisma.cart.findMany({
      where: { userId: req.user!.userId },
      include: { product: true },
    });
    res.json(items);
  } catch (err) {
    // DB 조회 실패 시 500 에러 반환 (서버 크래시 방지)
    console.error(err);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

// 장바구니 담기
router.post("/", async (req: AuthRequest, res: Response) => {
  const { productId, quantity } = req.body;

  // 상품 ID와 수량이 없거나 수량이 1 미만이면 요청 거부
  if (!productId || !quantity || Number(quantity) < 1) {
    res.status(400).json({ message: "상품 ID와 수량(1 이상)을 입력해주세요." });
    return;
  }

  try {
    // 이미 담긴 상품이면 수량만 추가
    const existing = await prisma.cart.findFirst({
      where: { userId: req.user!.userId, productId },
    });

    if (existing) {
      const updated = await prisma.cart.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
      });
      res.json(updated);
      return;
    }

    const item = await prisma.cart.create({
      data: { userId: req.user!.userId, productId, quantity },
    });
    res.status(201).json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

// 수량 변경
router.patch("/:id", async (req: AuthRequest, res: Response) => {
  const { quantity } = req.body;

  if (quantity < 1) {
    res.status(400).json({ message: "수량은 1 이상이어야 합니다." });
    return;
  }

  try {
    const updated = await prisma.cart.update({
      // userId 조건을 추가해 본인 장바구니만 수정 가능하도록 제한
      // 이전 코드는 id만으로 조회해서 타인의 장바구니 항목도 수정 가능했음
      where: { id: Number(req.params.id), userId: req.user!.userId },
      data: { quantity },
    });
    res.json(updated);
  } catch (err) {
    // 본인 소유가 아닌 항목 수정 시도 시 Prisma가 에러를 던지므로 404로 응답
    res.status(404).json({ message: "항목을 찾을 수 없습니다." });
  }
});

// 항목 삭제
router.delete("/:id", async (req: AuthRequest, res: Response) => {
  try {
    await prisma.cart.delete({
      // userId 조건을 추가해 본인 장바구니만 삭제 가능하도록 제한
      // 이전 코드는 id만으로 삭제해서 타인의 장바구니 항목도 삭제 가능했음
      where: { id: Number(req.params.id), userId: req.user!.userId },
    });
    res.json({ message: "삭제 완료" });
  } catch (err) {
    res.status(404).json({ message: "항목을 찾을 수 없습니다." });
  }
});

export default router;
