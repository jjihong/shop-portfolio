import { Router, Response } from "express";
import { authenticate, AuthRequest } from "../middleware/auth";
import prisma from "../lib/prisma";

const router = Router();

// 모든 cart 라우터에 인증 적용
router.use(authenticate);

// 내 장바구니 조회
router.get("/", async (req: AuthRequest, res: Response) => {
  const items = await prisma.cart.findMany({
    where: { userId: req.user!.userId },
    include: { product: true },
  });
  res.json(items);
});

// 장바구니 담기
router.post("/", async (req: AuthRequest, res: Response) => {
  const { productId, quantity } = req.body;

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
});

// 수량 변경
router.patch("/:id", async (req: AuthRequest, res: Response) => {
  const { quantity } = req.body;

  if (quantity < 1) {
    res.status(400).json({ message: "수량은 1 이상이어야 합니다." });
    return;
  }

  const updated = await prisma.cart.update({
    where: { id: Number(req.params.id) },
    data: { quantity },
  });
  res.json(updated);
});

// 항목 삭제
router.delete("/:id", async (req: AuthRequest, res: Response) => {
  await prisma.cart.delete({ where: { id: Number(req.params.id) } });
  res.json({ message: "삭제 완료" });
});

export default router;
