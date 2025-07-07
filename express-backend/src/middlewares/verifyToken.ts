import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables.");
}

interface JwtPayload {
  userId: number;
  email: string;
}


declare module "express-serve-static-core" {
  interface Request {
    userId?: number;
    email?: string;
  }
}



export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.cookies.token;

  if (!token) {
    res.status(401).json({
      success: false,
      message: "Unauthorized - no token provided",
    });
    return;
  }

  try {
    const decoded = jwt.verify(
      token,
      JWT_SECRET
    ) as JwtPayload;

    req.userId = decoded.userId;
    req.email = decoded.email;
    next();
  } catch (error) {
    console.error("Error in verifying token", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
};
