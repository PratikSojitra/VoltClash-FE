import imageMap from "./imageMap.json";

export interface ItemTemplate {
  name: string;
  category: "Defenses" | "Army" | "Resources" | "Troops" | "Spells" | "Heroes" | "Equipment" | "Pets" | "Traps";
  maxLevel: number; // Max level at TH16 or BH10
  minTH: number; // TH/BH level required to unlock
  resource: "Gold" | "Elixir" | "Dark Elixir" | "Shiny Ore" | "Glowy Ore";
  village?: "home" | "builder"; // Optional village indicator
}

export const ITEM_TEMPLATES: ItemTemplate[] = [
  // === Home Village: Defenses ===
  { name: "Cannon", category: "Defenses", maxLevel: 21, minTH: 1, resource: "Gold" },
  { name: "Archer Tower", category: "Defenses", maxLevel: 21, minTH: 2, resource: "Gold" },
  { name: "Mortar", category: "Defenses", maxLevel: 18, minTH: 3, resource: "Gold" },
  { name: "Air Defense", category: "Defenses", maxLevel: 16, minTH: 4, resource: "Gold" },
  { name: "Wizard Tower", category: "Defenses", maxLevel: 17, minTH: 5, resource: "Gold" },
  { name: "Hidden Tesla", category: "Defenses", maxLevel: 17, minTH: 7, resource: "Gold" },
  { name: "Bomb Tower", category: "Defenses", maxLevel: 13, minTH: 8, resource: "Gold" },
  { name: "X-Bow", category: "Defenses", maxLevel: 13, minTH: 9, resource: "Gold" },
  { name: "Inferno Tower", category: "Defenses", maxLevel: 12, minTH: 10, resource: "Gold" },
  { name: "Eagle Artillery", category: "Defenses", maxLevel: 7, minTH: 11, resource: "Gold" },
  { name: "Scattershot", category: "Defenses", maxLevel: 7, minTH: 13, resource: "Gold" },
  { name: "Monolith", category: "Defenses", maxLevel: 4, minTH: 15, resource: "Dark Elixir" },
  { name: "Ricochet Cannon", category: "Defenses", maxLevel: 4, minTH: 16, resource: "Gold" },
  { name: "Multi-Archer Tower", category: "Defenses", maxLevel: 4, minTH: 16, resource: "Gold" },
  { name: "Spell Tower", category: "Defenses", maxLevel: 4, minTH: 15, resource: "Gold" },

  // === Home Village: Army ===
  { name: "Army Camp", category: "Army", maxLevel: 14, minTH: 1, resource: "Elixir" },
  { name: "Barracks", category: "Army", maxLevel: 19, minTH: 1, resource: "Elixir" },
  { name: "Dark Barracks", category: "Army", maxLevel: 12, minTH: 7, resource: "Elixir" },
  { name: "Laboratory", category: "Army", maxLevel: 16, minTH: 3, resource: "Elixir" },
  { name: "Spell Factory", category: "Army", maxLevel: 9, minTH: 5, resource: "Elixir" },
  { name: "Dark Spell Factory", category: "Army", maxLevel: 7, minTH: 8, resource: "Elixir" },
  { name: "Clan Castle", category: "Army", maxLevel: 14, minTH: 1, resource: "Gold" },
  { name: "Pet House", category: "Army", maxLevel: 12, minTH: 14, resource: "Elixir" },
  { name: "Workshop", category: "Army", maxLevel: 9, minTH: 12, resource: "Elixir" },
  { name: "Blacksmith", category: "Army", maxLevel: 9, minTH: 8, resource: "Gold" },

  // === Home Village: Resources ===
  { name: "Gold Mine", category: "Resources", maxLevel: 17, minTH: 1, resource: "Elixir" },
  { name: "Elixir Collector", category: "Resources", maxLevel: 17, minTH: 1, resource: "Gold" },
  { name: "Dark Elixir Drill", category: "Resources", maxLevel: 11, minTH: 7, resource: "Elixir" },
  { name: "Gold Storage", category: "Resources", maxLevel: 19, minTH: 1, resource: "Elixir" },
  { name: "Elixir Storage", category: "Resources", maxLevel: 19, minTH: 1, resource: "Gold" },
  { name: "Dark Elixir Storage", category: "Resources", maxLevel: 13, minTH: 7, resource: "Elixir" },

  // === Home Village: Troops ===
  { name: "Barbarian", category: "Troops", maxLevel: 13, minTH: 1, resource: "Elixir" },
  { name: "Archer", category: "Troops", maxLevel: 14, minTH: 1, resource: "Elixir" },
  { name: "Giant", category: "Troops", maxLevel: 14, minTH: 1, resource: "Elixir" },
  { name: "Goblin", category: "Troops", maxLevel: 10, minTH: 1, resource: "Elixir" },
  { name: "Wall Breaker", category: "Troops", maxLevel: 14, minTH: 1, resource: "Elixir" },
  { name: "Balloon", category: "Troops", maxLevel: 13, minTH: 1, resource: "Elixir" },
  { name: "Wizard", category: "Troops", maxLevel: 14, minTH: 1, resource: "Elixir" },
  { name: "Healer", category: "Troops", maxLevel: 11, minTH: 5, resource: "Elixir" },
  { name: "Dragon", category: "Troops", maxLevel: 13, minTH: 7, resource: "Elixir" },
  { name: "PEKKA", category: "Troops", maxLevel: 13, minTH: 8, resource: "Elixir" },
  { name: "Baby Dragon", category: "Troops", maxLevel: 12, minTH: 9, resource: "Elixir" },
  { name: "Miner", category: "Troops", maxLevel: 12, minTH: 10, resource: "Elixir" },
  { name: "Electro Dragon", category: "Troops", maxLevel: 9, minTH: 11, resource: "Elixir" },
  { name: "Yeti", category: "Troops", maxLevel: 8, minTH: 12, resource: "Elixir" },
  { name: "Dragon Rider", category: "Troops", maxLevel: 6, minTH: 13, resource: "Elixir" },
  { name: "Electro Titan", category: "Troops", maxLevel: 5, minTH: 14, resource: "Elixir" },
  { name: "Root Rider", category: "Troops", maxLevel: 4, minTH: 15, resource: "Elixir" },
  { name: "Druid", category: "Troops", maxLevel: 6, minTH: 16, resource: "Dark Elixir" },
  { name: "Minion", category: "Troops", maxLevel: 14, minTH: 7, resource: "Dark Elixir" },
  { name: "Hog Rider", category: "Troops", maxLevel: 15, minTH: 7, resource: "Dark Elixir" },
  { name: "Valkyrie", category: "Troops", maxLevel: 12, minTH: 8, resource: "Dark Elixir" },
  { name: "Golem", category: "Troops", maxLevel: 15, minTH: 8, resource: "Dark Elixir" },
  { name: "Witch", category: "Troops", maxLevel: 8, minTH: 9, resource: "Dark Elixir" },
  { name: "Lava Hound", category: "Troops", maxLevel: 8, minTH: 9, resource: "Dark Elixir" },
  { name: "Bowler", category: "Troops", maxLevel: 10, minTH: 10, resource: "Dark Elixir" },
  { name: "Headhunter", category: "Troops", maxLevel: 4, minTH: 12, resource: "Dark Elixir" },

  // === Home Village: Spells ===
  { name: "Lightning Spell", category: "Spells", maxLevel: 11, minTH: 5, resource: "Elixir" },
  { name: "Healing Spell", category: "Spells", maxLevel: 11, minTH: 5, resource: "Elixir" },
  { name: "Rage Spell", category: "Spells", maxLevel: 11, minTH: 5, resource: "Elixir" },
  { name: "Jump Spell", category: "Spells", maxLevel: 10, minTH: 6, resource: "Elixir" },
  { name: "Freeze Spell", category: "Spells", maxLevel: 16, minTH: 8, resource: "Elixir" },
  { name: "Clone Spell", category: "Spells", maxLevel: 14, minTH: 10, resource: "Elixir" },
  { name: "Invisibility Spell", category: "Spells", maxLevel: 7, minTH: 11, resource: "Elixir" },
  { name: "Overgrowth Spell", category: "Spells", maxLevel: 11, minTH: 12, resource: "Elixir" },
  { name: "Poison Spell", category: "Spells", maxLevel: 11, minTH: 8, resource: "Dark Elixir" },
  { name: "Earthquake Spell", category: "Spells", maxLevel: 9, minTH: 8, resource: "Dark Elixir" },
  { name: "Haste Spell", category: "Spells", maxLevel: 8, minTH: 9, resource: "Dark Elixir" },
  { name: "Skeleton Spell", category: "Spells", maxLevel: 16, minTH: 9, resource: "Dark Elixir" },
  { name: "Bat Spell", category: "Spells", maxLevel: 11, minTH: 10, resource: "Dark Elixir" },
  { name: "Recall Spell", category: "Spells", maxLevel: 12, minTH: 13, resource: "Dark Elixir" },

  // === Home Village: Heroes ===
  { name: "Barbarian King", category: "Heroes", maxLevel: 95, minTH: 7, resource: "Dark Elixir" },
  { name: "Archer Queen", category: "Heroes", maxLevel: 95, minTH: 9, resource: "Dark Elixir" },
  { name: "Grand Warden", category: "Heroes", maxLevel: 70, minTH: 11, resource: "Elixir" },
  { name: "Royal Champion", category: "Heroes", maxLevel: 45, minTH: 13, resource: "Dark Elixir" },

  // === Home Village: Equipment ===
  { name: "Barbarian Puppet", category: "Equipment", maxLevel: 18, minTH: 8, resource: "Shiny Ore" },
  { name: "Archer Puppet", category: "Equipment", maxLevel: 18, minTH: 9, resource: "Shiny Ore" },
  { name: "Giant Gauntlet", category: "Equipment", maxLevel: 27, minTH: 8, resource: "Shiny Ore" },
  { name: "Frozen Arrow", category: "Equipment", maxLevel: 27, minTH: 9, resource: "Shiny Ore" },
  { name: "Eternal Tome", category: "Equipment", maxLevel: 18, minTH: 11, resource: "Shiny Ore" },
  { name: "Spiky Ball", category: "Equipment", maxLevel: 27, minTH: 8, resource: "Shiny Ore" },
  { name: "Life Gem", category: "Equipment", maxLevel: 18, minTH: 11, resource: "Shiny Ore" },
  { name: "Rage Gem", category: "Equipment", maxLevel: 18, minTH: 11, resource: "Shiny Ore" },
  { name: "Rage Vial", category: "Equipment", maxLevel: 18, minTH: 7, resource: "Shiny Ore" },
  { name: "Haste Vial", category: "Equipment", maxLevel: 18, minTH: 13, resource: "Shiny Ore" },
  { name: "Invisibility Vial", category: "Equipment", maxLevel: 18, minTH: 9, resource: "Shiny Ore" },
  { name: "Seeking Shield", category: "Equipment", maxLevel: 18, minTH: 13, resource: "Shiny Ore" },
  { name: "Royal Gem", category: "Equipment", maxLevel: 18, minTH: 13, resource: "Shiny Ore" },
  { name: "Vampstache", category: "Equipment", maxLevel: 18, minTH: 7, resource: "Shiny Ore" },
  { name: "Earthquake Boots", category: "Equipment", maxLevel: 18, minTH: 7, resource: "Shiny Ore" },
  { name: "Magic Mirror", category: "Equipment", maxLevel: 27, minTH: 9, resource: "Shiny Ore" },
  { name: "Heroic Torch", category: "Equipment", maxLevel: 27, minTH: 11, resource: "Shiny Ore" },
  { name: "Rocket Spear", category: "Equipment", maxLevel: 27, minTH: 13, resource: "Shiny Ore" },

  // === Home Village: Pets ===
  { name: "LASSI", category: "Pets", maxLevel: 15, minTH: 14, resource: "Dark Elixir" },
  { name: "Electro Owl", category: "Pets", maxLevel: 15, minTH: 14, resource: "Dark Elixir" },
  { name: "Mighty Yak", category: "Pets", maxLevel: 15, minTH: 14, resource: "Dark Elixir" },
  { name: "Unicorn", category: "Pets", maxLevel: 15, minTH: 14, resource: "Dark Elixir" },
  { name: "Frosty", category: "Pets", maxLevel: 15, minTH: 15, resource: "Dark Elixir" },
  { name: "Diggy", category: "Pets", maxLevel: 15, minTH: 15, resource: "Dark Elixir" },
  { name: "Poison Lizard", category: "Pets", maxLevel: 15, minTH: 15, resource: "Dark Elixir" },
  { name: "Phoenix", category: "Pets", maxLevel: 15, minTH: 15, resource: "Dark Elixir" },
  { name: "Spirit Fox", category: "Pets", maxLevel: 15, minTH: 16, resource: "Dark Elixir" },

  // === Home Village: Traps ===
  { name: "Bomb", category: "Traps", maxLevel: 11, minTH: 3, resource: "Gold" },
  { name: "Spring Trap", category: "Traps", maxLevel: 5, minTH: 7, resource: "Gold" },
  { name: "Giant Bomb", category: "Traps", maxLevel: 9, minTH: 6, resource: "Gold" },
  { name: "Air Bomb", category: "Traps", maxLevel: 10, minTH: 5, resource: "Gold" },
  { name: "Seeking Air Mine", category: "Traps", maxLevel: 5, minTH: 7, resource: "Gold" },
  { name: "Skeleton Trap", category: "Traps", maxLevel: 4, minTH: 8, resource: "Gold" },
  { name: "Tornado Trap", category: "Traps", maxLevel: 3, minTH: 11, resource: "Gold" },


  // ==========================================
  // === BUILDER BASE items (village: builder) ===
  // ==========================================

  // === Builder Base: Defenses ===
  { name: "Cannon", category: "Defenses", maxLevel: 10, minTH: 1, resource: "Gold", village: "builder" },
  { name: "Archer Tower", category: "Defenses", maxLevel: 10, minTH: 2, resource: "Gold", village: "builder" },
  { name: "Double Cannon", category: "Defenses", maxLevel: 10, minTH: 2, resource: "Gold", village: "builder" },
  { name: "Hidden Tesla", category: "Defenses", maxLevel: 10, minTH: 3, resource: "Gold", village: "builder" },
  { name: "Firecrackers", category: "Defenses", maxLevel: 10, minTH: 3, resource: "Gold", village: "builder" },
  { name: "Crusher", category: "Defenses", maxLevel: 10, minTH: 3, resource: "Gold", village: "builder" },
  { name: "Multi Mortar", category: "Defenses", maxLevel: 10, minTH: 5, resource: "Gold", village: "builder" },
  { name: "Roaster", category: "Defenses", maxLevel: 10, minTH: 6, resource: "Gold", village: "builder" },
  { name: "Giant Cannon", category: "Defenses", maxLevel: 10, minTH: 7, resource: "Gold", village: "builder" },
  { name: "Mega Tesla", category: "Defenses", maxLevel: 10, minTH: 8, resource: "Gold", village: "builder" },
  { name: "Lava Launcher", category: "Defenses", maxLevel: 10, minTH: 9, resource: "Gold", village: "builder" },
  { name: "Guard Post", category: "Defenses", maxLevel: 10, minTH: 4, resource: "Gold", village: "builder" },

  // === Builder Base: Army ===
  { name: "Builder Barracks", category: "Army", maxLevel: 12, minTH: 1, resource: "Elixir", village: "builder" },
  { name: "Star Laboratory", category: "Army", maxLevel: 10, minTH: 3, resource: "Elixir", village: "builder" },
  { name: "Clock Tower", category: "Army", maxLevel: 10, minTH: 4, resource: "Elixir", village: "builder" },
  { name: "Army Camp", category: "Army", maxLevel: 1, minTH: 2, resource: "Elixir", village: "builder" },

  // === Builder Base: Resources ===
  { name: "Gold Mine", category: "Resources", maxLevel: 10, minTH: 1, resource: "Elixir", village: "builder" },
  { name: "Elixir Collector", category: "Resources", maxLevel: 10, minTH: 1, resource: "Gold", village: "builder" },
  { name: "Gem Mine", category: "Resources", maxLevel: 10, minTH: 3, resource: "Elixir", village: "builder" },
  { name: "Gold Storage", category: "Resources", maxLevel: 10, minTH: 1, resource: "Elixir", village: "builder" },
  { name: "Elixir Storage", category: "Resources", maxLevel: 10, minTH: 1, resource: "Gold", village: "builder" },
  { name: "O.T.T.O's Outpost", category: "Resources", maxLevel: 10, minTH: 8, resource: "Gold", village: "builder" },

  // === Builder Base: Troops ===
  { name: "Raged Barbarian", category: "Troops", maxLevel: 20, minTH: 1, resource: "Elixir", village: "builder" },
  { name: "Sneaky Archer", category: "Troops", maxLevel: 20, minTH: 2, resource: "Elixir", village: "builder" },
  { name: "Boxer Giant", category: "Troops", maxLevel: 20, minTH: 3, resource: "Elixir", village: "builder" },
  { name: "Beta Minion", category: "Troops", maxLevel: 20, minTH: 4, resource: "Elixir", village: "builder" },
  { name: "Bomber", category: "Troops", maxLevel: 20, minTH: 5, resource: "Elixir", village: "builder" },
  { name: "Baby Dragon", category: "Troops", maxLevel: 20, minTH: 6, resource: "Elixir", village: "builder" },
  { name: "Cannon Cart", category: "Troops", maxLevel: 20, minTH: 7, resource: "Elixir", village: "builder" },
  { name: "Night Witch", category: "Troops", maxLevel: 20, minTH: 8, resource: "Elixir", village: "builder" },
  { name: "Drop Ship", category: "Troops", maxLevel: 20, minTH: 9, resource: "Elixir", village: "builder" },
  { name: "Power P.E.K.K.A", category: "Troops", maxLevel: 20, minTH: 9, resource: "Elixir", village: "builder" },
  { name: "Hog Glider", category: "Troops", maxLevel: 20, minTH: 10, resource: "Elixir", village: "builder" },
  { name: "Electrofire Wizard", category: "Troops", maxLevel: 20, minTH: 10, resource: "Elixir", village: "builder" },

  // === Builder Base: Heroes ===
  { name: "Battle Machine", category: "Heroes", maxLevel: 35, minTH: 5, resource: "Elixir", village: "builder" },
  { name: "Battle Copter", category: "Heroes", maxLevel: 35, minTH: 8, resource: "Elixir", village: "builder" },

  // === Builder Base: Traps ===
  { name: "Mine", category: "Traps", maxLevel: 10, minTH: 1, resource: "Gold", village: "builder" },
  { name: "Mega Mine", category: "Traps", maxLevel: 10, minTH: 4, resource: "Gold", village: "builder" },
  { name: "Push Trap", category: "Traps", maxLevel: 10, minTH: 2, resource: "Gold", village: "builder" },
  { name: "Spring Trap", category: "Traps", maxLevel: 4, minTH: 3, resource: "Gold", village: "builder" },
];

