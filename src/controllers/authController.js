import asyncHandler from "express-async-handler";
import prisma from "../config/prisma.js";
import { hashPassword, comparePassword } from "../utils/passwordUtil.js";
import generateToken from "../utils/generateJWTtoken.js";

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, schoolId } = req.body;

  if (!name || !email || !password || !role || !schoolId) {
    res.status(400);
    throw new Error("All fields are required");
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });

  const existingSchool = await prisma.school.findUnique({
    where: { id: schoolId },
  });

  if (existingUser) {
    res.status(400);
    throw new Error("User already exists");
  }

  if (!existingSchool) {
    res.status(400);
    throw new Error("School not found");
  }

  const hashedPassword = await hashPassword(password);

  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
      schoolId,
    },
  });

  res.status(201).json({
    success: true,
    token: generateToken({
      id: newUser.id,
      role: newUser.role,
      schoolId: newUser.schoolId,
    }),
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("All fields are required");
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    res.status(400);
    throw new Error("User not found");
  }

  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    res.status(400);
    throw new Error("Invalid password");
  }

  res.status(200).json({
    success: true,
    token: generateToken({
      id: user.id,
      role: user.role,
      schoolId: user.schoolId,
    }),
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});
