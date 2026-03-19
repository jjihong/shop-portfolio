// GET /api/products          ← 상품 목록 (카테고리 필터 + 검색 + 페이지네이션)
// GET /api/products/:id      ← 상품 상세

import { Router } from "express";
import prisma from "../lib/prisma";

const router = Router();

router.get("/", async (req, res) => {
  const categoryId = req.query.categoryId as string | undefined;
  const search = req.query.search as string | undefined;

  // 페이지네이션 파라미터
  // page: 현재 페이지 번호 (기본값 1 = 첫 번째 페이지)
  // limit: 한 페이지에 보여줄 상품 수 (기본값 9 = 3열 × 3행)
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 9));

  // skip: 몇 개를 건너뛸지 계산
  // 예) page=2, limit=9 이면 skip=9 → 9번째 이후부터 9개를 가져옴
  const skip = (page - 1) * limit;

  // where 조건을 변수로 빼서 count와 findMany에서 동일하게 재사용
  const where = {
    ...(categoryId && { categoryId: Number(categoryId) }),
    ...(search && { name: { contains: search, mode: "insensitive" as const } }),
  };

  try {
    // 전체 상품 수와 현재 페이지 상품을 동시에 조회 (Promise.all로 병렬 실행 → 더 빠름)
    // count: 페이지 버튼 개수 계산에 필요 (총 몇 페이지인지 알려면 전체 개수가 필요)
    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        include: { category: true },
        orderBy: { createdAt: "desc" },
        skip,   // 앞에서 skip개 건너뜀
        take: limit, // limit개만 가져옴
      }),
    ]);

    // totalPages: 전체 상품 수 / 한 페이지 상품 수를 올림해서 총 페이지 수 계산
    // 예) 상품 25개, limit=9 → ceil(25/9) = 3페이지
    const totalPages = Math.ceil(total / limit);

    // 응답 형식 변경: 이전에는 배열만 반환했지만,
    // 페이지네이션에 필요한 정보(전체 수, 현재 페이지, 총 페이지)를 함께 반환
    res.json({ products, total, page, totalPages });
  } catch (err) {
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
