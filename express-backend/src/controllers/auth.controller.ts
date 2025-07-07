import bcryptjs from "bcryptjs";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import { nanoid } from "nanoid";
import {
  sendPasswordResetEmail,
  sendResetSuccessEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
} from "../mailtrap/emails.js";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import {prisma} from "../config/db.js"
import asyncHandler from "../utils/asyncHandler.js";
import { Request,Response } from "express";
import validator from "validator"
import jwt from "jsonwebtoken"



export const signup = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, name } = req.body;

  
  if (!email || !name || !password) {
    res.status(400);
    throw new Error("All fields are required");
  }

  if (!validator.isEmail(email)) {
    res.status(400);
    throw new Error("Please enter a valid email");
  }

  const userAlreadyExists = await prisma.user.findUnique({
    where: { email },
  });

  if (userAlreadyExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const hashedPassword = await bcryptjs.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
    },
  });


  const verificationToken = Math.floor(
    100000 + Math.random() * 900000
  ).toString();


  await prisma.verificationToken.create({
    data: {
      token: verificationToken,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hrs
      userId: user.id,
    },
  });

 
  await sendWelcomeEmail(user.email, user.name);
  await sendVerificationEmail(user.email, verificationToken);

 
  await generateTokenAndSetCookie(res, user.id, user.email);

  res.status(201).json({
    success: true,
    message: "User created successfully",
    userData: {
      userId: user.id,
      email: user.email,
      isVerified: user.isVerified,
    },
  });
});




export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { code, email } = req.body;

  if (!code || !email) {
    res.status(400);
    throw new Error("Please fill all the details");
  }

  if (!validator.isEmail(email)) {
    res.status(400);
    throw new Error("Please enter a valid email");
  }


  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Find token for the user
  const validToken = await prisma.verificationToken.findFirst({
    where: {
      userId: user.id,
      token: code,
      expiresAt: {
        gt: new Date(),
      },
    },
  });

  if (!validToken) {
    res.status(403);
    throw new Error("Invalid or expired verification code");
  }

  // Mark user as verified
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      isVerified: true,
    },
  });

  // Delete the used verification token
  await prisma.verificationToken.delete({
    where: { id: validToken.id },
  });

  await generateTokenAndSetCookie(res, updatedUser.id, updatedUser.email);

  res.status(200).json({
    success: true,
    message: "Email verified successfully",
    userData: {
      userId: updatedUser.id,
      email: updatedUser.email,
      isVerified: updatedUser.isVerified,
    },
  });
});


export const regenerateVerificationToken = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
      res.status(400);
      throw new Error("Please fill all the details");
    }

    if (!validator.isEmail(email)) {
      res.status(400);
      throw new Error("Please enter a valid email");
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(400);
      throw new Error("Invalid user");
    }

    if(user.isVerified){
      res.status(400)
      throw new Error("User already verified")
    }


    // Generate new verification token
    const verificationToken = Math.floor(
      100000 + Math.random() * 900000
    ).toString();


    // Create new verification token entry
    await prisma.verificationToken.create({
      data: {
        token: verificationToken,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hrs
        userId: user.id,
      },
    });

    await sendVerificationEmail(user.email, verificationToken);

    res.status(200).json({
      success: true,
      message: "Verification token regenerated successfully",
      userData: {
        userId: user.id,
        email: user.email,
        isVerified: user.isVerified,
      },
    });
  }
);

export const logout = asyncHandler(async (req: Request, res: Response) => {
    const isProduction = process.env.NODE_ENV
  ? process.env.NODE_ENV === "production"
  : true; 

  res.clearCookie("token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});



export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Please provide both email and password");
  }

  if (!validator.isEmail(email)) {
    res.status(400);
    throw new Error("Please enter a valid email");
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    res.status(400);
    throw new Error("User does not exist");
  }

  const isPasswordValid = await bcryptjs.compare(password, user.password);
  if (!isPasswordValid) {
    res.status(400);
    throw new Error("Invalid credentials");
  }


  await generateTokenAndSetCookie(res, user.id, user.email);

  res.status(200).json({
    success: true,
    message: "User logged in successfully",
    userData: {
      userId: user.id,
      email: user.email,
      isVerified: user.isVerified,
    },
  });
});


