import express from 'express';
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';
import User from '../models/user.js';

const router = express.Router();
const jwtSecret = process.env.JWT_SECRET || 'default_jwt_secret';
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '1h';

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  const user = await User.findOne({ username });
  if (!user) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  const validPassword = await bcrypt.compare(password, user.passwordHash);
  if (!validPassword) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  const token = jwt.sign(
    { sub: user.id, username: user.username },
    jwtSecret,
    { expiresIn: jwtExpiresIn },
  );

  return res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
    },
  });
});

export default router;
