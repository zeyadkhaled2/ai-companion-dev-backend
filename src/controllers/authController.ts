import { PrismaClient } from '@prisma/client';
import { comparePassword, generateToken, hashPassword } from '../services/authServices';
import { Request, Response } from 'express';
const prisma = new PrismaClient();

export async function register(req: Request, res: Response) {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    res.status(400).json({ message: 'Email, password, and name are required' });
    return;
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    res.status(409).json({ message: 'Email already in use' });
    return;
  }

  const hashedPassword = await hashPassword(password);

  const newUser = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,  // key matches schema field, value is your hashed variable
      name,
    },
  });

  const token = generateToken(newUser.id);

  res.status(201).json({
    token,
    user: { id: newUser.id, email: newUser.email, name: newUser.name },
  });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: 'Email and password are required' });
    return;
  }
  const loginUser = await prisma.user.findUnique({ where: { email } })
  if (!loginUser) {
    res.status(401).json({ message: 'Email or password is incorrect' });
    return;
  }
  const passwordMatch = await comparePassword(password, loginUser.password)
  if (passwordMatch) {
    const token = generateToken(loginUser.id)
    res.status(200).json({
      token,
      user: { id: loginUser.id, email: loginUser.email, name: loginUser.name },
    });
  } else {
    res.status(401).json({ message: 'Email or password is incorrect' });
    return;
  }
}