export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error("Email is required");
  }

  if (!validator.isEmail(email)) {
    res.status(400);
    throw new Error("Please enter a valid email");
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    res.status(400);
    throw new Error("Invalid credentials");
  }

 

  // Generate secure token
  const resetPasswordToken = crypto.randomBytes(32).toString("hex");
  const resetPasswordExpiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

  // Save token in DB
  await prisma.passwordResetToken.create({
    data: {
      token: resetPasswordToken,
      expiresAt: resetPasswordExpiresAt,
      userId: user.id,
    },
  });

  const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetPasswordToken}`;

  // Send reset email
  await sendPasswordResetEmail(user.email, resetURL);

  res.status(200).json({
    success: true,
    message: "Password reset link sent to your email",
  });
});


export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!token || !password) {
    res.status(400);
    throw new Error("Reset token and new password are required");
  }

  // Find token in PasswordResetToken table
  const resetToken = await prisma.passwordResetToken.findFirst({
    where: {
      token,
      expiresAt: {
        gt: new Date(),
      },
    },
  });

  if (!resetToken) {
    res.status(400);
    throw new Error("Invalid or expired reset token");
  }

  const hashedPassword = await bcryptjs.hash(password, 10);

  // Update user's password
  await prisma.user.update({
    where: { id: resetToken.userId },
    data: {
      password: hashedPassword,
    },
  });

  // Delete token after use
  await prisma.passwordResetToken.delete({
    where: { id: resetToken.id },
  });

 
  const user = await prisma.user.findUnique({ where: { id: resetToken.userId } });
  if (user) {
    await sendResetSuccessEmail(user.email);
  }

  res.status(200).json({
    success: true,
    message: "Password reset successful",
  });
});


export const checkAuth = asyncHandler(
  async (req: Request, res: Response) => {
    interface JwtPayload {
      userId: string;
      email: string;
    }

    const token = req.cookies.token;

    if (!token) {
      res.status(401);
      throw new Error("Unauthorized – no token provided");
    }

  let decoded: JwtPayload;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
  } catch (err) {
    res.status(401);
    throw new Error("Unauthorized – Invalid or expired token");
  }

    
    (req as any).userId = decoded.userId;
    (req as any).email = decoded.email;

     const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
  });

  if (!user) {
    res.status(401);
    throw new Error("Unauthorized – User no longer exists");
  }

     res.status(200).json({
    success: true,
    message: "User verified successfully",
    userData: {
      userId: user.id,
      email: user.email,
      isVerified: user.isVerified,
    },
  });

  }
);


export const google = asyncHandler(async (req: Request, res: Response) => {
  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  const { idToken } = req.body;

  if (!idToken) {
    res.status(400);
    throw new Error("Google ID token is required");
  }

  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  if (!payload) {
    res.status(400);
    throw new Error("Invalid Google token payload");
  }

  const { email, name, email_verified } = payload;

  if (!email || !name) {
    res.status(400);
    throw new Error("Google account must have an email and name");
  }

  if (!email_verified) {
    res.status(403);
    throw new Error("Email not verified by Google");
  }

  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    const hashedPassword = await bcryptjs.hash(nanoid(8), 10); // random placeholder password

    user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        isVerified: true,
      },
    });

    await sendWelcomeEmail(user.email, user.name);
  } else if (!user.isVerified) {

    // Update user if previously registered but unverified
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
      },
    });

  }

  await generateTokenAndSetCookie(res, user.id, user.email);

  res.status(200).json({
    success: true,
    message: "User logged in successfully",
    userData: {
      userId: user.id,
      email: user.email,
      isVerified: true,
    },
  });
});





