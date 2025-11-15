import passport from "passport";
import local from "passport-local";
import jwt from "passport-jwt";
import UserModel from "../models/user.model.js";
import { createHash, isValidPassword } from "../utils/hash.js";

const LocalStrategy = local.Strategy;
const JWTStrategy   = jwt.Strategy;
const ExtractJWT    = jwt.ExtractJwt;

const JWT_SECRET = process.env.JWT_SECRET || "superSecretTPBackend2";

const cookieExtractor = (req) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies["jwtCookie"];   // nombre de la cookie
  }
  return token;
};

export const initPassport = () => {
  // 🔐 Estrategia local para login (email + password)
  passport.use(
    "login",
    new LocalStrategy(
      { usernameField: "email", passReqToCallback: false },
      async (email, password, done) => {
        try {
          const user = await UserModel.findOne({ email });
          if (!user) return done(null, false, { message: "Usuario no encontrado" });

          if (!isValidPassword(user, password))
            return done(null, false, { message: "Contraseña inválida" });

          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  // 🎫 Estrategia JWT “current” para obtener usuario logueado
  passport.use(
    "current",
    new JWTStrategy(
      {
        jwtFromRequest: ExtractJWT.fromExtractors([
          cookieExtractor,
          ExtractJWT.fromAuthHeaderAsBearerToken(),
        ]),
        secretOrKey: JWT_SECRET,
      },
      async (jwtPayload, done) => {
        try {
          const user = await UserModel.findById(jwtPayload.user._id);
          if (!user) return done(null, false, { message: "Usuario no encontrado" });
          return done(null, user);
        } catch (err) {
          return done(err, false);
        }
      }
    )
  );
};
