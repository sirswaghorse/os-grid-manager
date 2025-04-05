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
  splashPageSchema
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

  const httpServer = createServer(app);
  return httpServer;
}
