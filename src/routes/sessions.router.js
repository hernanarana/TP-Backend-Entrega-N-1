import { Router } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import UserModel from '../models/user.model.js';
import { createHash } from '../utils/hash.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'superSecretTPBackend2';
const COOKIE_NAME = 'jwtCookie';

// 🟢 Registro
router.post('/register', async (req, res) => {
  try {
    const { first_name, last_name, email, age, password } = req.body;

    if (!first_name || !last_name || !email || !age || !password) {
      return res.status(400).json({ status: 'error', error: 'Faltan campos' });
    }

    const exists = await UserModel.findOne({ email });
    if (exists) {
      return res.status(400).json({ status: 'error', error: 'El email ya está registrado' });
    }

    const hashedPassword = createHash(password);

    const newUser = await UserModel.create({
      first_name,
      last_name,
      email,
      age,
      password: hashedPassword,
      role: 'user',
      cart: null,
    });

    return res.status(201).json({
      status: 'success',
      payload: {
        _id: newUser._id,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        email: newUser.email,
        age: newUser.age,
        role: newUser.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', error: 'Error al registrar usuario' });
  }
});

// 🟢 Login (Passport local + JWT)
router.post(
  '/login',
  passport.authenticate('login', { session: false, failWithError: true }),
  async (req, res) => {
    try {
      const user = req.user;

      const userPayload = {
        _id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        age: user.age,
        role: user.role,
      };

      const token = jwt.sign({ user: userPayload }, JWT_SECRET, { expiresIn: '1h' });

      res
        .cookie(COOKIE_NAME, token, {
          httpOnly: true,
          maxAge: 60 * 60 * 1000,
        })
        .json({
          status: 'success',
          message: 'Login exitoso',
          token,
        });
    } catch (err) {
      console.error(err);
      res.status(500).json({ status: 'error', error: 'Error en el login' });
    }
  },
  (err, req, res, next) => {
    return res.status(401).json({ status: 'error', error: 'Credenciales inválidas' });
  }
);

// 🟢 /api/sessions/current
router.get(
  '/current',
  passport.authenticate('current', { session: false }),
  (req, res) => {
    const user = req.user;
    res.json({
      status: 'success',
      payload: {
        _id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        age: user.age,
        role: user.role,
      },
    });
  }
);

// 🟡 Logout
router.post('/logout', (req, res) => {
  res.clearCookie(COOKIE_NAME).json({ status: 'success', message: 'Logout exitoso' });
});

export default router;
