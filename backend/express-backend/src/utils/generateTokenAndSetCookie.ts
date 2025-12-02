import jwt from "jsonwebtoken";
import { Response } from "express";
import "dotenv/config"

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables.");
}

export const generateTokenAndSetCookie = async (
  res: Response,
  userId: string,
  email: string
): Promise<string> => {
  const token = jwt.sign(
    { userId, email },
    JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
 const isProduction = process.env.NODE_ENV
  ? process.env.NODE_ENV === "production"
  : true; 

  res.cookie("token", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  });

  return token;
};
