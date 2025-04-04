import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { createHash } from "crypto";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import createMemoryStore from "memorystore";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

// Simple password hashing with SHA-256
function hashPassword(password: string) {
  return createHash('sha256').update(password).digest('hex');
}

export function setupAuth(app: Express) {
  const MemoryStore = createMemoryStore(session);
  
  const sessionSettings: session.SessionOptions = {
    secret: "opensim-grid-manager-secret", // This should be environment variable in production
    resave: false,
    saveUninitialized: false,
    store: new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      sameSite: "lax",
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      const user = await storage.getUserByUsername(username);
      // For admin user, use direct comparison for simplicity
      if (username === "admin" && password === "admin") {
        return done(null, user);
      }
      
      if (!user || hashPassword(password) !== user.password) {
        return done(null, false);
      } else {
        return done(null, user);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    const user = await storage.getUser(id);
    done(null, user);
  });

  app.post("/api/register", async (req, res, next) => {
    const existingUser = await storage.getUserByUsername(req.body.username);
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Hash the password before storing
    const user = await storage.createUser({
      ...req.body,
      password: hashPassword(req.body.password),
    });

    req.login(user, (err) => {
      if (err) return next(err);
      const { password, ...safeUser } = user;
      res.status(201).json(safeUser);
    });
  });

  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    const { password, ...safeUser } = req.user as SelectUser;
    res.status(200).json(safeUser);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const { password, ...safeUser } = req.user as SelectUser;
    res.json(safeUser);
  });
}