/**
 * Calculates a realistic dynamic max level for any item based on the player's current Town/Builder Hall level.
 */
export function getMaxLevelForTH(item: ItemTemplate, thLevel: number): number {
  if (thLevel < item.minTH) return 0; // Not unlocked yet!
  
  const isBuilder = item.village === "builder";
  const maxTHVal = isBuilder ? 10 : 16;
  
  // Calculate max level using a realistic linear ratio from unlock level to max level
  const thSlots = maxTHVal - item.minTH;
  if (thSlots <= 0) return item.maxLevel;
  
  // Level unlocks range from 1 to maxLevel. We scale it linearly.
  const baseLevel = 1;
  const thDiff = thLevel - item.minTH;
  const levelRatio = thDiff / thSlots;
  
  const calculatedMax = Math.round(baseLevel + (item.maxLevel - baseLevel) * levelRatio);
  return Math.max(1, Math.min(item.maxLevel, calculatedMax));
}

/**
 * Computes realistic upgrade cost and time based on item configuration and level.
 */
export function getUpgradeCostAndTime(
  item: ItemTemplate,
  level: number,
  maxLevel: number
) {
  if (level <= 0) {
    return {
      cost: "Not Unlocked",
      time: "Locked",
      costRaw: 0,
      timeRawSeconds: -1,
    };
  }

  if (level >= maxLevel) {
    return {
      cost: "Maxed",
      time: "Maxed",
      costRaw: 0,
      timeRawSeconds: 0,
    };
  }

  // Base parameters
  let costBase = 12000;
  let timeBaseSeconds = 600; // 10 minutes

  if (item.village === "builder") {
    if (item.category === "Heroes") {
      costBase = 220000; // Builder heroes cost Elixir
      timeBaseSeconds = 3600 * 3; // 3 hours
    } else if (item.category === "Troops") {
      costBase = 15000; // Builder barracks troops cost Elixir
      timeBaseSeconds = 1800; // 30 minutes
    } else if (item.category === "Defenses") {
      costBase = 20000;
      timeBaseSeconds = 2400; // 40 minutes
    } else {
      costBase = 10000;
      timeBaseSeconds = 1200; // 20 minutes
    }
  } else {
    // Home Village
    if (item.category === "Heroes") {
      costBase = item.name === "Grand Warden" ? 80000 : 25000; 
      timeBaseSeconds = 7200; 
    } else if (item.category === "Equipment") {
      costBase = 120; // Ores
      timeBaseSeconds = 0; 
    } else if (item.category === "Pets") {
      costBase = 45000; 
      timeBaseSeconds = 86400 * 2; 
    } else if (
      item.category === "Defenses" &&
      ["Monolith", "Scattershot", "Eagle Artillery", "Ricochet Cannon", "Multi-Archer Tower"].includes(item.name)
    ) {
      costBase = 9000000;
      timeBaseSeconds = 86400 * 7; 
    }
  }

  // Growth rate scaling factors
  let costFactor = 1.48;
  let timeFactor = 1.38;

  if (item.village === "builder") {
    if (item.category === "Heroes") {
      costFactor = 1.14; // 35 levels
      timeFactor = 1.11;
    } else if (item.category === "Troops") {
      costFactor = 1.28; // 20 levels
      timeFactor = 1.24;
    } else {
      costFactor = 1.42; // 10 levels
      timeFactor = 1.35;
    }
  } else {
    // Home Village
    if (item.category === "Heroes") {
      costFactor = 1.055; 
      timeFactor = 1.045;
    } else if (item.category === "Equipment") {
      costFactor = 1.18;
      timeFactor = 0;
    } else if (item.category === "Pets") {
      costFactor = 1.15;
      timeFactor = 1.08;
    }
  }

  let costRaw = Math.round(costBase * Math.pow(costFactor, level - 1));
  let timeRawSeconds = Math.round(timeBaseSeconds * Math.pow(timeFactor, level - 1));

  // Clamping and formatting
  if (item.village === "builder") {
    if (costRaw > 500000) {
      costRaw = Math.round(costRaw / 50000) * 50000;
    } else if (costRaw > 50000) {
      costRaw = Math.round(costRaw / 5000) * 5000;
    } else {
      costRaw = Math.round(costRaw / 1000) * 1000;
    }
    costRaw = Math.min(costRaw, 6000000); // 6M Builder base limit
    timeRawSeconds = Math.min(timeRawSeconds, 86400 * 10); // 10 days limit
  } else {
    // Home Village
    if (item.resource === "Gold" || item.resource === "Elixir") {
      if (costRaw > 1000000) {
        costRaw = Math.round(costRaw / 250000) * 250000;
      } else if (costRaw > 100000) {
        costRaw = Math.round(costRaw / 25000) * 25000;
      } else {
        costRaw = Math.round(costRaw / 5000) * 5000;
      }
      costRaw = Math.min(costRaw, 22000000); 
      timeRawSeconds = Math.min(timeRawSeconds, 86400 * 16); 
    } else if (item.resource === "Dark Elixir") {
      if (costRaw > 10000) {
        costRaw = Math.round(costRaw / 2500) * 2500;
      } else {
        costRaw = Math.round(costRaw / 250) * 250;
      }
      costRaw = Math.min(costRaw, 360000); 
      timeRawSeconds = Math.min(timeRawSeconds, 86400 * 16);
    } else if (item.resource.includes("Ore")) {
      costRaw = Math.min(costRaw, 4800); 
      timeRawSeconds = 0; 
    }
  }

  // Round cost to nice strings (e.g. 4.5M, 250k)
  let costStr = "";
  if (costRaw >= 1000000) {
    costStr = `${(costRaw / 1000000).toFixed(1).replace(/\.0$/, "")}M`;
  } else if (costRaw >= 1000) {
    costStr = `${(costRaw / 1000).toFixed(0)}k`;
  } else {
    costStr = `${costRaw}`;
  }

  // Format time (e.g., 5d 4h, Instant)
  let timeStr = "";
  if (timeRawSeconds === 0) {
    timeStr = "Instant";
  } else {
    const days = Math.floor(timeRawSeconds / (86400));
    const hours = Math.floor((timeRawSeconds % (86400)) / 3600);
    const minutes = Math.floor((timeRawSeconds % 3600) / 60);

    if (days > 0) {
      timeStr = `${days}d${hours > 0 ? ` ${hours}h` : ""}`;
    } else if (hours > 0) {
      timeStr = `${hours}h${minutes > 0 ? ` ${minutes}m` : ""}`;
    } else {
      timeStr = `${minutes}m`;
    }
  }

  return {
    cost: costStr,
    time: timeStr,
    costRaw,
    timeRawSeconds,
  };
}

