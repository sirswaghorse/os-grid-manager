export type AvatarType = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  category: "male" | "female" | "neutral" | "other";
};

/**
 * Default avatar options available for users to select during registration
 */
export const defaultAvatars: AvatarType[] = [
  // Female avatars
  {
    id: "female-casual",
    name: "Casual Female",
    description: "A modern female avatar in casual clothing",
    imageUrl: "/avatars/female-casual.png",
    category: "female",
  },
  {
    id: "female-business",
    name: "Business Female",
    description: "A professional female avatar in business attire",
    imageUrl: "/avatars/female-business.png",
    category: "female",
  },
  {
    id: "female-sporty",
    name: "Sporty Female",
    description: "An athletic female avatar in sports clothing",
    imageUrl: "/avatars/female-sporty.png",
    category: "female",
  },
  {
    id: "female-fantasy",
    name: "Fantasy Female",
    description: "A fantasy-themed female avatar",
    imageUrl: "/avatars/female-fantasy.png",
    category: "female",
  },
  
  // Male avatars
  {
    id: "male-casual",
    name: "Casual Male",
    description: "A modern male avatar in casual clothing",
    imageUrl: "/avatars/male-casual.png",
    category: "male",
  },
  {
    id: "male-business",
    name: "Business Male",
    description: "A professional male avatar in business attire",
    imageUrl: "/avatars/male-business.png",
    category: "male",
  },
  {
    id: "male-sporty",
    name: "Sporty Male",
    description: "An athletic male avatar in sports clothing",
    imageUrl: "/avatars/male-sporty.png",
    category: "male",
  },
  {
    id: "male-fantasy",
    name: "Fantasy Male",
    description: "A fantasy-themed male avatar",
    imageUrl: "/avatars/male-fantasy.png",
    category: "male",
  },
  
  // Neutral avatars
  {
    id: "neutral-casual",
    name: "Casual Neutral",
    description: "A gender-neutral avatar in casual clothing",
    imageUrl: "/avatars/neutral-casual.png",
    category: "neutral",
  },
  {
    id: "neutral-business",
    name: "Business Neutral",
    description: "A gender-neutral avatar in business attire",
    imageUrl: "/avatars/neutral-business.png",
    category: "neutral",
  },
  
  // Other avatars
  {
    id: "robot",
    name: "Robot",
    description: "A robotic avatar",
    imageUrl: "/avatars/robot.png",
    category: "other",
  },
  {
    id: "alien",
    name: "Alien",
    description: "An alien avatar",
    imageUrl: "/avatars/alien.png",
    category: "other",
  },
  {
    id: "creature",
    name: "Creature",
    description: "A fantasy creature avatar",
    imageUrl: "/avatars/creature.png",
    category: "other",
  }
];

/**
 * Utility to find an avatar by its ID
 */
export function getAvatarById(id: string): AvatarType | undefined {
  return defaultAvatars.find(avatar => avatar.id === id);
}

/**
 * Utility to find avatars by category
 */
export function getAvatarsByCategory(category: AvatarType["category"]): AvatarType[] {
  return defaultAvatars.filter(avatar => avatar.category === category);
}