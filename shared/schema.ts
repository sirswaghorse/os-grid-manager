import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Grid configuration model
export const grids = pgTable("grids", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nickname: text("nickname").notNull(),
  adminEmail: text("admin_email").notNull(),
  externalAddress: text("external_address").notNull(),
  status: text("status").notNull().default("offline"),
  lastStarted: text("last_started"),
  port: integer("port").notNull().default(8000),
  externalPort: integer("external_port").notNull().default(8002),
  isRunning: boolean("is_running").notNull().default(false),
});

// Region model
export const regions = pgTable("regions", {
  id: serial("id").primaryKey(),
  gridId: integer("grid_id").notNull(),
  name: text("name").notNull(),
  positionX: integer("position_x").notNull(),
  positionY: integer("position_y").notNull(),
  sizeX: integer("size_x").notNull().default(256),
  sizeY: integer("size_y").notNull().default(256),
  port: integer("port").notNull(),
  template: text("template").notNull().default("empty"),
  status: text("status").notNull().default("offline"),
  isRunning: boolean("is_running").notNull().default(false),
});

// Avatar model
export const avatars = pgTable("avatars", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  avatarType: text("avatar_type").notNull(),
  name: text("name").notNull(),
  created: text("created").notNull().default(new Date().toISOString()),
});

// User model (for grid admin users)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  isAdmin: boolean("is_admin").notNull().default(false),
  firstName: text("first_name"),
  lastName: text("last_name"),
  dateJoined: text("date_joined").notNull().default(new Date().toISOString()),
});

// Create Zod schemas for data validation
export const insertGridSchema = createInsertSchema(grids).omit({
  id: true,
  lastStarted: true,
  isRunning: true,
});

export const insertRegionSchema = createInsertSchema(regions).omit({
  id: true,
  isRunning: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  dateJoined: true,
});

export const insertAvatarSchema = createInsertSchema(avatars).omit({
  id: true,
  created: true,
});

// User registration schema with avatar selection
export const userRegistrationSchema = insertUserSchema.extend({
  confirmPassword: z.string(),
  avatarType: z.string(),
  avatarName: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// TypeScript types for type safety
export type InsertGrid = z.infer<typeof insertGridSchema>;
export type Grid = typeof grids.$inferSelect;

export type InsertRegion = z.infer<typeof insertRegionSchema>;
export type Region = typeof regions.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertAvatar = z.infer<typeof insertAvatarSchema>;
export type Avatar = typeof avatars.$inferSelect;

export type UserRegistration = z.infer<typeof userRegistrationSchema>;
