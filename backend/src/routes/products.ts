// GET /api/products          ← 상품 목록 (카테고리 필터 + 검색)
// GET /api/products/:id      ← 상품 상세

import { Router } from "express";
// 수정: new PrismaClient() 직접 생성 대신 공유 인스턴스 사용
// 이전 코드는 routes/products.ts 에서 별도 PrismaClient를 생성해
// DB 커넥션이 불필요하게 2개 이상 열리는 문제가 있었음
import prisma from "../lib/prisma";

const router = Router();

router.get("/", async (req, res) => {
  const categoryId = req.query.categoryId as string | undefined;
  const search = req.query.search as string | undefined;

  try {
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
  } catch (err) {
    // DB 조회 실패 시 500 에러 반환 (서버 크래시 방지)
    console.error(err);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: Number(req.params.id) },
      include: { category: true },
    });

    if (!product) return res.status(404).json({ message: "상품 없음" });
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

export default router;
