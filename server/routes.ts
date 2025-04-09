import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertGridSchema, 
  insertRegionSchema, 
  insertUserSchema, 
  insertAvatarSchema,
  insertSettingSchema,
  userRegistrationSchema,
  loginCustomizationSchema,
  splashPageSchema,
  insertMarketplaceItemSchema,
  insertMarketplacePurchaseSchema,
  insertUserInventorySchema,
  insertMarketplaceCategorySchema,
  insertMarketplaceSettingSchema,
  securitySettingsSchema
} from "@shared/schema";
import { ZodError } from "zod";
import { setupAuth } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);
  
  // Error handler helper
  const handleError = (res: Response, error: any) => {
    console.error("API Error:", error);
    if (error instanceof ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.errors });
    }
    return res.status(500).json({ message: error.message || "Internal server error" });
  };

  // Grid Routes
  app.get("/api/grids", async (req: Request, res: Response) => {
    try {
      const grids = await storage.getAllGrids();
      res.json(grids);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get("/api/grids/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const grid = await storage.getGrid(id);
      if (!grid) {
        return res.status(404).json({ message: "Grid not found" });
      }
      res.json(grid);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post("/api/grids", async (req: Request, res: Response) => {
    try {
      const gridData = insertGridSchema.parse(req.body);
      const newGrid = await storage.createGrid(gridData);
      res.status(201).json(newGrid);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.patch("/api/grids/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const updatedGrid = await storage.updateGrid(id, req.body);
      if (!updatedGrid) {
        return res.status(404).json({ message: "Grid not found" });
      }
      res.json(updatedGrid);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.delete("/api/grids/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteGrid(id);
      if (!deleted) {
        return res.status(404).json({ message: "Grid not found" });
      }
      res.status(204).send();
    } catch (error) {
      handleError(res, error);
    }
  });

  // Region Routes
  app.get("/api/regions", async (req: Request, res: Response) => {
    try {
      const gridId = req.query.gridId ? parseInt(req.query.gridId as string) : undefined;
      const ownerId = req.query.ownerId ? parseInt(req.query.ownerId as string) : undefined;
      
      let regions = [];
      
      if (gridId) {
        regions = await storage.getRegionsByGrid(gridId);
      } else if (ownerId) {
        // Get all regions and filter by owner ID
        // Ideally, this would be a separate storage method for efficiency
        regions = (await storage.getAllRegions()).filter(region => region.ownerId === ownerId);
      } else {
        regions = await storage.getAllRegions();
      }
      
      res.json(regions);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get("/api/regions/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const region = await storage.getRegion(id);
      if (!region) {
        return res.status(404).json({ message: "Region not found" });
      }
      res.json(region);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post("/api/regions", async (req: Request, res: Response) => {
    try {
      const regionData = insertRegionSchema.parse(req.body);
      const newRegion = await storage.createRegion(regionData);
      res.status(201).json(newRegion);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.patch("/api/regions/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const updatedRegion = await storage.updateRegion(id, req.body);
      if (!updatedRegion) {
        return res.status(404).json({ message: "Region not found" });
      }
      res.json(updatedRegion);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.delete("/api/regions/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteRegion(id);
      if (!deleted) {
        return res.status(404).json({ message: "Region not found" });
      }
      res.status(204).send();
    } catch (error) {
      handleError(res, error);
    }
  });

  // User Routes
  app.get("/api/users", async (req: Request, res: Response) => {
    try {
      const users = await storage.getAllUsers();
      
      // Strip password field for security
      const safeUsers = users.map(({ password, ...user }) => user);
      
      res.json(safeUsers);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const newUser = await storage.createUser(userData);
      const { password, ...safeUser } = newUser;
      res.status(201).json(safeUser);
    } catch (error) {
      handleError(res, error);
    }
  });
  
  // User endpoint to create avatar for existing user
  app.post("/api/users/:id/avatars", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const avatarData = insertAvatarSchema.parse({ ...req.body, userId });
      const avatar = await storage.createAvatar(avatarData);
      res.status(201).json(avatar);
    } catch (error) {
      handleError(res, error);
    }
  });
  
  // Get avatars for a user
  app.get("/api/users/:id/avatars", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const avatars = await storage.getAvatarsByUser(userId);
      res.json(avatars);
    } catch (error) {
      handleError(res, error);
    }
  });

  // OpenSimulator Actions
  app.post("/api/grids/:id/start", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const grid = await storage.getGrid(id);
      if (!grid) {
        return res.status(404).json({ message: "Grid not found" });
      }
      
      // Update grid status
      const updatedGrid = await storage.updateGrid(id, {
        status: "online",
        isRunning: true,
        lastStarted: new Date().toISOString()
      });
      
      res.json(updatedGrid);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post("/api/grids/:id/stop", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const grid = await storage.getGrid(id);
      if (!grid) {
        return res.status(404).json({ message: "Grid not found" });
      }
      
      // Update grid status
      const updatedGrid = await storage.updateGrid(id, {
        status: "offline",
        isRunning: false
      });
      
      res.json(updatedGrid);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post("/api/regions/:id/restart", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const region = await storage.getRegion(id);
      if (!region) {
        return res.status(404).json({ message: "Region not found" });
      }
      
      // Update region status to restarting
      await storage.updateRegion(id, {
        status: "restarting",
        isRunning: false
      });
      
      // Simulate restart delay
      setTimeout(async () => {
        await storage.updateRegion(id, {
          status: "online",
          isRunning: true
        });
      }, 3000);
      
      res.json({ message: "Region restart initiated" });
    } catch (error) {
      handleError(res, error);
    }
  });

  // Settings Routes
  app.get("/api/settings", async (req: Request, res: Response) => {
    try {
      const settings = await storage.getAllSettings();
      res.json(settings);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get("/api/settings/:key", async (req: Request, res: Response) => {
    try {
      const key = req.params.key;
      const setting = await storage.getSetting(key);
      if (!setting) {
        return res.status(404).json({ message: "Setting not found" });
      }
      res.json(setting);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post("/api/settings", async (req: Request, res: Response) => {
    try {
      const settingData = insertSettingSchema.parse(req.body);
      const newSetting = await storage.createSetting(settingData);
      res.status(201).json(newSetting);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.put("/api/settings/:key", async (req: Request, res: Response) => {
    try {
      const key = req.params.key;
      const { value } = req.body;
      
      if (!value) {
        return res.status(400).json({ message: "Value is required" });
      }
      
      const updatedSetting = await storage.updateSetting(key, value);
      if (!updatedSetting) {
        return res.status(404).json({ message: "Setting not found" });
      }
      res.json(updatedSetting);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.delete("/api/settings/:key", async (req: Request, res: Response) => {
    try {
      const key = req.params.key;
      const deleted = await storage.deleteSetting(key);
      if (!deleted) {
        return res.status(404).json({ message: "Setting not found" });
      }
      res.status(204).send();
    } catch (error) {
      handleError(res, error);
    }
  });

  // Login Customization Endpoint
  app.get("/api/login-customization", async (req: Request, res: Response) => {
    try {
      const customization = await storage.getLoginCustomization();
      res.json(customization);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.put("/api/login-customization", async (req: Request, res: Response) => {
    try {
      // Add authentication check to restrict updates to admin users only
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).json({ error: "Unauthorized: Admin access required" });
      }
      
      const customizationData = loginCustomizationSchema.parse(req.body);
      const updatedCustomization = await storage.updateLoginCustomization(customizationData);
      res.json(updatedCustomization);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Region sizes endpoints
  app.get("/api/region-sizes", async (req: Request, res: Response) => {
    try {
      const regionSizes = await storage.getAllRegionSizes();
      res.json(regionSizes);
    } catch (error) {
      handleError(res, error);
    }
  });
  
  app.get("/api/region-sizes/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const regionSize = await storage.getRegionSize(id);
      if (!regionSize) {
        return res.status(404).json({ message: "Region size not found" });
      }
      res.json(regionSize);
    } catch (error) {
      handleError(res, error);
    }
  });
  
  // Region purchases endpoints
  app.get("/api/region-purchases", async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      
      if (userId) {
        const purchases = await storage.getRegionPurchasesByUser(userId);
        res.json(purchases);
      } else {
        // Only admins should see all purchases
        if (!req.isAuthenticated() || !(req.user as any).isAdmin) {
          return res.status(403).json({ message: "Unauthorized" });
        }
        
        const purchases = await storage.getPendingRegionPurchases();
        res.json(purchases);
      }
    } catch (error) {
      handleError(res, error);
    }
  });
  
  app.post("/api/region-purchases", async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const purchase = await storage.createRegionPurchase(req.body);
      res.status(201).json(purchase);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Splash page endpoints
  app.get("/api/splash-page", async (req: Request, res: Response) => {
    try {
      const splashPage = await storage.getSplashPage();
      res.json(splashPage);
    } catch (error) {
      handleError(res, error);
    }
  });
  
  app.put("/api/splash-page", async (req: Request, res: Response) => {
    try {
      // Add authentication check to restrict updates to admin users only
      if (!req.isAuthenticated() || !(req.user as any).isAdmin) {
        return res.status(403).json({ error: "Unauthorized: Admin access required" });
      }
      
      const splashPageData = splashPageSchema.parse(req.body);
      const splashPage = await storage.updateSplashPage(splashPageData);
      res.json(splashPage);
    } catch (error) {
      handleError(res, error);
    }
  });
  
  app.post("/api/splash-page/images", async (req: Request, res: Response) => {
    try {
      // Add authentication check to restrict updates to admin users only
      if (!req.isAuthenticated() || !(req.user as any).isAdmin) {
        return res.status(403).json({ error: "Unauthorized: Admin access required" });
      }
      
      const { imageUrl } = req.body;
      if (!imageUrl) {
        return res.status(400).json({ error: "Image URL is required" });
      }
      const splashPage = await storage.addSplashPageImage(imageUrl);
      res.json(splashPage);
    } catch (error) {
      handleError(res, error);
    }
  });
  
  app.delete("/api/splash-page/images", async (req: Request, res: Response) => {
    try {
      // Add authentication check to restrict updates to admin users only
      if (!req.isAuthenticated() || !(req.user as any).isAdmin) {
        return res.status(403).json({ error: "Unauthorized: Admin access required" });
      }
      
      const { imageUrl } = req.body;
      if (!imageUrl) {
        return res.status(400).json({ error: "Image URL is required" });
      }
      const splashPage = await storage.removeSplashPageImage(imageUrl);
      res.json(splashPage);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Marketplace API endpoints

  // Item endpoints
  app.get("/api/marketplace/items", async (req: Request, res: Response) => {
    try {
      const filters = {
        status: req.query.status as string,
        category: req.query.category as string
      };
      const items = await storage.getAllMarketplaceItems(filters);
      res.json(items);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get("/api/marketplace/items/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const item = await storage.getMarketplaceItem(id);
      if (!item) {
        return res.status(404).send("Item not found");
      }
      res.json(item);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get("/api/marketplace/seller/:sellerId/items", async (req: Request, res: Response) => {
    try {
      const sellerId = parseInt(req.params.sellerId);
      const items = await storage.getMarketplaceItemsBySeller(sellerId);
      res.json(items);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get("/api/marketplace/category/:category/items", async (req: Request, res: Response) => {
    try {
      const category = req.params.category;
      const items = await storage.getMarketplaceItemsByCategory(category);
      res.json(items);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post("/api/marketplace/items", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("You must be logged in to create marketplace items");
      }
      
      const itemData = { ...req.body, sellerId: req.user.id };
      const validatedData = insertMarketplaceItemSchema.parse(itemData);
      const newItem = await storage.createMarketplaceItem(validatedData);
      res.status(201).json(newItem);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.patch("/api/marketplace/items/:id", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("You must be logged in to update marketplace items");
      }
      
      const id = parseInt(req.params.id);
      const item = await storage.getMarketplaceItem(id);
      
      if (!item) {
        return res.status(404).send("Item not found");
      }
      
      // Only the seller or admin can update the item
      if (item.sellerId !== req.user.id && !req.user.isAdmin) {
        return res.status(403).send("You don't have permission to update this item");
      }
      
      const updatedItem = await storage.updateMarketplaceItem(id, req.body);
      res.json(updatedItem);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.delete("/api/marketplace/items/:id", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("You must be logged in to delete marketplace items");
      }
      
      const id = parseInt(req.params.id);
      const item = await storage.getMarketplaceItem(id);
      
      if (!item) {
        return res.status(404).send("Item not found");
      }
      
      // Only the seller or admin can delete the item
      if (item.sellerId !== req.user.id && !req.user.isAdmin) {
        return res.status(403).send("You don't have permission to delete this item");
      }
      
      await storage.deleteMarketplaceItem(id);
      res.status(204).send();
    } catch (error) {
      handleError(res, error);
    }
  });

  // Purchase endpoints
  app.post("/api/marketplace/purchases", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("You must be logged in to make a purchase");
      }
      
      const { itemId, deliveryLocation } = req.body;
      
      if (!itemId || !deliveryLocation) {
        return res.status(400).send("Item ID and delivery location are required");
      }
      
      const item = await storage.getMarketplaceItem(parseInt(itemId));
      if (!item) {
        return res.status(404).send("Item not found");
      }
      
      if (!item.isEnabled || item.status !== "approved") {
        return res.status(400).send("This item is not available for purchase");
      }
      
      const purchaseData = {
        itemId: parseInt(itemId),
        buyerId: req.user.id,
        sellerId: item.sellerId,
        price: item.price,
        deliveryLocation
      };
      
      const validatedData = insertMarketplacePurchaseSchema.parse(purchaseData);
      const purchase = await storage.createMarketplacePurchase(validatedData);
      
      res.status(201).json(purchase);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get("/api/marketplace/purchases/buyer", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("You must be logged in to view your purchases");
      }
      
      const purchases = await storage.getMarketplacePurchasesByBuyer(req.user.id);
      res.json(purchases);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get("/api/marketplace/purchases/seller", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("You must be logged in to view your sales");
      }
      
      const sales = await storage.getMarketplacePurchasesBySeller(req.user.id);
      res.json(sales);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get("/api/marketplace/purchases/pending", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated() || !req.user.isAdmin) {
        return res.status(401).send("Unauthorized");
      }
      
      const pendingDeliveries = await storage.getPendingDeliveries();
      res.json(pendingDeliveries);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.patch("/api/marketplace/purchases/:id", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated() || !req.user.isAdmin) {
        return res.status(401).send("Only admins can update purchase delivery status");
      }
      
      const id = parseInt(req.params.id);
      const purchase = await storage.getMarketplacePurchase(id);
      
      if (!purchase) {
        return res.status(404).send("Purchase not found");
      }
      
      const updatedPurchase = await storage.updateMarketplacePurchase(id, req.body);
      res.json(updatedPurchase);
    } catch (error) {
      handleError(res, error);
    }
  });

  // User inventory endpoints
  app.get("/api/inventory", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("You must be logged in to view your inventory");
      }
      
      const inventory = await storage.getUserInventoryByUser(req.user.id);
      res.json(inventory);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post("/api/inventory", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("You must be logged in to add items to your inventory");
      }
      
      const itemData = { ...req.body, userId: req.user.id };
      const validatedData = insertUserInventorySchema.parse(itemData);
      const newItem = await storage.createUserInventoryItem(validatedData);
      res.status(201).json(newItem);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.patch("/api/inventory/:id", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("You must be logged in to update your inventory");
      }
      
      const id = parseInt(req.params.id);
      const item = await storage.getUserInventoryItem(id);
      
      if (!item) {
        return res.status(404).send("Inventory item not found");
      }
      
      if (item.userId !== req.user.id && !req.user.isAdmin) {
        return res.status(403).send("You don't have permission to update this inventory item");
      }
      
      const updatedItem = await storage.updateUserInventoryItem(id, req.body);
      res.json(updatedItem);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.delete("/api/inventory/:id", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("You must be logged in to delete inventory items");
      }
      
      const id = parseInt(req.params.id);
      const item = await storage.getUserInventoryItem(id);
      
      if (!item) {
        return res.status(404).send("Inventory item not found");
      }
      
      if (item.userId !== req.user.id && !req.user.isAdmin) {
        return res.status(403).send("You don't have permission to delete this inventory item");
      }
      
      await storage.deleteUserInventoryItem(id);
      res.status(204).send();
    } catch (error) {
      handleError(res, error);
    }
  });

  // Marketplace category endpoints
  app.get("/api/marketplace/categories", async (req: Request, res: Response) => {
    try {
      const categories = await storage.getAllMarketplaceCategories();
      res.json(categories);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post("/api/marketplace/categories", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated() || !req.user.isAdmin) {
        return res.status(401).send("Only admins can create marketplace categories");
      }
      
      const validatedData = insertMarketplaceCategorySchema.parse(req.body);
      const newCategory = await storage.createMarketplaceCategory(validatedData);
      res.status(201).json(newCategory);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.patch("/api/marketplace/categories/:id", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated() || !req.user.isAdmin) {
        return res.status(401).send("Only admins can update marketplace categories");
      }
      
      const id = parseInt(req.params.id);
      const category = await storage.getMarketplaceCategory(id);
      
      if (!category) {
        return res.status(404).send("Category not found");
      }
      
      const updatedCategory = await storage.updateMarketplaceCategory(id, req.body);
      res.json(updatedCategory);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.delete("/api/marketplace/categories/:id", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated() || !req.user.isAdmin) {
        return res.status(401).send("Only admins can delete marketplace categories");
      }
      
      const id = parseInt(req.params.id);
      const category = await storage.getMarketplaceCategory(id);
      
      if (!category) {
        return res.status(404).send("Category not found");
      }
      
      await storage.deleteMarketplaceCategory(id);
      res.status(204).send();
    } catch (error) {
      handleError(res, error);
    }
  });

  // Marketplace settings endpoints
  app.get("/api/marketplace/settings", async (req: Request, res: Response) => {
    try {
      const settings = await storage.getAllMarketplaceSettings();
      res.json(settings);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get("/api/marketplace/settings/:key", async (req: Request, res: Response) => {
    try {
      const key = req.params.key;
      const setting = await storage.getMarketplaceSetting(key);
      
      if (!setting) {
        return res.status(404).send("Setting not found");
      }
      
      res.json(setting);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.post("/api/marketplace/settings", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated() || !req.user.isAdmin) {
        return res.status(401).send("Only admins can create marketplace settings");
      }
      
      const validatedData = insertMarketplaceSettingSchema.parse(req.body);
      const newSetting = await storage.createMarketplaceSetting(validatedData);
      res.status(201).json(newSetting);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.put("/api/marketplace/settings/:key", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated() || !req.user.isAdmin) {
        return res.status(401).send("Only admins can update marketplace settings");
      }
      
      const key = req.params.key;
      const value = req.body.value;
      
      if (value === undefined) {
        return res.status(400).send("Value is required");
      }
      
      const setting = await storage.getMarketplaceSetting(key);
      
      if (!setting) {
        // If setting doesn't exist, create it
        const newSetting = await storage.createMarketplaceSetting({
          key,
          value,
          description: req.body.description || null
        });
        return res.status(201).json(newSetting);
      }
      
      const updatedSetting = await storage.updateMarketplaceSetting(key, value);
      res.json(updatedSetting);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.delete("/api/marketplace/settings/:key", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated() || !req.user.isAdmin) {
        return res.status(401).send("Only admins can delete marketplace settings");
      }
      
      const key = req.params.key;
      const setting = await storage.getMarketplaceSetting(key);
      
      if (!setting) {
        return res.status(404).send("Setting not found");
      }
      
      await storage.deleteMarketplaceSetting(key);
      res.status(204).send();
    } catch (error) {
      handleError(res, error);
    }
  });
  
  // Version check API endpoint
  // Security settings endpoints
  app.get("/api/security-settings", async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated and is an admin
      if (!req.isAuthenticated() || !(req.user as any).isAdmin) {
        return res.status(403).json({ message: "Unauthorized: Admin access required" });
      }
      
      const securitySettings = await storage.getSecuritySettings();
      res.json(securitySettings);
    } catch (error) {
      handleError(res, error);
    }
  });
  
  app.put("/api/security-settings", async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated and is an admin
      if (!req.isAuthenticated() || !(req.user as any).isAdmin) {
        return res.status(403).json({ message: "Unauthorized: Admin access required" });
      }
      
      const settings = securitySettingsSchema.partial().parse(req.body);
      const updatedSettings = await storage.updateSecuritySettings(settings);
      res.json(updatedSettings);
    } catch (error) {
      handleError(res, error);
    }
  });

  app.get("/api/version-check", async (req: Request, res: Response) => {
    try {
      // Only allow authenticated admins to check for updates
      if (!req.isAuthenticated() || !req.user.isAdmin) {
        return res.status(401).send("Only admins can check for updates");
      }
      
      // Get current version from package.json
      const currentVersion = "1.0.0"; // Use package.json version in real deployment
      
      // Check GitHub for latest release
      const githubToken = process.env.GITHUB_TOKEN;
      
      if (!githubToken) {
        console.warn("GitHub token not available, using mock data");
        // Return mock data for demo purposes
        // In production, we would return an error
        return res.json({
          currentVersion: "1.0.0",
          latestVersion: "1.1.0",
          updateAvailable: true,
          releaseUrl: "https://github.com/sirswaghorse/os-grid-manager/releases/tag/v1.1.0",
          releaseNotes: "# Release Notes\n\n## New Features\n- Improved region management\n- Added grid statistics dashboard\n- Enhanced marketplace search\n\n## Bug Fixes\n- Fixed user avatar selection\n- Resolved grid startup issues\n- Improved error handling",
          updateDate: new Date().toISOString()
        });
      }
      
      // Make a request to GitHub API to get latest release info
      const repoOwner = "sirswaghorse";
      const repoName = "os-grid-manager";
      
      const response = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/releases/latest`, {
        headers: {
          "Authorization": `token ${githubToken}`,
          "Accept": "application/vnd.github.v3+json",
          "User-Agent": "OSGridManager"
        }
      });
      
      if (!response.ok) {
        throw new Error(`GitHub API request failed: ${response.statusText}`);
      }
      
      const releaseData = await response.json();
      
      // Extract the version number (typically in format "v1.2.3")
      const latestVersion = releaseData.tag_name.replace(/^v/, "");
      
      // Compare versions to see if update is available
      // Simple string comparison works for semver in format x.y.z
      const updateAvailable = latestVersion > currentVersion;
      
      res.json({
        currentVersion,
        latestVersion,
        updateAvailable,
        releaseUrl: releaseData.html_url,
        releaseNotes: releaseData.body,
        updateDate: releaseData.published_at
      });
    } catch (error: any) {
      console.error("Version check error:", error);
      // Fall back to returning current version with no update
      res.json({
        currentVersion: "1.0.0",
        latestVersion: "1.0.0",
        updateAvailable: false,
        error: error.message || "Unknown error checking for updates"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
