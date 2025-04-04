import { 
  users, regions, grids, avatars,
  type User, type InsertUser, 
  type Grid, type InsertGrid,
  type Region, type InsertRegion,
  type Avatar, type InsertAvatar
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  
  // Avatar operations
  createAvatar(avatar: InsertAvatar): Promise<Avatar>;
  getAvatarsByUser(userId: number): Promise<Avatar[]>;
  getAvatar(id: number): Promise<Avatar | undefined>;
  
  // Grid operations
  getGrid(id: number): Promise<Grid | undefined>;
  getAllGrids(): Promise<Grid[]>;
  createGrid(grid: InsertGrid): Promise<Grid>;
  updateGrid(id: number, grid: Partial<Grid>): Promise<Grid | undefined>;
  deleteGrid(id: number): Promise<boolean>;
  
  // Region operations
  getRegion(id: number): Promise<Region | undefined>;
  getRegionsByGrid(gridId: number): Promise<Region[]>;
  getAllRegions(): Promise<Region[]>;
  createRegion(region: InsertRegion): Promise<Region>;
  updateRegion(id: number, region: Partial<Region>): Promise<Region | undefined>;
  deleteRegion(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private grids: Map<number, Grid>;
  private regions: Map<number, Region>;
  private avatars: Map<number, Avatar>;
  
  private userCurrentId: number;
  private gridCurrentId: number;
  private regionCurrentId: number;
  private avatarCurrentId: number;

  constructor() {
    this.users = new Map();
    this.grids = new Map();
    this.regions = new Map();
    this.avatars = new Map();
    
    this.userCurrentId = 1;
    this.gridCurrentId = 1;
    this.regionCurrentId = 1;
    this.avatarCurrentId = 1;
    
    // Initialize with default admin user with pre-hashed password
    // "admin" hashed with salt "6d0819b746e85f5b"
    const adminUser: User = {
      id: this.userCurrentId++,
      username: "admin",
      password: "c7ad44cbad762a5da0a452f9e854fdc1e0e7a52a38015f23f3eab1d80b931dd472634dfac71cd34ebc35d16ab7fb8a90c81f975113d6c7538dc69dd8de9077ec.6d0819b746e85f5b",
      email: "admin@example.com",
      isAdmin: true,
      dateJoined: new Date().toISOString(),
      firstName: null,
      lastName: null
    };
    this.users.set(adminUser.id, adminUser);
    
    // Initialize with a sample grid
    const sampleGridData = {
      name: "Sample Grid",
      nickname: "SAMPLE",
      adminEmail: "admin@example.com",
      externalAddress: "localhost",
      status: "online",
      port: 8000,
      externalPort: 8002,
      isRunning: true
    };
    const sampleGrid = {
      id: this.gridCurrentId++,
      ...sampleGridData,
      lastStarted: new Date().toISOString()
    };
    this.grids.set(sampleGrid.id, sampleGrid);
    
    // Initialize with sample regions directly
    const welcomeIsland: Region = {
      id: this.regionCurrentId++,
      gridId: sampleGrid.id,
      name: "Welcome Island",
      positionX: 1000,
      positionY: 1000,
      sizeX: 256,
      sizeY: 256,
      port: 9000,
      template: "welcome",
      status: "online",
      isRunning: true
    };
    this.regions.set(welcomeIsland.id, welcomeIsland);
    
    const marketPlaza: Region = {
      id: this.regionCurrentId++,
      gridId: sampleGrid.id,
      name: "Market Plaza",
      positionX: 1000,
      positionY: 1256,
      sizeX: 512,
      sizeY: 512,
      port: 9001,
      template: "sandbox",
      status: "online",
      isRunning: true
    };
    this.regions.set(marketPlaza.id, marketPlaza);
    
    const eventsCenter: Region = {
      id: this.regionCurrentId++,
      gridId: sampleGrid.id,
      name: "Events Center",
      positionX: 1512,
      positionY: 1000,
      sizeX: 256,
      sizeY: 256,
      port: 9002,
      template: "empty",
      status: "online",
      isRunning: true
    };
    this.regions.set(eventsCenter.id, eventsCenter);
    
    const sandbox: Region = {
      id: this.regionCurrentId++,
      gridId: sampleGrid.id,
      name: "Sandbox",
      positionX: 1512,
      positionY: 1256,
      sizeX: 1024,
      sizeY: 1024,
      port: 9003,
      template: "sandbox",
      status: "restarting",
      isRunning: false
    };
    this.regions.set(sandbox.id, sandbox);
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const dateJoined = new Date().toISOString();
    const user: User = { 
      ...insertUser, 
      id, 
      dateJoined,
      firstName: insertUser.firstName || null,
      lastName: insertUser.lastName || null,
      isAdmin: insertUser.isAdmin || false
    };
    this.users.set(id, user);
    return user;
  }
  
  // Avatar operations
  async createAvatar(insertAvatar: InsertAvatar): Promise<Avatar> {
    const id = this.avatarCurrentId++;
    const created = new Date().toISOString();
    const avatar: Avatar = { ...insertAvatar, id, created };
    this.avatars.set(id, avatar);
    return avatar;
  }
  
  async getAvatarsByUser(userId: number): Promise<Avatar[]> {
    return Array.from(this.avatars.values()).filter(
      (avatar) => avatar.userId === userId
    );
  }
  
  async getAvatar(id: number): Promise<Avatar | undefined> {
    return this.avatars.get(id);
  }
  
  // Grid operations
  async getGrid(id: number): Promise<Grid | undefined> {
    return this.grids.get(id);
  }
  
  async getAllGrids(): Promise<Grid[]> {
    return Array.from(this.grids.values());
  }
  
  async createGrid(insertGrid: InsertGrid): Promise<Grid> {
    const id = this.gridCurrentId++;
    const now = new Date().toISOString();
    // Ensure all required fields have values
    const grid: Grid = { 
      ...insertGrid, 
      id, 
      lastStarted: now,
      status: insertGrid.status || "offline",
      port: insertGrid.port || 8000,
      externalPort: insertGrid.externalPort || 8002,
      isRunning: insertGrid.isRunning || false
    };
    this.grids.set(id, grid);
    return grid;
  }
  
  async updateGrid(id: number, updates: Partial<Grid>): Promise<Grid | undefined> {
    const grid = this.grids.get(id);
    if (!grid) return undefined;
    
    const updatedGrid = { ...grid, ...updates };
    this.grids.set(id, updatedGrid);
    return updatedGrid;
  }
  
  async deleteGrid(id: number): Promise<boolean> {
    return this.grids.delete(id);
  }
  
  // Region operations
  async getRegion(id: number): Promise<Region | undefined> {
    return this.regions.get(id);
  }
  
  async getRegionsByGrid(gridId: number): Promise<Region[]> {
    return Array.from(this.regions.values()).filter(
      (region) => region.gridId === gridId
    );
  }
  
  async getAllRegions(): Promise<Region[]> {
    return Array.from(this.regions.values());
  }
  
  async createRegion(insertRegion: InsertRegion): Promise<Region> {
    const id = this.regionCurrentId++;
    // Ensure all required fields have values
    const region: Region = { 
      ...insertRegion, 
      id,
      status: insertRegion.status || "offline",
      sizeX: insertRegion.sizeX || 256,
      sizeY: insertRegion.sizeY || 256,
      template: insertRegion.template || "empty",
      isRunning: insertRegion.isRunning || false
    };
    this.regions.set(id, region);
    return region;
  }
  
  async updateRegion(id: number, updates: Partial<Region>): Promise<Region | undefined> {
    const region = this.regions.get(id);
    if (!region) return undefined;
    
    const updatedRegion = { ...region, ...updates };
    this.regions.set(id, updatedRegion);
    return updatedRegion;
  }
  
  async deleteRegion(id: number): Promise<boolean> {
    return this.regions.delete(id);
  }
}

export const storage = new MemStorage();
