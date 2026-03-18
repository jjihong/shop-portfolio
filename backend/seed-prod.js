const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  await prisma.category.createMany({
    data: [
      { name: "상의" },
      { name: "하의" },
      { name: "아우터" },
      { name: "신발" },
    ],
  });
  console.log("완료");
}

main().finally(() => prisma.$disconnect());
