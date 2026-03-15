import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth";

export const adminOnly = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  if (req.user?.role !== "admin") {
    res.status(403).json({ message: "관리자만 접근 가능합니다." });
    return;
  }
  next();
};
