import { MarketplaceItem, MarketplacePurchase, UserInventory } from "@shared/schema";

export type InventoryItem = UserInventory;

export type MarketplacePurchaseWithDetails = MarketplacePurchase & {
  // Derived fields from joins
  itemName: string;
  buyerName: string;
  sellerName: string;
  status: string; // pending, completed, cancelled
  createdAt: string;
};