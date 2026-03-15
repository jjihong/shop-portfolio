async function main() {
  // 이미 데이터가 있으면 실행 안 함
  const existing = await prisma.product.count();
  if (existing > 0) {
    console.log("이미 데이터 있음, seed 건너뜀");
    return;
  }

  const category = await prisma.category.create({ data: { name: "상의" } });
  await prisma.product.createMany({
    data: [
      { name: "흰 티셔츠", price: 19000, stock: 50, categoryId: category.id },
      { name: "검정 후드", price: 39000, stock: 30, categoryId: category.id },
    ],
  });

  console.log("seed 완료");
}