/**
 * Smart image resolver function with dynamic Builder Base suffix fallbacks
 */
export function getImageUrl(name: string, level: number, village: "home" | "builder" = "home"): string {
  const cleanName = name.trim();
  const isBB = village === "builder";

  // 1. Spells
  if (cleanName.includes("Spell")) {
    const spellImage = `${cleanName} info.png`;
    if (imageMap.includes(spellImage)) {
      return `/images/${spellImage}`;
    }
  }

  // 2. Pets
  const petNames = ["LASSI", "Electro Owl", "Mighty Yak", "Unicorn", "Frosty", "Diggy", "Poison Lizard", "Phoenix", "Spirit Fox"];
  if (petNames.includes(cleanName)) {
    const petImage = `${cleanName} field.png`;
    if (imageMap.includes(petImage)) {
      return `/images/${petImage}`;
    }
  }

  // 3. Heroes & Altars
  if (cleanName === "Battle Machine") {
    if (imageMap.includes("BattleMachineAltar Deactivated.png")) {
      return `/images/BattleMachineAltar Deactivated.png`;
    }
  }
  if (cleanName === "Battle Copter") {
    if (imageMap.includes("Battle Copter Altar.png")) {
      return `/images/Battle Copter Altar.png`;
    }
  }
  if (["Barbarian King", "Archer Queen", "Grand Warden", "Royal Champion"].includes(cleanName)) {
    const heroImage = `${cleanName} info.png`;
    if (imageMap.includes(heroImage)) {
      return `/images/${heroImage}`;
    }
  }

  // 4. Equipment
  if (!isBB && imageMap.includes(`${cleanName}.png`)) {
    return `/images/${cleanName}.png`;
  }

  // 5. Custom Traps with "Ground" suffix in Builder Base
  if (isBB && (cleanName === "Mine" || cleanName === "Mega Mine")) {
    for (let l = level; l >= 1; l--) {
      const filename = `${cleanName}${l} Ground.png`;
      if (imageMap.includes(filename)) {
        return `/images/${filename}`;
      }
    }
  }

  // 6. Custom Builder Base Units and spelling overrides
  if (isBB && cleanName === "Raged Barbarian") {
    for (let l = level; l >= 1; l--) {
      const filename = `RagedBarbarian${l}.png`;
      if (imageMap.includes(filename)) return `/images/${filename}`;
    }
  }
  if (isBB && cleanName === "Electrofire Wizard") {
    for (let l = level; l >= 1; l--) {
      const filename1 = `Electrofire Wizard${l} Fire.png`;
      const filename2 = `Electrofire Wizard${l}.png`;
      if (imageMap.includes(filename1)) return `/images/${filename1}`;
      if (imageMap.includes(filename2)) return `/images/${filename2}`;
    }
  }
  if (isBB && cleanName === "O.T.T.O's Outpost") {
    for (let l = level; l >= 1; l--) {
      const filename1 = `O.T.T.O's Outpost${l}.png`;
      const filename2 = `O.T.T.O's Outpost-${l}.png`;
      if (imageMap.includes(filename1)) return `/images/${filename1}`;
      if (imageMap.includes(filename2)) return `/images/${filename2}`;
    }
  }

  // 7. Normal level-based lookup
  for (let l = level; l >= 1; l--) {
    // For Builder Base overlapping buildings, prioritize the "B" suffix (e.g. Cannon7B.png)
    if (isBB && ["Cannon", "Archer Tower", "Mortar", "Gold Mine", "Elixir Collector", "Gold Storage", "Elixir Storage"].includes(cleanName)) {
      const bFilename = `${cleanName}${l}B.png`;
      if (imageMap.includes(bFilename)) {
        return `/images/${bFilename}`;
      }
    }

    let filename = `${cleanName}${l}.png`;
    if (cleanName === "Inferno Tower") {
      filename = `Inferno Tower${l} Single.png`;
    } else if (cleanName === "X-Bow") {
      filename = `X-Bow${l} Ground.png`;
    }

    if (imageMap.includes(filename)) {
      return `/images/${filename}`;
    }
  }

  // 8. Generic Fallbacks
  if (imageMap.includes(`${cleanName}1.png`)) {
    return `/images/${cleanName}1.png`;
  }
  if (isBB && imageMap.includes(`${cleanName}1B.png`)) {
    return `/images/${cleanName}1B.png`;
  }

  const matchingFile = imageMap.find(f => f.toLowerCase().startsWith(cleanName.toLowerCase()));
  if (matchingFile) {
    return `/images/${matchingFile}`;
  }

  // Absolute fallback
  return "/images/Town Hall1.png";
}

