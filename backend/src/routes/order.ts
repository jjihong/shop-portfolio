import { Router, Response } from "express";
import prisma from "../lib/prisma";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = Router();

router.use(authenticate);

// 주문 생성
router.post("/", async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;

  // 장바구니 조회
  const cartItems = await prisma.cart.findMany({
    where: { userId },
    include: { product: true },
  });

  if (cartItems.length === 0) {
    res.status(400).json({ message: "장바구니가 비어있습니다." });
    return;
  }

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  // 주문 + 주문항목 생성 + 장바구니 비우기를 트랜잭션으로 처리
  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        userId,
        totalPrice,
        status: "pending",
        orderItems: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
          })),
        },
      },
      include: { orderItems: true },
    });

    await tx.cart.deleteMany({ where: { userId } });

    return newOrder;
  });

  res.status(201).json(order);
});

// 내 주문 목록 조회
router.get("/", async (req: AuthRequest, res: Response) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.user!.userId },
    include: { orderItems: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json(orders);
});

// 주문 상세 조회
router.get("/:id", async (req: AuthRequest, res: Response) => {
  const order = await prisma.order.findUnique({
    where: { id: Number(req.params.id) },
    include: { orderItems: { include: { product: true } } },
  });

  if (!order || order.userId !== req.user!.userId) {
    res.status(404).json({ message: "주문을 찾을 수 없습니다." });
    return;
  }

  res.json(order);
});

export default router;
