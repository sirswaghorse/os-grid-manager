import { pgTable, text, serial, integer, boolean, numeric, timestamp, json } from "drizzle-orm/pg-core";
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
  ownerId: integer("owner_id"), // User ID who owns this region (null for grid-owned regions)
  isPendingSetup: boolean("is_pending_setup").default(false), // Flag for regions that need admin setup
});

// Region size template model (admin-configurable region sizes and prices)
export const regionSizes = pgTable("region_sizes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // e.g., "Small", "Medium", "Large"
  description: text("description").notNull(),
  sizeX: integer("size_x").notNull(),
  sizeY: integer("size_y").notNull(),
  price: numeric("price").notNull(), // Price in USD
  isEnabled: boolean("is_enabled").notNull().default(true),
});

// Region purchase model
export const regionPurchases = pgTable("region_purchases", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(), // User who purchased
  regionSizeId: integer("region_size_id").notNull(), // Size template used
  regionId: integer("region_id"), // Linked region (null until admin creates region)
  purchaseDate: text("purchase_date").notNull().default(new Date().toISOString()),
  paymentMethod: text("payment_method").notNull().default("paypal"),
  paymentId: text("payment_id"), // Payment reference ID
  amount: numeric("amount").notNull(), // Amount paid
  status: text("status").notNull().default("pending"), // pending, completed, refunded
  regionName: text("region_name").notNull(), // Requested region name
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
});

export const insertRegionSchema = createInsertSchema(regions).omit({
  id: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  dateJoined: true,
});

export const insertAvatarSchema = createInsertSchema(avatars).omit({
  id: true,
  created: true,
});

// Define a direct schema for settings insertion without using createInsertSchema
export const insertSettingSchema = z.object({
  key: z.string(),
  value: z.string(),
});

export const insertRegionSizeSchema = createInsertSchema(regionSizes).omit({
  id: true,
});