/**
 * Returns how many instances of a building are present at a given Hall level.
 */
export function getInstanceCount(item: ItemTemplate, thLevel: number): number {
  if (thLevel < item.minTH) return 0;

  const isBB = item.village === "builder";

  // ==========================================
  // === BUILDER BASE BUILDING COUNTS ===
  // ==========================================
  if (isBB) {
    // Single instance troops and heroes
    if (["Troops", "Heroes"].includes(item.category)) return 1;
    if ([
      "Builder Barracks", "Star Laboratory", "Clock Tower", "Gem Mine", 
      "O.T.T.O's Outpost", "Multi Mortar", "Roaster", "Giant Cannon", 
      "Mega Tesla", "Lava Launcher", "Guard Post"
    ].includes(item.name)) {
      return 1;
    }
    
    if (item.name === "Army Camp") {
      if (thLevel < 2) return 0;
      if (thLevel === 2) return 2;
      if (thLevel === 3) return 3;
      if (thLevel === 4) return 4;
      if (thLevel < 8) return 5;
      return 6;
    }
    
    if (item.name === "Gold Mine" || item.name === "Elixir Collector") {
      if (thLevel < 1) return 0;
      if (thLevel === 1) return 1;
      if (thLevel === 2) return 2;
      return 3;
    }
    
    if (item.name === "Gold Storage" || item.name === "Elixir Storage") {
      if (thLevel < 1) return 0;
      if (thLevel <= 2) return 1;
      return 2;
    }
    
    if (item.name === "Cannon") {
      if (thLevel < 1) return 0;
      if (thLevel === 1) return 1;
      if (thLevel === 2) return 2;
      return 3;
    }
    
    if (item.name === "Archer Tower") {
      if (thLevel < 2) return 0;
      if (thLevel === 2) return 1;
      return 2;
    }
    
    if (item.name === "Double Cannon") {
      if (thLevel < 2) return 0;
      if (thLevel === 2) return 1;
      if (thLevel <= 4) return 2;
      return 3;
    }
    
    if (item.name === "Hidden Tesla") {
      if (thLevel < 3) return 0;
      if (thLevel === 3) return 1;
      return 2;
    }
    
    if (item.name === "Firecrackers") {
      if (thLevel < 3) return 0;
      if (thLevel === 3) return 1;
      if (thLevel <= 5) return 2;
      return 3;
    }
    
    if (item.name === "Crusher") {
      if (thLevel < 3) return 0;
      if (thLevel <= 4) return 1;
      return 2;
    }
    
    if (item.name === "Mine") {
      if (thLevel < 1) return 0;
      if (thLevel === 1) return 2;
      if (thLevel === 2) return 3;
      if (thLevel === 3) return 4;
      return 5;
    }
    
    if (item.name === "Mega Mine") {
      if (thLevel < 4) return 0;
      if (thLevel <= 5) return 1;
      return 2;
    }
    
    if (item.name === "Push Trap") {
      if (thLevel < 2) return 0;
      if (thLevel === 2) return 2;
      if (thLevel === 3) return 3;
      return 4;
    }
    
    if (item.name === "Spring Trap") {
      if (thLevel < 3) return 0;
      if (thLevel === 3) return 2;
      if (thLevel === 4) return 3;
      return 4;
    }
    
    return 1;
  }

  // ==========================================
  // === HOME VILLAGE BUILDING COUNTS ===
  // ==========================================
  if (["Troops", "Spells", "Heroes", "Equipment", "Pets"].includes(item.category)) {
    return 1;
  }

  if ([
    "Clan Castle", "Laboratory", "Spell Factory", "Dark Spell Factory", 
    "Pet House", "Workshop", "Blacksmith", "Eagle Artillery", "Monolith", "Tornado Trap"
  ].includes(item.name)) {
    return 1;
  }

  if ([
    "Ricochet Cannon", "Multi-Archer Tower", "Scattershot", "Spell Tower", "Bomb Tower"
  ].includes(item.name)) {
    return 2;
  }

  if (item.name === "Dark Elixir Drill") {
    if (thLevel < 7) return 0;
    if (thLevel < 8) return 1;
    if (thLevel < 10) return 2;
    return 3;
  }

  if ([
    "Air Defense", "Mortar", "Hidden Tesla", "X-Bow", 
    "Giant Bomb", "Skeleton Trap", "Air Bomb", "Seeking Air Mine"
  ].includes(item.name)) {
    return 4;
  }

  if (["Wizard Tower", "Inferno Tower"].includes(item.name)) {
    return 5;
  }

  if ([
    "Cannon", "Archer Tower", "Gold Mine", "Elixir Collector", 
    "Gold Storage", "Elixir Storage", "Bomb", "Spring Trap"
  ].includes(item.name)) {
    if (thLevel <= 2) return 2;
    if (thLevel <= 4) return 3;
    if (thLevel <= 6) return 4;
    if (thLevel <= 8) return 5;
    return 6;
  }

  if (item.name === "Army Camp") return 4;
  if (item.name === "Barracks" || item.name === "Dark Barracks") return 1;
  if (item.name === "Dark Elixir Storage") return 1;

  return 1;
}

