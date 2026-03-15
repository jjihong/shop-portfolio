import { Router, Response } from "express";
import prisma from "../lib/prisma";
import { authenticate, AuthRequest } from "../middleware/auth";
import { adminOnly } from "../middleware/admin";

const router = Router();

router.use(authenticate, adminOnly); // 모든 라우터에 인증 + 관리자 권한 적용

// 상품 등록
router.post("/products", async (req: AuthRequest, res: Response) => {
  const { name, description, price, stock, imageUrl, categoryId } = req.body;

  const product = await prisma.product.create({
    data: { name, description, price, stock, imageUrl, categoryId },
  });

  res.status(201).json(product);
});

// 상품 수정
router.patch("/products/:id", async (req: AuthRequest, res: Response) => {
  const { name, description, price, stock, imageUrl, categoryId } = req.body;

  const product = await prisma.product.update({
    where: { id: Number(req.params.id) },
    data: { name, description, price, stock, imageUrl, categoryId },
  });

  res.json(product);
});

// 상품 삭제
router.delete("/products/:id", async (req: AuthRequest, res: Response) => {
  await prisma.product.delete({ where: { id: Number(req.params.id) } });
  res.json({ message: "삭제 완료" });
});

// 전체 주문 목록 조회
router.get("/orders", async (req: AuthRequest, res: Response) => {
  const orders = await prisma.order.findMany({
    include: {
      user: { select: { email: true } },
      orderItems: { include: { product: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json(orders);
});

// 주문 상태 변경
router.patch("/orders/:id/status", async (req: AuthRequest, res: Response) => {
  const { status } = req.body;

  const validStatuses = ["pending", "confirmed", "shipping", "delivered"];
  if (!validStatuses.includes(status)) {
    res.status(400).json({ message: "유효하지 않은 상태값입니다." });
    return;
  }

  const order = await prisma.order.update({
    where: { id: Number(req.params.id) },
    data: { status },
  });

  res.json(order);
});

export default router;