export const insertRegionPurchaseSchema = createInsertSchema(regionPurchases).omit({
  id: true,
  purchaseDate: true,
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

// Login page customization schema
export const loginCustomizationSchema = z.object({
  displayType: z.enum(["text", "image"]),
  textValue: z.string().optional(),
  imageUrl: z.string().optional(),
});

// Splash page customization schema
export const splashPageSchema = z.object({
  message: z.string().default("Welcome to our grid!"),
  calendarUrl: z.string().optional(),
  slideshowImages: z.array(z.string()).default([]),
  slideshowSpeed: z.number().default(5000), // milliseconds between slides
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

export type InsertSetting = z.infer<typeof insertSettingSchema>;
export type Setting = {
  id: number;
  key: string;
  value: string;
  lastUpdated: string;
};

export type InsertRegionSize = z.infer<typeof insertRegionSizeSchema>;
export type RegionSize = typeof regionSizes.$inferSelect;

export type InsertRegionPurchase = z.infer<typeof insertRegionPurchaseSchema>;
export type RegionPurchase = typeof regionPurchases.$inferSelect;

export type UserRegistration = z.infer<typeof userRegistrationSchema>;

export type LoginCustomization = z.infer<typeof loginCustomizationSchema>;

export type SplashPage = z.infer<typeof splashPageSchema>;

// Marketplace Item model
export const marketplaceItems = pgTable("marketplace_items", {
  id: serial("id").primaryKey(),
  sellerId: integer("seller_id").notNull(), // User who's selling the item
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  price: numeric("price").notNull(),
  inWorldLocation: text("in_world_location"), // Where to find the item in-world
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
  updatedAt: text("updated_at").notNull().default(new Date().toISOString()),
  status: text("status").notNull().default("pending"), // pending, approved, rejected, removed
  isEnabled: boolean("is_enabled").notNull().default(true),
  permissions: text("permissions").notNull().default("copy"), // copy, transfer, modify - comma separated
  images: text("images").array(), // Array of image URLs
  tags: text("tags").array(), // Array of tags for search
});

// Marketplace Purchase model
export const marketplacePurchases = pgTable("marketplace_purchases", {
  id: serial("id").primaryKey(),
  itemId: integer("item_id").notNull(),
  buyerId: integer("buyer_id").notNull(),
  sellerId: integer("seller_id").notNull(),
  price: numeric("price").notNull(),
  purchaseDate: text("purchase_date").notNull().default(new Date().toISOString()),
  deliveryStatus: text("delivery_status").notNull().default("pending"), // pending, delivered, failed
  deliveryLocation: text("delivery_location"), // In-world location for delivery
  deliveryAttempts: integer("delivery_attempts").notNull().default(0),
  lastDeliveryAttempt: text("last_delivery_attempt"),
});

// User Inventory model
export const userInventory = pgTable("user_inventory", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  itemName: text("item_name").notNull(),
  itemType: text("item_type").notNull(), // object, texture, script, etc.
  description: text("description"),
  uploadDate: text("upload_date").notNull().default(new Date().toISOString()),
  inWorldId: text("in_world_id").notNull(), // UUID of the item in OpenSim
  isListed: boolean("is_listed").notNull().default(false), // Whether it's listed in marketplace
  marketplaceItemId: integer("marketplace_item_id"), // Link to marketplace item if listed
  thumbnailUrl: text("thumbnail_url"),
  permissions: text("permissions").notNull().default("copy"), // copy, transfer, modify - comma separated
});

// Marketplace Category model
export const marketplaceCategories = pgTable("marketplace_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  parentId: integer("parent_id"), // For hierarchical categories
  displayOrder: integer("display_order").notNull().default(0),
  isEnabled: boolean("is_enabled").notNull().default(true),
});

// Marketplace Settings model 
export const marketplaceSettings = pgTable("marketplace_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  updatedAt: text("updated_at").notNull().default(new Date().toISOString()),
});

// Create Zod schemas for marketplace components
export const insertMarketplaceItemSchema = createInsertSchema(marketplaceItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMarketplacePurchaseSchema = createInsertSchema(marketplacePurchases).omit({
  id: true,
  purchaseDate: true,
  lastDeliveryAttempt: true,
});

export const insertUserInventorySchema = createInsertSchema(userInventory).omit({
  id: true,
  uploadDate: true,
});

export const insertMarketplaceCategorySchema = createInsertSchema(marketplaceCategories).omit({
  id: true,
});

export const insertMarketplaceSettingSchema = createInsertSchema(marketplaceSettings).omit({
  id: true,
  updatedAt: true,
});

// TypeScript types for marketplace components
export type InsertMarketplaceItem = z.infer<typeof insertMarketplaceItemSchema>;
export type MarketplaceItem = typeof marketplaceItems.$inferSelect;

export type InsertMarketplacePurchase = z.infer<typeof insertMarketplacePurchaseSchema>;
export type MarketplacePurchase = typeof marketplacePurchases.$inferSelect;

export type InsertUserInventory = z.infer<typeof insertUserInventorySchema>;
export type UserInventory = typeof userInventory.$inferSelect;

export type InsertMarketplaceCategory = z.infer<typeof insertMarketplaceCategorySchema>;
export type MarketplaceCategory = typeof marketplaceCategories.$inferSelect;

export type InsertMarketplaceSetting = z.infer<typeof insertMarketplaceSettingSchema>;
export type MarketplaceSetting = typeof marketplaceSettings.$inferSelect;

// Security settings schema
export const securitySettingsSchema = z.object({
  requireEmailVerification: z.boolean().default(false),
  minimumPasswordLength: z.number().default(8),
  passwordRequireSpecialChar: z.boolean().default(true),
  passwordRequireNumbers: z.boolean().default(true),
  passwordRequireUppercase: z.boolean().default(true),
  maxLoginAttempts: z.number().default(5),
  accountLockoutDuration: z.number().default(30), // minutes
  sessionTimeout: z.number().default(120), // minutes
  twoFactorAuthEnabled: z.boolean().default(false),
  ipAccessRestriction: z.boolean().default(false),
  allowedIPs: z.array(z.string()).default([]),
  captchaOnRegistration: z.boolean().default(true),
  captchaOnLogin: z.boolean().default(false),
  gridAccessRestriction: z.enum(["open", "invite_only", "closed"]).default("open")
});

export type SecuritySettings = z.infer<typeof securitySettingsSchema>;

// Version check response type
export const versionCheckSchema = z.object({
  currentVersion: z.string(),
  latestVersion: z.string(),
  updateAvailable: z.boolean(),
  releaseUrl: z.string().optional(),
  releaseNotes: z.string().optional(),
  updateDate: z.string().optional(),
});

export type VersionCheck = z.infer<typeof versionCheckSchema>;