// ============================================================
// ID → Name Mapping (matches defenses.json id fields)
// Used by parseVillageJson to resolve numeric IDs from raw
// game client dumps to human-readable building/troop names.
// ============================================================
const BUILDING_ID_MAP: Record<number, string> = {
  // These IDs match the backend import.service.ts mapping (ground truth from CoC internal IDs)
  1000000: "Cannon",
  1000001: "Town Hall",
  1000002: "Archer Tower",
  1000003: "Mortar",
  1000004: "Air Defense",
  1000005: "Wizard Tower",
  1000006: "Air Sweeper",
  1000007: "Hidden Tesla",
  1000008: "Laboratory",
  1000009: "Spell Factory",
  1000011: "Gold Mine",
  1000012: "Elixir Collector",
  1000013: "Gold Storage",
  1000014: "Elixir Storage",
  1000015: "Barracks",
  1000019: "Clan Castle",
  1000020: "Dark Elixir Storage",
  1000021: "Dark Elixir Drill",
  1000023: "Army Camp",
  1000024: "Spell Factory",
  1000026: "Dark Barracks",
  1000027: "Dark Spell Factory",
  1000028: "Eagle Artillery",
  1000029: "Scattershot",
  1000031: "Monolith",
  1000032: "Ricochet Cannon",
  1000059: "Multi-Archer Tower",
  1000067: "Spell Tower",
  1000068: "Blacksmith",
  1000071: "Workshop",
  1000072: "Pet House",
  // Bomb Tower, X-Bow, Inferno (common game client IDs)
  1000016: "Bomb Tower",
  1000017: "X-Bow",
  1000018: "Inferno Tower",
  // Traps (from game client)
  1200000: "Bomb",
  1200001: "Spring Trap",
  1200002: "Air Bomb",
  1200003: "Giant Bomb",
  1200004: "Seeking Air Mine",
  1200005: "Skeleton Trap",
  1200006: "Tornado Trap",
};


