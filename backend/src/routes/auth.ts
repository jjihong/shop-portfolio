import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";

const router = Router();

// 회원가입
router.post("/register", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "이메일과 비밀번호를 입력해주세요." });
    return;
  }

  // 이메일 형식 검증: 프론트엔드에서도 검증하지만 백엔드에서도 독립적으로 검증해야 함
  // API를 직접 호출하는 경우에도 올바른 형식만 허용하기 위해
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ message: "올바른 이메일 형식을 입력해주세요." });
    return;
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ message: "이미 사용 중인 이메일입니다." });
      return;
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashed },
    });

    res.status(201).json({ message: "회원가입 성공", userId: user.id });
  } catch (err) {
    // DB 오류 또는 bcrypt 오류 발생 시 서버 에러 반환 (서버 크래시 방지)
    console.error(err);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

// 로그인
router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "이메일과 비밀번호를 입력해주세요." });
    return;
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res
        .status(401)
        .json({ message: "이메일 또는 비밀번호가 올바르지 않습니다." });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res
        .status(401)
        .json({ message: "이메일 또는 비밀번호가 올바르지 않습니다." });
      return;
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" },
    );

    res.json({ message: "로그인 성공", token });
  } catch (err) {
    // DB 조회 또는 JWT 서명 실패 시 서버 에러 반환
    console.error(err);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

export default router;
