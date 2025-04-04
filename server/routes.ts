import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertGridSchema, 
  insertRegionSchema, 
  insertUserSchema, 
  insertAvatarSchema,
  userRegistrationSchema 
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
      const regions = gridId 
        ? await storage.getRegionsByGrid(gridId)
        : await storage.getAllRegions();
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

  const httpServer = createServer(app);
  return httpServer;
}