const TROOP_ID_MAP: Record<number, string> = {
  4000000: "Barbarian",
  4000001: "Archer",
  4000002: "Goblin",
  4000003: "Giant",
  4000004: "Wall Breaker",
  4000005: "Balloon",
  4000006: "Wizard",
  4000007: "Healer",
  4000008: "Dragon",
  4000009: "P.E.K.K.A",
  4000010: "Minion",
  4000011: "Hog Rider",
  4000012: "Valkyrie",
  4000013: "Golem",
  4000015: "Witch",
  4000017: "Lava Hound",
  4000022: "Bowler",
  4000023: "Baby Dragon",
  4000024: "Miner",
  4000053: "Yeti",
  4000059: "Electro Dragon",
  4000065: "Dragon Rider",
  4000072: "Electro Titan",
  4000089: "Root Rider",
  4000115: "Thrower",
  // Siege Machines
  4000051: "Wall Wrecker",
  4000052: "Battle Blimp",
  4000062: "Stone Slammer",
  4000075: "Siege Barracks",
  4000087: "Log Launcher",
  4000091: "Flame Flinger",
  4000092: "Battle Drill",
};

const SPELL_ID_MAP: Record<number, string> = {
  26000000: "Lightning Spell",
  26000001: "Healing Spell",
  26000002: "Rage Spell",
  26000003: "Jump Spell",
  26000005: "Freeze Spell",
  26000009: "Poison Spell",
  26000010: "Earthquake Spell",
  26000011: "Haste Spell",
  26000016: "Clone Spell",
  26000017: "Skeleton Spell",
  26000035: "Invisibility Spell",
  26000053: "Recall Spell",
  26000054: "Revive Spell",
};

