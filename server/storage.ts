import { 
  users, regions, grids, avatars, regionSizes, regionPurchases,
  marketplaceItems, marketplacePurchases, userInventory, marketplaceCategories, marketplaceSettings,
  currencySettings, currencyTransactions,
  type User, type InsertUser, 
  type Grid, type InsertGrid,
  type Region, type InsertRegion,
  type Avatar, type InsertAvatar,
  type Setting, type InsertSetting,
  type RegionSize, type InsertRegionSize,
  type RegionPurchase, type InsertRegionPurchase,
  type LoginCustomization, type SplashPage,
  type MarketplaceItem, type InsertMarketplaceItem,
  type MarketplacePurchase, type InsertMarketplacePurchase,
  type UserInventory, type InsertUserInventory,
  type MarketplaceCategory, type InsertMarketplaceCategory,
  type MarketplaceSetting, type InsertMarketplaceSetting,
  type SecuritySettings,
  type CurrencySetting, type InsertCurrencySettings,
  type CurrencyTransaction, type InsertCurrencyTransaction
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
  
  // Region size operations (admin configurable region templates)
  getRegionSize(id: number): Promise<RegionSize | undefined>;
  getAllRegionSizes(): Promise<RegionSize[]>;
  createRegionSize(sizeTemplate: InsertRegionSize): Promise<RegionSize>;
  updateRegionSize(id: number, sizeTemplate: Partial<RegionSize>): Promise<RegionSize | undefined>;
  deleteRegionSize(id: number): Promise<boolean>;
  
  // Region purchase operations
  getRegionPurchase(id: number): Promise<RegionPurchase | undefined>;
  getRegionPurchasesByUser(userId: number): Promise<RegionPurchase[]>;
  getPendingRegionPurchases(): Promise<RegionPurchase[]>;
  createRegionPurchase(purchase: InsertRegionPurchase): Promise<RegionPurchase>;
  updateRegionPurchase(id: number, purchase: Partial<RegionPurchase>): Promise<RegionPurchase | undefined>;
  
  // Settings operations
  getSetting(key: string): Promise<Setting | undefined>;
  getAllSettings(): Promise<Setting[]>;
  createSetting(setting: InsertSetting): Promise<Setting>;
  updateSetting(key: string, value: string): Promise<Setting | undefined>;
  deleteSetting(key: string): Promise<boolean>;
  
  // Login customization operations
  getLoginCustomization(): Promise<LoginCustomization>;
  updateLoginCustomization(customization: LoginCustomization): Promise<LoginCustomization>;
  
  // Splash page operations
  getSplashPage(): Promise<SplashPage>;
  updateSplashPage(splashPage: SplashPage): Promise<SplashPage>;
  addSplashPageImage(imageUrl: string): Promise<SplashPage>;
  removeSplashPageImage(imageUrl: string): Promise<SplashPage>;
  
  // Security settings operations
  getSecuritySettings(): Promise<SecuritySettings>;
  updateSecuritySettings(settings: Partial<SecuritySettings>): Promise<SecuritySettings>;
  
  // Marketplace operations
  // Item operations
  getMarketplaceItem(id: number): Promise<MarketplaceItem | undefined>;
  getMarketplaceItemsBySeller(sellerId: number): Promise<MarketplaceItem[]>;
  getMarketplaceItemsByCategory(category: string): Promise<MarketplaceItem[]>;
  getAllMarketplaceItems(filters?: { status?: string, category?: string }): Promise<MarketplaceItem[]>;
  createMarketplaceItem(item: InsertMarketplaceItem): Promise<MarketplaceItem>;
  updateMarketplaceItem(id: number, item: Partial<MarketplaceItem>): Promise<MarketplaceItem | undefined>;
  deleteMarketplaceItem(id: number): Promise<boolean>;
  
  // Purchase operations
  getMarketplacePurchase(id: number): Promise<MarketplacePurchase | undefined>;
  getMarketplacePurchasesByBuyer(buyerId: number): Promise<MarketplacePurchase[]>;
  getMarketplacePurchasesBySeller(sellerId: number): Promise<MarketplacePurchase[]>;
  getPendingDeliveries(): Promise<MarketplacePurchase[]>;
  createMarketplacePurchase(purchase: InsertMarketplacePurchase): Promise<MarketplacePurchase>;
  updateMarketplacePurchase(id: number, purchase: Partial<MarketplacePurchase>): Promise<MarketplacePurchase | undefined>;
  
  // User Inventory operations
  getUserInventoryItem(id: number): Promise<UserInventory | undefined>;
  getUserInventoryByUser(userId: number): Promise<UserInventory[]>;
  createUserInventoryItem(item: InsertUserInventory): Promise<UserInventory>;
  updateUserInventoryItem(id: number, item: Partial<UserInventory>): Promise<UserInventory | undefined>;
  deleteUserInventoryItem(id: number): Promise<boolean>;
  
  // Category operations
  getMarketplaceCategory(id: number): Promise<MarketplaceCategory | undefined>;
  getAllMarketplaceCategories(): Promise<MarketplaceCategory[]>;
  createMarketplaceCategory(category: InsertMarketplaceCategory): Promise<MarketplaceCategory>;
  updateMarketplaceCategory(id: number, category: Partial<MarketplaceCategory>): Promise<MarketplaceCategory | undefined>;
  deleteMarketplaceCategory(id: number): Promise<boolean>;
  
  // Marketplace settings operations
  getMarketplaceSetting(key: string): Promise<MarketplaceSetting | undefined>;
  getAllMarketplaceSettings(): Promise<MarketplaceSetting[]>;
  createMarketplaceSetting(setting: InsertMarketplaceSetting): Promise<MarketplaceSetting>;
  updateMarketplaceSetting(key: string, value: string): Promise<MarketplaceSetting | undefined>;
  deleteMarketplaceSetting(key: string): Promise<boolean>;
  
  // Currency settings operations
  getCurrencySettings(): Promise<CurrencySetting>;
  updateCurrencySettings(settings: Partial<CurrencySetting>): Promise<CurrencySetting>;
  
  // Currency transaction operations
  getCurrencyTransaction(id: number): Promise<CurrencyTransaction | undefined>;
  getCurrencyTransactionsByUser(userId: number): Promise<CurrencyTransaction[]>;
  createCurrencyTransaction(transaction: InsertCurrencyTransaction): Promise<CurrencyTransaction>;
  updateCurrencyTransaction(id: number, transaction: Partial<CurrencyTransaction>): Promise<CurrencyTransaction | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private grids: Map<number, Grid>;
  private regions: Map<number, Region>;
  private avatars: Map<number, Avatar>;
  private settings: Map<string, Setting>;
  private regionSizes: Map<number, RegionSize>;
  private regionPurchases: Map<number, RegionPurchase>;
  // Marketplace related maps
  private marketplaceItems: Map<number, MarketplaceItem>;
  private marketplacePurchases: Map<number, MarketplacePurchase>;
  private userInventory: Map<number, UserInventory>;
  private marketplaceCategories: Map<number, MarketplaceCategory>;
  private marketplaceSettings: Map<string, MarketplaceSetting>;
  
  private userCurrentId: number;
  private gridCurrentId: number;
  private regionCurrentId: number;
  private avatarCurrentId: number;
  private settingCurrentId: number;
  private regionSizeCurrentId: number;
  private regionPurchaseCurrentId: number;
  // Marketplace related IDs
  private marketplaceItemCurrentId: number;
  private marketplacePurchaseCurrentId: number;
  private userInventoryCurrentId: number;
  private marketplaceCategoryCurrentId: number;

  constructor() {
    this.users = new Map();
    this.grids = new Map();
    this.regions = new Map();
    this.avatars = new Map();
    this.settings = new Map();
    this.regionSizes = new Map();
    this.regionPurchases = new Map();
    // Initialize marketplace maps
    this.marketplaceItems = new Map();
    this.marketplacePurchases = new Map();
    this.userInventory = new Map();
    this.marketplaceCategories = new Map();
    this.marketplaceSettings = new Map();
    // Initialize currency
    this.currencyTransactions = new Map();
    this._currencySettings = this.getDefaultCurrencySettings();
    
    this.userCurrentId = 1;
    this.gridCurrentId = 1;
    this.regionCurrentId = 1;
    this.avatarCurrentId = 1;
    this.settingCurrentId = 1;
    this.regionSizeCurrentId = 1;
    this.regionPurchaseCurrentId = 1;
    // Initialize marketplace IDs
    this.marketplaceItemCurrentId = 1;
    this.marketplacePurchaseCurrentId = 1;
    this.userInventoryCurrentId = 1;
    this.marketplaceCategoryCurrentId = 1;
    // Initialize currency IDs
    this.currencyTransactionCurrentId = 1;
    
    // Default login customization
    const loginCustomization = {
      id: this.settingCurrentId++,
      key: "loginCustomization",
      value: JSON.stringify({
        displayType: "text",
        textValue: "OpenSimulator Grid Manager"
      }),
      lastUpdated: new Date().toISOString()
    };
    this.settings.set(loginCustomization.key, loginCustomization);
    
    // Default splash page
    const splashPage = {
      id: this.settingCurrentId++,
      key: "splashPage",
      value: JSON.stringify({
        message: "Welcome to our OpenSimulator Grid! Explore virtual worlds and connect with others.",
        calendarUrl: "",
        slideshowImages: [
          "/splash/welcome1.jpg",
          "/splash/welcome2.jpg",
          "/splash/welcome3.jpg"
        ],
        slideshowSpeed: 5000
      }),
      lastUpdated: new Date().toISOString()
    };
    this.settings.set(splashPage.key, splashPage);
    
    // Initialize with default admin user
    const adminUser: User = {
      id: this.userCurrentId++,
      username: "admin",
      password: "admin", // Plain text for the special case of admin
      email: "admin@example.com",
      isAdmin: true,
      dateJoined: new Date().toISOString(),
      firstName: null,
      lastName: null
    };
    this.users.set(adminUser.id, adminUser);
    
    // Create a regular test user account
    const testUser: User = {
      id: this.userCurrentId++,
      username: "testuser",
      // We're using SHA-256 hashing in auth.ts, so hash the password the same way for consistency
      // This is the hash of "password123"
      password: "ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f",
      email: "user@example.com",
      isAdmin: false,
      dateJoined: new Date().toISOString(),
      firstName: "Test",
      lastName: "User"
    };
    this.users.set(testUser.id, testUser);
    
    // Create an avatar for the test user
    const testAvatar: Avatar = {
      id: this.avatarCurrentId++,
      userId: testUser.id,
      avatarType: "male",
      name: "TestAvatar",
      created: new Date().toISOString()
    };
    this.avatars.set(testAvatar.id, testAvatar);
    
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
      description: "The first landing point for new visitors to the grid",
      positionX: 1000,
      positionY: 1000,
      sizeX: 256,
      sizeY: 256,
      port: 9000,
      template: "welcome",
      status: "online",
      isRunning: true,
      ownerId: null,
      ownerName: "Grid Admin",
      regionType: "welcome",
      maturity: "general",
      maxVisitors: 20,
      visitCount: 125,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPendingSetup: null
    };
    this.regions.set(welcomeIsland.id, welcomeIsland);
    
    const marketPlaza: Region = {
      id: this.regionCurrentId++,
      gridId: sampleGrid.id,
      name: "Market Plaza",
      description: "Central marketplace for shopping and trading",
      positionX: 1000,
      positionY: 1256,
      sizeX: 512,
      sizeY: 512,
      port: 9001,
      template: "sandbox",
      status: "online",
      isRunning: true,
      ownerId: null,
      ownerName: "Grid Admin",
      regionType: "commercial",
      maturity: "general",
      maxVisitors: 30,
      visitCount: 87,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPendingSetup: null
    };
    this.regions.set(marketPlaza.id, marketPlaza);
    
    const eventsCenter: Region = {
      id: this.regionCurrentId++,
      gridId: sampleGrid.id,
      name: "Events Center",
      description: "Venue for grid-wide events and gatherings",
      positionX: 1512,
      positionY: 1000,
      sizeX: 256,
      sizeY: 256,
      port: 9002,
      template: "empty",
      status: "online",
      isRunning: true,
      ownerId: null,
      ownerName: "Grid Admin",
      regionType: "event",
      maturity: "general",
      maxVisitors: 50,
      visitCount: 63,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPendingSetup: null
    };
    this.regions.set(eventsCenter.id, eventsCenter);
    
    const sandbox: Region = {
      id: this.regionCurrentId++,
      gridId: sampleGrid.id,
      name: "Sandbox",
      description: "Free-build area for users to experiment with building",
      positionX: 1512,
      positionY: 1256,
      sizeX: 1024,
      sizeY: 1024,
      port: 9003,
      template: "sandbox",
      status: "restarting",
      isRunning: false,
      ownerId: null,
      ownerName: "Grid Admin",
      regionType: "sandbox",
      maturity: "general",
      maxVisitors: 15,
      visitCount: 42,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPendingSetup: null
    };
    this.regions.set(sandbox.id, sandbox);
    
    // Initialize sample region size templates
    const smallRegion: RegionSize = {
      id: this.regionSizeCurrentId++,
      name: "Small",
      description: "256 x 256 region - perfect for a small homestead",
      sizeX: 256,
      sizeY: 256,
      price: "10.00",
      isEnabled: true
    };
    this.regionSizes.set(smallRegion.id, smallRegion);
    
    const mediumRegion: RegionSize = {
      id: this.regionSizeCurrentId++,
      name: "Medium",
      description: "512 x 512 region - great for larger builds",
      sizeX: 512,
      sizeY: 512,
      price: "25.00",
      isEnabled: true
    };
    this.regionSizes.set(mediumRegion.id, mediumRegion);
    
    const largeRegion: RegionSize = {
      id: this.regionSizeCurrentId++,
      name: "Large",
      description: "1024 x 1024 region - ideal for estates and big projects",
      sizeX: 1024,
      sizeY: 1024,
      price: "45.00",
      isEnabled: true
    };
    this.regionSizes.set(largeRegion.id, largeRegion);
    
    // Initialize marketplace data
    this.marketplaceItems = new Map();
    this.marketplacePurchases = new Map();
    this.userInventory = new Map();
    this.marketplaceCategories = new Map();
    this.marketplaceSettings = new Map();
    
    this.marketplaceItemCurrentId = 1;
    this.marketplacePurchaseCurrentId = 1;
    this.userInventoryCurrentId = 1;
    this.marketplaceCategoryCurrentId = 1;
    
    // Add some default marketplace categories
    const categories = [
      { 
        id: this.marketplaceCategoryCurrentId++,
        name: "Avatars",
        description: "Custom avatar appearances and accessories",
        isEnabled: true,
        parentId: null,
        displayOrder: 1
      },
      { 
        id: this.marketplaceCategoryCurrentId++,
        name: "Buildings",
        description: "Structures and architectural designs",
        isEnabled: true,
        parentId: null,
        displayOrder: 2
      },
      { 
        id: this.marketplaceCategoryCurrentId++,
        name: "Furniture",
        description: "Decorative and functional items for your virtual spaces",
        isEnabled: true,
        parentId: null,
        displayOrder: 3
      },
      { 
        id: this.marketplaceCategoryCurrentId++,
        name: "Scripts",
        description: "Interactive scripts and code for objects",
        isEnabled: true,
        parentId: null,
        displayOrder: 4
      },
      { 
        id: this.marketplaceCategoryCurrentId++,
        name: "Clothing",
        description: "Virtual clothing and accessories",
        isEnabled: true,
        parentId: null,
        displayOrder: 5
      }
    ];
    
    categories.forEach(category => {
      this.marketplaceCategories.set(category.id, category);
    });
    
    // Add default marketplace settings
    const marketplaceSettings = [
      {
        id: this.settingCurrentId++,
        key: "marketplace_enabled",
        value: "true",
        description: "Enables or disables the marketplace functionality",
        updatedAt: new Date().toISOString()
      },
      {
        id: this.settingCurrentId++,
        key: "marketplace_fee_percentage",
        value: "5",
        description: "Percentage fee charged on marketplace transactions",
        updatedAt: new Date().toISOString()
      },
      {
        id: this.settingCurrentId++,
        key: "marketplace_moderation_required",
        value: "true",
        description: "Whether items require admin approval before listing",
        updatedAt: new Date().toISOString()
      }
    ];
    
    marketplaceSettings.forEach(setting => {
      this.marketplaceSettings.set(setting.key, setting);
    });
    
    // Add sample marketplace items
    const now = new Date().toISOString();
    const sampleItems = [
      {
        id: this.marketplaceItemCurrentId++,
        sellerId: 1, // admin user
        name: "Modern Villa",
        description: "Luxurious modern villa with swimming pool and garden",
        category: "Buildings",
        price: "1000",
        createdAt: now,
        updatedAt: now,
        status: "approved",
        isEnabled: true,
        permissions: "copy,transfer",
        images: ["/marketplace/modern-villa.jpg"],
        tags: ["house", "modern", "villa", "luxury"],
        inWorldLocation: "Welcome Island (128, 128, 20)"
      },
      {
        id: this.marketplaceItemCurrentId++,
        sellerId: 1, // admin user
        name: "Teleportation Script",
        description: "Script for creating teleportation points between regions",
        category: "Scripts",
        price: "500",
        createdAt: now,
        updatedAt: now,
        status: "approved",
        isEnabled: true,
        permissions: "copy,transfer,modify",
        images: ["/marketplace/teleport-script.jpg"],
        tags: ["script", "teleport", "utility"],
        inWorldLocation: "Welcome Island (128, 128, 20)"
      },
      {
        id: this.marketplaceItemCurrentId++,
        sellerId: 2, // test user
        name: "Winter Outfit Collection",
        description: "Complete winter outfit including coat, boots, and accessories",
        category: "Clothing",
        price: "250",
        createdAt: now,
        updatedAt: now,
        status: "approved",
        isEnabled: true,
        permissions: "copy,transfer",
        images: ["/marketplace/winter-outfit.jpg"],
        tags: ["clothing", "winter", "outfit", "fashion"],
        inWorldLocation: "Market Plaza (128, 128, 20)"
      }
    ];
    
    sampleItems.forEach(item => {
      this.marketplaceItems.set(item.id, item);
    });
    
    // Add sample inventory items for the test user
    const inventoryItems = [
      {
        id: this.userInventoryCurrentId++,
        userId: 2, // test user
        itemName: "Beach House",
        itemType: "object",
        description: "Tropical beach house with palm trees",
        uploadDate: now,
        inWorldId: "00000000-0000-0000-0000-000000000001",
        isListed: false,
        thumbnailUrl: "/inventory/beach-house-thumb.jpg",
        permissions: "copy,transfer,modify",
        marketplaceItemId: null
      },
      {
        id: this.userInventoryCurrentId++,
        userId: 2, // test user
        itemName: "Particle Effects Script",
        itemType: "script",
        description: "Script for creating custom particle effects",
        uploadDate: now,
        inWorldId: "00000000-0000-0000-0000-000000000002",
        isListed: false,
        thumbnailUrl: "/inventory/particle-script-thumb.jpg",
        permissions: "copy,transfer,modify",
        marketplaceItemId: null
      },
      {
        id: this.userInventoryCurrentId++,
        userId: 2, // test user
        itemName: "Winter Outfit Collection",
        itemType: "clothing",
        description: "Complete winter outfit including coat, boots, and accessories",
        uploadDate: now,
        inWorldId: "00000000-0000-0000-0000-000000000003",
        isListed: true,
        thumbnailUrl: "/inventory/winter-outfit-thumb.jpg",
        permissions: "copy,transfer",
        marketplaceItemId: 3 // ID of the listed marketplace item
      }
    ];
    
    inventoryItems.forEach(item => {
      this.userInventory.set(item.id, item);
    });
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
    const now = new Date().toISOString();
    // Ensure all required fields have values
    const region: Region = { 
      ...insertRegion, 
      id,
      description: insertRegion.description || null,
      status: insertRegion.status || "offline",
      sizeX: insertRegion.sizeX || 256,
      sizeY: insertRegion.sizeY || 256,
      template: insertRegion.template || "empty",
      isRunning: insertRegion.isRunning || false,
      ownerId: insertRegion.ownerId || null,
      ownerName: insertRegion.ownerName || null,
      regionType: insertRegion.regionType || null,
      maturity: insertRegion.maturity || "general",
      maxVisitors: insertRegion.maxVisitors || null,
      visitCount: insertRegion.visitCount || 0,
      createdAt: insertRegion.createdAt || now,
      updatedAt: insertRegion.updatedAt || now,
      isPendingSetup: insertRegion.isPendingSetup || null
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
  
  // Settings operations
  async getSetting(key: string): Promise<Setting | undefined> {
    return this.settings.get(key);
  }
  
  async getAllSettings(): Promise<Setting[]> {
    return Array.from(this.settings.values());
  }
  
  async createSetting(insertSetting: InsertSetting): Promise<Setting> {
    const id = this.settingCurrentId++;
    const lastUpdated = new Date().toISOString();
    const setting: Setting = { ...insertSetting, id, lastUpdated };
    this.settings.set(setting.key, setting);
    return setting;
  }
  
  async updateSetting(key: string, value: string): Promise<Setting | undefined> {
    const setting = this.settings.get(key);
    if (!setting) return undefined;
    
    const lastUpdated = new Date().toISOString();
    const updatedSetting = { ...setting, value, lastUpdated };
    this.settings.set(key, updatedSetting);
    return updatedSetting;
  }
  
  async deleteSetting(key: string): Promise<boolean> {
    return this.settings.delete(key);
  }
  
  // Login customization operations
  async getLoginCustomization(): Promise<LoginCustomization> {
    const setting = await this.getSetting("loginCustomization");
    if (!setting) {
      // Default if not found
      const defaultCustomization: LoginCustomization = {
        displayType: "text",
        textValue: "OpenSimulator Grid Manager"
      };
      return defaultCustomization;
    }
    
    try {
      return JSON.parse(setting.value);
    } catch (error) {
      // Handle parsing error by returning default
      const defaultCustomization: LoginCustomization = {
        displayType: "text",
        textValue: "OpenSimulator Grid Manager"
      };
      return defaultCustomization;
    }
  }
  
  async updateLoginCustomization(customization: LoginCustomization): Promise<LoginCustomization> {
    const settingValue = JSON.stringify(customization);
    const existing = await this.getSetting("loginCustomization");
    
    if (!existing) {
      // Create new setting if it doesn't exist
      await this.createSetting({
        key: "loginCustomization",
        value: settingValue
      });
    } else {
      // Update existing setting
      await this.updateSetting("loginCustomization", settingValue);
    }
    
    return customization;
  }
  
  // Region size operations
  async getRegionSize(id: number): Promise<RegionSize | undefined> {
    return this.regionSizes.get(id);
  }
  
  async getAllRegionSizes(): Promise<RegionSize[]> {
    return Array.from(this.regionSizes.values());
  }
  
  async createRegionSize(insertSizeTemplate: InsertRegionSize): Promise<RegionSize> {
    const id = this.regionSizeCurrentId++;
    const sizeTemplate: RegionSize = {
      ...insertSizeTemplate,
      id,
      isEnabled: insertSizeTemplate.isEnabled ?? true
    };
    this.regionSizes.set(id, sizeTemplate);
    return sizeTemplate;
  }
  
  async updateRegionSize(id: number, updates: Partial<RegionSize>): Promise<RegionSize | undefined> {
    const sizeTemplate = this.regionSizes.get(id);
    if (!sizeTemplate) return undefined;
    
    const updatedTemplate = { ...sizeTemplate, ...updates };
    this.regionSizes.set(id, updatedTemplate);
    return updatedTemplate;
  }
  
  async deleteRegionSize(id: number): Promise<boolean> {
    return this.regionSizes.delete(id);
  }
  
  // Region purchase operations
  async getRegionPurchase(id: number): Promise<RegionPurchase | undefined> {
    return this.regionPurchases.get(id);
  }
  
  async getRegionPurchasesByUser(userId: number): Promise<RegionPurchase[]> {
    return Array.from(this.regionPurchases.values()).filter(
      (purchase) => purchase.userId === userId
    );
  }
  
  async getPendingRegionPurchases(): Promise<RegionPurchase[]> {
    return Array.from(this.regionPurchases.values()).filter(
      (purchase) => purchase.status === "pending"
    );
  }
  
  async createRegionPurchase(insertPurchase: InsertRegionPurchase): Promise<RegionPurchase> {
    const id = this.regionPurchaseCurrentId++;
    const purchaseDate = new Date().toISOString();
    
    const purchase: RegionPurchase = {
      ...insertPurchase,
      id,
      purchaseDate,
      status: insertPurchase.status || "pending",
      paymentMethod: insertPurchase.paymentMethod || "paypal",
      regionId: insertPurchase.regionId ?? null,
      paymentId: insertPurchase.paymentId ?? null
    };
    
    this.regionPurchases.set(id, purchase);
    return purchase;
  }
  
  async updateRegionPurchase(id: number, updates: Partial<RegionPurchase>): Promise<RegionPurchase | undefined> {
    const purchase = this.regionPurchases.get(id);
    if (!purchase) return undefined;
    
    const updatedPurchase = { ...purchase, ...updates };
    this.regionPurchases.set(id, updatedPurchase);
    return updatedPurchase;
  }

  // Splash page operations
  async getSplashPage(): Promise<SplashPage> {
    const setting = await this.getSetting("splashPage");
    if (!setting) {
      // Default if not found
      const defaultSplashPage: SplashPage = {
        message: "Welcome to our OpenSimulator Grid! Explore virtual worlds and connect with others.",
        calendarUrl: "",
        slideshowImages: [],
        slideshowSpeed: 5000
      };
      return defaultSplashPage;
    }
    
    try {
      return JSON.parse(setting.value);
    } catch (error) {
      // Handle parsing error by returning default
      const defaultSplashPage: SplashPage = {
        message: "Welcome to our OpenSimulator Grid! Explore virtual worlds and connect with others.",
        calendarUrl: "",
        slideshowImages: [],
        slideshowSpeed: 5000
      };
      return defaultSplashPage;
    }
  }
  
  async updateSplashPage(splashPage: SplashPage): Promise<SplashPage> {
    const settingValue = JSON.stringify(splashPage);
    const existing = await this.getSetting("splashPage");
    
    if (!existing) {
      // Create new setting if it doesn't exist
      await this.createSetting({
        key: "splashPage",
        value: settingValue
      });
    } else {
      // Update existing setting
      await this.updateSetting("splashPage", settingValue);
    }
    
    return splashPage;
  }
  
  async addSplashPageImage(imageUrl: string): Promise<SplashPage> {
    const splashPage = await this.getSplashPage();
    
    // Only add if not already in the array
    if (!splashPage.slideshowImages.includes(imageUrl)) {
      splashPage.slideshowImages.push(imageUrl);
      await this.updateSplashPage(splashPage);
    }
    
    return splashPage;
  }
  
  async removeSplashPageImage(imageUrl: string): Promise<SplashPage> {
    const splashPage = await this.getSplashPage();
    
    splashPage.slideshowImages = splashPage.slideshowImages.filter(url => url !== imageUrl);
    await this.updateSplashPage(splashPage);
    
    return splashPage;
  }

  // Security settings operations
  async getSecuritySettings(): Promise<SecuritySettings> {
    const setting = await this.getSetting('securitySettings');
    if (setting) {
      return JSON.parse(setting.value) as SecuritySettings;
    }
    // Return default security settings if none are found
    const defaultSettings: SecuritySettings = {
      requireEmailVerification: false,
      minimumPasswordLength: 8,
      passwordRequireSpecialChar: true,
      passwordRequireNumbers: true,
      passwordRequireUppercase: true,
      maxLoginAttempts: 5,
      accountLockoutDuration: 30,
      sessionTimeout: 120,
      twoFactorAuthEnabled: false,
      ipAccessRestriction: false,
      allowedIPs: [],
      captchaOnRegistration: true,
      captchaOnLogin: false,
      gridAccessRestriction: "open"
    };
    
    // Create the default settings in storage
    await this.createSetting({
      key: 'securitySettings',
      value: JSON.stringify(defaultSettings)
    });
    
    return defaultSettings;
  }

  async updateSecuritySettings(settings: Partial<SecuritySettings>): Promise<SecuritySettings> {
    const currentSettings = await this.getSecuritySettings();
    const updatedSettings = { ...currentSettings, ...settings };
    
    await this.updateSetting('securitySettings', JSON.stringify(updatedSettings));
    
    return updatedSettings;
  }

  // Marketplace Item operations
  async getMarketplaceItem(id: number): Promise<MarketplaceItem | undefined> {
    return this.marketplaceItems.get(id);
  }
  
  async getMarketplaceItemsBySeller(sellerId: number): Promise<MarketplaceItem[]> {
    return Array.from(this.marketplaceItems.values()).filter(
      (item) => item.sellerId === sellerId
    );
  }
  
  async getMarketplaceItemsByCategory(category: string): Promise<MarketplaceItem[]> {
    return Array.from(this.marketplaceItems.values()).filter(
      (item) => item.category === category && item.isEnabled && item.status === "approved"
    );
  }
  
  async getAllMarketplaceItems(filters?: { status?: string, category?: string }): Promise<MarketplaceItem[]> {
    let items = Array.from(this.marketplaceItems.values());
    
    if (filters) {
      if (filters.status) {
        items = items.filter(item => item.status === filters.status);
      }
      
      if (filters.category) {
        items = items.filter(item => item.category === filters.category);
      }
    }
    
    return items;
  }
  
  async createMarketplaceItem(insertItem: InsertMarketplaceItem): Promise<MarketplaceItem> {
    const id = this.marketplaceItemCurrentId++;
    const now = new Date().toISOString();
    
    const item: MarketplaceItem = {
      ...insertItem,
      id,
      createdAt: now,
      updatedAt: now,
      status: insertItem.status || "pending",
      isEnabled: insertItem.isEnabled ?? true,
      permissions: insertItem.permissions || "copy",
      images: insertItem.images || [],
      tags: insertItem.tags || [],
      inWorldLocation: insertItem.inWorldLocation || null
    };
    
    this.marketplaceItems.set(id, item);
    return item;
  }
  
  async updateMarketplaceItem(id: number, updates: Partial<MarketplaceItem>): Promise<MarketplaceItem | undefined> {
    const item = this.marketplaceItems.get(id);
    if (!item) return undefined;
    
    const now = new Date().toISOString();
    const updatedItem = { 
      ...item, 
      ...updates,
      updatedAt: now
    };
    
    this.marketplaceItems.set(id, updatedItem);
    return updatedItem;
  }
  
  async deleteMarketplaceItem(id: number): Promise<boolean> {
    return this.marketplaceItems.delete(id);
  }
  
  // Marketplace Purchase operations
  async getMarketplacePurchase(id: number): Promise<MarketplacePurchase | undefined> {
    return this.marketplacePurchases.get(id);
  }
  
  async getMarketplacePurchasesByBuyer(buyerId: number): Promise<MarketplacePurchase[]> {
    return Array.from(this.marketplacePurchases.values()).filter(
      (purchase) => purchase.buyerId === buyerId
    );
  }
  
  async getMarketplacePurchasesBySeller(sellerId: number): Promise<MarketplacePurchase[]> {
    return Array.from(this.marketplacePurchases.values()).filter(
      (purchase) => purchase.sellerId === sellerId
    );
  }
  
  async getPendingDeliveries(): Promise<MarketplacePurchase[]> {
    return Array.from(this.marketplacePurchases.values()).filter(
      (purchase) => purchase.deliveryStatus === "pending"
    );
  }
  
  async createMarketplacePurchase(insertPurchase: InsertMarketplacePurchase): Promise<MarketplacePurchase> {
    const id = this.marketplacePurchaseCurrentId++;
    const purchaseDate = new Date().toISOString();
    
    const purchase: MarketplacePurchase = {
      ...insertPurchase,
      id,
      purchaseDate,
      deliveryStatus: insertPurchase.deliveryStatus || "pending",
      deliveryAttempts: insertPurchase.deliveryAttempts || 0,
      lastDeliveryAttempt: null,
      deliveryLocation: insertPurchase.deliveryLocation || null
    };
    
    this.marketplacePurchases.set(id, purchase);
    return purchase;
  }
  
  async updateMarketplacePurchase(id: number, updates: Partial<MarketplacePurchase>): Promise<MarketplacePurchase | undefined> {
    const purchase = this.marketplacePurchases.get(id);
    if (!purchase) return undefined;
    
    const updatedPurchase = { ...purchase, ...updates };
    this.marketplacePurchases.set(id, updatedPurchase);
    return updatedPurchase;
  }
  
  // User Inventory operations
  async getUserInventoryItem(id: number): Promise<UserInventory | undefined> {
    return this.userInventory.get(id);
  }
  
  async getUserInventoryByUser(userId: number): Promise<UserInventory[]> {
    return Array.from(this.userInventory.values()).filter(
      (item) => item.userId === userId
    );
  }
  
  async createUserInventoryItem(insertItem: InsertUserInventory): Promise<UserInventory> {
    const id = this.userInventoryCurrentId++;
    const uploadDate = new Date().toISOString();
    
    const item: UserInventory = {
      ...insertItem,
      id,
      uploadDate,
      isListed: insertItem.isListed || false,
      marketplaceItemId: insertItem.marketplaceItemId || null,
      thumbnailUrl: insertItem.thumbnailUrl || null,
      permissions: insertItem.permissions || "copy",
      description: insertItem.description || null
    };
    
    this.userInventory.set(id, item);
    return item;
  }
  
  async updateUserInventoryItem(id: number, updates: Partial<UserInventory>): Promise<UserInventory | undefined> {
    const item = this.userInventory.get(id);
    if (!item) return undefined;
    
    const updatedItem = { ...item, ...updates };
    this.userInventory.set(id, updatedItem);
    return updatedItem;
  }
  
  async deleteUserInventoryItem(id: number): Promise<boolean> {
    return this.userInventory.delete(id);
  }
  
  // Marketplace Category operations
  async getMarketplaceCategory(id: number): Promise<MarketplaceCategory | undefined> {
    return this.marketplaceCategories.get(id);
  }
  
  async getAllMarketplaceCategories(): Promise<MarketplaceCategory[]> {
    return Array.from(this.marketplaceCategories.values()).filter(
      category => category.isEnabled
    );
  }
  
  async createMarketplaceCategory(insertCategory: InsertMarketplaceCategory): Promise<MarketplaceCategory> {
    const id = this.marketplaceCategoryCurrentId++;
    
    const category: MarketplaceCategory = {
      ...insertCategory,
      id,
      isEnabled: insertCategory.isEnabled ?? true,
      parentId: insertCategory.parentId || null,
      description: insertCategory.description || null,
      displayOrder: insertCategory.displayOrder || 0
    };
    
    this.marketplaceCategories.set(id, category);
    return category;
  }
  
  async updateMarketplaceCategory(id: number, updates: Partial<MarketplaceCategory>): Promise<MarketplaceCategory | undefined> {
    const category = this.marketplaceCategories.get(id);
    if (!category) return undefined;
    
    const updatedCategory = { ...category, ...updates };
    this.marketplaceCategories.set(id, updatedCategory);
    return updatedCategory;
  }
  
  async deleteMarketplaceCategory(id: number): Promise<boolean> {
    return this.marketplaceCategories.delete(id);
  }
  
  // Marketplace Settings operations
  async getMarketplaceSetting(key: string): Promise<MarketplaceSetting | undefined> {
    return this.marketplaceSettings.get(key);
  }
  
  async getAllMarketplaceSettings(): Promise<MarketplaceSetting[]> {
    return Array.from(this.marketplaceSettings.values());
  }
  
  async createMarketplaceSetting(insertSetting: InsertMarketplaceSetting): Promise<MarketplaceSetting> {
    const id = this.settingCurrentId++;
    const updatedAt = new Date().toISOString();
    
    const setting: MarketplaceSetting = {
      ...insertSetting,
      id,
      updatedAt,
      description: insertSetting.description || null
    };
    
    this.marketplaceSettings.set(setting.key, setting);
    return setting;
  }
  
  async updateMarketplaceSetting(key: string, value: string): Promise<MarketplaceSetting | undefined> {
    const setting = this.marketplaceSettings.get(key);
    if (!setting) return undefined;
    
    const updatedAt = new Date().toISOString();
    const updatedSetting = { ...setting, value, updatedAt };
    this.marketplaceSettings.set(key, updatedSetting);
    return updatedSetting;
  }
  
  async deleteMarketplaceSetting(key: string): Promise<boolean> {
    return this.marketplaceSettings.delete(key);
  }

  private _currencySettings: CurrencySetting;
  private currencyTransactions: Map<number, CurrencyTransaction>;
  private currencyTransactionCurrentId: number;

  // Get default currency settings
  private getDefaultCurrencySettings(): CurrencySetting {
    return {
      id: 1,
      enabled: false,
      currencyName: 'Grid Coins',
      exchangeRate: '250',
      minPurchase: '5.00',
      maxPurchase: '100.00',
      paypalEmail: '',
      paypalClientId: '',
      paypalSecret: '',
      lastUpdated: new Date()
    };
  }

  // Initialize currency settings in constructor
  private initCurrencySettings() {
    if (!this._currencySettings) {
      this._currencySettings = this.getDefaultCurrencySettings();
    }
    
    if (!this.currencyTransactions) {
      this.currencyTransactions = new Map<number, CurrencyTransaction>();
    }
    
    if (!this.currencyTransactionCurrentId) {
      this.currencyTransactionCurrentId = 1;
    }
  }

  async getCurrencySettings(): Promise<CurrencySetting> {
    this.initCurrencySettings();
    return this._currencySettings;
  }

  async updateCurrencySettings(settings: Partial<CurrencySetting>): Promise<CurrencySetting> {
    this.initCurrencySettings();
    
    this._currencySettings = {
      ...this._currencySettings,
      ...settings,
      lastUpdated: new Date()
    };
    
    return this._currencySettings;
  }

  async getCurrencyTransaction(id: number): Promise<CurrencyTransaction | undefined> {
    this.initCurrencySettings();
    return this.currencyTransactions.get(id);
  }

  async getCurrencyTransactionsByUser(userId: number): Promise<CurrencyTransaction[]> {
    this.initCurrencySettings();
    
    if (this.currencyTransactions.size === 0) {
      return [];
    }
    
    return Array.from(this.currencyTransactions.values())
      .filter(transaction => transaction.userId === userId);
  }

  async createCurrencyTransaction(transaction: InsertCurrencyTransaction): Promise<CurrencyTransaction> {
    this.initCurrencySettings();
    
    const newTransaction: CurrencyTransaction = {
      id: this.currencyTransactionCurrentId++,
      userId: transaction.userId,
      amount: transaction.amount,
      usdAmount: transaction.usdAmount,
      status: transaction.status || 'pending',
      paymentProcessor: transaction.paymentProcessor || 'paypal',
      paymentId: transaction.paymentId || null,
      createdAt: new Date(),
      completedAt: null
    };
    
    this.currencyTransactions.set(newTransaction.id, newTransaction);
    return newTransaction;
  }

  async updateCurrencyTransaction(id: number, transaction: Partial<CurrencyTransaction>): Promise<CurrencyTransaction | undefined> {
    this.initCurrencySettings();
    
    const currentTransaction = this.currencyTransactions.get(id);
    
    if (!currentTransaction) {
      return undefined;
    }
    
    const updatedTransaction = {
      ...currentTransaction,
      ...transaction
    };
    
    this.currencyTransactions.set(id, updatedTransaction);
    
    return updatedTransaction;
  }
}

export const storage = new MemStorage();