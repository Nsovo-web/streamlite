import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { HttpError } from '../middleware/errorHandler.js';

const isProd = process.env.NODE_ENV === 'production';
const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

const publicUser = (u) => ({ id: u._id, email: u.email, role: u.role });

export async function register(req, res) {
  const { email, password } = req.body;
  if (await User.findOne({ email })) throw new HttpError(409, 'Email already registered');
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ email, passwordHash });
  res.cookie('token', signToken(user), cookieOptions);
  res.status(201).json(publicUser(user));
}

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  // same message for both cases so attackers cannot discover which emails exist
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new HttpError(401, 'Invalid email or password');
  }
  res.cookie('token', signToken(user), cookieOptions);
  res.json(publicUser(user));
}

export function logout(req, res) {
  res.clearCookie('token', cookieOptions);
  res.json({ message: 'Logged out' });
}

export async function me(req, res) {
  const user = await User.findById(req.user.id);
  if (!user) throw new HttpError(401, 'User no longer exists');
  res.json(publicUser(user));
}