const HERO_ID_MAP: Record<number, string> = {
  28000000: "Barbarian King",
  28000001: "Archer Queen",
  28000002: "Grand Warden",
  28000004: "Royal Champion",
  28000006: "Minion Prince",
  28000007: "Dragon Duke",
};

const PET_ID_MAP: Record<number, string> = {
  18000000: "L.A.S.S.I",
  18000001: "Electro Owl",
  18000002: "Mighty Yak",
  18000003: "Unicorn",
  18000004: "Frosty",
  18000005: "Diggy",
  18000006: "Poison Lizard",
  18000007: "Phoenix",
  18000008: "Spirit Fox",
  18000009: "Angry Jelly",
};

// Try to resolve a building ID to a name
function resolveBuildingId(id: number): string | null {
  return BUILDING_ID_MAP[id] || null;
}

export interface ParsedVillageItem {
  name: string;
  level: number;
  village: "home" | "builder";
  category: "building" | "troop" | "spell" | "hero" | "pet";
}

/**
 * Parse a raw village JSON (from game client dump or Supercell API)
 * into a normalized list of named items with levels.
 *
 * Handles:
 *   - { data: <numericId>, lvl: <n> }   (game client format)
 *   - { name: <string>, level: <n> }     (Supercell API / standard format)
 */
