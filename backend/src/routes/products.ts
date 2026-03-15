// GET /api/products          ← 상품 목록 (카테고리 필터 + 검색)
// GET /api/products/:id      ← 상품 상세

import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

router.get("/", async (req, res) => {
  const categoryId = req.query.categoryId as string | undefined;
  const search = req.query.search as string | undefined;

  const products = await prisma.product.findMany({
    where: {
      ...(categoryId && { categoryId: Number(categoryId) }),
      ...(search && {
        name: { contains: search, mode: "insensitive" },
      }),
    },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  res.json(products);
});

router.get("/:id", async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { id: Number(req.params.id) },
    include: { category: true },
  });

  if (!product) return res.status(404).json({ message: "상품 없음" });
  res.json(product);
});

export default router;