export function parseVillageJson(raw: any): {
  playerTag: string | null;
  name: string | null;
  townHallLevel: number;
  buildings: ParsedVillageItem[];
  troops: ParsedVillageItem[];
  spells: ParsedVillageItem[];
  heroes: ParsedVillageItem[];
  pets: ParsedVillageItem[];
} {
  const playerTag = raw.playerTag || raw.tag || null;
  const name = raw.name || null;
  let townHallLevel = parseInt(raw.townhallLevel || raw.townHallLevel || "1", 10);

  const buildings: ParsedVillageItem[] = [];
  const troops: ParsedVillageItem[] = [];
  const spells: ParsedVillageItem[] = [];
  const heroes: ParsedVillageItem[] = [];
  const pets: ParsedVillageItem[] = [];

  // --- Buildings ---
  for (const b of raw.buildings || []) {
    // Determine village
    const village: "home" | "builder" = b.village === "builderBase" ? "builder" : "home";

    // Resolve name
    let bName: string | null = b.name || null;
    if (!bName && b.data) bName = resolveBuildingId(b.data);
    if (!bName) continue; // Skip unmapped items

    // Skip Walls and Town Hall (TH level comes from root field, Walls not tracked)
    if (bName === "Walls" || bName === "Town Hall") continue;

    const level = parseInt(b.level || b.lvl || "1", 10);
    buildings.push({ name: bName, level, village, category: "building" });
  }

  // Detect TH level from buildings if not in root
  if (townHallLevel === 1) {
    const thEntry = buildings.find((b) => b.name === "Town Hall");
    if (thEntry) townHallLevel = thEntry.level;
  }

  // --- Troops ---
  for (const t of raw.troops || raw.units || []) {
    const village: "home" | "builder" = t.village === "builderBase" ? "builder" : "home";
    let tName: string | null = t.name || null;
    if (!tName && t.data) tName = TROOP_ID_MAP[t.data] || null;
    if (!tName) continue;
    const level = parseInt(t.level || t.lvl || "1", 10);
    troops.push({ name: tName, level, village, category: "troop" });
  }

  // --- Spells ---
  for (const s of raw.spells || []) {
    const village: "home" | "builder" = s.village === "builderBase" ? "builder" : "home";
    let sName: string | null = s.name || null;
    if (!sName && s.data) sName = SPELL_ID_MAP[s.data] || null;
    if (!sName) continue;
    const level = parseInt(s.level || s.lvl || "1", 10);
    spells.push({ name: sName, level, village, category: "spell" });
  }

  // --- Heroes ---
  for (const h of raw.heroes || []) {
    const village: "home" | "builder" = h.village === "builderBase" ? "builder" : "home";
    let hName: string | null = h.name || null;
    if (!hName && h.data) hName = HERO_ID_MAP[h.data] || null;
    if (!hName) continue;
    const level = parseInt(h.level || h.lvl || "1", 10);
    heroes.push({ name: hName, level, village, category: "hero" });
  }

  // --- Pets / Hero Equipment (sometimes mixed into heroes in API) ---
  for (const p of raw.heroEquipment || raw.pets || []) {
    let pName: string | null = p.name || null;
    if (!pName && p.data) pName = PET_ID_MAP[p.data] || null;
    if (!pName) continue;
    const level = parseInt(p.level || p.lvl || "1", 10);
    pets.push({ name: pName, level, village: "home", category: "pet" });
  }

  return { playerTag, name, townHallLevel, buildings, troops, spells, heroes, pets };
}
